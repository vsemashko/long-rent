# Quick MVP Deployment Checklist

Use this checklist to ensure smooth deployment. Check off each item as you complete it.

---

## Pre-Deployment (1-2 hours)

### Service Sign-Ups

- [ ] **Supabase** (Database)
  - [ ] Create account
  - [ ] Create project: homemore-production
  - [ ] Enable PostGIS extension
  - [ ] Copy connection strings
  - [ ] Estimated cost: Free tier

- [ ] **Upstash** (Redis)
  - [ ] Create account
  - [ ] Create database: homemore-cache
  - [ ] Copy Redis URL
  - [ ] Estimated cost: Free tier

- [ ] **Railway** (Backend)
  - [ ] Create account
  - [ ] Get $5 free trial credit
  - [ ] Estimated cost: $20-50/month

- [ ] **Vercel** (Frontend)
  - [ ] Create account
  - [ ] Link GitHub repository
  - [ ] Estimated cost: Free tier

- [ ] **AWS S3** (File Storage)
  - [ ] Create AWS account
  - [ ] Create S3 bucket: homemore-uploads-production
  - [ ] Configure CORS policy
  - [ ] Create IAM user with S3 access
  - [ ] Copy access key and secret
  - [ ] Estimated cost: $5-10/month

- [ ] **Stripe** (Payments)
  - [ ] Create account
  - [ ] Complete business verification
  - [ ] Copy API keys (live mode)
  - [ ] Estimated cost: 2.9% + €0.30 per transaction

- [ ] **SendGrid** (Email)
  - [ ] Create account
  - [ ] Create API key
  - [ ] Verify sender domain (homemore.pl)
  - [ ] Estimated cost: Free tier (100 emails/day)

- [ ] **Sentry** (Error Tracking)
  - [ ] Create account
  - [ ] Create projects (backend + frontend)
  - [ ] Copy DSNs
  - [ ] Estimated cost: Free tier

- [ ] **Google Cloud** (Maps & Analytics)
  - [ ] Create account
  - [ ] Enable Maps JavaScript API
  - [ ] Enable Places API
  - [ ] Create API key
  - [ ] Create GA4 property
  - [ ] Estimated cost: Free tier ($200/month credit)

- [ ] **Mixpanel** (Analytics)
  - [ ] Create account
  - [ ] Create project
  - [ ] Copy project token
  - [ ] Estimated cost: Free tier

---

## Environment Configuration (30 minutes)

- [ ] **Generate Secrets**
  ```bash
  openssl rand -hex 64  # JWT_SECRET
  openssl rand -hex 64  # JWT_REFRESH_SECRET
  openssl rand -hex 64  # SESSION_SECRET
  ```

- [ ] **Create .env.production**
  ```bash
  cp .env.production.template .env.production
  ```

- [ ] **Fill in all values** in `.env.production`:
  - [ ] Database URLs (Supabase)
  - [ ] Redis URL (Upstash)
  - [ ] AWS S3 credentials
  - [ ] Stripe API keys
  - [ ] SendGrid API key
  - [ ] Google Maps API key
  - [ ] Sentry DSNs
  - [ ] Analytics IDs (GA4, Mixpanel)
  - [ ] Generated secrets

- [ ] **Run setup script** (optional):
  ```bash
  ./scripts/setup-production-env.sh
  ```

---

## Database Migration (15 minutes)

- [ ] **Install Prisma CLI**
  ```bash
  npm install -g prisma
  ```

- [ ] **Set DATABASE_URL**
  ```bash
  export DATABASE_URL="your-supabase-connection-string"
  ```

- [ ] **Generate Prisma Client**
  ```bash
  cd apps/api
  npx prisma generate
  ```

- [ ] **Run migrations**
  ```bash
  npx prisma migrate deploy
  ```

- [ ] **Verify migration**
  ```bash
  npx prisma db execute --stdin <<< "SELECT 1"
  ```

---

## Backend Deployment (30 minutes)

