import Stripe from "stripe";
import { CreateSessionParams } from "./types";
import { StripeIntegrationError } from "./errors";

export class CheckoutHandler {
  private stripe: Stripe;

  constructor(secretKey: string) {
    if (!secretKey) {
      throw new StripeIntegrationError("Missing Stripe secret key");
    }
    this.stripe = new Stripe(secretKey, {
  apiVersion: "2024-06-20" as any, // 👈 fix
});

  }

  async createSession(params: CreateSessionParams) {
    try {
      const mode = params.mode ?? "payment";

      // --- Common validations ---
      if (!params.successUrl || !params.cancelUrl) {
        throw new StripeIntegrationError("successUrl and cancelUrl are required");
      }

      // --- One-time payment ---
      if (mode === "payment") {
        if (typeof params.amount !== "number" || params.amount <= 0) {
          throw new StripeIntegrationError(
            "Amount must be a positive number for one-time payments"
          );
        }
        if (!params.currency) {
          throw new StripeIntegrationError(
            "Currency is required for one-time payments"
          );
        }

        const session = await this.stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: params.currency,
                product_data: { name: params.productName ?? "Product" },
                unit_amount: params.amount,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: params.successUrl,
          cancel_url: params.cancelUrl,
          metadata: params.metadata,
        });

        return { id: session.id, url: session.url, raw: session };
      }

      // --- Subscription ---
      if (mode === "subscription") {
        if (!params.priceId) {
          throw new StripeIntegrationError("priceId required for subscription mode");
        }

        const session = await this.stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [{ price: params.priceId, quantity: 1 }],
          mode: "subscription",
          success_url: params.successUrl,
          cancel_url: params.cancelUrl,
          metadata: params.metadata,
        });

        return { id: session.id, url: session.url, raw: session };
      }

      // --- Unsupported mode ---
      throw new StripeIntegrationError("Unsupported session mode");
    } catch (err: any) {
      // Always wrap in our custom error for clarity
      throw new StripeIntegrationError(
        err instanceof Error ? err.message : "Failed to create session"
      );
    }
  }
}
