# Stripe Integration Package

A simple and reusable Stripe integration package for Node.js/Express apps.

## Installation
```bash
npm install stripe-integration-package
 

 import { CheckoutHandler } from "stripe-integration-package";

const checkout = new CheckoutHandler(process.env.STRIPE_SECRET!);

const session = await checkout.createSession({
  amount: 2000,
  currency: "usd",
  successUrl: "http://localhost:3000/success",
  cancelUrl: "http://localhost:3000/cancel",
});

console.log(session.url);

Features

Easy checkout session creation

Webhook handler

Revenue calculation utilities

Error handling helpers 

License
Ashish Kumar
# Stripe Integration Package

[![npm version](https://img.shields.io/npm/v/stripe-integration-package.svg?style=flat-square)](https://www.npmjs.com/package/stripe-integration-package)
[![npm downloads](https://img.shields.io/npm/dm/stripe-integration-package.svg?style=flat-square)](https://www.npmjs.com/package/stripe-integration-package)
[![license](https://img.shields.io/npm/l/stripe-integration-package.svg?style=flat-square)](https://github.com/yourusername/stripe-integration-package/blob/main/LICENSE)

A simple and reusable **Stripe integration package** for Node.js/Express applications.  
This package provides ready-to-use utilities for checkout, webhooks, revenue stats, and error handling.

---

## 📦 Installation

```bash
npm install stripe-integration-package

