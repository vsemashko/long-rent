# Production Monitoring Setup Guide

Complete guide for setting up monitoring, alerts, and observability for HomeMore production deployment.

---

## Overview

Monitoring is crucial for production applications. This guide covers:
- **Error Tracking** (Sentry)
- **Analytics** (Google Analytics 4 + Mixpanel)
- **Uptime Monitoring** (UptimeRobot or Better Uptime)
- **Performance Monitoring** (Vercel Analytics + Railway Metrics)
- **Log Management** (Railway Logs + CloudWatch)

---

## 1. Error Tracking with Sentry

### Why Sentry?
- Real-time error tracking
- Stack traces with source maps
- User context and breadcrumbs
- Performance monitoring
- Release tracking

### Setup Steps:

#### A. Configure Sentry Projects (Already Done)
You already have two Sentry projects:
- `homemore-api` (backend)
- `homemore-web` (frontend)

#### B. Verify DSN Configuration

**Backend** (`apps/api/src/main.ts`):
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Frontend** (`apps/web/app/layout.tsx`):
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% for performance monitoring
});
```

#### C. Set Up Alerts

1. Go to: https://sentry.io/settings/homemore/projects/
2. Click on **homemore-api**
3. Go to **Alerts** → **Create Alert**
4. **Alert Type**: Select **Issues**
5. Configure trigger:
   - When: **A new issue is created**
   - Or: **Issue frequency is above threshold** (100 events in 1 hour)
6. **Action**: Send notification to:
   - ✅ Email
   - ✅ Slack (optional - connect workspace)
7. Save alert rule

**Repeat for homemore-web**

#### D. Set Up Slack Integration (Optional)

1. Go to: https://sentry.io/settings/homemore/integrations/
2. Find **Slack** → Click **Add to Slack**
3. Authorize Sentry
4. Configure which alerts go to which channels:
   - `#alerts-production` - Critical errors
   - `#monitoring` - Performance issues

#### E. Configure Release Tracking

Add to your deployment script (`scripts/deploy-quick-mvp.sh`):

```bash
# After successful deployment
if command -v sentry-cli &> /dev/null; then
    VERSION=$(git rev-parse --short HEAD)
    sentry-cli releases new "$VERSION"
    sentry-cli releases set-commits "$VERSION" --auto
    sentry-cli releases finalize "$VERSION"
    sentry-cli releases deploys "$VERSION" new -e production
fi
```

Install Sentry CLI:
```bash
npm install -g @sentry/cli

# Configure
export SENTRY_AUTH_TOKEN="your-auth-token"  # From Sentry → Settings → Auth Tokens
export SENTRY_ORG="homemore"
export SENTRY_PROJECT="homemore-api"
```

---

## 2. Analytics Setup

### A. Google Analytics 4

#### Verify Installation

**Frontend** (`apps/web/app/layout.tsx`):
```tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

#### Set Up Key Events

1. Go to: https://analytics.google.com
2. Select **HomeMore Production** property
3. Go to **Configure** → **Events**
4. Click **Create event**

**Key Events to Track:**
- `user_signup` - User registration completed
- `property_view` - User viewed property details
- `search_performed` - User searched for properties
- `booking_started` - User initiated booking
- `payment_completed` - Successful payment
- `profile_completed` - User completed profile

#### Set Up Conversion Goals

1. Go to **Admin** → **Events**
2. Mark these as conversions:
   - ✅ `user_signup`
   - ✅ `payment_completed`
   - ✅ `profile_completed`

#### Create Custom Dashboard

1. Go to **Explore** → **Blank**
2. Add these visualizations:
   - **Daily Active Users** (line chart)
   - **Top Properties** (table: property views)
   - **Conversion Funnel**:
     - View homepage → Search → View property → Book → Pay
   - **User Demographics** (geo map)
   - **Device Breakdown** (pie chart)
3. Save as **"HomeMore Overview"**

### B. Mixpanel

#### Verify Installation

**Frontend tracking** (`apps/web/lib/analytics.ts`):
```typescript
import mixpanel from 'mixpanel-browser';

mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!, {
  track_pageview: true,
  persistence: 'localStorage',
});

export const track = (event: string, properties?: object) => {
  mixpanel.track(event, properties);
};

export const identify = (userId: string) => {
  mixpanel.identify(userId);
};
```

#### Set Up Funnels

1. Go to: https://mixpanel.com/report
2. Click **Create** → **Funnel**
3. **Name**: "User Registration Funnel"
4. Add steps:
   - Step 1: `Page Viewed` (where page = `/register`)
   - Step 2: `Form Started` (custom event)
   - Step 3: `Form Submitted` (custom event)
   - Step 4: `Registration Complete` (user_signup)
5. Save funnel

**Additional Funnels:**
- Property search to booking
- Booking to payment
- Profile completion

#### Set Up Retention Reports

1. Click **Create** → **Retention**
2. **Name**: "Weekly User Retention"
3. **First Time**: User does `user_signup`
4. **Return**: User does any event
5. **Shown as**: Weekly
6. Save report

#### Set Up Alerts

1. Go to **Project Settings** → **Notifications**
2. Add **Custom Alert**:
   - **Metric**: `user_signup` count
   - **Condition**: Decreases by 50% compared to previous day
   - **Send to**: Your email
3. Add another alert:
   - **Metric**: `payment_completed` count
   - **Condition**: Equals 0 for 24 hours
   - **Send to**: Your email + Slack

---

## 3. Uptime Monitoring

### Option A: UptimeRobot (Free)

#### Setup:

1. Go to: https://uptimerobot.com/signUp
2. Sign up (free account)
3. Click **+ Add New Monitor**

**Monitor 1: API Health**
- **Monitor Type**: HTTP(s)
- **Friendly Name**: HomeMore API
- **URL**: `https://api.homemore.pl/health`
- **Monitoring Interval**: Every 5 minutes
- **Alert Contacts**: Add your email
- Click **Create Monitor**

**Monitor 2: Frontend**
- **Monitor Type**: HTTP(s)
- **Friendly Name**: HomeMore Web
- **URL**: `https://homemore.pl`
- **Monitoring Interval**: Every 5 minutes
- **Keyword**: Search for `HomeMore` (verifies page content)
- Click **Create Monitor**

**Monitor 3: API Search**
- **Monitor Type**: HTTP(s)
- **Friendly Name**: HomeMore API Search
- **URL**: `https://api.homemore.pl/api/properties/search`
- **Monitoring Interval**: Every 15 minutes
- Click **Create Monitor**

#### Set Up Notifications:

1. Go to **My Settings**
2. Click **Add Alert Contact**
3. Add:
   - Email notification
   - Slack webhook (optional)
   - SMS (paid feature)

### Option B: Better Uptime (Recommended)

#### Setup:

1. Go to: https://betteruptime.com
2. Sign up (free for 1 monitor)
3. Click **Create Monitor**

**Configuration:**
- **URL**: `https://api.homemore.pl/health`
- **Name**: HomeMore API
- **Check frequency**: Every 3 minutes
- **Request timeout**: 10 seconds
- **Expected status code**: 200
- **Assertion**: Response body contains `"status"`

**Advanced Settings:**
- **Regions**: Select multiple:
  - ✅ Europe (Frankfurt)
  - ✅ US East
  - ✅ Asia (Singapore)
- **Incident notification policy**:
  - Alert after: 2 failed checks
  - Recovery after: 1 successful check

#### Create Status Page:

1. Go to **Status Pages**
2. Click **Create Status Page**
3. **Subdomain**: `status.homemore.pl`
4. Add components:
   - HomeMore API
   - HomeMore Frontend
   - Payment Processing
5. **Make it public**
6. Share URL with users

---

## 4. Performance Monitoring

### A. Vercel Analytics

#### Enable Vercel Analytics:

