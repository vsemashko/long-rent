# Scripts

Utility scripts for HomeMore platform development, testing, and deployment.

## Available Scripts

### Production Verification

**`verify-production.sh`** - Comprehensive pre-deployment verification

Checks:
- Required tools installed
- Repository status (no uncommitted changes)
- Environment configuration
- Dependencies and security vulnerabilities
- Build status
- Database configuration
- Test files exist
- Documentation complete
- Security configuration
- Production readiness files

Usage:
```bash
./scripts/verify-production.sh
```

Expected output:
```
🚀 HomeMore Production Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ node is installed
✓ npm is installed
✓ git is installed
...

📊 Verification Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Results:
  ✓ Passed:   45
  ⚠ Warnings: 3
  ✗ Failed:   0

🎉 All checks passed! Ready for production deployment.
```

### Database Backup

**`backup-db.sh`** - Automated database backup to S3

```bash
#!/bin/bash
# Daily database backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="homemore_backup_$DATE.sql"

pg_dump -h <RDS_ENDPOINT> -U homemore homemore_production > $BACKUP_FILE
gzip $BACKUP_FILE

aws s3 cp $BACKUP_FILE.gz s3://homemore-db-backups/
rm $BACKUP_FILE.gz

# Keep only last 30 days
aws s3 ls s3://homemore-db-backups/ | awk '{print $4}' | sort -r | tail -n +31 | xargs -I {} aws s3 rm s3://homemore-db-backups/{}
```

Add to crontab for daily backups:
```bash
0 2 * * * /path/to/scripts/backup-db.sh
```

### Health Check

**`health-check.sh`** - Simple health check for deployed services

```bash
#!/bin/bash
# Check if services are healthy

API_URL="https://api.homemore.pl/health"
WEB_URL="https://homemore.pl"

# Check API
if curl -sf "$API_URL" > /dev/null; then
    echo "✓ API is healthy"
else
    echo "✗ API is down"
    exit 1
fi

# Check Web
if curl -sf "$WEB_URL" > /dev/null; then
    echo "✓ Web is healthy"
else
    echo "✗ Web is down"
    exit 1
fi

echo "✓ All services healthy"
```

### Deploy Script

**`deploy.sh`** - Deployment automation script

```bash
#!/bin/bash
# Deploy to production

set -e

echo "🚀 Deploying HomeMore to production..."

# 1. Run verification
./scripts/verify-production.sh

# 2. Build
echo "Building applications..."
npm run build

# 3. Run tests
echo "Running tests..."
npm test

# 4. Deploy backend
echo "Deploying backend..."
cd apps/api
pm2 stop homemore-api || true
pm2 start ecosystem.config.js
pm2 save

# 5. Deploy frontend
echo "Deploying frontend..."
cd ../web
vercel --prod

echo "✅ Deployment complete!"
```

---

## Usage in CI/CD

### GitHub Actions

```yaml
name: Production Deployment

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run verification
        run: ./scripts/verify-production.sh

      - name: Deploy
        run: ./scripts/deploy.sh
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

---

## Creating New Scripts

When creating new scripts, follow these guidelines:

1. **Make executable**: `chmod +x scripts/my-script.sh`
2. **Add shebang**: Start with `#!/bin/bash`
3. **Use set -e**: Fail fast on errors
4. **Add documentation**: Include usage instructions
5. **Test thoroughly**: Test in dev environment first
6. **Update this README**: Document new scripts

Example template:

```bash
#!/bin/bash

################################################################################
# Script Name: my-script.sh
#
# Description: What this script does
#
# Usage: ./scripts/my-script.sh [arguments]
#
# Author: Your Name
# Date: YYYY-MM-DD
################################################################################

set -e  # Exit on error

# Your script here
echo "Hello, World!"
```

---

## Troubleshooting

### Permission Denied

```bash
# Make script executable
chmod +x scripts/my-script.sh
```

### Environment Variables Not Found

```bash
# Load .env file first
export $(cat .env.production | grep -v '^#' | xargs)
./scripts/my-script.sh
```

### Script Fails on macOS vs Linux

Use portable commands:
- Use `#!/usr/bin/env bash` instead of `#!/bin/bash`
- Avoid GNU-specific flags
- Test on both platforms

---

## Security Notes

⚠️ **Never commit secrets to git**
- Use environment variables
- Load from `.env` files (gitignored)
- Use secret management services in production

⚠️ **Validate inputs**
- Check for required arguments
- Sanitize user inputs
- Validate file paths

⚠️ **Log sensitive operations**
- Log script executions
- Mask sensitive data in logs
- Alert on critical operations

---

Last Updated: November 22, 2025
