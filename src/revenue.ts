import Stripe from "stripe";
import { StripeIntegrationError } from "./errors";

export class RevenueHandler {
  private stripe: Stripe;

  constructor(secretKey: string, apiVersion: string = "2024-10-01") {
    if (!secretKey) {
      throw new StripeIntegrationError("Missing Stripe secret key");
    }
    this.stripe = new Stripe(secretKey, { apiVersion: apiVersion as any });
  }

  // --- Get total revenue ---
  async getTotalRevenue(opts?: { from?: string | number | Date; to?: string | number | Date }) {
    const params: Stripe.ChargeListParams = { limit: 100 };

    if (opts?.from || opts?.to) {
      params.created = {};
      if (opts.from) params.created.gte = Math.floor(new Date(opts.from).getTime() / 1000);
      if (opts.to) params.created.lte = Math.floor(new Date(opts.to).getTime() / 1000);
    }

    const charges = await this.stripe.charges.list(params);
    const total = charges.data.reduce((sum, c) => sum + (c.amount ?? 0), 0);

    return {
      total,
      currency: charges.data[0]?.currency ?? "usd",
      count: charges.data.length,
    };
  }

  // --- Get revenue by metadata (e.g., courseId) ---
  async getRevenueByMetadata(
    key: string,
    value: string,
    opts?: { from?: string | number | Date; to?: string | number | Date }
  ) {
    const params: Stripe.ChargeListParams = { limit: 100 };

    if (opts?.from || opts?.to) {
      params.created = {};
      if (opts.from) params.created.gte = Math.floor(new Date(opts.from).getTime() / 1000);
      if (opts.to) params.created.lte = Math.floor(new Date(opts.to).getTime() / 1000);
    }

    const charges = await this.stripe.charges.list(params);
    const filtered = charges.data.filter((c) => c.metadata && c.metadata[key] === value);
    const total = filtered.reduce((sum, c) => sum + (c.amount ?? 0), 0);

    return {
      total,
      currency: filtered[0]?.currency ?? "usd",
      count: filtered.length,
    };
  }

  // --- Refund a payment ---
  async refundPayment(paymentIntentId: string) {
    if (!paymentIntentId) {
      throw new StripeIntegrationError("paymentIntentId is required to refund");
    }
    return this.stripe.refunds.create({ payment_intent: paymentIntentId });
  }

  // --- List payments ---
  async listPayments(limit = 50) {
    if (limit <= 0) {
      throw new StripeIntegrationError("limit must be greater than 0");
    }
    return this.stripe.paymentIntents.list({ limit });
  }
}
