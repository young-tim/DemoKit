import type { CoreResponse } from "../core/request";
import { bodyToString, normalizeHeaders, parseBody } from "./common";

export async function toCoreRequest(event: any) {
  const url = new URL(event.rawUrl || event.url || event.path || "/", "https://netlify.local");
  const rawBody = event.isBase64Encoded && event.body ? Buffer.from(event.body, "base64").toString("utf-8") : event.body;
  return {
    method: event.httpMethod || event.method || "GET",
    path: url.pathname.startsWith("/.netlify/functions") ? event.headers?.["x-forwarded-path"] || url.pathname : url.pathname,
    query: Object.fromEntries(url.searchParams.entries()),
    headers: normalizeHeaders(event.headers || {}),
    rawBody,
    body: await parseBody(rawBody, event.headers?.["content-type"] || event.headers?.["Content-Type"] || "")
  };
}

export function toNetlifyResponse(coreRes: CoreResponse) {
  return { statusCode: coreRes.status, headers: coreRes.headers || {}, body: bodyToString(coreRes) };
}
