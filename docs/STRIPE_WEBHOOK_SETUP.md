# Stripe Webhook Setup Guide

This guide shows you how to configure Stripe webhooks to receive payment events in your HomeMore application.

## Why Webhooks?

Webhooks allow Stripe to notify your backend when important payment events occur:
- Payment succeeded
- Payment failed
- Subscription created/cancelled
- Refund processed
- Dispute opened

**Without webhooks**, your app wouldn't know when these events happen!

---

## Prerequisites

✅ Backend API deployed and accessible at a public URL
✅ Stripe account activated (or test account for development)
✅ Admin access to Stripe Dashboard

---

## Step-by-Step Setup

### 1. Get Your Webhook URL

Your webhook endpoint URL will be:
```
https://api.homemore.pl/webhooks/stripe
```

Or for Railway deployment:
```
https://your-app.railway.app/webhooks/stripe
```

**Testing locally** (using Stripe CLI):
```
http://localhost:3001/webhooks/stripe
```

---

### 2. Create Webhook in Stripe Dashboard

#### For Production:

1. Go to: https://dashboard.stripe.com/webhooks
2. Ensure you're in **LIVE mode** (toggle in top-left)
3. Click **"Add endpoint"**
4. **Endpoint URL**: Enter your production URL:
   ```
   https://api.homemore.pl/webhooks/stripe
   ```
5. **Description**: `HomeMore Production Webhooks`
6. Click **"+ Select events"**
7. Select these events:

   **Payment Intents:**
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`
   - ✅ `payment_intent.created`

   **Charges:**
   - ✅ `charge.succeeded`
   - ✅ `charge.failed`
   - ✅ `charge.refunded`

   **Customers:**
   - ✅ `customer.created`
   - ✅ `customer.updated`
   - ✅ `customer.deleted`

   **Subscriptions** (if you add subscription features later):
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`

   **Disputes:**
   - ✅ `charge.dispute.created`
   - ✅ `charge.dispute.updated`
   - ✅ `charge.dispute.closed`

8. Click **"Add events"**
9. Click **"Add endpoint"**

#### For Test Mode:

1. Toggle to **TEST mode**
2. Repeat steps above with test URL:
   ```
   https://your-staging-url.railway.app/webhooks/stripe
   ```

---

### 3. Get Webhook Signing Secret

After creating the webhook endpoint:

1. Click on the webhook you just created
2. In the **"Signing secret"** section, click **"Reveal"**
3. Copy the secret (starts with `whsec_...`)
4. **This is critical for security!** Save it securely.

---

### 4. Add Signing Secret to Environment

#### Option A: Update .env.production

Add this line:
```bash
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

#### Option B: Add to Railway Environment Variables

1. Go to Railway Dashboard → Your Project → homemore-api
2. Click **"Variables"** tab
3. Click **"New Variable"**
4. **Key**: `STRIPE_WEBHOOK_SECRET`
5. **Value**: `whsec_...` (your signing secret)
6. Click **"Add"**
7. **Redeploy** your API

#### Option C: Add to GitHub Secrets (for CI/CD)

```bash
gh secret set STRIPE_WEBHOOK_SECRET --body "whsec_xxxxxxxxxxxxx"
```

---

### 5. Verify Webhook Configuration

After deployment with the secret:

1. Go to Stripe Dashboard → Webhooks
2. Click on your endpoint
3. Click **"Send test webhook"**
4. Select event type: `payment_intent.succeeded`
5. Click **"Send test webhook"**

**Expected result:**
- Response status: **200 OK**
- Response time: < 2 seconds

If you see **500 or 400 errors**, check your backend logs.

---

### 6. Test with Stripe CLI (Development)

For local development, use Stripe CLI to forward webhooks:

#### Install Stripe CLI:

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

**Windows:**
Download from: https://github.com/stripe/stripe-cli/releases

#### Login to Stripe:
```bash
stripe login
```

#### Forward webhooks to local server:
```bash
stripe listen --forward-to localhost:3001/webhooks/stripe
```

**Output:**
```
> Ready! Your webhook signing secret is whsec_xxxxx (^C to quit)
```

Copy the `whsec_` secret and add it to your local `.env`:
```bash
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
```

#### Trigger test events:
```bash
# Test payment succeeded
stripe trigger payment_intent.succeeded

