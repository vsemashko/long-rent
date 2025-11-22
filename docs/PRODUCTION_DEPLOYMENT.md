# Production Deployment Guide

This guide provides step-by-step instructions for deploying the HomeMore platform to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Infrastructure Setup](#infrastructure-setup)
- [Database Setup](#database-setup)
- [Application Deployment](#application-deployment)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Accounts & Services

- [ ] **Cloud Provider** (AWS/Vercel/DigitalOcean)
- [ ] **Domain Name** (homemore.pl)
- [ ] **PostgreSQL Database** (AWS RDS/Supabase/Neon)
- [ ] **Redis Instance** (AWS ElastiCache/Upstash)
- [ ] **Email Service** (SendGrid/AWS SES)
- [ ] **SMS Service** (Twilio)
- [ ] **File Storage** (AWS S3/Cloudinary)
- [ ] **Payment Gateway** (Stripe)
- [ ] **Monitoring** (Datadog/New Relic)
- [ ] **Error Tracking** (Sentry)
- [ ] **CDN** (CloudFront/Cloudflare)

### Tools

```bash
# Install required tools
brew install node@20
brew install postgresql
brew install redis
npm install -g pm2  # For process management
npm install -g pnpm # Package manager
```

---

## Infrastructure Setup

### Option 1: Vercel + Serverless (Recommended for MVP)

**Frontend (Next.js)**:
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy frontend
cd apps/web
vercel --prod

# Configure custom domain
vercel domains add homemore.pl
```

**Backend (NestJS)**:
```bash
# Deploy to Vercel (serverless functions)
cd apps/api
vercel --prod

# Or deploy to Railway/Render (recommended for WebSocket support)
# Railway supports WebSocket and is easier for NestJS
```

### Option 2: AWS (Production-Ready)

**Architecture**:
```
┌─────────────┐
│ CloudFront  │ (CDN)
└──────┬──────┘
       │
┌──────▼──────┐
│    ALB      │ (Load Balancer)
└──────┬──────┘
       │
┌──────▼──────────────────┐
│  ECS/EC2 Instances      │
│  ┌─────────┬─────────┐  │
│  │Frontend │ Backend │  │
│  │(Next.js)│(NestJS) │  │
│  └─────────┴─────────┘  │
└─────────────────────────┘
       │          │
┌──────▼───┐  ┌──▼─────┐
│   RDS    │  │ Redis  │
│(Postgres)│  │(Cache) │
└──────────┘  └────────┘
```

**Setup Steps**:

1. **Create VPC**:
```bash
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=homemore-vpc}]'
```

2. **Create RDS Instance**:
```bash
aws rds create-db-instance \
  --db-instance-identifier homemore-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username homemore \
  --master-user-password <SECURE_PASSWORD> \
  --allocated-storage 100 \
  --storage-type gp3 \
  --vpc-security-group-ids <SECURITY_GROUP_ID> \
  --publicly-accessible false \
  --backup-retention-period 7 \
  --multi-az
```

3. **Create ElastiCache Redis**:
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id homemore-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --cache-subnet-group-name <SUBNET_GROUP>
```

4. **Create S3 Bucket**:
```bash
aws s3 mb s3://homemore-uploads
aws s3api put-bucket-versioning --bucket homemore-uploads --versioning-configuration Status=Enabled
aws s3api put-bucket-encryption --bucket homemore-uploads --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
```

5. **Create ECS Cluster**:
```bash
aws ecs create-cluster --cluster-name homemore-cluster
```

### Option 3: DigitalOcean (Cost-Effective)

**Setup**:
```bash
# Create Droplet
doctl compute droplet create homemore-api \
  --size s-2vcpu-4gb \
  --image ubuntu-22-04-x64 \
  --region fra1

# Create Managed Database
doctl databases create homemore-db \
  --engine pg \
  --version 15 \
  --size db-s-2vcpu-4gb \
  --region fra1
```

---

## Database Setup

### 1. Create Production Database

```sql
-- Connect to PostgreSQL
psql -h <RDS_ENDPOINT> -U homemore -d postgres

-- Create database
CREATE DATABASE homemore_production;

-- Enable PostGIS (for geolocation)
\c homemore_production
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- For text search
```

### 2. Run Migrations

```bash
# Set production database URL
export DATABASE_URL="postgresql://homemore:<PASSWORD>@<RDS_ENDPOINT>:5432/homemore_production"

# Run Prisma migrations
cd apps/api
npx prisma migrate deploy

# Seed initial data (if needed)
npx prisma db seed
```

### 3. Set Up Backup

```bash
# Automated backups (AWS RDS does this automatically)
# For manual backup:
pg_dump -h <RDS_ENDPOINT> -U homemore homemore_production > backup.sql

# Create S3 bucket for backups
aws s3 mb s3://homemore-db-backups

# Upload backup
aws s3 cp backup.sql s3://homemore-db-backups/$(date +%Y%m%d).sql

# Create daily backup cron job
# Add to crontab: 0 2 * * * /scripts/backup-db.sh
```

---

## Application Deployment

### Backend Deployment (NestJS)

**Using PM2** (on VPS/EC2):
```bash
# Install dependencies
cd apps/api
npm install --production

# Build application
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'homemore-api',
    script: './dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Configure to start on boot
```

**Using Docker**:
```dockerfile
# Dockerfile.api
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

```bash
# Build and run
docker build -t homemore-api:latest -f Dockerfile.api .
docker run -d -p 3001:3001 --env-file .env.production homemore-api:latest
```

### Frontend Deployment (Next.js)

**Vercel** (Recommended):
```bash
# Deploy via CLI
cd apps/web
vercel --prod

# Or connect GitHub repo for automatic deployments
# https://vercel.com/new
```

**Self-Hosted**:
```bash
# Build
cd apps/web
npm run build

# Start
npm run start  # Runs on port 3000

# Or use PM2
pm2 start npm --name "homemore-web" -- start
```

**Docker**:
```dockerfile
# Dockerfile.web
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Environment Variables

### Backend (.env.production)

```bash
# Database
DATABASE_URL="postgresql://homemore:<PASSWORD>@<RDS_ENDPOINT>:5432/homemore_production?connection_limit=20"
DATABASE_URL_UNPOOLED="postgresql://homemore:<PASSWORD>@<RDS_ENDPOINT>:5432/homemore_production"

# Redis
REDIS_URL="redis://<ELASTICACHE_ENDPOINT>:6379"

# Authentication
JWT_SECRET="<GENERATE_SECURE_RANDOM_STRING_64_CHARS>"
JWT_REFRESH_SECRET="<GENERATE_SECURE_RANDOM_STRING_64_CHARS>"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Application
NODE_ENV="production"
API_URL="https://api.homemore.pl"
WEB_URL="https://homemore.pl"
PORT=3001

# Email
EMAIL_FROM="noreply@homemore.pl"
SENDGRID_API_KEY="<SENDGRID_API_KEY>"

# SMS
TWILIO_ACCOUNT_SID="<TWILIO_SID>"
TWILIO_AUTH_TOKEN="<TWILIO_TOKEN>"
TWILIO_PHONE_NUMBER="+48123456789"

# File Storage
AWS_S3_REGION="eu-central-1"
AWS_S3_BUCKET="homemore-uploads"
AWS_S3_ACCESS_KEY_ID="<AWS_ACCESS_KEY>"
AWS_S3_SECRET_ACCESS_KEY="<AWS_SECRET_KEY>"

# Maps
GOOGLE_PLACES_API_KEY="<GOOGLE_API_KEY>"

# Payments
STRIPE_PUBLIC_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Monitoring
SENTRY_DSN="<SENTRY_DSN>"

# Rate Limiting
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="15m"

# Session
SESSION_SECRET="<GENERATE_SECURE_RANDOM_STRING_64_CHARS>"

# CORS
CORS_ORIGIN="https://homemore.pl"
```

### Frontend (.env.production)

```bash
NEXT_PUBLIC_API_URL="https://api.homemore.pl"
NEXT_PUBLIC_WS_URL="wss://api.homemore.pl"
NEXT_PUBLIC_SITE_URL="https://homemore.pl"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="<GOOGLE_API_KEY>"
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_live_..."
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_MIXPANEL_TOKEN="<MIXPANEL_TOKEN>"
NEXT_PUBLIC_SENTRY_DSN="<SENTRY_DSN>"
```

### Generate Secrets

```bash
# Generate random secrets
openssl rand -hex 64  # For JWT_SECRET
openssl rand -hex 64  # For JWT_REFRESH_SECRET
openssl rand -hex 64  # For SESSION_SECRET
```

---

## Post-Deployment

### 1. SSL/TLS Setup

**Certbot** (Let's Encrypt):
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d homemore.pl -d www.homemore.pl -d api.homemore.pl

# Auto-renewal
sudo certbot renew --dry-run
```

**CloudFlare** (Recommended):
```
1. Add domain to CloudFlare
2. Enable SSL/TLS (Full or Full Strict)
3. Enable "Always Use HTTPS"
4. Configure DNS records:
   - A: homemore.pl → <SERVER_IP>
   - CNAME: www → homemore.pl
   - CNAME: api → <API_SERVER>
```

### 2. Configure Reverse Proxy (Nginx)

```nginx
# /etc/nginx/sites-available/homemore
upstream api_backend {
  server localhost:3001;
}

upstream web_backend {
  server localhost:3000;
}

# API Server
server {
  listen 443 ssl http2;
  server_name api.homemore.pl;

  ssl_certificate /etc/letsencrypt/live/api.homemore.pl/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.homemore.pl/privkey.pem;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;

  # WebSocket support
  location /socket.io/ {
    proxy_pass http://api_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  location / {
    proxy_pass http://api_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

# Web Server
server {
  listen 443 ssl http2;
  server_name homemore.pl www.homemore.pl;

  ssl_certificate /etc/letsencrypt/live/homemore.pl/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/homemore.pl/privkey.pem;

  location / {
    proxy_pass http://web_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

# HTTP to HTTPS redirect
server {
  listen 80;
  server_name homemore.pl www.homemore.pl api.homemore.pl;
  return 301 https://$server_name$request_uri;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/homemore /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Configure Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# AWS Security Group
# Inbound Rules:
# - SSH (22) from My IP
# - HTTP (80) from 0.0.0.0/0
# - HTTPS (443) from 0.0.0.0/0
# - PostgreSQL (5432) from VPC only
# - Redis (6379) from VPC only
```

### 4. Health Checks

```typescript
// apps/api/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prisma.pingCheck('database'),
    ]);
  }
}
```

```bash
# Test health endpoint
curl https://api.homemore.pl/health
```

---

## Monitoring & Maintenance

### 1. Set Up Monitoring

**Sentry** (Error Tracking):
```typescript
// apps/api/src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 0.1,
});
```

**PM2 Monitoring**:
```bash
# Install PM2 monitoring
pm2 install pm2-logrotate

# View logs
pm2 logs

# Monitor
pm2 monit
```

### 2. Set Up Alerts

```bash
# PM2 alerts for crashes
pm2 install pm2-slack
pm2 set pm2-slack:slack_url https://hooks.slack.com/services/...

# AWS CloudWatch alarms
aws cloudwatch put-metric-alarm \
  --alarm-name high-cpu \
  --alarm-description "CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### 3. Backup Strategy

```bash
# Daily database backup script
#!/bin/bash
# /scripts/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="homemore_backup_$DATE.sql"

pg_dump -h <RDS_ENDPOINT> -U homemore homemore_production > $BACKUP_FILE
gzip $BACKUP_FILE

aws s3 cp $BACKUP_FILE.gz s3://homemore-db-backups/
rm $BACKUP_FILE.gz

# Keep only last 30 days
aws s3 ls s3://homemore-db-backups/ | awk '{print $4}' | sort -r | tail -n +31 | xargs -I {} aws s3 rm s3://homemore-db-backups/{}
```

```bash
# Add to crontab
0 2 * * * /scripts/backup-db.sh
```

### 4. Log Rotation

```bash
# /etc/logrotate.d/homemore
/var/log/homemore/*.log {
  daily
  rotate 14
  compress
  delaycompress
  notifempty
  create 0640 www-data www-data
  sharedscripts
  postrotate
    pm2 reloadLogs
  endscript
}
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (unit, integration, E2E)
- [ ] Environment variables configured
- [ ] Secrets generated and secure
- [ ] Database migrations ready
- [ ] SSL certificates obtained
- [ ] DNS records configured
- [ ] Backup strategy in place

### Deployment
- [ ] Database deployed and migrations run
- [ ] Redis instance running
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Health checks passing
- [ ] SSL/TLS working
- [ ] CDN configured

### Post-Deployment
- [ ] Smoke tests passed
- [ ] Monitoring configured
- [ ] Error tracking active
- [ ] Analytics working
- [ ] Backup tested
- [ ] Load testing completed
- [ ] Performance metrics acceptable (Lighthouse > 90)

### Go-Live
- [ ] Beta users invited
- [ ] Support team ready
- [ ] Announcement scheduled
- [ ] Social media posts ready
- [ ] Press release (if applicable)

---

## Rollback Plan

```bash
# If deployment fails, rollback:

# 1. Revert frontend (Vercel)
vercel rollback

# 2. Revert backend
pm2 stop homemore-api
git checkout <PREVIOUS_TAG>
npm install
npm run build
pm2 start homemore-api

# 3. Rollback database (if needed)
psql -h <RDS_ENDPOINT> -U homemore homemore_production < backup.sql

# 4. Clear cache
redis-cli FLUSHALL
```

---

## Support Contacts

- **DevOps**: devops@homemore.pl
- **Database**: dba@homemore.pl
- **Security**: security@homemore.pl
- **On-call**: +48 XXX XXX XXX

---

**Last Updated**: November 22, 2025
