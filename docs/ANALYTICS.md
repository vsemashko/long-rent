# Analytics Guide

Comprehensive analytics implementation for the HomeMore platform using Google Analytics 4 and Mixpanel.

## Overview

HomeMore uses a dual analytics approach:
- **Google Analytics 4**: Website traffic, user behavior, and marketing attribution
- **Mixpanel**: Product analytics, user journeys, and cohort analysis

## Google Analytics 4 (GA4)

### Setup

**1. Create GA4 Property**:
```
1. Go to https://analytics.google.com
2. Create new property: "HomeMore Production"
3. Set timezone: Europe/Warsaw
4. Set currency: PLN (Polish Złoty)
5. Enable enhanced measurement
6. Copy Measurement ID (G-XXXXXXXXXX)
```

**2. Configure Environment**:
```bash
# .env.production
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**3. Implementation**:
```typescript
// apps/web/src/components/analytics/google-analytics.tsx
import { GoogleAnalytics } from '@/components/analytics/google-analytics';

// In app/layout.tsx
<GoogleAnalytics />
```

### Events Tracked

#### User Authentication
```typescript
// Sign up completed
analytics.event(AnalyticsEvents.SIGN_UP, {
  method: 'email', // 'email' | 'google' | 'facebook'
  user_type: 'tenant', // 'tenant' | 'landlord'
});

// Login completed
analytics.event(AnalyticsEvents.LOGIN, {
  method: 'email',
});

// Logout
analytics.event(AnalyticsEvents.LOGOUT, {
  session_duration: 1234, // seconds
});
```

#### Property Discovery
```typescript
// Property search performed
analytics.event(AnalyticsEvents.SEARCH, {
  search_term: 'Warsaw apartments',
  filters: {
    price_min: 2000,
    price_max: 4000,
    bedrooms: 2,
    location: 'Warsaw',
  },
  results_count: 42,
});

// Property viewed
analytics.event(AnalyticsEvents.PROPERTY_VIEW, {
  property_id: 'prop_123',
  property_type: 'apartment',
  price: 3500,
  location: 'Warsaw',
  bedrooms: 2,
  source: 'search_results', // 'search_results' | 'recommendations' | 'direct'
});

// Property saved
analytics.event(AnalyticsEvents.PROPERTY_SAVE, {
  property_id: 'prop_123',
});

// Property shared
analytics.event(AnalyticsEvents.SHARE, {
  property_id: 'prop_123',
  method: 'email', // 'email' | 'whatsapp' | 'link'
});
```

#### Application Process
```typescript
// Application started
analytics.event(AnalyticsEvents.APPLICATION_START, {
  property_id: 'prop_123',
  monthly_rent: 3500,
});

// Application submitted
analytics.event(AnalyticsEvents.APPLICATION_SUBMIT, {
  application_id: 'app_456',
  property_id: 'prop_123',
  monthly_rent: 3500,
});

// Application approved
analytics.event(AnalyticsEvents.APPLICATION_APPROVE, {
  application_id: 'app_456',
  time_to_approve: 86400, // seconds
});
```

#### Contract & Payments
```typescript
// Contract signed
analytics.event(AnalyticsEvents.CONTRACT_SIGN, {
  contract_id: 'contract_789',
  monthly_rent: 3500,
  deposit: 3500,
  lease_duration: 12, // months
  signing_method: 'electronic', // 'electronic' | 'in_person'
});

// Payment initiated
analytics.event(AnalyticsEvents.PAYMENT_INITIATED, {
  payment_id: 'pay_111',
  amount: 3500,
  payment_type: 'rent', // 'rent' | 'deposit' | 'utilities'
  payment_method: 'card', // 'card' | 'bank_transfer' | 'blik'
});

