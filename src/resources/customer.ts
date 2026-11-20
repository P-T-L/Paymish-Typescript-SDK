import HttpClient, { type RequestOptions } from "../client.js";
import type { ApiResponse } from "./auth.js";

export interface CreateCustomerPayload {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryId: number;
  dialingCodeId?: number;
  businessId?: number;
  [key: string]: unknown;
}

export interface UpdateCustomerPayload {
  customerReference: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dialingCodeId?: number;
  [key: string]: unknown;
}

export interface ListCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface BlacklistCustomerPayload {
  customerReference: string;
  isBlackListed: boolean;
  [key: string]: unknown;
}

export interface CustomerIdentifierObject {
  customerId?: number | string;
  id?: number | string;
  customerReference?: string | number;
  [key: string]: unknown;
}

export type CustomerIdentifierInput =
  number | string | CustomerIdentifierObject;

export interface CustomerRecord {
  id?: number | string;
  customerReference?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  countryId?: number | string;
  dialingCodeId?: number | string;
  businessId?: number | string;
  isBlackListed?: boolean;
  [key: string]: unknown;
}

export class Customer {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Creates a new customer record
   * POST /api/customer-service/external/v1/create
   */
  public async createCustomer(
    payload: CreateCustomerPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<CustomerRecord>> {
    if (
      !payload ||
      !payload.email ||
      !payload.firstName ||
      !payload.lastName ||
      !payload.phoneNumber ||
      payload.countryId == null
    ) {
      throw new Error(
        "Invalid payload: 'email', 'firstName', 'lastName', 'phoneNumber', and 'countryId' are required fields.",
      );
    }

    return this.client.request<ApiResponse<CustomerRecord>>(
      "POST",
      "/api/customer-service/external/v1/create",
      payload,
      options,
    );
  }

  /**
   * Updates an existing customer record
   * PUT /api/customer-service/external/v1/customer-update
   */
  public async updateCustomer(
    payload: UpdateCustomerPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<CustomerRecord>> {
    if (!payload || !payload.customerReference) {
      throw new Error(
        "Invalid payload: 'customerReference' is required to update a customer.",
      );
    }

    return this.client.request<ApiResponse<CustomerRecord>>(
      "PUT",
      "/api/customer-service/external/v1/customer-update",
      payload,
      options,
    );
  }

  /**
   * Retrieves a paginated list of customers
   * GET /api/customer-service/external/v1/list
   */
  public async listCustomers(
    params: ListCustomersParams = {},
    options: RequestOptions = {},
  ): Promise<ApiResponse<CustomerRecord[]>> {
    // Merge provided params with default pagination values if omitted
    const queryParams: Record<
      string,
      string | number | boolean | undefined | null
    > = {
      page: 1,
      limit: 10,
      ...params,
    };

    let endpoint = "/api/customer-service/external/v1/list";
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

    return this.client.request<ApiResponse<CustomerRecord[]>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Blacklists or whitelists a customer
   * PUT /api/customer-service/external/v1/black-listed
   */
  public async blacklistCustomer(
    payload: BlacklistCustomerPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<CustomerRecord>> {
    if (
      !payload ||
      !payload.customerReference ||
      typeof payload.isBlackListed !== "boolean"
    ) {
      throw new Error(
        "Invalid payload: 'customerReference' (string) and 'isBlackListed' (boolean) are required fields.",
      );
    }

    return this.client.request<ApiResponse<CustomerRecord>>(
      "PUT",
      "/api/customer-service/external/v1/black-listed",
      payload,
      options,
    );
  }

  /**
   * Retrieves customer details by ID
   * GET /api/customer-service/external/v1/get-customer-by-id
   */
  public async getCustomerById(
    identifier: CustomerIdentifierInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<CustomerRecord>> {
    const rawId =
      typeof identifier === "object" && identifier !== null
        ? (identifier.customerId ??
          identifier.id ??
          identifier.customerReference)
        : identifier;
    const customerId = Number(rawId);

    if (
      rawId == null ||
      rawId === "" ||
      typeof rawId === "boolean" ||
      Number.isNaN(customerId) ||
      !Number.isInteger(customerId)
    ) {
      throw new Error(
        "Invalid parameter: 'customerId' must be a valid integer.",
      );
    }

    const endpoint = `/api/customer-service/external/v1/get-customer-by-id?customerId=${customerId}`;

    return this.client.request<ApiResponse<CustomerRecord>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }
}

export default Customer;
