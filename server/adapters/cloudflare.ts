import type { CoreResponse } from "../core/request";
import { bodyToString, normalizeHeaders, parseBody } from "./common";

export async function toCoreRequest(request: Request) {
  const url = new URL(request.url);
  const rawBody = ["GET", "HEAD"].includes(request.method) ? undefined : await request.text();
  return {
    method: request.method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams.entries()),
    headers: normalizeHeaders(request.headers),
    rawBody,
    body: await parseBody(rawBody, request.headers.get("content-type") || "")
  };
}

export function toCloudflareResponse(coreRes: CoreResponse) {
  return new Response(bodyToString(coreRes), { status: coreRes.status, headers: coreRes.headers });
}
