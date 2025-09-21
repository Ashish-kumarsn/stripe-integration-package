// tests/errors.test.ts
import { StripeIntegrationError } from "../src/errors";

describe("StripeIntegrationError", () => {
  it("should be an instance of Error and StripeIntegrationError", () => {
    const err = new StripeIntegrationError("test error");

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(StripeIntegrationError);
  });

  it("should set the correct name and message", () => {
    const message = "test error";
    const err = new StripeIntegrationError(message);

    expect(err.message).toBe(message);
    expect(err.name).toBe("StripeIntegrationError");
  });

  it("should include a stack trace", () => {
    const err = new StripeIntegrationError("with stack");
    expect(err.stack).toContain("StripeIntegrationError");
  });
});