// Payment completed
analytics.event(AnalyticsEvents.PAYMENT_SUCCESS, {
  payment_id: 'pay_111',
  amount: 3500,
  transaction_id: 'stripe_ch_xxx',
});
```

#### Engagement
```typescript
// Message sent
analytics.event(AnalyticsEvents.MESSAGE_SEND, {
  recipient_type: 'landlord', // 'landlord' | 'tenant' | 'support'
  message_type: 'inquiry', // 'inquiry' | 'reply' | 'offer'
});

// Review submitted
analytics.event(AnalyticsEvents.REVIEW_SUBMIT, {
  rating: 5,
  review_type: 'property', // 'property' | 'landlord' | 'tenant'
  has_comment: true,
});
```

### Custom Dimensions

Configure in GA4 Admin → Custom Definitions:

| Dimension | Scope | Description |
|-----------|-------|-------------|
| user_type | User | tenant \| landlord |
| subscription_tier | User | free \| basic \| premium |
| property_type | Event | apartment \| house \| room |
| price_range | Event | 0-2000 \| 2000-4000 \| 4000+ |
| location_city | Event | Warsaw \| Krakow \| etc. |

### Conversion Events

Mark as conversions in GA4:
- ✅ sign_up
- ✅ application_submit
- ✅ contract_sign
- ✅ payment_success
- ✅ review_submit

### Enhanced Ecommerce

```typescript
// Property view (as product)
analytics.event('view_item', {
  currency: 'PLN',
  value: 3500, // monthly rent
  items: [{
    item_id: 'prop_123',
    item_name: 'Modern 2BR Apartment in Warsaw',
    item_category: 'apartment',
    item_category2: 'Warsaw',
    item_category3: '2-bedroom',
    price: 3500,
  }],
});

// Add to favorites (add to cart)
analytics.event('add_to_cart', {
  currency: 'PLN',
  value: 3500,
  items: [{ /* same as above */ }],
});

// Application (begin checkout)
analytics.event('begin_checkout', {
  currency: 'PLN',
  value: 3500,
  items: [{ /* same as above */ }],
});

// Contract signed (purchase)
analytics.event('purchase', {
  transaction_id: 'contract_789',
  currency: 'PLN',
  value: 42000, // 12 months * 3500
  items: [{ /* same as above */ }],
});
```

## Mixpanel

### Setup

**1. Create Mixpanel Project**:
```
1. Go to https://mixpanel.com
2. Create project: "HomeMore Production"
3. Copy Project Token
```

**2. Configure Environment**:
```bash
# .env.production
NEXT_PUBLIC_MIXPANEL_TOKEN=your_project_token_here
```

**3. Implementation**:
```typescript
// apps/web/src/components/analytics/mixpanel.tsx
import { Mixpanel } from '@/components/analytics/mixpanel';

// In app/layout.tsx
<Mixpanel />
```

### User Identification

```typescript
import { analytics } from '@/lib/analytics';

// Identify user after login
analytics.identify(user.id, {
  email: user.email,
  name: user.name,
  user_type: user.role, // 'tenant' | 'landlord'
  created_at: user.createdAt,
  subscription: user.subscription?.tier,
  total_applications: user.applicationsCount,
  total_properties: user.propertiesCount,
});

// Reset on logout
analytics.reset();
```

### User Properties

Track user attributes:
```typescript
// Set user properties
analytics.setUserProperties({
  subscription_tier: 'premium',
  verification_status: 'verified',
  total_contracts: 3,
  total_reviews: 5,
  average_rating: 4.8,
  last_active: new Date().toISOString(),
});

// Increment counters
analytics.increment('properties_viewed');
analytics.increment('messages_sent', 1);
```

### Funnel Analysis

**Application Funnel**:
1. Property View
2. Application Start
3. Application Submit
4. Application Approve
5. Contract Sign
6. Payment Success

**Setup in Mixpanel**:
```
Funnels → Create New Funnel
Steps:
1. property_view
2. application_start  (conversion: ~40%)
3. application_submit (conversion: ~80%)
4. application_approve (conversion: ~60%)
5. contract_sign      (conversion: ~90%)
6. payment_success    (conversion: ~95%)
```

### Cohort Analysis

**User Retention**:
```
Cohorts → Create Cohort
Cohort by: sign_up event
Return criteria: Any event
Time interval: Weekly
Duration: 12 weeks
```

**Target Metrics**:
- Week 1: 60% retention
- Week 4: 40% retention
- Week 12: 25% retention

### A/B Testing

```typescript
// Track experiment exposure
analytics.event('experiment_viewed', {
  experiment_id: 'search_layout_v2',
  variant: 'treatment', // 'control' | 'treatment'
});

