import { randomUUID } from "node:crypto";
import { PaymishError } from "./errors.js";

export type HttpMethod =
  "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | (string & {});

export interface RequestOptions {
  headers?: Record<string, string>;
  idempotencyKey?: string;
  customTimeout?: number;
  [key: string]: unknown;
}

export interface HttpClientOptions {
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface ApiResponsePayload {
  status?: string;
  message?: string;
  data?: unknown;
  errors?: unknown;
  [key: string]: unknown;
}

export class HttpClient {
  public readonly baseUrl: string;
  public readonly timeout: number;
  public readonly maxRetries: number;
  public readonly retryDelayMs: number;

  constructor(options: HttpClientOptions = {}) {
    const rawBaseUrl = options.baseUrl || "https://api.paymish.com";
    this.baseUrl = this._validateAndNormalizeBaseUrl(rawBaseUrl);
    this.timeout = options.timeout || 10000; // Default timeout: 10 seconds
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelayMs = options.retryDelayMs ?? 500;
  }

  /**
   * Validates and normalizes the provided baseUrl to prevent SSRF and protocol misuse
   */
  private _validateAndNormalizeBaseUrl(urlString: string): string {
    if (typeof urlString !== "string" || !urlString.trim()) {
      throw new Error("Invalid baseUrl: Base URL must be a non-empty string");
    }

    try {
      const parsedUrl = new URL(urlString);

      // Enforce HTTP/HTTPS protocols (blocks file://, ftp://, gopher://, etc.)
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error(
          `Invalid baseUrl protocol "${parsedUrl.protocol}". Only "http:" and "https:" are allowed.`,
        );
      }

      // Ensure hostname is present
      if (!parsedUrl.hostname) {
        throw new Error("Invalid baseUrl: Missing hostname.");
      }

      // Return clean base URL without trailing slash
      return urlString.replace(/\/+$/, "");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("protocol") || message.includes("hostname")) {
        throw error;
      }

      throw new Error(
        `Invalid baseUrl provided: "${urlString}". Must be a valid URL.`,
        {
          cause: error,
        },
      );
    }
  }

  /**
   * Helper method to delay execution for exponential backoff
   */
  private _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Helper method for all outbound requests
   */
  public async request<T = ApiResponsePayload>(
    method: HttpMethod,
    endpoint: string,
    body: unknown = null,
    options: RequestOptions | Record<string, string> = {},
    customTimeout: number | null = null,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Handle case where positional parameter 'options' is passed purely as a headers object
    const optionsObj = (options || {}) as RequestOptions;
    const isPlainHeadersObj =
      !optionsObj.idempotencyKey &&
      !optionsObj.headers &&
      !optionsObj.customTimeout;

    const rawHeaders: Record<string, unknown> = isPlainHeadersObj
      ? { ...(optionsObj as Record<string, unknown>) }
      : { ...(optionsObj.headers || {}) };

    const requestHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(rawHeaders)) {
      if (typeof value === "string") {
        requestHeaders[key] = value;
      }
    }

    const timeoutMs = customTimeout || optionsObj.customTimeout || this.timeout;

    // Resolve Idempotency Key (Explicit option > Explicit header > Auto-generated for POST/PUT/PATCH)
    const explicitIdempotencyKey =
      optionsObj.idempotencyKey ||
      requestHeaders["Idempotency-Key"] ||
      requestHeaders["idempotency-key"];
    const isStateChanging = ["POST", "PUT", "PATCH"].includes(
      method.toUpperCase(),
    );
    const idempotencyKey =
      explicitIdempotencyKey ||
      (isStateChanging ? `sdk_auto_${randomUUID()}` : null);

    // Check if the body is a FormData instance (for multipart file uploads)
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;

    // Prepare Base Headers (omit Content-Type for FormData)
    const finalHeaders: Record<string, string> = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...requestHeaders,
    };

    if (idempotencyKey) {
      finalHeaders["Idempotency-Key"] = idempotencyKey;
    }

    let attempt = 0;

    while (attempt <= this.maxRetries) {
      attempt++;

      const config: RequestInit = {
        method,
        headers: finalHeaders,
        signal: AbortSignal.timeout(timeoutMs),
      };

      if (body !== null && body !== undefined) {
        config.body = isFormData ? (body as BodyInit) : JSON.stringify(body);
      }

      try {
        const response = await fetch(url, config);
        const contentType = response.headers?.get?.("content-type") || "";
        const isJson = contentType.includes("application/json");

        let data: ApiResponsePayload;

        if (isJson) {
          data = (await response.json()) as ApiResponsePayload;
        } else {
          // Fallback for non-JSON content (HTML/plain text error pages from WAF or proxies)
          const rawText = await response.text();

          // Check if non-JSON response is a retryable 5xx error
          if (response.status >= 500 && attempt <= this.maxRetries) {
            const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
            await this._sleep(delay);
            continue;
          }

          throw new PaymishError(
            `HTML or Non-JSON response received from server (${response.status} ${response.statusText})`,
            response.status,
            { rawResponseBody: rawText.slice(0, 500) },
            body,
          );
        }

        // Check if application JSON response is a 5xx error that can be retried
        if (response.status >= 500 && attempt <= this.maxRetries) {
          const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
          await this._sleep(delay);
          continue;
        }

        // Handle standard client 4xx errors or other unhandled errors
        if (!response.ok || data.status === "error") {
          throw new PaymishError(
            typeof data.message === "string"
              ? data.message
              : "An error occurred during the request",
            response.status,
            data.errors ?? null,
            body,
          );
        }

        return data as T;
      } catch (error) {
        const err = error as { name?: string };
        const isTimeout =
          err?.name === "TimeoutError" || err?.name === "AbortError";

        // Retry network timeouts if attempts remaining
        if (isTimeout && attempt <= this.maxRetries) {
          const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
          await this._sleep(delay);
          continue;
        }

        if (isTimeout) {
          throw new PaymishError(
            `Request timed out after ${timeoutMs} ms`,
            408,
            { timeout: true },
            body,
          );
        }

        throw error; // Re-throw if already a PaymishError or non-retryable error
      }
    }

    throw new PaymishError(
      `Request failed after ${this.maxRetries + 1} attempts`,
      500,
      null,
      body,
    );
  }
}

export default HttpClient;
