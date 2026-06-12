import type { CoreResponse } from "../core/request";
import { bodyToString, normalizeHeaders, parseBody } from "./common";

export async function toCoreRequest(req: any) {
  const url = new URL(req.url || "/", `https://${req.headers.host || "localhost"}`);
  const rawBody = typeof req.body === "string" ? req.body : req.body ? JSON.stringify(req.body) : undefined;
  return {
    method: req.method || "GET",
    path: url.pathname,
    query: Object.fromEntries(url.searchParams.entries()),
    headers: normalizeHeaders(req.headers || {}),
    rawBody,
    body: typeof req.body === "object" ? req.body : await parseBody(rawBody, req.headers?.["content-type"] || "")
  };
}

export async function sendVercelResponse(res: any, coreRes: CoreResponse) {
  for (const [key, value] of Object.entries(coreRes.headers || {})) res.setHeader(key, value);
  return res.status(coreRes.status).send(await bodyToString(coreRes));
}
