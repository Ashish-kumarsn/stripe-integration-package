import { WebhookHandler } from "../src/webhook";

const fakeEvent = {
  id: "evt_1",
  type: "checkout.session.completed",
  data: { object: { id: "sess_123" } },
};

const mockConstructEvent = jest.fn();

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: { constructEvent: mockConstructEvent },
  }));
});

describe("WebhookHandler", () => {
  let handler: WebhookHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConstructEvent.mockReturnValue(fakeEvent);
    handler = new WebhookHandler("sk_test_123", "whsec_test");
  });

  it("should call callback in handleRaw", async () => {
    let called = false;
    const cb = jest.fn(() => { called = true; });

    const raw = Buffer.from("{}");
    const sig = "sig";

    const event = await handler.handleRaw(raw, sig, { "checkout.session.completed": cb });

    expect(event).toBe(fakeEvent);
    expect(cb).toHaveBeenCalledWith(fakeEvent.data.object);
    expect(called).toBe(true);
  });

  it("should ignore unknown event types in handleRaw", async () => {
    const cb = jest.fn();
    const event = await handler.handleRaw(Buffer.from("{}"), "sig", { "pi.succeeded": cb });
    expect(event).toBe(fakeEvent);
    expect(cb).not.toHaveBeenCalled();
  });

  it("should send 200 in expressMiddleware on success", async () => {
    const req: any = { body: Buffer.from("{}"), headers: { "stripe-signature": "sig" } };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    const mw = handler.expressMiddleware({ "checkout.session.completed": jest.fn() });
    await mw(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it("should send 400 if constructEvent throws", async () => {
    mockConstructEvent.mockImplementationOnce(() => { throw new Error("bad sig"); });

    const req: any = { body: Buffer.from("{}"), headers: { "stripe-signature": "sig" } };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    const mw = handler.expressMiddleware({});

    await mw(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.stringContaining("Webhook Error"));
  });
});