// Track experiment conversion
analytics.event('experiment_converted', {
  experiment_id: 'search_layout_v2',
  variant: 'treatment',
  conversion_type: 'application_submit',
});
```

## Privacy & GDPR Compliance

### Cookie Consent

```typescript
// Only track after consent
if (cookieConsent.analytics) {
  analytics.event('page_view', { path: '/properties' });
}

// Respect DNT (Do Not Track)
if (navigator.doNotTrack === '1') {
  // Disable tracking
  window['ga-disable-G-XXXXXXXXXX'] = true;
  mixpanel.opt_out_tracking();
}
```

### Data Retention

**GA4 Settings**:
- Event data: 14 months
- User data: Reset on user request

**Mixpanel Settings**:
- Event data: 5 years
- User profiles: Delete on user request

### PII Handling

**Never track**:
- ❌ Full names
- ❌ Email addresses
- ❌ Phone numbers
- ❌ Credit card numbers
- ❌ Personal ID numbers

**OK to track**:
- ✅ User IDs (hashed)
- ✅ Property IDs
- ✅ Transaction IDs
- ✅ Aggregated data
- ✅ Behavioral data

## Reporting Dashboards

### GA4 Dashboards

**1. Overview Dashboard**:
- Total users (daily/weekly/monthly)
- New vs returning users
- Sessions per user
- Average session duration
- Bounce rate
- Top pages by views
- Top acquisition sources

**2. Property Discovery Dashboard**:
- Search queries (top 20)
- Property views by location
- Property views by type
- Average time on property page
- Properties viewed per session
- Save rate (saved / viewed)

**3. Conversion Dashboard**:
- Application funnel
- Contract signing rate
- Payment success rate
- Average time to conversion
- Revenue by channel
- Revenue by location

**4. User Engagement Dashboard**:
- Daily active users (DAU)
- Monthly active users (MAU)
- DAU/MAU ratio (stickiness)
- Messages sent per day
- Reviews submitted per day
- User retention cohorts

### Mixpanel Dashboards

**1. Product Analytics**:
- Feature adoption rates
- User journey flow
- Drop-off points
- Time to value
- Power users analysis

**2. Retention Analysis**:
- Weekly retention curve
- Monthly retention curve
- Cohort retention table
- Churn analysis
- Resurrection rate

**3. Funnel Optimization**:
- Application funnel
- Payment funnel
- Search → View → Apply funnel
- Conversion time analysis
- Abandonment reasons

## Key Metrics & KPIs

### Acquisition
- **Traffic Sources**: Organic, Direct, Referral, Social, Paid
- **Cost per Acquisition (CPA)**: Marketing spend / New users
- **User Growth Rate**: (New users this month / Total users last month) × 100

### Activation
- **Activation Rate**: (Users who complete profile / Total signups) × 100
- **Time to First Action**: Average time from signup to first property view
- **Onboarding Completion**: Users who complete all onboarding steps

### Engagement
- **DAU/MAU Ratio**: Daily active users / Monthly active users
- **Session Duration**: Average time spent per session
- **Pages per Session**: Average pages viewed per session
- **Feature Usage**: % of users using each feature

### Retention
- **Week 1 Retention**: % of users returning after 7 days
- **Month 1 Retention**: % of users returning after 30 days
- **Churn Rate**: (Users lost / Total users at start) × 100

### Revenue
- **MRR (Monthly Recurring Revenue)**: Total monthly rent payments
- **ARPU (Average Revenue Per User)**: Total revenue / Total users
- **Lifetime Value (LTV)**: Average revenue per user over their lifetime
- **LTV:CAC Ratio**: Lifetime value / Customer acquisition cost (target: >3)

### Conversion
- **Property → Application**: (Applications / Property views) × 100
- **Application → Contract**: (Contracts / Applications) × 100
- **Overall Conversion**: (Contracts / Unique visitors) × 100

## Monitoring & Alerts

### GA4 Alerts

Configure in GA4 Admin → Alerts:

1. **Traffic Drop Alert**:
   - Condition: Sessions decrease >30% vs previous day
   - Notify: product@homemore.pl

2. **Conversion Rate Drop**:
   - Condition: Contract signups decrease >20% vs previous week
   - Notify: product@homemore.pl, cto@homemore.pl

3. **Error Rate Spike**:
   - Condition: Errors increase >50% vs previous hour
   - Notify: engineering@homemore.pl

### Mixpanel Alerts

1. **User Retention Drop**:
   - Week 1 retention < 50%
   - Notify product team

2. **Funnel Drop-off**:
   - Any funnel step drops >15%
   - Notify product and engineering

## Data Analysis Examples

### SQL Queries (BigQuery Export)

**Daily Active Users**:
```sql
SELECT
  DATE(TIMESTAMP_MICROS(event_timestamp)) as date,
  COUNT(DISTINCT user_pseudo_id) as dau
