# GitHub Actions Secrets Setup Guide

This guide walks you through configuring GitHub Actions secrets for automated CI/CD deployment.

## Prerequisites

✅ You must have completed all service signups from `docs/SERVICE_SIGNUP_GUIDE.md`
✅ You must have all credentials saved in `.env.production`

---

## What Are GitHub Secrets?

GitHub Secrets allow you to securely store sensitive information (API keys, tokens, passwords) that your CI/CD workflows need. They are:
- Encrypted at rest
- Never visible in logs
- Only accessible to authorized workflows
- Scoped to your repository

---

## Required Secrets

You need to add **14 secrets** total for automated deployment.

### Quick Access

Go to: `https://github.com/vsemashko/long-rent/settings/secrets/actions`

Or navigate:
1. Go to your repository: https://github.com/vsemashko/long-rent
2. Click **"Settings"** tab
3. In left sidebar, expand **"Secrets and variables"**
4. Click **"Actions"**
5. Click **"New repository secret"** for each secret below

---

## Secrets to Add

### 1. Database Secrets

#### `DATABASE_URL`
- **Description**: Supabase PostgreSQL connection string (pooled)
- **Where to find**: Supabase Dashboard → Settings → Database → Connection string (Transaction mode)
- **Format**: `postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?pgbouncer=true`
- **Used for**: Application database connections

**To add:**
1. Click **"New repository secret"**
2. Name: `DATABASE_URL`
3. Value: Paste your Supabase pooled connection string
4. Click **"Add secret"**

---

#### `DATABASE_URL_UNPOOLED`
- **Description**: Supabase PostgreSQL direct connection (for migrations)
- **Where to find**: Supabase Dashboard → Settings → Database → Connection string (Session mode)
- **Format**: `postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`
- **Used for**: Running Prisma migrations

**To add:**
1. Click **"New repository secret"**
2. Name: `DATABASE_URL_UNPOOLED`
3. Value: Paste your Supabase direct connection string
4. Click **"Add secret"**

---

### 2. Hosting Platform Secrets

#### `RAILWAY_TOKEN`
- **Description**: Railway API token for deploying backend
- **Where to find**: Run `railway whoami --token` in terminal after `railway login`
- **Format**: Long alphanumeric string
- **Used for**: Deploying NestJS API to Railway

**To add:**
1. In terminal: `railway login` (opens browser)
2. Authenticate
3. Run: `railway whoami --token`
4. Copy the token
5. Add as secret in GitHub

---

#### `VERCEL_TOKEN`
- **Description**: Vercel API token for deploying frontend
- **Where to find**: Generate via `vercel token create` command
- **Format**: Long alphanumeric string
- **Used for**: Deploying Next.js app to Vercel

**To add:**
1. In terminal: `vercel login`
2. Run: `vercel token create "GitHub Actions Deploy"`
3. Copy the token (starts with `vercel_...`)
4. Add as secret in GitHub

---

#### `VERCEL_ORG_ID`
- **Description**: Your Vercel organization ID
- **Where to find**: `.vercel/project.json` after running `vercel link`
- **Format**: Random string like `team_xxxxxxxxxxxxx` or `prj_xxxxx`
- **Used for**: Identifying your Vercel organization

**To add:**
1. In terminal: `cd apps/web && vercel link`
2. Run: `cat .vercel/project.json`
3. Copy the value of `"orgId"`
4. Add as secret in GitHub

---

#### `VERCEL_PROJECT_ID`
- **Description**: Your Vercel project ID
- **Where to find**: `.vercel/project.json` after running `vercel link`
- **Format**: Random string like `prj_xxxxxxxxxxxxx`
- **Used for**: Identifying your Vercel project

**To add:**
1. Same file as above: `cat .vercel/project.json`
2. Copy the value of `"projectId"`
3. Add as secret in GitHub

---

### 3. Application Configuration

#### `API_URL`
- **Description**: Your Railway backend URL
- **Where to find**: Railway Dashboard → Your service → Settings → Domains
- **Format**: `https://your-app.railway.app`
- **Used for**: Health checks and frontend API connection

**To add:**
1. Deploy backend first OR use Railway's generated URL
2. Railway gives you: `https://[random].railway.app`
3. Add as secret in GitHub
4. **Update this after first deployment** with your actual domain

---

#### `NEXT_PUBLIC_API_URL`
- **Description**: Same as API_URL, but for frontend environment
- **Where to find**: Same as above
- **Format**: `https://your-app.railway.app` or `https://api.homemore.pl`
- **Used for**: Frontend API calls

**To add:**
1. Same value as `API_URL`
2. This will be updated to use your custom domain later

---

### 4. Third-Party Service Secrets

#### `AWS_S3_ACCESS_KEY_ID`
- **Description**: AWS IAM user access key for S3
- **Where to find**: AWS IAM → Users → homemore-s3-uploader → Security credentials → Access keys
- **Format**: Starts with `AKIA...`
- **Used for**: Uploading files to S3

