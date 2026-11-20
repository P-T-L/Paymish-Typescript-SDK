import HttpClient, { type RequestOptions } from "../client.js";
import type { ApiResponse } from "./auth.js";

export interface ListTransactionCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface CreateTransactionCustomerPayload {
  [key: string]: unknown;
}

export interface UpdateTransactionCustomerPayload {
  [key: string]: unknown;
}

export interface TransactionCustomerIdentifierObject {
  id?: string | number;
  customerId?: string | number;
  [key: string]: unknown;
}

export type TransactionCustomerIdentifierInput =
  string | number | TransactionCustomerIdentifierObject;

export interface TransactionCustomerRecord {
  id?: string | number;
  customerId?: string | number;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  [key: string]: unknown;
}

export class TransactionCustomer {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Retrieves a paginated list of transaction customers
   * GET /api/transaction-service/external/v1/customers
   */
  public async listCustomers(
    params: ListTransactionCustomersParams = {},
    options: RequestOptions = {},
  ): Promise<ApiResponse<TransactionCustomerRecord[]>> {
    let endpoint = "/api/transaction-service/external/v1/customers";

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();

      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }

      const queryString = searchParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }

    return this.client.request<ApiResponse<TransactionCustomerRecord[]>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Creates a new customer in the transaction service
   * POST /api/transaction-service/external/v1/customers
   */
  public async createCustomer(
    payload: CreateTransactionCustomerPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<TransactionCustomerRecord>> {
    if (!payload || typeof payload !== "object") {
      throw new Error(
        "Invalid payload: A valid payload object is required to create a transaction customer.",
      );
    }

    return this.client.request<ApiResponse<TransactionCustomerRecord>>(
      "POST",
      "/api/transaction-service/external/v1/customers",
      payload,
      options,
    );
  }

  /**
   * Retrieves transaction customer details by ID
   * GET /api/transaction-service/external/v1/customers/{id}
   */
  public async getCustomerById(
    identifier: TransactionCustomerIdentifierInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<TransactionCustomerRecord>> {
    const customerId =
      typeof identifier === "object" && identifier !== null
        ? (identifier.id ?? identifier.customerId)
        : identifier;

    if (customerId == null || customerId === "") {
      throw new Error("Invalid parameter: 'customerId' (or 'id') is required.");
    }

    const endpoint = `/api/transaction-service/external/v1/customers/${encodeURIComponent(String(customerId))}`;

    return this.client.request<ApiResponse<TransactionCustomerRecord>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Updates an existing transaction customer by ID
   * PUT /api/transaction-service/external/v1/customers/{id}
   */
  public async updateCustomer(
    identifier: TransactionCustomerIdentifierInput,
    payload: UpdateTransactionCustomerPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<TransactionCustomerRecord>> {
    const customerId =
      typeof identifier === "object" && identifier !== null
        ? (identifier.id ?? identifier.customerId)
        : identifier;

    if (customerId == null || customerId === "") {
      throw new Error(
        "Invalid parameter: 'customerId' (or 'id') is required to update a customer.",
      );
    }

    if (!payload || typeof payload !== "object") {
      throw new Error(
        "Invalid payload: A valid payload object is required to update a transaction customer.",
      );
    }

    const endpoint = `/api/transaction-service/external/v1/customers/${encodeURIComponent(String(customerId))}`;

    return this.client.request<ApiResponse<TransactionCustomerRecord>>(
      "PUT",
      endpoint,
      payload,
      options,
    );
  }
}

export default TransactionCustomer;
