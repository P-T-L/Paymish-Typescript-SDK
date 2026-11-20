const SENSITIVE_KEYS = [
  "secret_key",
  "public_key",
  "token",
  "authorization",
  "password",
  "api_key",
] as const;

/**
 * Deeply sanitizes an object or string, redacting sensitive fields
 */
export function sanitize<T>(data: T): T {
  if (!data) {
    return data;
  }

  if (typeof data === "string") {
    // Redact JWT tokens or long secret key strings if present directly
    const redacted = data.replace(
      /(sk_[a-zA-Z0-9_]+|eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/g,
      "[REDACTED]",
    );
    return redacted as unknown as T;
  }

  if (typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitize(item)) as unknown as T;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const isSensitive = SENSITIVE_KEYS.some((sensitiveKey) =>
      key.toLowerCase().includes(sensitiveKey),
    );

    if (isSensitive && typeof value === "string") {
      // Keep first 4 characters for debugging, redact the rest
      sanitized[key] =
        value.length > 8 ? `${value.slice(0, 4)}***[REDACTED]` : "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