1. Go to: https://vercel.com/dashboard
2. Select **homemore-web** project
3. Go to **Analytics** tab
4. Click **Enable**

**What it tracks:**
- Core Web Vitals (LCP, FID, CLS)
- Real User Monitoring (RUM)
- Visitor insights
- Top pages

#### Set Performance Budgets:

1. In Vercel project settings
2. Go to **Speed Insights**
3. Set budgets:
   - **LCP**: < 2.5s
   - **FID**: < 100ms
   - **CLS**: < 0.1
4. Enable alerts when budgets are exceeded

### B. Railway Metrics

#### Monitor Backend Performance:

1. Go to: https://railway.app/dashboard
2. Select **homemore-api** service
3. Click **Metrics** tab

**Key Metrics:**
- **CPU Usage**: Should stay < 70%
- **Memory Usage**: Should stay < 80%
- **Network**: Monitor egress for cost
- **Response Time**: Should be < 500ms p95

#### Set Up Alerts:

1. In Railway project settings
2. Go to **Observability**
3. Enable webhooks:
   - CPU > 80% for 5 minutes
   - Memory > 90% for 2 minutes
   - Deployment failures
4. Add webhook URL (Slack or Discord)

---

## 5. Log Management

### A. Railway Logs

#### Access Logs:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# View logs
railway logs

# Follow logs in real-time
railway logs --follow

# Filter by service
railway logs --service homemore-api

# Export logs
railway logs --since "2025-01-01" > logs.txt
```

#### Set Up Log Alerts:

1. Use Railway webhooks for critical errors
2. Configure in Railway dashboard:
   - **Trigger**: Log line contains "ERROR" or "CRITICAL"
   - **Action**: Send to webhook

### B. Structured Logging Best Practices

**Backend** (`apps/api/src/main.ts`):
```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger('Main');

// Good logging
logger.log('User registered', { userId: user.id, email: user.email });
logger.error('Payment failed', { orderId, error: error.message });
logger.warn('High memory usage', { usage: '85%' });

