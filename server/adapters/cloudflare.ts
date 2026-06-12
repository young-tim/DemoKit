import type { CoreResponse } from "../core/request";
import { bodyToString, isReadableStream, normalizeHeaders, parseBody } from "./common";

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

export async function toCloudflareResponse(coreRes: CoreResponse) {
  const body = isReadableStream(coreRes.body) ? coreRes.body : await bodyToString(coreRes);
  return new Response(body, { status: coreRes.status, headers: coreRes.headers });
}