FROM `project.analytics_XXXXXX.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20250101' AND '20250131'
GROUP BY date
ORDER BY date
```

**Conversion Funnel**:
```sql
WITH funnel AS (
  SELECT
    user_pseudo_id,
    MAX(CASE WHEN event_name = 'property_view' THEN 1 ELSE 0 END) as viewed,
    MAX(CASE WHEN event_name = 'application_start' THEN 1 ELSE 0 END) as started,
    MAX(CASE WHEN event_name = 'application_submit' THEN 1 ELSE 0 END) as submitted,
    MAX(CASE WHEN event_name = 'contract_sign' THEN 1 ELSE 0 END) as signed
  FROM `project.analytics_XXXXXX.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20250101' AND '20250131'
  GROUP BY user_pseudo_id
)
SELECT
  SUM(viewed) as total_viewers,
  SUM(started) as total_started,
  SUM(submitted) as total_submitted,
  SUM(signed) as total_signed,
  ROUND(SUM(started) / SUM(viewed) * 100, 2) as view_to_start,
  ROUND(SUM(submitted) / SUM(started) * 100, 2) as start_to_submit,
  ROUND(SUM(signed) / SUM(submitted) * 100, 2) as submit_to_sign
FROM funnel
```

### Mixpanel JQL Queries

**User Retention**:
```javascript
function main() {
  return Events({
    from_date: '2025-01-01',
    to_date: '2025-01-31',
    event_selectors: [{
      event: 'sign_up'
    }]
  })
  .groupBy(['user_id'], mixpanel.reducer.count())
  .retention({
    retentionType: 'recurring',
    unit: 'week'
  });
}
```

## Best Practices

### Event Naming
- ✅ Use lowercase with underscores: `property_view`
- ✅ Use verb + noun format: `application_submit`
- ✅ Be specific: `payment_success` not `success`
- ❌ Don't use spaces: `Property View`
- ❌ Don't use camelCase: `propertyView`

### Property Naming
- ✅ Use snake_case: `user_type`
- ✅ Include units: `price_pln`, `duration_months`
- ✅ Be descriptive: `monthly_rent` not `rent`

### Tracking Guidelines
- Track user intent, not just clicks
- Track errors and failures
- Track feature discovery
- Track time to complete tasks
- Track drop-off points

## Resources

- [GA4 Documentation](https://support.google.com/analytics/answer/10089681)
- [Mixpanel Documentation](https://docs.mixpanel.com/)
- [Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [GTM Documentation](https://support.google.com/tagmanager)

---

Last Updated: November 22, 2025
