import Stripe from "stripe";

export class WebhookHandler {
  private stripe: Stripe;
  private endpointSecret: string;

  constructor(
    secretKey: string,
    endpointSecret: string,
    apiVersion: Stripe.LatestApiVersion = "2025-08-27.basil"
  ) {
    this.stripe = new Stripe(secretKey, { apiVersion });
    this.endpointSecret = endpointSecret;
  }

  // --- Handle raw event ---
  async handleRaw(
    rawBody: Buffer,
    signature: string,
    callbacks: Record<string, (payload: any) => Promise<void> | void>
  ) {
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, this.endpointSecret);
    if (callbacks[event.type]) {
      await callbacks[event.type](event.data.object);
    }
    return event;
  }

  // --- Express middleware ---
  expressMiddleware(
    callbacks: Record<string, (payload: any) => Promise<void> | void>
  ) {
    return async (req: any, res: any, next: any) => {
      try {
        const rawBody: Buffer = req.body;
        const sig = req.headers["stripe-signature"] as string;

        const event = this.stripe.webhooks.constructEvent(rawBody, sig, this.endpointSecret);
        if (callbacks[event.type]) {
          await callbacks[event.type](event.data.object);
        }

        res.status(200).json({ received: true });
      } catch (err: any) {
        res.status(400).send(`Webhook Error: ${err.message}`);
      }
    };
  }
}
