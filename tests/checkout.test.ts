import { CheckoutHandler } from "../src/checkout";
import { StripeIntegrationError } from "../src/errors";

// --- Mock Stripe SDK ---
const mockCreate = jest.fn();
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: mockCreate,
      },
    },
  }));
});

describe("CheckoutHandler", () => {
  let checkout: CheckoutHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    checkout = new CheckoutHandler("sk_test_123");
  });

  it("should create a checkout session (payment)", async () => {
    mockCreate.mockResolvedValueOnce({
      id: "sess_123",
      url: "https://stripe.com/checkout/sess_123",
    });

    const session = await checkout.createSession({
      amount: 2000,
      currency: "usd",
      successUrl: "http://localhost:3000/success",
      cancelUrl: "http://localhost:3000/cancel",
      metadata: { userId: "123" },
    });

    expect(session).toEqual(
      expect.objectContaining({
        id: "sess_123",
        url: "https://stripe.com/checkout/sess_123",
      })
    );
    expect(mockCreate).toHaveBeenCalled();
  });

  it("should create a subscription session", async () => {
    mockCreate.mockResolvedValueOnce({
      id: "sess_sub",
      url: "https://stripe.com/checkout/sess_sub",
    });

    const session = await checkout.createSession({
      mode: "subscription",
      priceId: "price_123",
      successUrl: "http://localhost:3000/success",
      cancelUrl: "http://localhost:3000/cancel",
    });

    expect(session).toEqual(
      expect.objectContaining({
        id: "sess_sub",
        url: "https://stripe.com/checkout/sess_sub",
      })
    );
  });

  it("should throw an error if secret key is missing", () => {
    expect(() => new CheckoutHandler("")).toThrow(StripeIntegrationError);
  });

  it("should throw if successUrl/cancelUrl are missing", async () => {
    await expect(
      checkout.createSession({
        amount: 1000,
        currency: "usd",
        successUrl: "",
        cancelUrl: "",
      })
    ).rejects.toThrow("successUrl and cancelUrl are required");
  });

  it("should throw if amount is invalid for payment", async () => {
    await expect(
      checkout.createSession({
        amount: 0,
        currency: "usd",
        successUrl: "ok",
        cancelUrl: "ok",
      })
    ).rejects.toThrow("Amount must be a positive number");
  });

  it("should throw if currency missing", async () => {
    await expect(
      checkout.createSession({
        amount: 2000,
        successUrl: "ok",
        cancelUrl: "ok",
      } as any)
    ).rejects.toThrow("Currency is required");
  });

  it("should throw if subscription priceId missing", async () => {
    await expect(
      checkout.createSession({
        mode: "subscription",
        successUrl: "ok",
        cancelUrl: "ok",
      } as any)
    ).rejects.toThrow("priceId required for subscription mode");
  });

  it("should throw if unsupported mode is passed", async () => {
    await expect(
      checkout.createSession({
        mode: "donation" as any,
        successUrl: "ok",
        cancelUrl: "ok",
      })
    ).rejects.toThrow("Unsupported session mode");
  });

  it("should wrap unexpected errors in StripeIntegrationError", async () => {
    mockCreate.mockRejectedValueOnce(new Error("Stripe API failure"));

    await expect(
      checkout.createSession({
        amount: 2000,
        currency: "usd",
        successUrl: "ok",
        cancelUrl: "ok",
      })
    ).rejects.toThrow("Stripe API failure");
  });
});
