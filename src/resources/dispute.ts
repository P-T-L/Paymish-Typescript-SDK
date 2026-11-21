import HttpClient, { type RequestOptions } from "../client.js";
import type { ApiResponse } from "./auth.js";

export type DisputeEvidenceFile = Blob | File | NodeJS.ReadableStream | unknown;

export interface CreateDisputeObjectPayload {
  transactionRef: string;
  disputeReason: string;
  disputeDescription: string;
  image?: DisputeEvidenceFile;
  [key: string]: unknown;
}

export type CreateDisputeInput = FormData | CreateDisputeObjectPayload;

export interface ListDisputesParams {
  limit?: number;
  page?: number;
  search?: string;
}

export interface DisputeReferenceObject {
  transactionRef?: string;
  reference?: string;
  [key: string]: unknown;
}

export type DisputeReferenceInput = string | DisputeReferenceObject;

export interface UpdateDisputePayload {
  tnxRef: string;
  reason: string;
  status: string;
  [key: string]: unknown;
}

export interface DisputeRecord {
  id?: string | number;
  transactionRef?: string;
  tnxRef?: string;
  disputeReason?: string;
  disputeDescription?: string;
  reason?: string;
  status?: string;
  [key: string]: unknown;
}

export class Dispute {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Creates a dispute by uploading a document/evidence.
   * POST /api/dispute-service/external/v1/create-dispute
   */
  public async createDispute(
    payload: CreateDisputeInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<DisputeRecord>> {
    let requestBody: FormData | CreateDisputeObjectPayload = payload;

    // If a plain object is passed instead of FormData, construct FormData automatically
    if (!(payload instanceof FormData)) {
      if (
        !payload ||
        !payload.transactionRef ||
        !payload.disputeReason ||
        !payload.disputeDescription
      ) {
        throw new Error(
          "Invalid payload: 'transactionRef', 'disputeReason', and 'disputeDescription' are required.",
        );
      }

      const formData = new FormData();
      formData.append("transactionRef", payload.transactionRef);
      formData.append("disputeReason", payload.disputeReason);
      formData.append("disputeDescription", payload.disputeDescription);

      if (payload.image) {
        formData.append("image", payload.image as string | Blob);
      }

      requestBody = formData;
    }

    return this.client.request<ApiResponse<DisputeRecord>>(
      "POST",
      "/api/dispute-service/external/v1/create-dispute",
      requestBody,
      options,
    );
  }

  /**
   * Retrieves a paginated list of disputes.
   * GET /api/dispute-service/external/v1/list
   */
  public async listDisputes(
    params: ListDisputesParams = {},
    options: RequestOptions = {},
  ): Promise<ApiResponse<DisputeRecord[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append("limit", String(params.limit ?? 10));
    queryParams.append("page", String(params.page ?? 1));

    if (params.search != null) {
      queryParams.append("search", String(params.search));
    }

    return this.client.request<ApiResponse<DisputeRecord[]>>(
      "GET",
      `/api/dispute-service/external/v1/list?${queryParams.toString()}`,
      null,
      options,
    );
  }

  /**
   * Retrieves dispute details by transaction reference.
   * GET /api/dispute-service/external/v1/dispute-details
   */
  public async getDisputeDetails(
    transactionRef: DisputeReferenceInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<DisputeRecord>> {
    const ref =
      typeof transactionRef === "object" && transactionRef !== null
        ? (transactionRef.transactionRef ?? transactionRef.reference)
        : transactionRef;

    if (!ref || typeof ref !== "string") {
      throw new Error(
        "Invalid parameter: 'transactionRef' is required to retrieve dispute details.",
      );
    }

    const queryParams = new URLSearchParams({ transactionRef: ref }).toString();

    return this.client.request<ApiResponse<DisputeRecord>>(
      "GET",
      `/api/dispute-service/external/v1/dispute-details?${queryParams}`,
      null,
      options,
    );
  }

  /**
   * Updates an existing dispute record.
   * PUT /api/dispute-service/external/v1/update-dispute
   */
  public async updateDispute(
    payload: UpdateDisputePayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<DisputeRecord>> {
    if (!payload || !payload.tnxRef || !payload.reason || !payload.status) {
      throw new Error(
        "Invalid payload: 'tnxRef', 'reason', and 'status' are required to update a dispute.",
      );
    }

    return this.client.request<ApiResponse<DisputeRecord>>(
      "PUT",
      "/api/dispute-service/external/v1/update-dispute",
      payload,
      options,
    );
  }
}

export default Dispute;
