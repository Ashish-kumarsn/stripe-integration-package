import { RevenueHandler } from "../src/revenue";
import { StripeIntegrationError } from "../src/errors";

const fakeCharges = {
  data: [
    { id: "ch_1", amount: 2000, currency: "usd", metadata: { courseId: "c1" } },
    { id: "ch_2", amount: 3000, currency: "usd", metadata: { courseId: "c2" } },
    { id: "ch_3", amount: 1500, currency: "usd", metadata: { courseId: "c1" } },
  ],
};
const fakePaymentIntents = { data: [{ id: "pi_1" }, { id: "pi_2" }] };

const mockListCharges = jest.fn();
const mockRefundCreate = jest.fn();
const mockListPaymentIntents = jest.fn();

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    charges: { list: mockListCharges },
    refunds: { create: mockRefundCreate },
    paymentIntents: { list: mockListPaymentIntents },
  }));
});

describe("RevenueHandler", () => {
  let handler: RevenueHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new RevenueHandler("sk_test_123");
  });

  it("should calculate total revenue", async () => {
    mockListCharges.mockResolvedValue(fakeCharges);
    const res = await handler.getTotalRevenue();
    expect(res.total).toBe(6500);
    expect(res.count).toBe(3);
  });

  it("should apply date filters for total revenue", async () => {
    mockListCharges.mockResolvedValue(fakeCharges);
    await handler.getTotalRevenue({ from: Date.now(), to: Date.now() });
    expect(mockListCharges).toHaveBeenCalledWith(expect.objectContaining({ created: expect.any(Object) }));
  });

  it("should calculate revenue by metadata match", async () => {
    mockListCharges.mockResolvedValue(fakeCharges);
    const res = await handler.getRevenueByMetadata("courseId", "c1");
    expect(res.total).toBe(3500);
  });

  it("should return 0 revenue if metadata not found", async () => {
    mockListCharges.mockResolvedValue(fakeCharges);
    const res = await handler.getRevenueByMetadata("courseId", "none");
    expect(res.total).toBe(0);
    expect(res.count).toBe(0);
  });

  it("should apply date filters in revenueByMetadata", async () => {
    mockListCharges.mockResolvedValue(fakeCharges);
    await handler.getRevenueByMetadata("courseId", "c1", { from: Date.now() });
    expect(mockListCharges).toHaveBeenCalledWith(expect.objectContaining({ created: expect.any(Object) }));
  });

  it("should create refund", async () => {
    mockRefundCreate.mockResolvedValue({ id: "re_1" });
    const refund = await handler.refundPayment("pi_123");
    expect(refund.id).toBe("re_1");
  });

  it("should throw if refundPayment called without id", async () => {
    await expect(handler.refundPayment("")).rejects.toThrow("paymentIntentId is required");
  });

  it("should list payments", async () => {
    mockListPaymentIntents.mockResolvedValue(fakePaymentIntents);
    const res = await handler.listPayments(2);
    expect(res.data).toHaveLength(2);
  });

  it("should throw if listPayments called with invalid limit", async () => {
    await expect(handler.listPayments(0)).rejects.toThrow("limit must be greater than 0");
  });

  it("should throw if secret key missing", () => {
    expect(() => new RevenueHandler("")).toThrow(StripeIntegrationError);
  });
});
