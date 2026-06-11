import { toAppError } from "./errors";

export type DemoFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  timeoutMs?: number;
};

export async function demoFetch<T>(url: string, options: DemoFetchOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 30000);

  try {
    const response = await fetch(url, {
      ...options,
      body: typeof options.body === "string" ? options.body : options.body ? JSON.stringify(options.body) : undefined,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      signal: controller.signal
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json().catch(() => null) : await response.text();

    if (!response.ok || (typeof data === "object" && data && "ok" in data && data.ok === false)) {
      throw (typeof data === "object" && data && "error" in data ? data.error : null) || {
        code: "REQUEST_ERROR",
        message: `Request failed with ${response.status}`
      };
    }

    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw { code: "REQUEST_TIMEOUT", message: "Request timed out" };
    }
    throw toAppError(error);
  } finally {
    window.clearTimeout(timeout);
  }
}
