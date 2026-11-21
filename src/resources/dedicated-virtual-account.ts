import HttpClient, { type RequestOptions } from "../client.js";
import type { ApiResponse } from "./auth.js";

export interface CreateDedicatedAccountPayload {
  [key: string]: unknown;
}

export interface ListDedicatedAccountsParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface DedicatedAccountIdentifierObject {
  customerId?: string | number;
  id?: string | number;
  [key: string]: unknown;
}

export type DedicatedAccountIdentifierInput =
  string | number | DedicatedAccountIdentifierObject;

export interface UpdateDedicatedAccountPayload {
  [key: string]: unknown;
}

export interface RequeryDedicatedAccountParams {
  account_number: string;
  provider_slug: string;
  date?: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface AssignDedicatedAccountPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  [key: string]: unknown;
}

export interface DedicatedVirtualAccountRecord {
  id?: string | number;
  customerId?: string | number;
  account_number?: string;
  account_name?: string;
  bank_name?: string;
  provider_slug?: string;
  active?: boolean;
  [key: string]: unknown;
}

export class DedicatedVirtualAccount {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Creates a new dedicated virtual account
   * POST /api/transaction-service/external/v1/dedicated-virtual-accounts
   */
  public async createAccount(
    payload: CreateDedicatedAccountPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<DedicatedVirtualAccountRecord>> {
    if (!payload || typeof payload !== "object") {
      throw new Error(
        "Invalid payload: A valid payload object is required to create a dedicated virtual account.",
      );
    }

    return this.client.request<ApiResponse<DedicatedVirtualAccountRecord>>(
      "POST",
      "/api/transaction-service/external/v1/dedicated-virtual-accounts",
      payload,
      options,
    );
  }

  /**
   * Retrieves a paginated list of dedicated virtual accounts
   * GET /api/transaction-service/external/v1/dedicated-virtual-accounts
   */
  public async listAccounts(
    params: ListDedicatedAccountsParams = {},
    options: RequestOptions = {},
  ): Promise<ApiResponse<DedicatedVirtualAccountRecord[]>> {
    const queryParams: Record<
      string,
      string | number | boolean | undefined | null
    > = {
      page: 1,
      limit: 10,
      ...params,
    };
    let endpoint =
      "/api/transaction-service/external/v1/dedicated-virtual-accounts";
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }

    const queryString = searchParams.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }

    return this.client.request<ApiResponse<DedicatedVirtualAccountRecord[]>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Retrieves a dedicated virtual account by customer ID
   * GET /api/transaction-service/external/v1/dedicated-virtual-accounts/{customerId}
   */
  public async getAccountByCustomerId(
    identifier: DedicatedAccountIdentifierInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<DedicatedVirtualAccountRecord>> {
    const customerId =
      typeof identifier === "object" && identifier !== null
        ? (identifier.customerId ?? identifier.id)
        : identifier;

    if (customerId == null || customerId === "") {
      throw new Error(
        "Invalid parameter: 'customerId' is required to retrieve a dedicated virtual account.",
      );
    }

    const endpoint = `/api/transaction-service/external/v1/dedicated-virtual-accounts/${encodeURIComponent(String(customerId))}`;

    return this.client.request<ApiResponse<DedicatedVirtualAccountRecord>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Updates a dedicated virtual account by customer ID
   * PUT /api/transaction-service/external/v1/dedicated-virtual-accounts/{customerId}
   */
  public async updateAccountByCustomerId(
    identifier: DedicatedAccountIdentifierInput,
    payload: UpdateDedicatedAccountPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<DedicatedVirtualAccountRecord>> {
    const customerId =
      typeof identifier === "object" && identifier !== null
        ? (identifier.customerId ?? identifier.id)
        : identifier;

    if (customerId == null || customerId === "") {
      throw new Error(
        "Invalid parameter: 'customerId' is required to update a dedicated virtual account.",
      );
    }

    if (!payload || typeof payload !== "object") {
      throw new Error(
        "Invalid payload: A valid payload object is required to update a dedicated virtual account.",
      );
    }

    const endpoint = `/api/transaction-service/external/v1/dedicated-virtual-accounts/${encodeURIComponent(String(customerId))}`;

    return this.client.request<ApiResponse<DedicatedVirtualAccountRecord>>(
      "PUT",
      endpoint,
      payload,
      options,
    );
  }

  /**
   * Requeries the status of a dedicated virtual account
   * GET /api/transaction-service/external/v1/dedicated-virtual-accounts/requery
   */
  public async requeryAccount(
    params: RequeryDedicatedAccountParams,
    options: RequestOptions = {},
  ): Promise<ApiResponse<DedicatedVirtualAccountRecord>> {
    if (!params || !params.account_number || !params.provider_slug) {
      throw new Error(
        "Invalid parameters: 'account_number' and 'provider_slug' are required query parameters.",
      );
    }

    let endpoint =
      "/api/transaction-service/external/v1/dedicated-virtual-accounts/requery";
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

    return this.client.request<ApiResponse<DedicatedVirtualAccountRecord>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Assigns a dedicated virtual account
   * POST /api/transaction-service/external/v1/dedicated-virtual-accounts/assign
   */
  public async assignAccount(
    payload: AssignDedicatedAccountPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<DedicatedVirtualAccountRecord>> {
    if (
      !payload ||
      !payload.first_name ||
      !payload.last_name ||
      !payload.email ||
      !payload.phone
    ) {
      throw new Error(
        "Invalid payload: 'email', 'first_name', 'last_name', and 'phone' are required fields.",
      );
    }

    return this.client.request<ApiResponse<DedicatedVirtualAccountRecord>>(
      "POST",
      "/api/transaction-service/external/v1/dedicated-virtual-accounts/assign",
      payload,
      options,
    );
  }
}

export default DedicatedVirtualAccount;