---

#### `AWS_S3_SECRET_ACCESS_KEY`
- **Description**: AWS IAM user secret key for S3
- **Where to find**: Same as above (only visible when created)
- **Format**: Long alphanumeric string
- **Used for**: S3 authentication

---

#### `SENDGRID_API_KEY`
- **Description**: SendGrid API key for sending emails
- **Where to find**: SendGrid Dashboard → Settings → API Keys
- **Format**: Starts with `SG.`
- **Used for**: Transactional email delivery

---

#### `STRIPE_SECRET_KEY`
- **Description**: Stripe secret key for payment processing
- **Where to find**: Stripe Dashboard → Developers → API keys
- **Format**: `sk_test_...` (test) or `sk_live_...` (production)
- **Used for**: Creating payment intents, processing payments

**⚠️ Important**: Start with `sk_test_...` until you're ready for production

---

#### `SENTRY_DSN`
- **Description**: Sentry DSN for backend error tracking
- **Where to find**: Sentry → homemore-api project → Settings → Client Keys
- **Format**: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
- **Used for**: Backend error reporting

---

#### `SENTRY_AUTH_TOKEN` (Optional for source maps)
- **Description**: Sentry auth token for uploading source maps
- **Where to find**: Sentry → Settings → Auth Tokens
- **Format**: Long hexadecimal string
- **Used for**: Uploading source maps for better error traces
- **Note**: Optional, but recommended for production

---

### 5. Security Secrets

#### `JWT_SECRET`
- **Description**: Secret key for signing JWT tokens
- **Where to find**: Generated by `./scripts/setup-production-env.sh`
- **Format**: 128 character hex string
- **Used for**: JWT authentication

**To generate manually:**
```bash
openssl rand -hex 64
```

---

#### `JWT_REFRESH_SECRET`
- **Description**: Secret key for refresh tokens
- **Where to find**: Generated by `./scripts/setup-production-env.sh`
- **Format**: 128 character hex string
- **Used for**: JWT refresh token authentication

**To generate manually:**
```bash
openssl rand -hex 64
```

---

#### `SESSION_SECRET`
- **Description**: Secret key for session encryption
- **Where to find**: Generated by `./scripts/setup-production-env.sh`
- **Format**: 128 character hex string
- **Used for**: Express session signing

**To generate manually:**
```bash
openssl rand -hex 64
```

---

## Quick Setup Script

To add all secrets at once, you can use GitHub CLI:

### Prerequisites
```bash
# Install GitHub CLI
# macOS: brew install gh
# Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md
# Windows: https://github.com/cli/cli/releases

# Login
gh auth login
```

### Add All Secrets

```bash
#!/bin/bash
# Load environment variables
source .env.production

# Add all secrets
gh secret set DATABASE_URL --body "$DATABASE_URL"
gh secret set DATABASE_URL_UNPOOLED --body "$DATABASE_URL_UNPOOLED"
gh secret set RAILWAY_TOKEN --body "$RAILWAY_TOKEN"
gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID"
gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID"
gh secret set API_URL --body "$API_URL"
gh secret set NEXT_PUBLIC_API_URL --body "$NEXT_PUBLIC_API_URL"
gh secret set AWS_S3_ACCESS_KEY_ID --body "$AWS_S3_ACCESS_KEY_ID"
gh secret set AWS_S3_SECRET_ACCESS_KEY --body "$AWS_S3_SECRET_ACCESS_KEY"
gh secret set SENDGRID_API_KEY --body "$SENDGRID_API_KEY"
gh secret set STRIPE_SECRET_KEY --body "$STRIPE_SECRET_KEY"
gh secret set SENTRY_DSN --body "$SENTRY_DSN"
gh secret set JWT_SECRET --body "$JWT_SECRET"
gh secret set JWT_REFRESH_SECRET --body "$JWT_REFRESH_SECRET"
gh secret set SESSION_SECRET --body "$SESSION_SECRET"

echo "✅ All secrets added successfully!"
```

Save this as `scripts/setup-github-secrets.sh` and run:
```bash
chmod +x scripts/setup-github-secrets.sh
./scripts/setup-github-secrets.sh
```

---

## Verification

After adding all secrets, verify they're set:

### Via Web UI
1. Go to: https://github.com/vsemashko/long-rent/settings/secrets/actions
2. You should see 14-16 secrets listed
3. Click on each to verify it was added (values are hidden, but you can see the name)

### Via GitHub CLI
```bash
gh secret list
```

