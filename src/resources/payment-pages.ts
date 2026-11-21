import HttpClient, { type RequestOptions } from "../client.js";
import type { ApiResponse } from "./auth.js";

export type PaymentPageId = number | string;

export interface CheckCustomLinkExistsPayload {
  customLink: string;
  [key: string]: unknown;
}

export interface CreatePaymentPageObjectPayload {
  businessId: number;
  pageName: string;
  [key: string]: unknown;
}

export type CreatePaymentPageInput = FormData | CreatePaymentPageObjectPayload;

export interface GetPaymentPagesParams {
  status?: string;
  searchPageText?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaymentPageIdObject {
  pageId?: PaymentPageId;
  id?: PaymentPageId;
  [key: string]: unknown;
}

export type PaymentPageDetailsInput = PaymentPageId | PaymentPageIdObject;

export interface GetAssociatedProductsObjectParams extends PaymentPageIdObject {
  searchProduct?: string;
}

export type GetAssociatedProductsInput =
  PaymentPageId | GetAssociatedProductsObjectParams;

export interface UpdatePaymentPageObjectPayload extends PaymentPageIdObject {
  pageName?: string;
  [key: string]: unknown;
}

export type UpdatePaymentPageInput = FormData | UpdatePaymentPageObjectPayload;

export interface UpdatePageStatusPayload {
  pageId: PaymentPageId;
  status: string;
  [key: string]: unknown;
}

export interface DeletePagePayload {
  pageId: PaymentPageId;
  isDeleted: boolean;
  [key: string]: unknown;
}

export interface AddProductToPaymentPagePayload extends PaymentPageIdObject {
  productIds: string | Array<number | string>;
}

export type DeleteProductFromPaymentPageInput =
  | PaymentPageId
  | {
      paymentPageProductId?: PaymentPageId;
      id?: PaymentPageId;
      [key: string]: unknown;
    };

export interface InitiateCheckoutDvaPayload {
  accessCode?: string;
  access_code?: string;
  amount: number;
  email?: string;
  pageReference?: string;
  page_reference?: string;
  transferSelectedAt?: number;
  [key: string]: unknown;
}

export interface CreateTransactionPaymentPagePayload {
  [key: string]: unknown;
}

export interface PaymentPageRecord {
  id?: PaymentPageId;
  pageId?: PaymentPageId;
  businessId?: number;
  pageName?: string;
  customLink?: string;
  status?: string;
  isDeleted?: boolean;
  [key: string]: unknown;
}

export interface PaymentPageProductRecord {
  id?: PaymentPageId;
  paymentPageProductId?: PaymentPageId;
  pageId?: PaymentPageId;
  productId?: PaymentPageId;
  [key: string]: unknown;
}

export interface CheckoutDvaData {
  accessCode?: string;
  amount?: number;
  account_number?: string;
  account_name?: string;
  bank_name?: string;
  pageReference?: string;
  [key: string]: unknown;
}

export class PaymentPages {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Check if a custom payment page link exists.
   * POST /api/payment-service/external/v1/payment-pages/custom-link-check-exist
   */
  public async checkCustomLinkExists(
    payload: CheckCustomLinkExistsPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<Record<string, unknown>>> {
    if (!payload || !payload.customLink) {
      throw new Error(
        "Invalid payload: 'customLink' is required to check if a custom link exists.",
      );
    }

    return this.client.request<ApiResponse<Record<string, unknown>>>(
      "POST",
      "/api/payment-service/external/v1/payment-pages/custom-link-check-exist",
      payload,
      options,
    );
  }

  /**
   * Creates a new payment page.
   * POST /api/payment-service/external/v1/payment-pages/create-pages
   */
  public async createPaymentPage(
    payload: CreatePaymentPageInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<PaymentPageRecord>> {
    let requestBody: FormData | CreatePaymentPageObjectPayload = payload;

    if (!(payload instanceof FormData)) {
      if (
        !payload ||
        payload.businessId === undefined ||
        payload.businessId === null ||
        !payload.pageName
      ) {
        throw new Error(
          "Invalid payload: 'businessId' and 'pageName' are required to create a payment page.",
        );
      }

      const formData = new FormData();
      for (const [key, value] of Object.entries(payload)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(`${key}[]`, String(item)));
          } else {
            formData.append(key, value as string | Blob);
          }
        }
      }

      requestBody = formData;
    }

    return this.client.request<ApiResponse<PaymentPageRecord>>(
      "POST",
      "/api/payment-service/external/v1/payment-pages/create-pages",
      requestBody,
      options,
    );
  }