// Bad logging
logger.log('User registered');  // No context
logger.error(error);  // Full error object
```

**Log Levels:**
- `log` - Normal operations
- `debug` - Detailed debugging (disabled in production)
- `warn` - Warning conditions
- `error` - Error conditions
- `fatal` - System is unusable

---

## 6. Monitoring Dashboard

### Create Unified Dashboard

Use **Grafana Cloud** (free tier):

1. Go to: https://grafana.com/auth/sign-up
2. Create free account
3. Create new dashboard
4. Add data sources:
   - **Prometheus** (Railway metrics)
   - **Google Analytics** (via plugin)
   - **PostgreSQL** (Supabase)

**Dashboard Panels:**

**Row 1: Application Health**
- API Uptime (last 24h)
- Frontend Uptime (last 24h)
- Error Rate (errors/min)
- Response Time (p50, p95, p99)

**Row 2: Business Metrics**
- New Users (today)
- Active Properties
- Bookings (today)
- Revenue (today)

**Row 3: Infrastructure**
- CPU Usage (API)
- Memory Usage (API)
- Database Connections
- Cache Hit Rate

**Row 4: User Activity**
- Active Users (now)
- Page Views (today)
- Top Pages
- Geographic Distribution

---

## 7. Alert Rules

### Critical Alerts (Page immediately)

- ✅ API down for 3 minutes
- ✅ Database connection lost
- ✅ Payment processing failed for 5 minutes
- ✅ Error rate > 10% for 5 minutes
- ✅ CPU > 90% for 3 minutes
- ✅ Memory > 95% for 2 minutes

**Notification: Email + SMS + Slack**

### Warning Alerts (Notify next business day)

- ⚠️ Response time > 1s (p95)
- ⚠️ Error rate > 1%
- ⚠️ CPU > 70% for 15 minutes
- ⚠️ Memory > 80% for 15 minutes
- ⚠️ Disk usage > 80%

**Notification: Email + Slack**

### Info Alerts (Log only)

- ℹ️ New user registration
- ℹ️ Successful payment
- ℹ️ Deployment completed
- ℹ️ Weekly summary report

**Notification: Email summary**

---

## 8. Health Check Endpoints

Ensure these endpoints are implemented:

### API Health (`/health`)
```json
{
  "status": "ok",
  "timestamp": "2025-11-22T10:00:00Z",
  "uptime": 3600,
  "checks": {
    "database": "ok",
    "redis": "ok",
    "s3": "ok"
  }
}
```

### Detailed Health (`/health/detailed`)
```json
{
  "status": "ok",
  "version": "1.0.0",
  "commit": "abc123",
  "environment": "production",
  "services": {
    "database": {
      "status": "ok",
      "responseTime": 15,
      "connections": 5
    },
    "redis": {
      "status": "ok",
      "responseTime": 3,
      "memory": "45MB"
    },
    "stripe": {
      "status": "ok",
      "mode": "live"
    }
  },
  "metrics": {
    "requests": 1234,
    "errors": 3,
    "avgResponseTime": 250
  }
}
```

---

## 9. Monitoring Checklist

After setup, verify:

### Sentry
- [ ] Errors are being reported
- [ ] Source maps are uploaded
- [ ] Alerts are configured
- [ ] Slack integration works

### Analytics
- [ ] GA4 is receiving events
- [ ] Mixpanel funnels are set up
- [ ] Custom dashboards created
- [ ] Conversion goals configured

### Uptime
- [ ] API monitor is active
- [ ] Frontend monitor is active
- [ ] Alerts are configured
- [ ] Status page is public

### Performance
- [ ] Vercel Analytics enabled
- [ ] Railway metrics visible
- [ ] Performance budgets set
- [ ] Alerts configured

### Logs
- [ ] Railway logs accessible
- [ ] Critical errors trigger alerts
- [ ] Log retention configured
- [ ] Export mechanism tested

---

## 10. Weekly Monitoring Routine

### Every Monday Morning:

1. **Check Sentry**:
   - Review error trends from last week
   - Identify top 5 errors
   - Create issues for critical bugs

2. **Review Analytics**:
   - Check user growth (week-over-week)
   - Review conversion funnel drop-offs
   - Identify top-performing pages

3. **Check Uptime**:
   - Review uptime percentage (should be > 99.9%)
   - Identify any incidents
   - Document root causes

4. **Review Performance**:
   - Check Core Web Vitals trends
   - Identify slow endpoints
   - Review response time percentiles

5. **Infrastructure Health**:
   - Check resource usage trends
   - Review cost vs. usage
   - Plan for scaling if needed

---

## Quick Setup Script

Save as `scripts/verify-monitoring.sh`:

```bash
#!/bin/bash

echo "🔍 Checking Monitoring Setup..."

# Check Sentry
echo -n "Sentry DSN configured: "
if [ ! -z "$SENTRY_DSN" ]; then
    echo "✓"
else
    echo "✗ - Add SENTRY_DSN to environment"
fi

# Check GA4
echo -n "Google Analytics configured: "
if [ ! -z "$NEXT_PUBLIC_GA_MEASUREMENT_ID" ]; then
    echo "✓"
else
    echo "✗ - Add NEXT_PUBLIC_GA_MEASUREMENT_ID to environment"
fi

# Check Mixpanel
echo -n "Mixpanel configured: "
if [ ! -z "$NEXT_PUBLIC_MIXPANEL_TOKEN" ]; then
    echo "✓"
else
    echo "✗ - Add NEXT_PUBLIC_MIXPANEL_TOKEN to environment"
fi

# Test API health endpoint
echo -n "API health endpoint: "
if curl -s https://api.homemore.pl/health | grep -q "status"; then
    echo "✓"
else
    echo "✗ - Health endpoint not responding"
fi

echo ""
echo "✅ Monitoring verification complete"
```

---

**Last Updated**: November 22, 2025
**Setup Time**: 2-3 hours
**Difficulty**: Intermediate
