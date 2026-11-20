import HttpClient, { type RequestOptions } from "../client.js";
import type { ApiResponse } from "./auth.js";

export interface ChangeBusinessModePayload {
  isLive: boolean;
}

export type ChangeBusinessModeInput = ChangeBusinessModePayload | boolean;

export interface CreateBusinessPayload {
  countryId: number;
  businessName: string;
  businessCategory: number;
  businessDescription?: string;
  [key: string]: unknown;
}

export interface BusinessProfile {
  id?: string | number;
  businessName?: string;
  businessDescription?: string;
  businessCategory?: number | string;
  countryId?: number | string;
  isLive?: boolean;
  [key: string]: unknown;
}

export class Business {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Changes the mode (live or not live) of the business
   * POST /api/user-service/external/v1/change-business-mode
   */
  public async changeMode(
    payload: ChangeBusinessModeInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<BusinessProfile>> {
    const isLive = typeof payload === "boolean" ? payload : payload?.isLive;

    if (typeof isLive !== "boolean") {
      throw new Error(
        "Invalid payload: 'isLive' must be a boolean value (true or false).",
      );
    }

    return this.client.request<ApiResponse<BusinessProfile>>(
      "POST",
      "/api/user-service/external/v1/change-business-mode",
      { isLive },
      options,
    );
  }

  /**
   * Retrieves full details for the authenticated business profile
   * GET /api/user-service/external/v1/get-business-detail
   */
  public async getDetails(
    options: RequestOptions = {},
  ): Promise<ApiResponse<BusinessProfile>> {
    return this.client.request<ApiResponse<BusinessProfile>>(
      "GET",
      "/api/user-service/external/v1/get-business-detail",
      null,
      options,
    );
  }

  /**
   * Adds a new business profile
   * POST /api/user-service/external/v1/add-new-business
   */
  public async createBusiness(
    payload: CreateBusinessPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<BusinessProfile>> {
    if (
      !payload ||
      payload.countryId == null ||
      !payload.businessName ||
      payload.businessCategory == null
    ) {
      throw new Error(
        "Invalid payload: 'countryId', 'businessName', and 'businessCategory' are required.",
      );
    }

    return this.client.request<ApiResponse<BusinessProfile>>(
      "POST",
      "/api/user-service/external/v1/add-new-business",
      payload,
      options,
    );
  }

  /**
   * Retrieves the list of businesses associated with the account.
   * GET /api/user-service/external/v1/business-list
   */
  public async listBusinesses(
    options: RequestOptions = {},
  ): Promise<ApiResponse<BusinessProfile[]>> {
    return this.client.request<ApiResponse<BusinessProfile[]>>(
      "GET",
      "/api/user-service/external/v1/business-list",
      null,
      options,
    );
  }
}

export default Business;
