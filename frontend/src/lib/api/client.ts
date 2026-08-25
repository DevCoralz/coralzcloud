const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export class ApiError extends Error {
  status: number;
  code?: string;
  fields?: Record<string, string>;

  constructor(
    message: string,
    { status, code, fields }: { status: number; code?: string; fields?: Record<string, string> }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

/**
 * Minimal fetch wrapper for the Coralz Cloud backend. Sends cookies
 * (`credentials: "include"`) so session-based auth works across
 * requests, and normalizes error responses into ApiError so callers
 * can read per-field validation messages without re-parsing the
 * response shape every time.
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    credentials: "include",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message = data?.error?.message || "Something went wrong. Please try again.";
    throw new ApiError(message, {
      status: response.status,
      code: data?.error?.code,
      fields: data?.error?.fields,
    });
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
};
