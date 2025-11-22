# Quick MVP Deployment Guide

**Deployment Stack**: Vercel + Railway + Supabase + Upstash + CloudFlare
**Estimated Time**: 2-3 hours setup + 1-2 hours deployment
**Monthly Cost**: $71-121

This guide will help you deploy the HomeMore platform to production using the Quick MVP approach.

---

## Prerequisites

- [ ] GitHub account (for repository)
- [ ] Credit card (for service sign-ups, most have free tiers)
- [ ] Domain name `homemore.pl` (or substitute with your domain)
- [ ] 2-3 hours of focused time

---

## Phase 1: Service Sign-Ups (30-60 minutes)

### 1. Supabase (Database) - Free Tier Available

**What**: PostgreSQL database with PostGIS extension

**Sign Up**:
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" → Sign up with GitHub
3. Create new organization: "HomeMore"
4. Create new project:
   - **Name**: homemore-production
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Europe (Frankfurt) - closest to Poland
   - **Plan**: Free tier (upgrade to Pro later: $25/month)
5. Wait 2-3 minutes for database to provision

**Get Connection Strings**:
1. Go to Project Settings > Database
2. Copy connection strings:
   - **Connection Pooling**: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?pgbouncer=true`
   - **Direct Connection**: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`
3. Save these in a secure note (you'll need them later)

**Enable PostGIS**:
1. Go to Database > Extensions
2. Search for "postgis"
3. Click "Enable" next to PostGIS extension

**Cost**: Free tier (500MB database, 1GB file storage, 2GB bandwidth)
**Upgrade**: Pro $25/month (8GB database, 100GB file storage, 50GB bandwidth)

---

### 2. Upstash (Redis Cache) - Free Tier Available

**What**: Redis cache for sessions, caching, WebSocket scaling

**Sign Up**:
1. Go to [https://upstash.com](https://upstash.com)
2. Sign up with GitHub
3. Create new database:
   - **Name**: homemore-cache
   - **Region**: EU-Central-1 (Frankfurt)
   - **Type**: Regional
   - **TLS**: Enabled
4. Wait 30 seconds for provisioning

**Get Connection String**:
1. Click on your database
2. Copy "Redis URL" (starts with `rediss://`)
3. Example: `rediss://default:[PASSWORD]@eu2-absolute-krill-12345.upstash.io:6379`
4. Save this in your secure note

**Cost**: Free tier (10,000 commands/day, 256MB)
**Upgrade**: Pay-as-you-go ($0.20 per 100K commands)

---

### 3. Vercel (Frontend Hosting) - Free Tier Available

**What**: Next.js frontend hosting with CDN

**Sign Up**:
1. Go to [https://vercel.com](https://vercel.com)
2. Click "Sign Up" → Continue with GitHub
3. Authorize Vercel to access your repositories
4. **Don't import a project yet** (we'll do this later)

**Cost**: Free tier (100GB bandwidth, unlimited domains)
**Upgrade**: Pro $20/month (1TB bandwidth, better performance)

---

### 4. Railway (Backend Hosting) - Free Trial Available

**What**: Node.js backend hosting with Docker support

**Sign Up**:
1. Go to [https://railway.app](https://railway.app)
2. Click "Login" → Login with GitHub
3. Authorize Railway
4. Get $5 free trial credit (no credit card required initially)
5. **Don't create a project yet** (we'll do this later)

**Cost**: Free trial $5 credit (lasts ~2-3 weeks)
**Upgrade**: Pay-as-you-go (~$20-50/month for hobby usage)

---

### 5. AWS (S3 File Storage) - Free Tier for 12 Months

**What**: File storage for property photos

**Sign Up**:
1. Go to [https://aws.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Fill in email, password, account name
4. Choose "Personal" account type
5. Enter payment information (required, but we'll use free tier)
6. Verify identity (phone call)
7. Choose "Basic Support" (free)

**Create S3 Bucket**:
1. Go to S3 console: [https://s3.console.aws.amazon.com](https://s3.console.aws.amazon.com)
2. Click "Create bucket"
   - **Bucket name**: `homemore-uploads-production` (must be globally unique)
   - **Region**: Europe (Frankfurt) eu-central-1
   - **Block Public Access**: UNCHECK "Block all public access"
   - **Bucket Versioning**: Enable
   - **Encryption**: Enable (default SSE-S3)
3. Click "Create bucket"

**Configure Bucket CORS**:
1. Click on your bucket
2. Go to "Permissions" tab
3. Scroll to "Cross-origin resource sharing (CORS)"
4. Click "Edit" and paste:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["https://homemore.pl", "https://www.homemore.pl", "https://api.homemore.pl"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```
5. Save changes

**Create IAM User for S3 Access**:
1. Go to IAM console: [https://console.aws.amazon.com/iam](https://console.aws.amazon.com/iam)
2. Click "Users" > "Add users"
   - **User name**: `homemore-s3-user`
   - **Access type**: Programmatic access
3. Click "Next: Permissions"
   - Click "Attach existing policies directly"
   - Search and select "AmazonS3FullAccess"
4. Click through to "Create user"
5. **IMPORTANT**: Copy Access Key ID and Secret Access Key (save in secure note)
6. You won't be able to see the secret key again!

**Cost**: Free tier (5GB storage, 20K GET requests, 2K PUT requests/month for 12 months)
**After free tier**: ~$0.023/GB/month (~$5-10/month for typical usage)

---

### 6. Stripe (Payment Processing)

**What**: Payment processing for rent, deposits, utilities

**Sign Up**:
1. Go to [https://stripe.com](https://stripe.com)
2. Click "Start now" → Create account
3. Fill in business details:
   - **Country**: Poland
   - **Business type**: Individual (or Company if registered)
   - **Industry**: Real Estate
4. Complete identity verification (required for live payments)
5. This may take 1-2 business days for approval

**Get API Keys**:
1. Go to Developers > API Keys
2. Toggle "Test mode" OFF (to see live keys)
3. Copy:
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...` (click "Reveal live key")
4. Save both in your secure note

**Set Up Webhook** (we'll do this after backend is deployed):
- We'll add webhook endpoint: `https://api.homemore.pl/webhooks/stripe`
- We'll get webhook secret: `whsec_...`

**Cost**: Free to set up, 2.9% + €0.30 per transaction

---

### 7. SendGrid (Email Service) - Free Tier Available

**What**: Email delivery for verification, password reset, notifications

**Sign Up**:
1. Go to [https://sendgrid.com](https://sendgrid.com)
2. Click "Start for free"
3. Create account (use business email if possible)
4. Complete email verification
5. Choose "Free" plan (100 emails/day)

**Create API Key**:
1. Go to Settings > API Keys
2. Click "Create API Key"
   - **Name**: HomeMore Production
   - **Permissions**: Full Access
3. Copy API key (starts with `SG.`) and save it
4. **You won't be able to see it again!**

**Verify Sender Domain** (Important for deliverability):
1. Go to Settings > Sender Authentication
2. Click "Authenticate Your Domain"
3. Choose DNS host (where you bought homemore.pl)
4. Add the DNS records they provide (CNAME, MX, TXT)
5. Wait for verification (can take 24-48 hours)

**Cost**: Free tier (100 emails/day = 3,000/month)
**Upgrade**: Essential $19.95/month (40,000 emails/month)

---

### 8. Sentry (Error Tracking) - Free Tier Available

**What**: Real-time error monitoring and crash reporting

**Sign Up**:
1. Go to [https://sentry.io](https://sentry.io)
2. Click "Get Started" → Sign up with GitHub
3. Create organization: "HomeMore"
4. Create project:
   - **Platform**: Node.js (for backend)
   - **Project name**: homemore-api
5. Copy the DSN (Data Source Name)
6. Repeat for frontend:
   - **Platform**: Next.js
   - **Project name**: homemore-web
7. Copy both DSNs to secure note

**Cost**: Free tier (5,000 errors/month, 1 user)
**Upgrade**: Team $26/month (50,000 errors/month, unlimited users)

---

### 9. Google Cloud (Maps & Analytics) - Free Tier Available

**What**: Google Maps for property search + Google Analytics for tracking

**Sign Up**:
1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with Google account
3. Create new project: "HomeMore"
4. Enable billing (required for Maps API, but you get $200/month free credit)

**Enable Maps APIs**:
1. Go to "APIs & Services" > "Library"
2. Search and enable:
   - Maps JavaScript API
   - Places API
   - Geocoding API
3. Go to "Credentials"
4. Click "Create Credentials" > "API Key"
5. Copy API key
6. Click "Restrict Key":
   - **Application restrictions**: HTTP referrers
   - **Website restrictions**:
     - `https://homemore.pl/*`
     - `https://www.homemore.pl/*`
   - **API restrictions**: Select the 3 APIs enabled above
7. Save

**Create Google Analytics 4 Property**:
1. Go to [https://analytics.google.com](https://analytics.google.com)
2. Click "Start measuring"
3. Create account: "HomeMore"
4. Create property: "HomeMore Production"
5. Set up data stream:
   - **Platform**: Web
   - **Website URL**: https://homemore.pl
   - **Stream name**: HomeMore Web
6. Copy Measurement ID (starts with `G-`)

**Cost**: Free tier ($200/month credit = 28,000 map loads)
**Typical usage**: $20-50/month after free credit

---

### 10. Mixpanel (Analytics) - Free Tier Available

**What**: User behavior analytics and event tracking

**Sign Up**:
1. Go to [https://mixpanel.com](https://mixpanel.com)
2. Click "Get Started Free"
3. Create account
4. Create project: "HomeMore Production"
5. Copy Project Token

**Cost**: Free tier (20M events/month)
**Upgrade**: Growth $24/month (100M events/month)

---

### 11. CloudFlare (CDN & SSL) - Free Tier Available

**What**: CDN, DDoS protection, free SSL certificates

**Sign Up**:
1. Go to [https://cloudflare.com](https://cloudflare.com)
2. Click "Sign Up"
3. Enter email and password
4. **We'll configure this after deploying** (need DNS access)

**Cost**: Free tier (unlimited bandwidth, basic DDoS protection)
**Upgrade**: Pro $20/month (better performance, advanced security)

---

## Phase 2: Environment Configuration (15-30 minutes)

### 1. Generate Secure Secrets

On your local machine, run:

```bash
# Generate JWT secrets
openssl rand -hex 64  # Save as JWT_SECRET
openssl rand -hex 64  # Save as JWT_REFRESH_SECRET
openssl rand -hex 64  # Save as SESSION_SECRET
```

Copy these three values to your secure note.

### 2. Create Production Environment File

```bash
cd /path/to/long-rent
cp .env.production.template .env.production
```

Edit `.env.production` and fill in ALL the values you collected:

- Supabase connection strings
- Upstash Redis URL
- AWS S3 credentials
- Stripe API keys
- SendGrid API key
- Google Maps API key
- Sentry DSNs
- Analytics IDs (GA4, Mixpanel)
- Generated secrets

**Important**: This file contains sensitive data. Never commit it to Git!

---

## Phase 3: Deploy Backend (30-45 minutes)

### 1. Run Database Migrations

On your local machine:

```bash
# Set Supabase connection string
export DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# Navigate to API directory
cd apps/api

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Verify migration
npx prisma db execute --stdin <<< "SELECT 1"
```

Expected output: Migration successful ✓

### 2. Deploy to Railway

**Via CLI** (Recommended):

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project (creates new project if doesn't exist)
railway link

# Add environment variables (one by one or bulk)
railway variables set DATABASE_URL="your-supabase-url"
railway variables set REDIS_URL="your-upstash-url"
# ... repeat for all variables from .env.production

# Deploy
railway up
```

**Via Dashboard** (Alternative):

1. Go to [https://railway.app/new](https://railway.app/new)
2. Click "Deploy from GitHub repo"
3. Select your `long-rent` repository
4. Railway will detect the Dockerfile automatically
5. Configure:
   - **Root Directory**: `/`
   - **Dockerfile Path**: `apps/api/Dockerfile`
6. Add environment variables:
   - Click "Variables" tab
   - Click "RAW Editor"
   - Paste all variables from `.env.production` (backend section)
7. Click "Deploy"

Wait 3-5 minutes for build and deployment.

### 3. Get Backend URL

1. Go to Railway dashboard
2. Click on your service
3. Go to "Settings" > "Networking"
4. Click "Generate Domain"
5. Copy the URL (e.g., `homemore-api.up.railway.app`)
6. **Optional**: Add custom domain `api.homemore.pl`:
   - Click "Custom Domain"
   - Enter `api.homemore.pl`
   - Add CNAME record to your DNS:
     - **Type**: CNAME
     - **Name**: api
     - **Value**: `homemore-api.up.railway.app`

### 4. Test Backend

```bash
# Health check
curl https://homemore-api.up.railway.app/health

# Expected response:
# {"status":"ok","database":"connected"}
```

If you get an error, check Railway logs:
```bash
railway logs
```

---

## Phase 4: Deploy Frontend (15-30 minutes)

### 1. Deploy to Vercel

**Via CLI** (Recommended):

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd apps/web
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name: homemore-web
# - Directory: apps/web
# - Want to override settings? Yes
# - Build command: leave as default
# - Output directory: .next
# - Development command: npm run dev
```

**Via Dashboard** (Alternative):

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select `vsemashko/long-rent`
4. Configure:
   - **Root Directory**: `apps/web`
   - **Framework Preset**: Next.js
   - **Build Command**: `cd ../.. && npm run build --filter=web`
   - **Output Directory**: `.next`
5. Add environment variables:
   - Click "Environment Variables"
   - Add all `NEXT_PUBLIC_*` variables from `.env.production`
   - Add `API_URL` pointing to your Railway backend
6. Click "Deploy"

Wait 2-4 minutes for build.

### 2. Configure Custom Domain

1. In Vercel dashboard, go to your project
2. Click "Settings" > "Domains"
3. Add domain: `homemore.pl`
4. Add redirect: `www.homemore.pl` → `homemore.pl`
5. Vercel will provide DNS instructions:
   - **Type**: A
   - **Name**: @
   - **Value**: 76.76.21.21 (Vercel IP)
   - **Type**: CNAME
   - **Name**: www
   - **Value**: cname.vercel-dns.com
6. Add these records to your domain registrar's DNS settings
7. Wait for DNS propagation (5 minutes to 48 hours, usually <1 hour)

### 3. Test Frontend

```bash
# Visit your site
open https://homemore.pl

# Or with Vercel URL
open https://homemore-web.vercel.app
```

You should see the HomeMore homepage!

---

## Phase 5: Post-Deployment (30-60 minutes)

### 1. Configure Stripe Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
   - **Endpoint URL**: `https://api.homemore.pl/webhooks/stripe`
   - **Events to send**: Select:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
3. Click "Add endpoint"
4. Copy "Signing secret" (starts with `whsec_`)
5. Add to Railway environment:
   ```bash
   railway variables set STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

### 2. Configure CloudFlare (Optional but Recommended)

1. Go to CloudFlare dashboard
2. Click "Add a Site"
3. Enter `homemore.pl`
4. Select Free plan
5. CloudFlare will scan your DNS records
6. Verify records are correct
7. Update nameservers at your domain registrar to CloudFlare's:
   - Usually: `adam.ns.cloudflare.com` and `erin.ns.cloudflare.com`
8. Enable:
   - SSL/TLS: Full (strict)
   - Always Use HTTPS: On
   - Auto Minify: On (JS, CSS, HTML)
   - Brotli: On
9. Wait for nameserver propagation (2-48 hours, usually <4 hours)

### 3. Run Production Verification

```bash
# Clone your repo locally if not already
git clone https://github.com/vsemashko/long-rent.git
cd long-rent

# Run verification script
./scripts/verify-production.sh
```

Fix any errors that appear.

### 4. Test Critical User Flows

Manually test these flows in production:

- [ ] User registration
- [ ] Email verification (check SendGrid for email)
- [ ] Login
- [ ] Create property listing
- [ ] Upload property photo (check S3)
- [ ] Search for properties
- [ ] Request viewing
- [ ] Real-time messaging
- [ ] Submit rental application

### 5. Monitor Errors

1. Go to Sentry dashboard
2. Trigger a test error:
   ```bash
   curl https://api.homemore.pl/test-error
   ```
3. Verify error appears in Sentry

### 6. Check Analytics

1. Visit https://homemore.pl
2. Click around (property search, etc.)
3. Wait 5-10 minutes
4. Check Google Analytics 4 dashboard for page views
5. Check Mixpanel dashboard for events

---

## Phase 6: Going Live (Day 2-3)

### 1. Beta Testing

1. Invite 10-20 beta testers
2. Share credentials
3. Collect feedback
4. Fix critical bugs

### 2. Performance Optimization

Run Lighthouse audit:
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://homemore.pl --view
```

Target scores: >90 for Performance, Accessibility, SEO

### 3. Security Check

1. SSL test: https://www.ssllabs.com/ssltest/analyze.html?d=homemore.pl
2. Security headers: https://securityheaders.com/?q=homemore.pl
3. Fix any issues

---

## Troubleshooting

### Backend won't start on Railway

**Check logs**:
```bash
railway logs
```

**Common issues**:
- Missing environment variables
- Database connection failed (check Supabase URL)
- Redis connection failed (check Upstash URL)
- Port mismatch (Railway auto-assigns PORT)

**Fix**: Ensure `PORT` is not hardcoded in code, use `process.env.PORT`

### Frontend build fails on Vercel

**Check build logs** in Vercel dashboard

**Common issues**:
- Missing environment variables
- TypeScript errors
- API URL incorrect

**Fix**:
```bash
# Verify build locally first
cd apps/web
npm run build
```

### Database migrations fail

**Error**: "SSL connection required"

**Fix**: Add `?sslmode=require` to DATABASE_URL:
```
postgresql://...?sslmode=require&pgbouncer=true
```

### Emails not sending

**Check**:
1. SendGrid API key is correct
2. Sender domain is verified
3. No typos in `EMAIL_FROM`

**Debug**:
```bash
# Check Railway logs for email sending
railway logs | grep -i email
```

### File uploads fail

**Check**:
1. S3 bucket exists
2. AWS credentials are correct
3. CORS policy is configured
4. Bucket is not blocking public access

**Test S3 directly**:
```bash
# Install AWS CLI
brew install awscli

# Configure
aws configure
# Enter your access key, secret key, region (eu-central-1)

# Test upload
echo "test" > test.txt
aws s3 cp test.txt s3://homemore-uploads-production/test.txt
```

---

## Cost Summary

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Supabase | Free / Pro | $0 / $25 |
| Upstash | Free | $0 |
| Vercel | Free / Pro | $0 / $20 |
| Railway | Pay-as-you-go | $20-50 |
| AWS S3 | Pay-as-you-go | $5-10 |
| Stripe | Transaction fees | 2.9% + €0.30 |
| SendGrid | Free | $0 |
| Sentry | Free | $0 |
| Google Maps | Free credit | $0 (free $200/mo) |
| Mixpanel | Free | $0 |
| CloudFlare | Free | $0 |
| **Total** | **MVP** | **$25-85/month** |

---

## Next Steps

After deployment:

1. ✅ Complete legal review (hire Polish attorney)
2. ✅ Register DPO with PUODO
3. ✅ Run E2E tests against production
4. ✅ Load testing (K6 or Artillery)
5. ✅ Security audit (OWASP ZAP)
6. ✅ Beta program (50-100 users)
7. ✅ Public launch

---

## Support

If you encounter issues:

1. Check Railway logs: `railway logs`
2. Check Vercel logs: Vercel dashboard > Deployments > View logs
3. Check Sentry for errors
4. Refer to `PRODUCTION_READINESS_ASSESSMENT.md`
5. Review `docs/PRODUCTION_DEPLOYMENT.md`

---

**Last Updated**: November 22, 2025
**Deployment Stack**: Vercel + Railway + Supabase (Quick MVP)
**Status**: Ready for deployment 🚀
