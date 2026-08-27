const RAW_API_URL = import.meta.env["VITE_API_URL"] || "http://localhost:4000/api";

// VITE_API_URL must be an absolute URL (with scheme). If someone sets it to
// a bare host like "api.cloud.coralz.de5.net" (no https://), fetch() treats
// it as a relative path against the frontend's own origin instead of the
// API host, and requests silently go to the wrong place. Catch that early
// with a loud console error instead of letting every request fail with a
// generic "Something went wrong".
if (!/^https?:\/\//i.test(RAW_API_URL)) {
  // eslint-disable-next-line no-console
  console.error(
    `[api/client] VITE_API_URL is missing a scheme: "${RAW_API_URL}". ` +
      `It must start with http:// or https://, e.g. "https://api.cloud.coralz.de5.net/api". ` +
      `Falling back to https:// — fix the env var to silence this.`
  );
}

const API_URL = /^https?:\/\//i.test(RAW_API_URL) ? RAW_API_URL : `https://${RAW_API_URL}`;

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
    // Assigned conditionally: the project builds with
    // exactOptionalPropertyTypes, under which writing `undefined` into an
    // optional property is a type error.
    if (code !== undefined) this.code = code;
    if (fields !== undefined) this.fields = fields;
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
  let response: Response;
  try {
    // Built as a RequestInit and only given headers/body when there is a
    // body, instead of passing explicit `undefined` (rejected under
    // exactOptionalPropertyTypes).
    const init: RequestInit = {
      method: options.method || "GET",
      credentials: "include",
    };
    if (options.body !== undefined) {
      init.headers = { "Content-Type": "application/json" };
      init.body = JSON.stringify(options.body);
    }
    response = await fetch(`${API_URL}${path}`, init);
  } catch (err) {
    // fetch() throws a generic TypeError ("Failed to fetch" / "Load failed")
    // for network-level failures: DNS errors, the API being down, or a CORS
    // rejection (e.g. backend sending Access-Control-Allow-Origin: * while
    // credentials: "include" is set, which browsers reject outright). These
    // never reach response.ok below, so without this they'd surface to the
    // user as a bare "Something went wrong" with the real cause invisible.
    console.error(`[api/client] Network/CORS failure calling ${API_URL}${path}:`, err);
    throw new ApiError(
      "Could not reach the server. This is usually a network or CORS problem — check the console for details.",
      { status: 0, code: "NETWORK_ERROR" }
    );
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message = data?.error?.message || "Something went wrong. Please try again.";
    console.error(`[api/client] ${options.method || "GET"} ${path} -> ${response.status}`, data);
    throw new ApiError(message, {
      status: response.status,
      code: data?.error?.code,
      fields: data?.error?.fields,
    });
  }

  return data as T;
}

async function del<T>(path: string): Promise<T> {
  const init: RequestInit = { method: "DELETE", credentials: "include" };
  const response = await fetch(`${API_URL}${path}`, init);
  if (!response.ok) {
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json().catch(() => null) : null;
    throw new ApiError(data?.error?.message || "Something went wrong.", { status: response.status });
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  del: <T>(path: string) => del<T>(path),
  upload: <T>(path: string, formData: FormData) => upload<T>(path, formData),
};

async function upload<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;
  if (!response.ok) {
    throw new ApiError(data?.error?.message || "Upload failed.", { status: response.status });
  }
  return data as T;
}