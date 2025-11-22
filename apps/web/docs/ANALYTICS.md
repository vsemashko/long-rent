# Analytics Setup Guide

HomeMore includes built-in support for Google Analytics 4 and Mixpanel for tracking user behavior and improving the platform.

## Configuration

### 1. Google Analytics 4

1. Create a Google Analytics 4 property at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (format: `G-XXXXXXXXXX`)
3. Add to your `.env.local`:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### 2. Mixpanel

1. Create a Mixpanel project at [mixpanel.com](https://mixpanel.com)
2. Get your Project Token from Project Settings
3. Add to your `.env.local`:
   ```
   NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token
   ```

## Usage

Analytics are automatically initialized and will track page views. To track custom events, use the analytics utility:

```typescript
import { analytics, AnalyticsEvents } from '@/lib/analytics';

// Track a predefined event
analytics.event(AnalyticsEvents.PROPERTY_VIEW, {
  propertyId: '123',
  price: 2000,
  city: 'Warsaw',
});

// Track a custom event
analytics.event('custom_event_name', {
  customProperty: 'value',
});

// Identify user (on login)
analytics.identify(user.id, {
  email: user.email,
  role: user.role,
  firstName: user.profile.firstName,
});

// Reset identity (on logout)
analytics.reset();
```

## Predefined Events

The following events are tracked throughout the application:

### Authentication
- `sign_up` - User registration
- `login` - User login
- `logout` - User logout

### Property
- `property_view` - Property detail page view
- `property_favorite` - User favorites a property
- `property_search` - Search query submitted
- `property_list` - Landlord lists a property

### Application
- `application_submit` - Tenant submits application
- `application_accept` - Landlord accepts application
- `application_reject` - Landlord rejects application

### Contract
- `contract_create` - New contract created
- `contract_sign` - Party signs contract
- `contract_activate` - Contract becomes active
- `contract_terminate` - Contract is terminated

### Payment
- `payment_initiate` - Payment process started
- `payment_success` - Payment completed successfully
- `payment_failed` - Payment failed

### Maintenance
- `maintenance_report` - Issue reported
- `maintenance_update` - Status updated
- `maintenance_resolve` - Issue resolved

### Review
- `review_submit` - Review submitted

### Messaging
- `message_send` - Message sent
- `message_read` - Message read

## Privacy Considerations

- Analytics are configured to respect user privacy
- No personally identifiable information (PII) is sent without consent
- Users can opt-out of tracking (implement cookie consent banner)
- All analytics comply with GDPR requirements

## Development

During development, analytics will work but Mixpanel debug mode is enabled. To disable analytics in development, simply don't set the environment variables.

## Testing

Analytics are automatically disabled if environment variables are not set, making it safe to run tests without tracking test data.
