export class StripeIntegrationError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "StripeIntegrationError";
    this.code = code;
  }
}