  /**
   * Retrieves a paginated list of payment pages with optional filters.
   * GET /api/payment-service/external/v1/payment-pages/get-pages
   */
  public async getPaymentPages(
    params: GetPaymentPagesParams = {},
    options: RequestOptions = {},
  ): Promise<ApiResponse<PaymentPageRecord[]>> {
    const queryParams = new URLSearchParams();

    if (params.status !== undefined && params.status !== null) {
      queryParams.append("status", String(params.status));
    }
    if (params.searchPageText !== undefined && params.searchPageText !== null) {
      queryParams.append("searchPageText", String(params.searchPageText));
    }
    if (params.startDate !== undefined && params.startDate !== null) {
      queryParams.append("startDate", String(params.startDate));
    }
    if (params.endDate !== undefined && params.endDate !== null) {
      queryParams.append("endDate", String(params.endDate));
    }
    if (params.page !== undefined && params.page !== null) {
      queryParams.append("page", String(params.page));
    }
    if (params.limit !== undefined && params.limit !== null) {
      queryParams.append("limit", String(params.limit));
    }
    if (params.sort !== undefined && params.sort !== null) {
      queryParams.append("sort", String(params.sort));
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/api/payment-service/external/v1/payment-pages/get-pages?${queryString}`
      : "/api/payment-service/external/v1/payment-pages/get-pages";

    return this.client.request<ApiResponse<PaymentPageRecord[]>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Retrieves details of a specific payment page by its ID.
   * GET /api/payment-service/external/v1/payment-pages/get-page-details
   */
  public async getPageDetails(
    params: PaymentPageDetailsInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<PaymentPageRecord>> {
    const pageId =
      typeof params === "object" && params !== null
        ? (params.pageId ?? params.id)
        : params;

    if (pageId === undefined || pageId === null || pageId === "") {
      throw new Error(
        "Invalid parameter: 'pageId' is required to retrieve payment page details.",
      );
    }

    const queryParams = new URLSearchParams();
    queryParams.append("pageId", String(pageId));

    const endpoint = `/api/payment-service/external/v1/payment-pages/get-page-details?${queryParams.toString()}`;

    return this.client.request<ApiResponse<PaymentPageRecord>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Updates the details of an existing payment page.
   * PUT /api/payment-service/external/v1/payment-pages/update-page-details
   */
  public async updatePaymentPage(
    payload: UpdatePaymentPageInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<PaymentPageRecord>> {
    let requestBody: FormData | UpdatePaymentPageObjectPayload = payload;

    if (!(payload instanceof FormData)) {
      const pageId =
        payload && (payload.pageId !== undefined ? payload.pageId : payload.id);

      if (pageId === undefined || pageId === null || pageId === "") {
        throw new Error(
          "Invalid payload: 'pageId' is required to update payment page details.",
        );
      }

      const formData = new FormData();
      for (const [key, value] of Object.entries(payload)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(`${key}[]`, String(item)));
          } else {
            formData.append(key, value as string | Blob);
          }
        }
      }

      requestBody = formData;
    }

    return this.client.request<ApiResponse<PaymentPageRecord>>(
      "PUT",
      "/api/payment-service/external/v1/payment-pages/update-page-details",
      requestBody,
      options,
    );
  }

  /**
   * Updates the status of a specific payment page.
   * PUT /api/payment-service/external/v1/payment-pages/update-page-status
   */
  public async updatePageStatus(
    payload: UpdatePageStatusPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<PaymentPageRecord>> {
    if (
      !payload ||
      payload.pageId === undefined ||
      payload.pageId === null ||
      payload.pageId === "" ||
      !payload.status
    ) {
      throw new Error(
        "Invalid payload: 'pageId' and 'status' are required to update payment page status.",
      );
    }

    return this.client.request<ApiResponse<PaymentPageRecord>>(
      "PUT",
      "/api/payment-service/external/v1/payment-pages/update-page-status",
      payload,
      options,
    );
  }

  /**
   * Deletes (or marks as deleted) a payment page.
   * POST /api/payment-service/external/v1/payment-pages/delete-page
   */
  public async deletePage(
    payload: DeletePagePayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<PaymentPageRecord>> {
    if (
      !payload ||
      payload.pageId === undefined ||
      payload.pageId === null ||
      payload.pageId === "" ||
      payload.isDeleted === undefined ||
      payload.isDeleted === null
    ) {
      throw new Error(
        "Invalid payload: 'pageId' and 'isDeleted' are required to delete a payment page.",
      );
    }

    return this.client.request<ApiResponse<PaymentPageRecord>>(
      "POST",
      "/api/payment-service/external/v1/payment-pages/delete-page",
      payload,
      options,
    );
  }

  /**
   * Retrieves products associated with a payment page.
   * GET /api/payment-service/external/v1/payment-pages/payment-page-get-product
   */
  public async getAssociatedProducts(
    params: GetAssociatedProductsInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<PaymentPageProductRecord[]>> {
    const pageId =
      typeof params === "object" && params !== null
        ? params.pageId !== undefined
          ? params.pageId
          : params.id
        : params;

    if (pageId === undefined || pageId === null || pageId === "") {
      throw new Error(
        "Invalid parameter: 'pageId' is required to retrieve products associated with a payment page.",
      );
    }

    const searchProduct =
      typeof params === "object" && params !== null
        ? params.searchProduct
        : undefined;

    const queryParams = new URLSearchParams();
    queryParams.append("pageId", String(pageId));
    if (
      searchProduct !== undefined &&
      searchProduct !== null &&
      searchProduct !== ""
    ) {
      queryParams.append("searchProduct", String(searchProduct));
    }

    const endpoint = `/api/payment-service/external/v1/payment-pages/payment-page-get-product?${queryParams.toString()}`;

    return this.client.request<ApiResponse<PaymentPageProductRecord[]>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Adds products to a payment page.
   * POST /api/payment-service/external/v1/payment-pages/payment-page-add-product
   */
  public async addProductToPaymentPage(
    payload: AddProductToPaymentPagePayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<PaymentPageProductRecord>> {
    const pageId =
      payload && (payload.pageId !== undefined ? payload.pageId : payload.id);
    const rawProductIds = payload && payload.productIds;

    if (
      !payload ||
      pageId === undefined ||
      pageId === null ||
      pageId === "" ||
      !rawProductIds
    ) {
      throw new Error(
        "Invalid payload: 'pageId' and 'productIds' are required to add products to a payment page.",
      );
    }

    const productIds = Array.isArray(rawProductIds)
      ? rawProductIds.join(",")
      : rawProductIds;

    const requestPayload = {
      pageId,
      productIds: String(productIds),
    };

    return this.client.request<ApiResponse<PaymentPageProductRecord>>(
      "POST",
      "/api/payment-service/external/v1/payment-pages/payment-page-add-product",
      requestPayload,
      options,
    );
  }

  /**
   * Deletes a product from a payment page.
   * POST /api/payment-service/external/v1/payment-pages/payment-page-delete-product
   */
  public async deleteProductFromPaymentPage(
    payload: DeleteProductFromPaymentPageInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<PaymentPageProductRecord>> {
    const paymentPageProductId =
      typeof payload === "object" && payload !== null
        ? payload.paymentPageProductId !== undefined
          ? payload.paymentPageProductId
          : payload.id
        : payload;

    if (
      paymentPageProductId === undefined ||
      paymentPageProductId === null ||
      paymentPageProductId === ""
    ) {
      throw new Error(
        "Invalid payload: 'paymentPageProductId' is required to delete a product from a payment page.",
      );
    }

    const requestPayload = {
      paymentPageProductId,
    };

    return this.client.request<ApiResponse<PaymentPageProductRecord>>(
      "POST",
      "/api/payment-service/external/v1/payment-pages/payment-page-delete-product",
      requestPayload,
      options,
    );
  }

  /**
   * Initiates a dynamic virtual account for a payment page checkout session.
   * POST /api/payment-service/external/v1/payment-pages/initiate-initialize-checkout-dynamic-virtual-account
   */
  public async initiateCheckoutDynamicVirtualAccount(
    payload: InitiateCheckoutDvaPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<CheckoutDvaData>> {
    const accessCode = payload && (payload.accessCode ?? payload.access_code);
    const amount = payload && payload.amount;

    if (
      !payload ||
      !accessCode ||
      amount === undefined ||
      amount === null ||
      typeof amount !== "number"
    ) {
      throw new Error(
        "Invalid payload: 'accessCode' and numeric 'amount' are required to initiate a dynamic virtual account.",
      );
    }

    const pageReference = payload.pageReference ?? payload.page_reference;

    const requestPayload = {
      accessCode,
      amount,
      ...(payload.email && { email: payload.email }),
      ...(pageReference && { pageReference }),
      ...(payload.transferSelectedAt !== undefined && {
        transferSelectedAt: payload.transferSelectedAt,
      }),
    };

    return this.client.request<ApiResponse<CheckoutDvaData>>(
      "POST",
      "/api/payment-service/external/v1/payment-pages/initiate-initialize-checkout-dynamic-virtual-account",
      requestPayload,
      options,
    );
  }

  /**
   * Retrieves a list of payment pages via the transaction service.
   * GET /api/transaction-service/external/v1/payment-pages
   */
  public async listPaymentPages(
    options: RequestOptions = {},
  ): Promise<ApiResponse<PaymentPageRecord[]>> {
    return this.client.request<ApiResponse<PaymentPageRecord[]>>(
      "GET",
      "/api/transaction-service/external/v1/payment-pages",
      null,
      options,
    );
  }

  /**
   * Creates a payment page via the transaction service.
   * POST /api/transaction-service/external/v1/payment-pages
   */
  public async createPaymentPageTransactionService(
    payload: CreateTransactionPaymentPagePayload = {},
    options: RequestOptions = {},
  ): Promise<ApiResponse<PaymentPageRecord>> {
    return this.client.request<ApiResponse<PaymentPageRecord>>(
      "POST",
      "/api/transaction-service/external/v1/payment-pages",
      payload,
      options,
    );
  }
}

export default PaymentPages;
