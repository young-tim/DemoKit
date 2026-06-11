import type { CoreResponse } from "../core/request";

export function normalizeHeaders(headers: Headers | Record<string, string | string[] | undefined>) {
  const result: Record<string, string> = {};
  if (headers instanceof Headers) {
    headers.forEach((value, key) => { result[key] = value; });
    return result;
  }
  for (const [key, value] of Object.entries(headers || {})) {
    if (Array.isArray(value)) result[key] = value.join(", ");
    else if (value !== undefined) result[key] = String(value);
  }
  return result;
}

export async function parseBody(rawBody?: string, contentType = "") {
  if (!rawBody) return undefined;
  if (contentType.includes("application/json")) return JSON.parse(rawBody);
  return rawBody;
}

export function bodyToString(coreRes: CoreResponse) {
  return typeof coreRes.body === "string" ? coreRes.body : JSON.stringify(coreRes.body);
}