# Test payment failed
stripe trigger payment_intent.payment_failed

# Test refund
stripe trigger charge.refunded
```

---

## Webhook Handler Code

The webhook endpoint is already implemented in your backend at:
`apps/api/src/payment/payment.controller.ts`

### Key Features:

1. **Signature Verification**: Ensures webhooks are from Stripe
2. **Idempotency**: Prevents duplicate processing
3. **Error Handling**: Logs errors and returns proper status codes
4. **Event Processing**: Handles each event type appropriately

### Example Handler:

```typescript
@Post('webhooks/stripe')
@UseGuards(StripeWebhookGuard)
async handleWebhook(
  @Req() req: RawBodyRequest<Request>,
  @Res() res: Response,
) {
  const signature = req.headers['stripe-signature'] as string;

  try {
    // Verify webhook signature
    const event = this.stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;

      case 'charge.refunded':
        await this.handleRefund(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
```

---

## Monitoring Webhook Activity

### In Stripe Dashboard:

1. Go to: https://dashboard.stripe.com/webhooks
2. Click on your endpoint
3. View **"Event logs"** tab

You'll see:
- ✅ Successful deliveries (200 OK)
- ❌ Failed deliveries (with retry attempts)
- ⏱️ Response times
- 📊 Success rate

### Set Up Alerts:

1. In Stripe Dashboard → Webhooks → Your endpoint
2. Click **"⋮" menu** → **"Edit endpoint"**
3. Under **"Advanced"** → **"Failure notifications"**
4. Enable **"Email me when endpoint fails"**
5. Add your email

---

## Troubleshooting

### Webhook Returns 401 Unauthorized

**Cause**: Missing or incorrect signing secret

**Fix**:
1. Verify `STRIPE_WEBHOOK_SECRET` is set in environment
2. Ensure it starts with `whsec_`
3. Make sure you copied the correct secret from Stripe Dashboard
4. Redeploy after adding the secret

### Webhook Returns 500 Internal Server Error

**Cause**: Error in webhook handler code

**Fix**:
1. Check backend logs: `railway logs`
2. Look for error stack traces
3. Ensure database is accessible
4. Check if all required environment variables are set

### Webhook Returns 404 Not Found

**Cause**: Route not properly configured

**Fix**:
1. Verify endpoint URL is correct: `/webhooks/stripe`
2. Check API is deployed and running
3. Test health endpoint first: `curl https://api.homemore.pl/health`

### Webhooks Not Being Received

**Cause**: Stripe can't reach your server

**Fix**:
1. Ensure API is deployed to a public URL (not localhost)
2. Check firewall/security group settings
3. Verify SSL certificate is valid
4. Test endpoint manually:
   ```bash
   curl -X POST https://api.homemore.pl/webhooks/stripe \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

### Signature Verification Failed

**Cause**: Using wrong signing secret or body parsing issue

**Fix**:
1. Ensure you're using the raw request body (not parsed JSON)
2. In NestJS, use `@Req() req: RawBodyRequest<Request>`
3. Double-check the webhook secret matches Stripe Dashboard

---

## Security Best Practices

### 1. Always Verify Signatures
```typescript
// ✅ GOOD - Verifies signature
const event = stripe.webhooks.constructEvent(
  req.rawBody,
  signature,
  webhookSecret
);

// ❌ BAD - Never trust webhook data without verification
const event = req.body; // Don't do this!
```

### 2. Use HTTPS Only
- Never expose webhook endpoints over HTTP
- Stripe requires HTTPS for production webhooks

### 3. Implement Idempotency
```typescript
// Check if event already processed
const existing = await this.db.webhookEvent.findUnique({
  where: { stripeEventId: event.id }
});

if (existing) {
  return res.json({ received: true }); // Already processed
}

// Process event and save
await this.processEvent(event);
await this.db.webhookEvent.create({
  data: { stripeEventId: event.id, processedAt: new Date() }
});
```

### 4. Return 200 Quickly
```typescript
// Process webhook asynchronously
this.processWebhookAsync(event); // Don't await

// Return 200 immediately
return res.json({ received: true });
```

### 5. Handle Retries Gracefully
Stripe will retry failed webhooks:
- Immediate retry
- Retry after 5 minutes
- Retry after 30 minutes
- Retry after 2 hours
- Retry after 5 hours
- Retry after 10 hours
- Retry after 24 hours

Make your handler **idempotent** to handle duplicate events.

---

## Testing Checklist

After setting up webhooks, test these scenarios:

### Manual Tests:

- [ ] Send test webhook from Stripe Dashboard
- [ ] Verify 200 OK response
- [ ] Check backend logs for event processing
- [ ] Trigger payment success event
- [ ] Trigger payment failure event
- [ ] Trigger refund event
- [ ] Verify database is updated correctly

### Automated Tests:

Run webhook tests:
```bash
cd apps/api
npm run test:e2e -- payment.webhook.e2e-spec.ts
```

### Local Development Tests:

```bash
# Terminal 1: Start backend
cd apps/api
npm run start:dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3001/webhooks/stripe

# Terminal 3: Trigger events
stripe trigger payment_intent.succeeded
stripe trigger charge.refunded
```

---

## Quick Setup Script

Save this as `scripts/setup-stripe-webhooks.sh`:

```bash
#!/bin/bash

# Stripe Webhook Setup Script

set -e

API_URL="${1:-https://api.homemore.pl}"
WEBHOOK_URL="${API_URL}/webhooks/stripe"

echo "🔧 Setting up Stripe webhooks..."
echo "Webhook URL: ${WEBHOOK_URL}"
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI not installed"
    echo "Install from: https://stripe.com/docs/stripe-cli"
    exit 1
fi

# Login to Stripe
echo "📝 Logging in to Stripe..."
stripe login

# Create webhook endpoint
echo "🎯 Creating webhook endpoint..."
WEBHOOK_ID=$(stripe webhook_endpoints create \
  --url "${WEBHOOK_URL}" \
  --enabled-events payment_intent.succeeded \
  --enabled-events payment_intent.payment_failed \
  --enabled-events charge.refunded \
  --enabled-events customer.created \
  --format json | jq -r '.id')

if [ ! -z "$WEBHOOK_ID" ]; then
    echo "✅ Webhook created: ${WEBHOOK_ID}"

    # Get signing secret
    SIGNING_SECRET=$(stripe webhook_endpoints retrieve ${WEBHOOK_ID} --format json | jq -r '.secret')

    echo ""
    echo "🔑 Webhook Signing Secret:"
    echo "${SIGNING_SECRET}"
    echo ""
    echo "Add this to your environment:"
    echo "STRIPE_WEBHOOK_SECRET=\"${SIGNING_SECRET}\""
    echo ""

    # Optionally add to Railway
    read -p "Add to Railway automatically? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        railway variables set STRIPE_WEBHOOK_SECRET="${SIGNING_SECRET}"
        echo "✅ Added to Railway. Redeploy your API to apply changes."
    fi
else
    echo "❌ Failed to create webhook"
    exit 1
fi

echo ""
echo "✅ Stripe webhook setup complete!"
```

Make it executable and run:
```bash
chmod +x scripts/setup-stripe-webhooks.sh
./scripts/setup-stripe-webhooks.sh https://api.homemore.pl
```

---

## Next Steps

After webhook setup:

1. ✅ **Test in production**:
   - Create a real payment
   - Verify webhook is received
   - Check database is updated

2. ✅ **Set up monitoring**:
   - Add Sentry error tracking for webhook failures
   - Set up Stripe email alerts
   - Monitor webhook success rate

3. ✅ **Document events**:
   - Document what happens for each event type
   - Create runbook for handling failed webhooks
   - Set up alerts for critical failures

4. ✅ **Implement additional events**:
   - Add handlers for subscription events (if needed)
   - Add handlers for dispute events
   - Add handlers for payout events

---

**Last Updated**: November 22, 2025
**Setup Time**: 15-20 minutes
**Difficulty**: Intermediate
