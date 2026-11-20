import HttpClient, { type RequestOptions } from "../client.js";

export interface AuthCredentials {
  public_key: string;
  secret_key: string;
}

export interface GenerateTokenData {
  token?: string;
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  status: "success" | "error" | (string & {});
  message?: string;
  data?: T;
  errors?: unknown;
  [key: string]: unknown;
}

export class Auth {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Generates an authentication token using public and secret keys
   * POST /api/user-service/external/v1/generate-token
   */
  public async generateToken(
    credentials: AuthCredentials,
    options: RequestOptions = {},
  ): Promise<ApiResponse<GenerateTokenData>> {
    if (!credentials || !credentials.public_key || !credentials.secret_key) {
      throw new Error(
        "Both public_key and secret_key are required to generate a token.",
      );
    }

    return this.client.request<ApiResponse<GenerateTokenData>>(
      "POST",
      "/api/user-service/external/v1/generate-token",
      {
        public_key: credentials.public_key,
        secret_key: credentials.secret_key,
      },
      options,
    );
  }
}

export default Auth;
