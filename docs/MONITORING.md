# Monitoring & Observability Guide

This document describes the monitoring and observability setup for the HomeMore platform.

## Overview

The platform uses a multi-layered approach to monitoring:

1. **Error Tracking**: Sentry for error monitoring and performance
2. **Application Monitoring**: Datadog/New Relic for APM
3. **Analytics**: Google Analytics 4 + Mixpanel for user analytics
4. **Logging**: Structured logging with CloudWatch/ELK
5. **Health Checks**: Automated health monitoring

## Setup

### 1. Sentry (Error Tracking)

**Installation:**
```bash
npm install --save @sentry/nextjs @sentry/node
```

**Configuration:**

Add to `.env`:
```
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-auth-token
```

**Frontend Setup (Next.js):**

Create `sentry.client.config.ts`:
```typescript
import * as Sentry from '@sentry/nextjs';
import { monitoringConfig } from '../config/monitoring';

if (monitoringConfig.sentry.enabled) {
  Sentry.init({
    dsn: monitoringConfig.sentry.dsn,
    environment: monitoringConfig.sentry.environment,
    tracesSampleRate: monitoringConfig.sentry.tracesSampleRate,
    profilesSampleRate: monitoringConfig.sentry.profilesSampleRate,
  });
}
```

**Backend Setup (NestJS):**

Install:
```bash
npm install @sentry/node @sentry/profiling-node
```

Integrate in `main.ts`:
```typescript
import * as Sentry from '@sentry/node';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new ProfilingIntegration(),
    ],
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
  });
}
```

### 2. Application Performance Monitoring

#### Datadog APM

**Installation:**
```bash
npm install dd-trace --save
```

**Configuration:**
```typescript
// At the very top of your main.ts
import tracer from 'dd-trace';

tracer.init({
  service: 'homemore-api',
  env: process.env.NODE_ENV,
  version: process.env.npm_package_version,
  logInjection: true,
});
```

**Environment Variables:**
```
DD_API_KEY=your-datadog-api-key
DD_SITE=datadoghq.eu
DD_SERVICE=homemore
DD_ENV=production
```

#### New Relic (Alternative)

**Installation:**
```bash
npm install newrelic --save
```

**Configuration:**
Create `newrelic.js` in project root.

### 3. Analytics

#### Google Analytics 4

**Installation:**
```bash
npm install @next/third-parties
```

**Setup:**
```typescript
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
    </html>
  )
}
```

#### Mixpanel

**Installation:**
```bash
npm install mixpanel-browser
```

**Usage:**
```typescript
import mixpanel from 'mixpanel-browser';

mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN);
mixpanel.track('Page Viewed', { page: '/home' });
```

### 4. Logging

#### Structured Logging

Use the custom `LoggerService` in `apps/api/src/common/logger.service.ts`:

```typescript
import { LoggerService } from '@/common/logger.service';

export class MyService {
  private readonly logger = new LoggerService();

  constructor() {
    this.logger.setContext(MyService.name);
  }

  doSomething() {
    this.logger.log('Operation started');
    this.logger.error('Operation failed', error.stack);
  }
}
```

#### CloudWatch (AWS)

Logs are automatically sent to CloudWatch when running on AWS.

Configure log groups:
- `/aws/lambda/homemore-api-{env}`
- `/aws/ecs/homemore-web-{env}`

#### ELK Stack (Self-hosted)

For self-hosted logging:

```bash
docker-compose -f docker-compose.elk.yml up -d
```

### 5. Health Checks

#### API Health Endpoints

Available endpoints:
- `GET /api/health` - Overall health
- `GET /api/health/database` - Database connectivity
- `GET /api/health/redis` - Redis connectivity
- `GET /api/health/external` - External services

#### Automated Monitoring

Use services like:
- **UptimeRobot**: Free tier for basic uptime monitoring
- **Pingdom**: Advanced monitoring with alerting
- **StatusPage**: Public status page for users

**Setup with UptimeRobot:**
1. Create account at uptimerobot.com
2. Add HTTP(s) monitors for each health endpoint
3. Configure alerting (email, SMS, Slack)

### 6. Alerts & Notifications

#### Sentry Alerts

Configure in Sentry dashboard:
- Error rate spikes (>10 errors/minute)
- New error types
- Performance degradation (p95 > 2s)

#### Datadog Monitors

Create monitors for:
- API latency (p95 > 1s)
- Error rate (>1%)
- Database connections
- Memory usage (>80%)
- CPU usage (>70%)

#### Slack Integration

Integrate monitoring tools with Slack:

```
Sentry → #alerts-errors
Datadog → #alerts-performance
UptimeRobot → #alerts-uptime
```

## Dashboards

### Recommended Dashboards

**Operational Dashboard:**
- Request rate
- Error rate
- Response time (p50, p95, p99)
- Active users
- Database query performance

**Business Dashboard:**
- User signups
- Property listings
- Completed transactions
- Revenue
- Conversion funnel

## Performance Targets

### Frontend (Web Vitals)
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 600ms

### Backend (API)
- **Response Time** (p95): < 500ms
- **Response Time** (p99): < 1000ms
- **Error Rate**: < 0.1%
- **Uptime**: > 99.9%

### Database
- **Query Time** (p95): < 100ms
- **Connection Pool Usage**: < 80%

## Incident Response

### Severity Levels

1. **P0 - Critical**: Complete service outage
   - Response: Immediate (15 minutes)
   - Example: Database down, API not responding

2. **P1 - High**: Major feature broken
   - Response: 1 hour
   - Example: Payment processing failing

3. **P2 - Medium**: Minor feature issue
   - Response: 4 hours
   - Example: Search filters not working

4. **P3 - Low**: Cosmetic issues
   - Response: Next business day
   - Example: Button alignment off

### On-Call Rotation

Use PagerDuty or OpsGenie for on-call management.

## Best Practices

1. **Always log context**: Include user ID, request ID, etc.
2. **Don't log sensitive data**: Passwords, tokens, personal data
3. **Use structured logging**: JSON format for easy parsing
4. **Set up alerts early**: Don't wait for problems
5. **Monitor business metrics**: Not just technical metrics
6. **Regular dashboard reviews**: Weekly team reviews
7. **Test your alerts**: Ensure they fire correctly
8. **Document runbooks**: How to respond to alerts

## Cost Optimization

- **Sentry**: Use sampling to reduce events
- **Datadog**: Monitor your usage, adjust retention
- **CloudWatch**: Set log retention policies
- **Analytics**: Use Google Analytics (free) + selective Mixpanel

## Useful Commands

```bash
# View logs (Docker)
docker-compose logs -f api

# View logs (production)
aws logs tail /aws/ecs/homemore-api-production --follow

# Test health endpoint
curl https://api.homemore.pl/api/health

# Generate test error (staging only)
curl -X POST https://api-staging.homemore.pl/api/test/error
```

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Datadog APM Guide](https://docs.datadoghq.com/tracing/)
- [Google Analytics 4](https://support.google.com/analytics/answer/10089681)
- [Web Vitals](https://web.dev/vitals/)
- [NestJS Logging](https://docs.nestjs.com/techniques/logger)

---

Last updated: November 2025
