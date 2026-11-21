import HttpClient, { type RequestOptions } from "../client.js";
import type { ApiResponse } from "./auth.js";

export interface CreateTransactionDisputePayload {
  [key: string]: unknown;
}

export interface UpdateTransactionDisputePayload {
  [key: string]: unknown;
}

export interface TransactionDisputeIdentifierObject {
  disputeId?: string | number;
  id?: string | number;
  [key: string]: unknown;
}

export type TransactionDisputeIdentifierInput =
  string | number | TransactionDisputeIdentifierObject;

export interface TransactionDisputeRecord {
  id?: string | number;
  disputeId?: string | number;
  transactionRef?: string;
  reason?: string;
  status?: string;
  [key: string]: unknown;
}

export class TransactionDisputes {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Retrieves the list of transaction-level disputes.
   * GET /api/transaction-service/external/v1/disputes
   */
  public async listDisputes(
    options: RequestOptions = {},
  ): Promise<ApiResponse<TransactionDisputeRecord[]>> {
    return this.client.request<ApiResponse<TransactionDisputeRecord[]>>(
      "GET",
      "/api/transaction-service/external/v1/disputes",
      null,
      options,
    );
  }

  /**
   * Creates a new transaction-level dispute.
   * POST /api/transaction-service/external/v1/disputes
   */
  public async createDispute(
    payload: CreateTransactionDisputePayload = {},
    options: RequestOptions = {},
  ): Promise<ApiResponse<TransactionDisputeRecord>> {
    return this.client.request<ApiResponse<TransactionDisputeRecord>>(
      "POST",
      "/api/transaction-service/external/v1/disputes",
      payload,
      options,
    );
  }

  /**
   * Retrieves a transaction-level dispute by its ID.
   * GET /api/transaction-service/external/v1/disputes/{id}
   */
  public async getDisputeById(
    disputeId: TransactionDisputeIdentifierInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<TransactionDisputeRecord>> {
    const id =
      typeof disputeId === "object" && disputeId !== null
        ? (disputeId.disputeId ?? disputeId.id)
        : disputeId;

    if (!id && id !== 0) {
      throw new Error(
        "Invalid parameter: 'disputeId' is required to retrieve dispute details.",
      );
    }

    return this.client.request<ApiResponse<TransactionDisputeRecord>>(
      "GET",
      `/api/transaction-service/external/v1/disputes/${id}`,
      null,
      options,
    );
  }

  /**
   * Updates an existing transaction-level dispute by its ID.
   * PUT /api/transaction-service/external/v1/disputes/{id}
   */
  public async updateDispute(
    disputeId: TransactionDisputeIdentifierInput,
    payload: UpdateTransactionDisputePayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<TransactionDisputeRecord>> {
    const id =
      typeof disputeId === "object" && disputeId !== null
        ? (disputeId.disputeId ?? disputeId.id)
        : disputeId;

    if (!id && id !== 0) {
      throw new Error(
        "Invalid parameter: 'disputeId' is required to update a dispute.",
      );
    }

    if (!payload || typeof payload !== "object") {
      throw new Error(
        "Invalid payload: A valid payload object is required to update a dispute.",
      );
    }

    return this.client.request<ApiResponse<TransactionDisputeRecord>>(
      "PUT",
      `/api/transaction-service/external/v1/disputes/${id}`,
      payload,
      options,
    );
  }
}

export default TransactionDisputes;
