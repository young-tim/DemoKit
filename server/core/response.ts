import type { CoreResponse } from "./request";

export function jsonOk(data: unknown, status = 200): CoreResponse {
  return {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: { ok: true, data }
  };
}

export function jsonError(code: string, message: string, status = 500, detail?: unknown): CoreResponse {
  return {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: { ok: false, error: { code, message, detail } }
  };
}

export function textResponse(text: string, status = 200): CoreResponse {
  return { status, headers: { "content-type": "text/plain; charset=utf-8" }, body: text };
}

export function streamResponse(stream: ReadableStream<Uint8Array>, status = 200): CoreResponse {
  return {
    status,
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive"
    },
    body: stream
  };
}