### Option A: Manual Deployment

- [ ] **Install Railway CLI**
  ```bash
  npm install -g @railway/cli
  ```

- [ ] **Login to Railway**
  ```bash
  railway login
  ```

- [ ] **Create new project** (first time only)
  ```bash
  railway init
  ```

- [ ] **Add environment variables**
  - Go to Railway dashboard
  - Click your project
  - Go to "Variables" tab
  - Add all backend env vars from `.env.production`

- [ ] **Deploy**
  ```bash
  railway up
  ```

- [ ] **Generate domain**
  - Go to Railway dashboard > Settings > Networking
  - Click "Generate Domain"
  - Copy URL (e.g., homemore-api.up.railway.app)

- [ ] **Test backend**
  ```bash
  curl https://your-railway-domain/health
  ```

### Option B: Automated Deployment

- [ ] **Run deployment script**
  ```bash
  ./scripts/deploy-quick-mvp.sh
  ```

---

## Frontend Deployment (30 minutes)

### Option A: Manual Deployment

- [ ] **Install Vercel CLI**
  ```bash
  npm install -g vercel
  ```

- [ ] **Login to Vercel**
  ```bash
  vercel login
  ```

- [ ] **Deploy**
  ```bash
  cd apps/web
  vercel --prod
  ```

- [ ] **Add environment variables**
  - Go to Vercel dashboard
  - Click your project > Settings > Environment Variables
  - Add all `NEXT_PUBLIC_*` variables
  - Add `API_URL` (your Railway URL)

- [ ] **Redeploy** (after adding env vars)
  ```bash
  vercel --prod --force
  ```

### Option B: Automated Deployment

- [ ] Deployment script covers this (if used above)

---

## Domain Configuration (1-2 hours)

- [ ] **Add custom domain to Vercel**
  - Go to Vercel dashboard > Settings > Domains
  - Add domain: homemore.pl
  - Add redirect: www.homemore.pl → homemore.pl

- [ ] **Configure DNS**
  - Add A record: @ → 76.76.21.21
  - Add CNAME: www → cname.vercel-dns.com
  - Add CNAME: api → your-railway-domain

- [ ] **Wait for DNS propagation** (5 min to 48 hours)

- [ ] **Verify SSL** (automatic via Vercel & Railway)
  - https://homemore.pl
  - https://api.homemore.pl

---

## Post-Deployment (1 hour)

- [ ] **Configure Stripe Webhook**
  - Go to Stripe Dashboard > Developers > Webhooks
  - Add endpoint: https://api.homemore.pl/webhooks/stripe
  - Select events: payment_intent.*, charge.refunded
  - Copy webhook secret
  - Add to Railway env vars

- [ ] **Set up CloudFlare** (Optional but recommended)
  - Add site: homemore.pl
  - Update nameservers at domain registrar
  - Enable SSL/TLS: Full (strict)
  - Enable "Always Use HTTPS"

- [ ] **Run verification script**
  ```bash
  ./scripts/verify-production.sh
  ```

- [ ] **Smoke test critical flows**
  - [ ] User registration
  - [ ] Email verification
  - [ ] Login
  - [ ] Create property listing
  - [ ] Upload photo (check S3)
  - [ ] Search properties
  - [ ] Request viewing
  - [ ] Send message
  - [ ] Submit application

- [ ] **Check error tracking**
  - Trigger test error
  - Verify appears in Sentry dashboard

- [ ] **Check analytics**
  - Visit site
  - Wait 5-10 minutes
  - Verify events in GA4 and Mixpanel

---

## GitHub Actions Setup (Optional - 15 minutes)

For automatic deployment on push to `main`:

