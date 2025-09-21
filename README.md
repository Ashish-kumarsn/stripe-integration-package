# Stripe Integration Package

[![npm version](https://img.shields.io/npm/v/stripe-integration-package.svg?style=flat-square)](https://www.npmjs.com/package/stripe-integration-package)
[![npm downloads](https://img.shields.io/npm/dm/stripe-integration-package.svg?style=flat-square)](https://www.npmjs.com/package/stripe-integration-package)
[![license](https://img.shields.io/npm/l/stripe-integration-package.svg?style=flat-square)](https://github.com/yourusername/stripe-integration-package/blob/main/LICENSE)

A simple and powerful **Stripe integration package** for Node.js/Express applications. This package provides ready-to-use utilities for **checkout sessions**, **webhook handling**, **revenue analytics**, and **error management**.

## 📦 Installation

```bash
npm install stripe-integration-package
```

## 🚀 Quick Start

```typescript
import { CheckoutHandler } from "stripe-integration-package";

const checkout = new CheckoutHandler(process.env.STRIPE_SECRET!);

const session = await checkout.createSession({
  amount: 2000, // $20.00 in cents
  currency: "usd",
  successUrl: "https://yourapp.com/success",
  cancelUrl: "https://yourapp.com/cancel",
});

console.log(session.url); // Redirect user to Stripe Checkout
```

## ✨ Features

- ⚡ **Easy checkout sessions** - One-time payments & subscriptions
- 🔔 **Secure webhook handling** - Process Stripe events safely
- 📊 **Revenue analytics** - Calculate earnings with filtering
- 🛠️ **Custom error handling** - Consistent error management
- 🎯 **TypeScript support** - Full type definitions included
- 📱 **Express middleware** - Ready-to-use webhook middleware

## 📖 API Documentation

### CheckoutHandler

Create Stripe checkout sessions for payments and subscriptions.

#### One-time Payment

```typescript
import { CheckoutHandler } from "stripe-integration-package";

const checkout = new CheckoutHandler("sk_test_...");

const session = await checkout.createSession({
  mode: "payment", // default
  amount: 2500, // $25.00 in cents
  currency: "usd",
  productName: "Premium Course",
  successUrl: "https://yourapp.com/success",
  cancelUrl: "https://yourapp.com/cancel",
  metadata: {
    courseId: "course_123",
    userId: "user_456"
  }
});

// Redirect user to session.url
```

#### Subscription

```typescript
const session = await checkout.createSession({
  mode: "subscription",
  priceId: "price_1234567890", // Stripe Price ID
  successUrl: "https://yourapp.com/success",
  cancelUrl: "https://yourapp.com/cancel",
  metadata: {
    planType: "premium"
  }
});
```

### WebhookHandler

Securely process Stripe webhook events with signature verification.

#### Basic Usage

```typescript
import { WebhookHandler } from "stripe-integration-package";
import express from "express";

const webhook = new WebhookHandler(
  process.env.STRIPE_SECRET!,
  process.env.STRIPE_WEBHOOK_SECRET!
);

const app = express();

// Raw body parser for webhooks
app.use('/webhook', express.raw({ type: 'application/json' }));

app.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    
    await webhook.handleRaw(req.body, signature, {
      'checkout.session.completed': async (session) => {
        console.log('Payment successful:', session.id);
        // Handle successful payment
      },
      'invoice.payment_failed': async (invoice) => {
        console.log('Payment failed:', invoice.id);
        // Handle failed payment
      }
    });
    
    res.status(200).json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});
```

#### Express Middleware

```typescript
app.post('/webhook', webhook.expressMiddleware({
  'checkout.session.completed': async (session) => {
    // Handle successful checkout
    await processSuccessfulPayment(session);
  },
  'customer.subscription.created': async (subscription) => {
    // Handle new subscription
    await activateUserSubscription(subscription);
  }
}));
```

### RevenueHandler

Calculate and analyze revenue from your Stripe data.

```typescript
import { RevenueHandler } from "stripe-integration-package";

const revenue = new RevenueHandler(process.env.STRIPE_SECRET!);
```

#### Get Total Revenue

```typescript
// All time revenue
const totalRevenue = await revenue.getTotalRevenue();
console.log(`Total: $${totalRevenue.total / 100}`);

// Revenue for specific date range
const monthlyRevenue = await revenue.getTotalRevenue({
  from: "2024-01-01",
  to: "2024-01-31"
});
```

#### Revenue by Metadata

```typescript
// Revenue for specific course
const courseRevenue = await revenue.getRevenueByMetadata(
  "courseId", 
  "course_123",
  {
    from: new Date(2024, 0, 1), // January 1, 2024
    to: new Date() // Now
  }
);

console.log(`Course revenue: $${courseRevenue.total / 100}`);
console.log(`Number of sales: ${courseRevenue.count}`);
```

#### Payment Management

```typescript
// Refund a payment
const refund = await revenue.refundPayment("pi_1234567890");

// List recent payments
const payments = await revenue.listPayments(20); // Last 20 payments
```

### Error Handling

Custom error class for consistent error management across your application.

```typescript
import { StripeIntegrationError } from "stripe-integration-package";

try {
  const session = await checkout.createSession(invalidParams);
} catch (error) {
  if (error instanceof StripeIntegrationError) {
    console.error('Stripe Integration Error:', error.message);
    console.error('Error Code:', error.code);
  }
}
```

## 🔧 Configuration

### Environment Variables

```bash
STRIPE_SECRET=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_endpoint_secret
```

### TypeScript Configuration

The package includes full TypeScript definitions. No additional `@types` packages needed.

```typescript
import { 
  CheckoutHandler, 
  WebhookHandler, 
  RevenueHandler,
  CreateSessionParams,
  StripeIntegrationError 
} from "stripe-integration-package";
```

## 🛡️ Security Best Practices

1. **Always verify webhook signatures** using the WebhookHandler
2. **Use environment variables** for sensitive keys
3. **Validate amounts** on the server-side before creating sessions
4. **Use HTTPS** for all webhook endpoints in production

## 📋 Requirements

- Node.js 14.0 or higher
- Stripe account with API keys
- Express.js (for webhook middleware)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © [Ashish Kumar](https://github.com/yourusername)

---

Made with ❤️ for the developer community
