# Service Signup Guide - Step by Step

This guide walks you through signing up for all required services in priority order. Follow each step carefully and save all credentials in a secure location.

---

## ⏱️ Estimated Time: 2-3 hours

## 💰 Total Initial Cost: $0 (using free tiers)

---

## Priority Order

**Critical Path (Do these first):**
1. ✅ Supabase (Database) - 15 minutes
2. ✅ Railway (Backend Hosting) - 10 minutes
3. ✅ Vercel (Frontend Hosting) - 10 minutes
4. ✅ Upstash (Redis Cache) - 5 minutes

**Important (Do these next):**
5. ✅ AWS S3 (File Storage) - 20 minutes
6. ✅ SendGrid (Email) - 15 minutes
7. ✅ Stripe (Payments) - 20 minutes

**Supporting Services (Do these after deployment):**
8. ✅ Google Cloud (Maps & Analytics) - 20 minutes
9. ✅ Sentry (Error Tracking) - 10 minutes
10. ✅ Mixpanel (Analytics) - 10 minutes

---

# 1️⃣ Supabase (Database) - START HERE

## What You'll Get:
- PostgreSQL database with PostGIS extension
- Connection string for migrations
- Free tier: Unlimited API requests, 500 MB database

## Step-by-Step:

### 1. Create Account
1. Go to: https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

### 2. Create Project
1. Click **"New Project"**
2. **Organization**: Create new or select existing
3. **Project Name**: `homemore-production`
4. **Database Password**: Generate a strong password (SAVE THIS!)
   - Click the generate button or use: `openssl rand -base64 32`
   - Store in password manager immediately
5. **Region**: Select `Europe (Frankfurt)` (closest to Poland)
6. **Pricing Plan**: Select **Free** for now
7. Click **"Create new project"**
8. Wait 2-3 minutes for provisioning

### 3. Enable PostGIS Extension
1. In left sidebar, click **"Database"** > **"Extensions"**
2. Search for **"postgis"**
3. Click **"Enable"** on PostGIS row
4. Wait for confirmation

### 4. Get Connection Strings
1. In left sidebar, click **"Project Settings"** (gear icon)
2. Click **"Database"** in settings menu
3. Scroll to **"Connection string"** section
4. **Copy these TWO URLs:**

   **A. Connection pooling (for application):**
   - Mode: **"Transaction"**
   - Copy the URL that looks like:
   ```
   postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?pgbouncer=true
   ```
   - This is your `DATABASE_URL`

   **B. Direct connection (for migrations):**
   - Mode: **"Session"**
   - Copy the URL that looks like:
   ```
   postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```
   - This is your `DATABASE_URL_UNPOOLED`

5. **IMPORTANT**: Replace `[YOUR-PASSWORD]` in both URLs with the password you generated in step 2

### 5. Save Credentials
Open `.env.production` and update:
```bash
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
DATABASE_URL_UNPOOLED="postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
```

### 6. Test Connection (Optional but Recommended)
```bash
# Install PostgreSQL client if needed
# Ubuntu/Debian: sudo apt-get install postgresql-client
# macOS: brew install postgresql

# Test connection
psql "postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# If successful, you'll see:
# postgres=>

# Type \q to exit
```

✅ **Supabase Complete!** Database is ready for migrations.

---

# 2️⃣ Railway (Backend Hosting)

## What You'll Get:
- Docker container hosting for NestJS API
- $5 free trial credit
- Pay-as-you-go pricing (~$20-30/month expected)

## Step-by-Step:

### 1. Create Account
1. Go to: https://railway.app
2. Click **"Login"**
3. Sign up with **GitHub** (strongly recommended for deployments)
4. Authorize Railway to access your repositories

### 2. Claim Free Trial
1. After login, you'll see **"$5 in free credits"**
2. No credit card required for trial
3. Credits last indefinitely until used

### 3. Create New Project
1. Click **"New Project"** in dashboard
2. Select **"Deploy from GitHub repo"**
3. Select repository: `vsemashko/long-rent`
4. Railway will ask for permission - click **"Install & Authorize"**