- [ ] **Add secrets to GitHub**
  - Go to repo > Settings > Secrets and variables > Actions
  - Add secrets:
    - `RAILWAY_TOKEN` (get from `railway whoami --token`)
    - `VERCEL_TOKEN` (get from Vercel dashboard)
    - `VERCEL_ORG_ID` (get from Vercel project settings)
    - `VERCEL_PROJECT_ID` (get from Vercel project settings)
    - `DATABASE_URL` (Supabase connection string)
    - `API_URL` (https://api.homemore.pl)
    - `WEB_URL` (https://homemore.pl)

- [ ] **Test workflow**
  - Push to `main` branch
  - Go to Actions tab
  - Verify deployment succeeds

---

## Monitoring Setup (30 minutes)

- [ ] **Sentry Alerts**
  - Go to Sentry > Alerts
  - Create alert: Email on error (critical errors)
  - Add notification email

- [ ] **Uptime Monitoring**
  - Sign up for UptimeRobot (free)
  - Add monitors:
    - https://homemore.pl (every 5 min)
    - https://api.homemore.pl/health (every 5 min)
  - Add alert email

- [ ] **Set up status page** (Optional)
  - Create status page: status.homemore.pl
  - Link to uptime monitors

---

## Beta Launch (Day 2)

- [ ] **Invite 10-20 beta testers**
  - Send invitation email
  - Include credentials
  - Request feedback

- [ ] **Monitor errors**
  - Check Sentry daily
  - Fix critical bugs within 24h

- [ ] **Collect feedback**
  - Create feedback form (Google Forms)
  - Schedule follow-up calls

---

## Go-Live Checklist

- [ ] **All smoke tests passing** ✓
- [ ] **No critical errors in Sentry** ✓
- [ ] **SSL certificates valid** ✓
- [ ] **Email delivery working** ✓
- [ ] **Payments working** (test mode) ✓
- [ ] **Analytics tracking** ✓
- [ ] **Domain configured** ✓
- [ ] **CDN enabled** ✓
- [ ] **Backups configured** ✓
- [ ] **Legal review complete** (pending)
- [ ] **Beta testing complete** (pending)

---

## Post-Launch (Week 1)

- [ ] **Daily monitoring**
  - Check Sentry for errors
  - Review Railway/Vercel logs
  - Monitor uptime (target: 99.9%)

- [ ] **Performance optimization**
  - Run Lighthouse audit
  - Optimize slow pages
  - Target: >90 scores

- [ ] **User feedback**
  - Analyze feedback forms
  - Prioritize feature requests
  - Fix critical UX issues

---

## Estimated Total Time

- Service sign-ups: 1-2 hours
- Environment setup: 30 minutes
- Database migration: 15 minutes
- Backend deployment: 30 minutes
- Frontend deployment: 30 minutes
- Domain configuration: 1-2 hours (mostly waiting)
- Post-deployment: 1 hour
- **Total active time: 4-6 hours**
- **Total elapsed time: 1-2 days** (including DNS propagation)

---

## Estimated Total Cost

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Supabase | Free/Pro | $0-25 |
| Upstash | Free | $0 |
| Railway | Pay-as-you-go | $20-50 |
| Vercel | Free/Pro | $0-20 |
| AWS S3 | Free tier | $5-10 |
| Stripe | Transaction fees | 2.9% + €0.30 |
| SendGrid | Free | $0 |
| Sentry | Free | $0 |
| Google Cloud | Free credit | $0 |
| Mixpanel | Free | $0 |
| CloudFlare | Free | $0 |
| **Total** | **Quick MVP** | **$25-105/month** |

---

## Support Resources

- **Deployment Guide**: `docs/QUICK_MVP_DEPLOYMENT.md`
- **Production Readiness**: `PRODUCTION_READINESS_ASSESSMENT.md`
- **Launch Checklist**: `docs/LAUNCH_CHECKLIST.md`
- **Testing Guide**: `docs/TESTING.md`

---

## Emergency Rollback

If deployment fails:

```bash
# Rollback Vercel
vercel rollback

# Rollback Railway
railway rollback
```

See `docs/LAUNCH_CHECKLIST.md` for detailed rollback procedures.

---

**Last Updated**: November 22, 2025
**Status**: Ready for deployment 🚀
