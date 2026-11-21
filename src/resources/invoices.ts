import HttpClient, { type RequestOptions } from "../client.js";
import type { ApiResponse } from "./auth.js";

export interface CreateInvoicePayload {
  customerEmail: string;
  amount: number;
  note?: string;
  sendImmediately?: boolean;
  [key: string]: unknown;
}

export interface ListInvoicesParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface InvoiceIdentifierObject {
  invoiceId?: string | number;
  id?: string | number;
  [key: string]: unknown;
}

export type InvoiceIdentifierInput = string | number | InvoiceIdentifierObject;

export interface InvoiceRecord {
  id?: string | number;
  invoiceId?: string | number;
  customerEmail?: string;
  amount?: number;
  note?: string;
  status?: string;
  sendImmediately?: boolean;
  [key: string]: unknown;
}

export class Invoices {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Creates an invoice
   * POST /api/payment-service/external/v1/invoices
   */
  public async createInvoice(
    payload: CreateInvoicePayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<InvoiceRecord>> {
    if (
      !payload ||
      !payload.customerEmail ||
      payload.amount === undefined ||
      payload.amount === null
    ) {
      throw new Error(
        "Invalid payload: 'customerEmail' and 'amount' are required to create an invoice.",
      );
    }

    return this.client.request<ApiResponse<InvoiceRecord>>(
      "POST",
      "/api/payment-service/external/v1/invoices",
      payload,
      options,
    );
  }

  /**
   * Retrieves a paginated list of invoices with optional filters.
   * GET /api/payment-service/external/v1/invoices
   */
  public async listInvoices(
    params: ListInvoicesParams = {},
    options: RequestOptions = {},
  ): Promise<ApiResponse<InvoiceRecord[]>> {
    const queryParams = new URLSearchParams();

    if (params.status !== undefined && params.status !== null) {
      queryParams.append("status", String(params.status));
    }
    if (params.startDate !== undefined && params.startDate !== null) {
      queryParams.append("startDate", String(params.startDate));
    }
    if (params.endDate !== undefined && params.endDate !== null) {
      queryParams.append("endDate", String(params.endDate));
    }
    if (params.search !== undefined && params.search !== null) {
      queryParams.append("search", String(params.search));
    }
    if (params.page !== undefined && params.page !== null) {
      queryParams.append("page", String(params.page));
    }
    if (params.limit !== undefined && params.limit !== null) {
      queryParams.append("limit", String(params.limit));
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/api/payment-service/external/v1/invoices?${queryString}`
      : "/api/payment-service/external/v1/invoices";

    return this.client.request<ApiResponse<InvoiceRecord[]>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Retrieves a single invoice by its ID.
   * GET /api/payment-service/external/v1/invoices/{id}
   */
  public async getInvoiceById(
    invoiceId: InvoiceIdentifierInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<InvoiceRecord>> {
    const id =
      typeof invoiceId === "object" && invoiceId !== null
        ? (invoiceId.invoiceId ?? invoiceId.id)
        : invoiceId;

    if (!id && id !== 0) {
      throw new Error(
        "Invalid parameter: 'invoiceId' is required to retrieve invoice details.",
      );
    }

    return this.client.request<ApiResponse<InvoiceRecord>>(
      "GET",
      `/api/payment-service/external/v1/invoices/${id}`,
      null,
      options,
    );
  }
}

export default Invoices;