### 4. Configure Service
1. Railway will detect your repository
2. Click **"Add variables"** to add environment variables (we'll do this later)
3. **Don't deploy yet** - we'll do this via CLI with proper configuration

### 5. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 6. Login to Railway CLI
```bash
railway login
```
- This will open browser for authentication
- Authorize the CLI

### 7. Link to Project
```bash
cd /home/user/long-rent
railway link
```
- Select your project: `homemore-production` (or whatever you named it)

### 8. Get Railway Token (for CI/CD)
```bash
railway whoami --token
```
- Copy this token
- Save it as `RAILWAY_TOKEN` in GitHub Secrets (we'll do this later)

✅ **Railway Complete!** Backend hosting is ready (we'll deploy later).

---

# 3️⃣ Vercel (Frontend Hosting)

## What You'll Get:
- Next.js hosting with edge CDN
- Automatic SSL certificates
- Free tier: Unlimited bandwidth

## Step-by-Step:

### 1. Create Account
1. Go to: https://vercel.com
2. Click **"Sign Up"**
3. Sign up with **GitHub** (recommended)
4. Authorize Vercel

### 2. Import Project
1. Click **"Add New..."** > **"Project"**
2. Import Git Repository: `vsemashko/long-rent`
3. Click **"Import"**

### 3. Configure Project
1. **Framework Preset**: Vercel should auto-detect **Next.js**
2. **Root Directory**: Click **"Edit"** and select `apps/web`
3. **Build Command**: Leave default (`next build`)
4. **Output Directory**: Leave default (`.next`)
5. **Install Command**: `npm install`

### 4. Add Environment Variables (Critical!)
**Don't deploy yet!** Click **"Environment Variables"** and add:

```bash
NEXT_PUBLIC_API_URL=https://your-app.railway.app
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=xxx
NEXT_PUBLIC_SENTRY_DSN=xxx
NEXT_PUBLIC_GA_MEASUREMENT_ID=xxx
NEXT_PUBLIC_MIXPANEL_TOKEN=xxx
```

**Note**: We'll fill in the actual values after setting up other services.

### 5. Skip Deployment for Now
1. Click **"Deploy"**
2. **Actually, wait!** Click the **X** to close
3. We'll deploy later after configuring environment variables

### 6. Get Vercel Credentials (for CI/CD)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
cd apps/web
vercel link
```

When prompted:
- **Set up and deploy**: No
- **Link to existing project**: Yes
- **What's your project's name**: Select your project
- **In which directory is your code located**: `./`

### 7. Get Tokens for GitHub Actions
```bash
# Get Vercel token
vercel token create "GitHub Actions"
# Copy this token -> save as VERCEL_TOKEN

# Get Org ID and Project ID
cat .vercel/project.json
# Save "orgId" as VERCEL_ORG_ID
# Save "projectId" as VERCEL_PROJECT_ID
```

✅ **Vercel Complete!** Frontend hosting is ready.

---

# 4️⃣ Upstash (Redis Cache)

## What You'll Get:
- Serverless Redis database
- Free tier: 10,000 commands/day

## Step-by-Step:

### 1. Create Account
1. Go to: https://upstash.com
2. Click **"Login"** or **"Get Started"**
3. Sign up with **GitHub** or email
4. Verify email if required

### 2. Create Redis Database
1. Click **"Create Database"**
2. **Name**: `homemore-cache`
3. **Type**: Select **"Regional"**
4. **Region**: Select **"Europe (Frankfurt)"** (eu-central-1)
5. **Eviction**: Select **"No eviction"**
6. Click **"Create"**

### 3. Get Connection URL
1. Click on your database: `homemore-cache`
2. Scroll to **"REST API"** section
3. **Copy the Redis URL** (starts with `rediss://`):
   ```
   rediss://default:[PASSWORD]@eu2-[RANDOM-ID].upstash.io:6379
   ```

### 4. Save to .env.production
```bash
REDIS_URL="rediss://default:[PASSWORD]@eu2-xxxxx.upstash.io:6379"
```

### 5. Test Connection (Optional)
```bash
# Install redis-cli if needed
# Ubuntu: sudo apt-get install redis-tools
# macOS: brew install redis

# Test (replace with your URL)
redis-cli -u "rediss://default:[PASSWORD]@eu2-xxxxx.upstash.io:6379" PING
# Should return: PONG
```

✅ **Upstash Complete!** Redis cache is ready.

---

# 5️⃣ AWS S3 (File Storage)

## What You'll Get:
- Object storage for user uploads (photos, documents)
- Free tier: 5 GB storage, 20,000 GET requests/month

## Step-by-Step:

### 1. Create AWS Account
1. Go to: https://aws.amazon.com
2. Click **"Create an AWS Account"**
3. **Email**: Your business email
4. **AWS account name**: `HomeMore Production`
5. **Credit card required** (for verification, free tier available)
6. **Phone verification required**
7. **Support plan**: Select **"Basic Support - Free"**

### 2. Create S3 Bucket
1. Go to: https://s3.console.aws.amazon.com
2. Click **"Create bucket"**
3. **Bucket name**: `homemore-uploads-production`
   - Must be globally unique
   - If taken, try: `homemore-uploads-prod-[random-number]`
4. **AWS Region**: Select **"Europe (Frankfurt) eu-central-1"**
5. **Block Public Access**: ✅ **KEEP ALL ENABLED**
   - We'll use signed URLs for security
6. **Bucket Versioning**: Disabled (for now)
7. **Default encryption**: Enable (SSE-S3)
8. Click **"Create bucket"**

### 3. Configure CORS
1. Click on your bucket: `homemore-uploads-production`
2. Go to **"Permissions"** tab
3. Scroll to **"Cross-origin resource sharing (CORS)"**
4. Click **"Edit"**
5. Paste this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "https://homemore.pl",
      "https://www.homemore.pl",
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

6. Click **"Save changes"**

### 4. Create IAM User
1. Go to: https://console.aws.amazon.com/iam
2. Click **"Users"** in left sidebar
3. Click **"Create user"**
4. **User name**: `homemore-s3-uploader`
5. Click **"Next"**
6. **Permissions**: Select **"Attach policies directly"**
7. Search and select: **"AmazonS3FullAccess"**
   - ⚠️ For production, you should create a custom policy limiting access to only your bucket
8. Click **"Next"** > **"Create user"**

### 5. Create Access Keys
1. Click on user: `homemore-s3-uploader`
2. Go to **"Security credentials"** tab
3. Scroll to **"Access keys"**
4. Click **"Create access key"**
5. **Use case**: Select **"Application running outside AWS"**
6. Click **"Next"**
7. **Description**: `HomeMore Production API`
8. Click **"Create access key"**
9. **⚠️ IMPORTANT**: Copy both keys NOW (you can't see them again):
   - **Access key ID**: Starts with `AKIA...`
   - **Secret access key**: Long random string

### 6. Save to .env.production
```bash
AWS_S3_REGION="eu-central-1"
AWS_S3_BUCKET="homemore-uploads-production"
AWS_S3_ACCESS_KEY_ID="AKIA..."
AWS_S3_SECRET_ACCESS_KEY="..."
```

✅ **AWS S3 Complete!** File storage is ready.

---

# 6️⃣ SendGrid (Email Service)

## What You'll Get:
- Transactional email delivery
- Free tier: 100 emails/day (3,000/month)

## Step-by-Step:

### 1. Create Account
1. Go to: https://sendgrid.com
2. Click **"Start for free"** or **"Sign Up"**
3. Fill in details:
   - **Email**: Your business email
   - **Password**: Strong password
   - **First/Last Name**: Your name
4. Verify email address (check inbox)

### 2. Complete Profile
1. **Tell us about yourself**:
   - Role: Developer
   - Company: HomeMore
   - Website: homemore.pl (or leave blank)
2. **How will you send email**:
   - Choose: **"Integrate using our Web API or SMTP Relay"**
3. **What features are you interested in**:
   - Select: **"Transactional Email"**

### 3. Create API Key
1. Go to: https://app.sendgrid.com/settings/api_keys
2. Click **"Create API Key"**
3. **API Key Name**: `HomeMore Production`
4. **API Key Permissions**: Select **"Full Access"**
   - ⚠️ For production, use "Restricted Access" with only Mail Send permission
5. Click **"Create & View"**
6. **Copy the API key** (starts with `SG.`)
   - ⚠️ You can only see this ONCE!

### 4. Verify Sender Domain (CRITICAL for delivery)
1. Go to: https://app.sendgrid.com/settings/sender_auth
2. Click **"Authenticate Your Domain"**
3. **DNS Host**: Select your domain provider (e.g., "home.pl", "cloudflare", "other")
4. **Domain**: Enter `homemore.pl`
5. SendGrid will provide DNS records to add:

   **Add these DNS records to your domain:**
   ```
   CNAME: em123.homemore.pl -> u123.wl.sendgrid.net
   CNAME: s1._domainkey.homemore.pl -> s1.domainkey.u123.wl.sendgrid.net
   CNAME: s2._domainkey.homemore.pl -> s2.domainkey.u123.wl.sendgrid.net
   ```

6. Add these records at your domain registrar
7. Wait 24-48 hours for DNS propagation
8. Click **"Verify"** in SendGrid

**Alternative (Quick start)**: Use **Single Sender Verification**
1. Go to: https://app.sendgrid.com/settings/sender_auth/senders
2. Click **"Create New Sender"**
3. Fill in your details:
   - From Name: `HomeMore`
   - From Email: `noreply@homemore.pl` (must be your actual email for verification)
   - Reply To: `support@homemore.pl`
4. Verify email (check inbox)

### 5. Save to .env.production
```bash
EMAIL_FROM="noreply@homemore.pl"
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

✅ **SendGrid Complete!** Email service is ready (domain verification may take 24-48h).

---

# 7️⃣ Stripe (Payment Processing)

## What You'll Get:
- Payment processing for rent, deposits, fees
- No monthly fee, just transaction fees: 2.9% + €0.30

## Step-by-Step:

### 1. Create Account
1. Go to: https://stripe.com
2. Click **"Start now"** or **"Sign in"**
3. **Email**: Your business email
4. **Password**: Strong password
5. **Country**: Poland
6. Verify email

### 2. Complete Business Profile
You'll need to activate your account before going live:
1. **Business type**: Select appropriate type (Individual/Company)
2. **Business details**:
   - Legal name
   - Tax ID (NIP)
   - Business address
3. **Bank account**: Add bank account for payouts
4. **Identity verification**: Upload ID document

**⚠️ Note**: This process can take 1-2 business days for approval

### 3. Get Test API Keys (Start Here)
While waiting for approval, you can use test mode:

1. Go to: https://dashboard.stripe.com/test/apikeys
2. **Ensure you're in TEST mode** (toggle in left sidebar)
3. Copy these keys:
   - **Publishable key**: Starts with `pk_test_...`
   - **Secret key**: Starts with `sk_test_...` (click "Reveal test key")

### 4. Save Test Keys to .env.production
```bash
# TEST MODE (for development)
STRIPE_PUBLIC_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 5. When Your Account is Activated (Later)
1. Toggle to **LIVE mode** in dashboard
2. Go to: https://dashboard.stripe.com/apikeys
3. Copy live keys:
   - **Publishable key**: Starts with `pk_live_...`
   - **Secret key**: Starts with `sk_live_...`
4. Update .env.production with live keys

### 6. Set Up Webhook (Do this after deployment)
We'll configure this after deploying the API, as you need the webhook URL.

**Webhook URL will be**: `https://api.homemore.pl/webhooks/stripe`

✅ **Stripe Complete!** Payment processing is ready (test mode).
⏳ **Pending**: Account activation (1-2 business days)

---

# 8️⃣ Google Cloud (Maps & Analytics)

## What You'll Get:
- Google Maps JavaScript API
- Google Places API
- Google Analytics 4
- Free tier: $200/month credit for 90 days

## Step-by-Step:

### 1. Create Google Cloud Account
1. Go to: https://console.cloud.google.com
2. Sign in with Google account (or create one)
3. Accept terms of service
4. **Credit card required** (for $200 free credit)
5. Set up billing account

### 2. Create New Project
1. Click **"Select a project"** dropdown at top
2. Click **"New Project"**
3. **Project name**: `HomeMore Production`
4. **Organization**: Leave as "No organization"
5. Click **"Create"**
6. Wait for project creation (30 seconds)
7. Select the project

### 3. Enable Maps JavaScript API
1. Go to: https://console.cloud.google.com/apis/library
2. Search for **"Maps JavaScript API"**
3. Click on it
4. Click **"Enable"**
5. Wait for activation

### 4. Enable Places API
1. Go to: https://console.cloud.google.com/apis/library
2. Search for **"Places API"**
3. Click on it
4. Click **"Enable"**

### 5. Create API Key
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"Create Credentials"** > **"API key"**
3. **Copy the API key** (starts with `AIza...`)
4. Click **"Edit API key"** (or click on the key name)

### 6. Restrict API Key (IMPORTANT for security)
1. **API restrictions**:
   - Select **"Restrict key"**
   - Check: ✅ Maps JavaScript API
   - Check: ✅ Places API
2. **Application restrictions**:
   - Select **"HTTP referrers (web sites)"**
   - Add referrers:
     ```
     https://homemore.pl/*
     https://www.homemore.pl/*
     http://localhost:3000/*
     ```
3. Click **"Save"**

### 7. Save to .env.production
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
GOOGLE_PLACES_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

### 8. Set Up Google Analytics 4
1. Go to: https://analytics.google.com
2. Click **"Start measuring"**
3. **Account name**: `HomeMore`
4. Click **"Next"**
5. **Property name**: `HomeMore Production`
6. **Time zone**: `(GMT+01:00) Warsaw`
7. **Currency**: `Euro (EUR)`
8. Click **"Next"**
9. **Business information**: Fill in details
10. Click **"Create"**
11. Accept terms
12. Go to **Admin** > **Data Streams**
13. Click **"Add stream"** > **"Web"**
14. **Website URL**: `https://homemore.pl`
15. **Stream name**: `HomeMore Web`
16. Click **"Create stream"**
17. **Copy the Measurement ID** (format: `G-XXXXXXXXXX`)

### 9. Save GA4 to .env.production
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

✅ **Google Cloud Complete!** Maps and Analytics are ready.

---

# 9️⃣ Sentry (Error Tracking)

## What You'll Get:
- Real-time error tracking and monitoring
- Free tier: 5,000 events/month

## Step-by-Step:

### 1. Create Account
1. Go to: https://sentry.io
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with **GitHub** (recommended) or email
4. **Organization name**: `HomeMore`

### 2. Create Backend Project
1. **Platform**: Select **Node.js**
2. **Project name**: `homemore-api`
3. **Alert frequency**: **On every new issue**
4. Click **"Create Project"**
5. **Copy the DSN** (looks like `https://xxx@xxx.ingest.sentry.io/xxx`)

### 3. Create Frontend Project
1. Click **"Projects"** in left sidebar
2. Click **"Create Project"**
3. **Platform**: Select **Next.js**
4. **Project name**: `homemore-web`
5. **Alert frequency**: **On every new issue**
6. Click **"Create Project"**
7. **Copy the DSN**

### 4. Save to .env.production
```bash
# Backend Sentry
SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"

# Frontend Sentry
NEXT_PUBLIC_SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
```

✅ **Sentry Complete!** Error tracking is ready.

---

# 🔟 Mixpanel (Analytics)

## What You'll Get:
- User behavior analytics
- Free tier: 100,000 events/month

## Step-by-Step:

### 1. Create Account
1. Go to: https://mixpanel.com
2. Click **"Get Started Free"**
3. Sign up with email or Google
4. **Organization name**: `HomeMore`

### 2. Create Project
1. **Project name**: `HomeMore Production`
2. **Data residency**: Select **EU Data Residency**
3. **Industry**: Real Estate
4. Click **"Create Project"**

### 3. Get Project Token
1. Click **Settings** (gear icon) in left sidebar
2. Go to **"Project Settings"**
3. **Copy the Project Token** (32 character string)

### 4. Save to .env.production
```bash
NEXT_PUBLIC_MIXPANEL_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

✅ **Mixpanel Complete!** Analytics tracking is ready.

---

# 📋 Post-Signup Checklist

After completing all service signups, verify you have these credentials saved:

## Database & Cache
- [ ] `DATABASE_URL` (Supabase pooled connection)
- [ ] `DATABASE_URL_UNPOOLED` (Supabase direct connection)
- [ ] `REDIS_URL` (Upstash)

## Hosting
- [ ] `RAILWAY_TOKEN` (for CI/CD)
- [ ] `VERCEL_TOKEN` (for CI/CD)
- [ ] `VERCEL_ORG_ID` (for CI/CD)
- [ ] `VERCEL_PROJECT_ID` (for CI/CD)

## File Storage
- [ ] `AWS_S3_REGION` = eu-central-1
- [ ] `AWS_S3_BUCKET` = homemore-uploads-production
- [ ] `AWS_S3_ACCESS_KEY_ID`
- [ ] `AWS_S3_SECRET_ACCESS_KEY`

## Email
- [ ] `EMAIL_FROM` = noreply@homemore.pl
- [ ] `SENDGRID_API_KEY`

## Payments
- [ ] `STRIPE_PUBLIC_KEY` (test or live)
- [ ] `STRIPE_SECRET_KEY` (test or live)

## Maps & Analytics
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- [ ] `GOOGLE_PLACES_API_KEY`
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID`

## Error Tracking & Analytics
- [ ] `SENTRY_DSN` (backend)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` (frontend)
- [ ] `NEXT_PUBLIC_MIXPANEL_TOKEN`

## Generated Secrets
- [ ] `JWT_SECRET` (generated by setup script)
- [ ] `JWT_REFRESH_SECRET` (generated by setup script)
- [ ] `SESSION_SECRET` (generated by setup script)

---

# 🔒 Security Reminders

1. **Never commit `.env.production` to Git**
   - It's already in `.gitignore`
   - Double-check before any commit

2. **Store credentials securely**
   - Use a password manager (1Password, Bitwarden, etc.)
   - Keep backup in secure location

3. **Rotate keys regularly**
   - Set calendar reminder for quarterly key rotation
   - Especially important for API keys and secrets

4. **Use environment-specific keys**
   - Keep test and production keys separate
   - Never use production keys in development

---

# ⏭️ Next Steps

After completing all signups:

1. **Run environment setup script**:
   ```bash
   ./scripts/setup-production-env.sh
   ```

2. **Verify all credentials in `.env.production`**

3. **Add GitHub Secrets** (for CI/CD):
   - Go to: https://github.com/vsemashko/long-rent/settings/secrets/actions
   - Add all secrets listed in deployment checklist

4. **Run database migrations**:
   ```bash
   export DATABASE_URL="your-supabase-url"
   cd apps/api
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Deploy to production**:
   ```bash
   ./scripts/deploy-quick-mvp.sh
   ```

---

# 🆘 Need Help?

- **Supabase**: https://supabase.com/docs
- **Railway**: https://docs.railway.app
- **Vercel**: https://vercel.com/docs
- **AWS S3**: https://docs.aws.amazon.com/s3
- **Stripe**: https://stripe.com/docs
- **SendGrid**: https://docs.sendgrid.com

---

**Last Updated**: November 22, 2025
**Estimated Completion Time**: 2-3 hours
**Total Initial Cost**: $0 (using free tiers)
