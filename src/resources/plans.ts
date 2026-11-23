import HttpClient, { type RequestOptions } from "../client.js";
import type { ApiResponse } from "./auth.js";

export type PlanId = number | string;

export interface CreatePlanPayload {
  businessId: number;
  planName: string;
  planDescription: string;
  planAmount: number;
  interval: string;
  maxNoOfPayment: number;
  isSubscriptionPageForThisPlan: boolean;
  [key: string]: unknown;
}

export type PlanComparisonType = "moreThan" | "lessThan" | "equals" | string;

export interface GetPlansParams {
  status?: string;
  interval?: string;
  noOfSubscriptions?: number;
  noOfSubscriptionType?: PlanComparisonType;
  amount?: number;
  amountType?: PlanComparisonType;
  revenueAmount?: number;
  revenueType?: PlanComparisonType;
  searchPlanText?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  [key: string]: string | number | boolean | undefined | null;
}

export interface PlanIdentifierObject {
  planId?: PlanId;
  id?: PlanId;
  [key: string]: unknown;
}

export type PlanIdentifierInput = PlanId | PlanIdentifierObject;

export interface UpdatePlanDetailsPayload {
  planId: number;
  planName: string;
  planDescription: string;
  planAmount: number;
  interval: string;
  maxNoOfPayment: number;
  [key: string]: unknown;
}

export interface DeletePlanPayload {
  planId: number;
  status: string;
  [key: string]: unknown;
}

export interface ListTransactionPlansParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface CreateTransactionPlanPayload {
  [key: string]: unknown;
}

export interface PlanRecord {
  id?: PlanId;
  planId?: PlanId;
  businessId?: number;
  planName?: string;
  planDescription?: string;
  planAmount?: number;
  interval?: string;
  maxNoOfPayment?: number;
  isSubscriptionPageForThisPlan?: boolean;
  status?: string;
  [key: string]: unknown;
}

export class Plans {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Creates a new payment plan.
   * POST /api/payment-service/external/v1/plans/create-plan
   */
  public async createPlan(
    payload: CreatePlanPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<PlanRecord>> {
    if (
      !payload ||
      payload.businessId === undefined ||
      payload.businessId === null ||
      !payload.planName ||
      !payload.planDescription ||
      payload.planAmount === undefined ||
      payload.planAmount === null ||
      !payload.interval ||
      payload.maxNoOfPayment === undefined ||
      payload.maxNoOfPayment === null ||
      payload.isSubscriptionPageForThisPlan === undefined ||
      payload.isSubscriptionPageForThisPlan === null
    ) {
      throw new Error(
        "Invalid payload: 'businessId', 'planName', 'planDescription', 'planAmount', 'interval', 'maxNoOfPayment', and 'isSubscriptionPageForThisPlan' are required.",
      );
    }

    const requestPayload: CreatePlanPayload = {
      businessId: payload.businessId,
      planName: payload.planName,
      planDescription: payload.planDescription,
      planAmount: payload.planAmount,
      interval: payload.interval,
      maxNoOfPayment: payload.maxNoOfPayment,
      isSubscriptionPageForThisPlan: payload.isSubscriptionPageForThisPlan,
    };

    return this.client.request<ApiResponse<PlanRecord>>(
      "POST",
      "/api/payment-service/external/v1/plans/create-plan",
      requestPayload,
      options,
    );
  }

  /**
   * Retrieves a paginated list of payment plans with optional filters.
   * GET /api/payment-service/external/v1/plans/get-plans
   */
  public async getPlans(
    params: GetPlansParams = {},
    options: RequestOptions = {},
  ): Promise<ApiResponse<PlanRecord[]>> {
    let endpoint = "/api/payment-service/external/v1/plans/get-plans";

    if (
      params &&
      typeof params === "object" &&
      Object.keys(params).length > 0
    ) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }

    return this.client.request<ApiResponse<PlanRecord[]>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Retrieves detailed information for a specific payment plan.
   * GET /api/payment-service/external/v1/plans/get-plan-details
   */
  public async getPlanDetails(
    identifier: PlanIdentifierInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<PlanRecord>> {
    let planId: PlanId | undefined;

    if (identifier !== null && typeof identifier === "object") {
      planId =
        identifier.planId !== undefined ? identifier.planId : identifier.id;
    } else {
      planId = identifier;
    }

    if (planId === undefined || planId === null || planId === "") {
      throw new Error(
        "Invalid parameter: 'planId' is required to retrieve plan details.",
      );
    }

    const endpoint = `/api/payment-service/external/v1/plans/get-plan-details?planId=${encodeURIComponent(String(planId))}`;

    return this.client.request<ApiResponse<PlanRecord>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Updates details for an existing payment plan.
   * PUT /api/payment-service/external/v1/plans/update-plan-details
   */
  public async updatePlanDetails(
    payload: UpdatePlanDetailsPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<PlanRecord>> {
    if (
      !payload ||
      payload.planId === undefined ||
      payload.planId === null ||
      !payload.planName ||
      !payload.planDescription ||
      payload.planAmount === undefined ||
      payload.planAmount === null ||
      !payload.interval ||
      payload.maxNoOfPayment === undefined ||
      payload.maxNoOfPayment === null
    ) {
      throw new Error(
        "Invalid payload: 'planId', 'planName', 'planDescription', 'planAmount', 'interval', and 'maxNoOfPayment' are required.",
      );
    }

    const requestPayload: UpdatePlanDetailsPayload = {
      planId: payload.planId,
      planName: payload.planName,
      planDescription: payload.planDescription,
      planAmount: payload.planAmount,
      interval: payload.interval,
      maxNoOfPayment: payload.maxNoOfPayment,
    };

    return this.client.request<ApiResponse<PlanRecord>>(
      "PUT",
      "/api/payment-service/external/v1/plans/update-plan-details",
      requestPayload,
      options,
    );
  }

  /**
   * Deletes or updates the status of an existing payment plan.
   * POST /api/payment-service/external/v1/plans/delete-plan
   */
  public async deletePlan(
    payload: DeletePlanPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<PlanRecord>> {
    if (
      !payload ||
      payload.planId === undefined ||
      payload.planId === null ||
      !payload.status
    ) {
      throw new Error("Invalid payload: 'planId' and 'status' are required.");
    }

    const requestPayload: DeletePlanPayload = {
      planId: payload.planId,
      status: payload.status,
    };

    return this.client.request<ApiResponse<PlanRecord>>(
      "POST",
      "/api/payment-service/external/v1/plans/delete-plan",
      requestPayload,
      options,
    );
  }

  /**
   * Retrieves a list of payment plans via the transaction service.
   * GET /api/transaction-service/external/v1/plans
   */
  public async listPlansTransactionService(
    params: ListTransactionPlansParams = {},
    options: RequestOptions = {},
  ): Promise<ApiResponse<PlanRecord[]>> {
    let endpoint = "/api/transaction-service/external/v1/plans";

    if (
      params &&
      typeof params === "object" &&
      Object.keys(params).length > 0
    ) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }

    return this.client.request<ApiResponse<PlanRecord[]>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Creates a new payment plan via the transaction service.
   * POST /api/transaction-service/external/v1/plans
   */
  public async createPlanTransactionService(
    payload: CreateTransactionPlanPayload = {},
    options: RequestOptions = {},
  ): Promise<ApiResponse<PlanRecord>> {
    return this.client.request<ApiResponse<PlanRecord>>(
      "POST",
      "/api/transaction-service/external/v1/plans",
      payload,
      options,
    );
  }
}

export default Plans;