Expected output:
```
DATABASE_URL               Updated 2024-XX-XX
DATABASE_URL_UNPOOLED      Updated 2024-XX-XX
RAILWAY_TOKEN              Updated 2024-XX-XX
VERCEL_TOKEN               Updated 2024-XX-XX
VERCEL_ORG_ID              Updated 2024-XX-XX
VERCEL_PROJECT_ID          Updated 2024-XX-XX
API_URL                    Updated 2024-XX-XX
NEXT_PUBLIC_API_URL        Updated 2024-XX-XX
AWS_S3_ACCESS_KEY_ID       Updated 2024-XX-XX
AWS_S3_SECRET_ACCESS_KEY   Updated 2024-XX-XX
SENDGRID_API_KEY           Updated 2024-XX-XX
STRIPE_SECRET_KEY          Updated 2024-XX-XX
SENTRY_DSN                 Updated 2024-XX-XX
JWT_SECRET                 Updated 2024-XX-XX
JWT_REFRESH_SECRET         Updated 2024-XX-XX
SESSION_SECRET             Updated 2024-XX-XX
```

---

## Testing the Workflow

After adding all secrets, test the CI/CD workflow:

### Option 1: Manual Trigger
1. Go to: https://github.com/vsemashko/long-rent/actions
2. Click on **"Deploy to Production"** workflow
3. Click **"Run workflow"** dropdown
4. Select branch: `main`
5. Click **"Run workflow"**

### Option 2: Push to Main
```bash
# Make a small change
echo "# Test deployment" >> README.md
git add README.md
git commit -m "test: Trigger CI/CD workflow"
git push origin main
```

The workflow will:
1. ✅ Deploy backend to Railway
2. ✅ Run database migrations
3. ✅ Deploy frontend to Vercel
4. ✅ Run health checks
5. ✅ Notify on success/failure

---

## Security Best Practices

### 1. Never Log Secrets
```yaml
# ❌ BAD - Don't do this
- name: Debug
  run: echo "API Key: ${{ secrets.STRIPE_SECRET_KEY }}"

# ✅ GOOD - Mask sensitive data
- name: Debug
  run: echo "API Key is set: ${{ secrets.STRIPE_SECRET_KEY != '' }}"
```

### 2. Rotate Secrets Regularly
- Set calendar reminder for quarterly rotation
- Especially important for:
  - JWT secrets
  - API keys
  - Database passwords

### 3. Use Different Secrets for Environments
- Never share production secrets with staging
- Use Stripe test keys for non-production
- Use separate databases for each environment

### 4. Limit Secret Access
- Only add secrets that workflows actually need
- Review secret usage periodically
- Remove unused secrets

### 5. Monitor Secret Usage
- Check Actions logs for failed authentications
- Set up alerts for secret-related errors
- Regularly audit which workflows use which secrets

---

## Troubleshooting

### Secret Not Found
**Error**: `secret not found: DATABASE_URL`

**Solution**:
1. Verify secret name matches exactly (case-sensitive)
2. Check you're in the right repository
3. Ensure secret is at repository level, not environment level

---

### Secret Value Incorrect
**Error**: `Invalid API key` or `Authentication failed`

**Solution**:
1. Copy the secret value again from source
2. Check for trailing spaces or newlines
3. Ensure no quotes are included unless they're part of the value
4. Re-add the secret in GitHub

---

### Permission Denied
**Error**: `Resource not accessible by integration`

**Solution**:
1. Go to: Settings → Actions → General
2. Ensure **"Workflow permissions"** is set to **"Read and write permissions"**
3. Check **"Allow GitHub Actions to create and approve pull requests"**

---

### Railway/Vercel Deployment Fails
**Error**: `Railway token invalid` or `Vercel token expired`

**Solution**:
1. Tokens may expire - generate new ones
2. For Railway: `railway whoami --token`
3. For Vercel: `vercel token create "New Token"`
4. Update secrets with new tokens

---

## Next Steps

After setting up all GitHub Secrets:

1. ✅ **Verify all secrets are added** (16 total)
2. ✅ **Test the workflow** with a manual trigger or test push
3. ✅ **Run pre-deployment verification**: `./scripts/verify-deployment.sh`
4. ✅ **Deploy to production**: Push to `main` branch
5. ✅ **Monitor deployment**: Watch GitHub Actions tab
6. ✅ **Run post-deployment verification**: Check health endpoints

---

## Reference: Environment Variables vs Secrets

| Variable | In `.env.production` | In GitHub Secrets | Why Different? |
|----------|---------------------|-------------------|----------------|
| `DATABASE_URL` | ✅ Yes | ✅ Yes | Needed locally and in CI/CD |
| `NEXT_PUBLIC_API_URL` | ✅ Yes | ✅ Yes | Frontend needs it, CI/CD too |
| `AWS_S3_BUCKET` | ✅ Yes | ❌ No | Not sensitive, can be public |
| `STRIPE_SECRET_KEY` | ✅ Yes | ✅ Yes | Sensitive, needed in both |
| `PORT` | ✅ Yes | ❌ No | Railway sets this automatically |

**Rule of thumb**: If it's sensitive (password, secret key, token), add it to GitHub Secrets.

---

**Last Updated**: November 22, 2025
**Required Secrets**: 14-16
**Setup Time**: 15-20 minutes (manual) or 5 minutes (with script)
