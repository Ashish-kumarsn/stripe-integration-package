import Stripe from "stripe";

export type Maybe<T> = T | null | undefined;

export interface CreateSessionParams {
  mode?: "payment" | "subscription"; // default payment
  amount?: number; // in cents — required for one-time
  currency?: string; // required for one-time
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  // for subscription:
  priceId?: string; // prefer using a Stripe priceId for subscription
  // optional product fallback for single payment item
  productName?: string;
}

export type StripeCallback = (payload: any, event?: Stripe.Event) => Promise<void> | void;

export interface WebhookCallbackMap {
  [stripeEventType: string]: StripeCallback;
}
