import { sanitize } from "./utils/sanitize.js";

export class PaymishError extends Error {
  public override readonly name = "PaymishError";
  public readonly statusCode: number;
  public readonly errors: unknown;
  public readonly requestData: unknown;

  constructor(
    message: string,
    statusCode: number,
    errors: unknown = null,
    requestData: unknown = null,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;

    // Sanitize any request payload attached to the error object
    this.requestData = requestData ? sanitize(requestData) : null;

    // Ensure proper prototype chain in transpiled environments
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
