import HttpClient, { type RequestOptions } from "../client.js";
import type { ApiResponse } from "./auth.js";

export interface BankItem {
  name?: string;
  code?: string;
  slug?: string;
  active?: boolean;
  country?: string;
  currency?: string;
  [key: string]: unknown;
}

export interface ResolveAccountParams {
  account_number: string;
  bank_code: string;
}

export interface ResolvedAccountData {
  account_number?: string;
  account_name?: string;
  bank_code?: string;
  bank_id?: number | string;
  [key: string]: unknown;
}

export class Banks {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Retrieves the list of banks supported by Paymish.
   * GET /api/transaction-service/external/v1/bank
   */
  public async list(
    options: RequestOptions = {},
  ): Promise<ApiResponse<BankItem[]>> {
    return this.client.request<ApiResponse<BankItem[]>>(
      "GET",
      "/api/transaction-service/external/v1/bank",
      null,
      options,
    );
  }

  /**
   * Confirms that an account number exists at a bank and returns the account details.
   * GET /api/transaction-service/external/v1/bank/resolve
   */
  public async resolveAccount(
    params: ResolveAccountParams,
    options: RequestOptions = {},
  ): Promise<ApiResponse<ResolvedAccountData>> {
    if (!params || !params.account_number || !params.bank_code) {
      throw new Error(
        "Invalid parameters: Both 'account_number' and 'bank_code' are required to resolve an account.",
      );
    }

    const queryParams = new URLSearchParams({
      account_number: params.account_number,
      bank_code: params.bank_code,
    }).toString();

    return this.client.request<ApiResponse<ResolvedAccountData>>(
      "GET",
      `/api/transaction-service/external/v1/bank/resolve?${queryParams}`,
      null,
      options,
    );
  }
}

export default Banks;
