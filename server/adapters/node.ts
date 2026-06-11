import type { Context } from "hono";
import type { CoreResponse } from "../core/request";
import { normalizeHeaders, parseBody } from "./common";

export async function toCoreRequest(c: Context) {
  const url = new URL(c.req.url);
  const rawBody = ["GET", "HEAD"].includes(c.req.method) ? undefined : await c.req.text();
  return {
    method: c.req.method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams.entries()),
    headers: normalizeHeaders(c.req.raw.headers),
    rawBody,
    body: await parseBody(rawBody, c.req.header("content-type") || "")
  };
}

export function toNodeResponse(c: Context, coreRes: CoreResponse) {
  return c.body(typeof coreRes.body === "string" ? coreRes.body : JSON.stringify(coreRes.body), coreRes.status as any, coreRes.headers);
}
