import HttpClient, { type RequestOptions } from "../client.js";
import type { ApiResponse } from "./auth.js";

export type CheckoutAmount = string | number;

export interface InitializeTransactionPayload {
  email: string;
  amount: CheckoutAmount;
  [key: string]: unknown;
}

export interface InitializeDvaPayload {
  email: string;
  amount: CheckoutAmount;
  reference?: string;
  [key: string]: unknown;
}

export interface InitializedCheckoutData {
  authorization_url?: string;
  access_code?: string;
  reference?: string;
  account_number?: string;
  account_name?: string;
  bank_name?: string;
  amount?: CheckoutAmount;
  [key: string]: unknown;
}

export class InitializeCheckout {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Initializes a transaction.
   * POST /api/transaction-service/external/v1/transaction-initialize
   */
  public async initializeTransaction(
    payload: InitializeTransactionPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<InitializedCheckoutData>> {
    if (
      !payload ||
      !payload.email ||
      payload.amount === undefined ||
      payload.amount === null
    ) {
      throw new Error(
        "Invalid payload: 'email' and 'amount' are required to initialize a transaction.",
      );
    }

    return this.client.request<ApiResponse<InitializedCheckoutData>>(
      "POST",
      "/api/transaction-service/external/v1/transaction-initialize",
      payload,
      options,
    );
  }

  /**
   * Initializes a transaction with a Dynamic Virtual Account (DVA).
   * POST /api/transaction-service/external/v1/transaction-initialize/dva
   */
  public async initializeDva(
    payload: InitializeDvaPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<InitializedCheckoutData>> {
    if (
      !payload ||
      !payload.email ||
      payload.amount === undefined ||
      payload.amount === null
    ) {
      throw new Error(
        "Invalid payload: 'email' and 'amount' are required to initialize a DVA transaction.",
      );
    }

    return this.client.request<ApiResponse<InitializedCheckoutData>>(
      "POST",
      "/api/transaction-service/external/v1/transaction-initialize/dva",
      payload,
      options,
    );
  }
}

export default InitializeCheckout;
