import { getEnv, getNumberEnv } from "./env";
import type { CoreRequest } from "./request";
import { jsonError } from "./response";

const proxyConfig = {
  services: {
    openai: {
      baseUrlEnv: "OPENAI_BASE_URL",
      apiKeyEnv: "OPENAI_API_KEY",
      authHeader: "Authorization",
      authPrefix: "Bearer"
    },
    custom: {
      baseUrlEnv: "CUSTOM_API_BASE_URL",
      apiKeyEnv: "CUSTOM_API_KEY",
      authHeader: "X-API-Key"
    }
  }
} as const;

type ServiceName = keyof typeof proxyConfig.services;

const blockedHeaders = new Set(["host", "connection", "content-length", "cookie", "set-cookie", "authorization", "x-api-key"]);
const privateHostPattern = /^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.|0\.0\.0\.0)/i;

function parseProxyPath(path: string) {
  const parts = path.replace(/^\/api\/proxy\/?/, "").split("/").filter(Boolean);
  return { service: parts[0] as ServiceName | undefined, targetPath: parts.slice(1).join("/") };
}

function buildHeaders(req: CoreRequest, service: (typeof proxyConfig.services)[ServiceName]) {
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!blockedHeaders.has(key.toLowerCase())) headers[key] = value;
  }

  const apiKey = getEnv(service.apiKeyEnv);
  if (apiKey) {
    headers[service.authHeader] = "authPrefix" in service && service.authPrefix ? `${service.authPrefix} ${apiKey}` : apiKey;
  }
  return headers;
}

export async function handleProxy(req: CoreRequest) {
  const { service, targetPath } = parseProxyPath(req.path);
  if (!service || !(service in proxyConfig.services)) {
    return jsonError("PROXY_SERVICE_NOT_FOUND", "Proxy service is not configured", 404);
  }

  const config = proxyConfig.services[service];
  const baseUrl = getEnv(config.baseUrlEnv);
  if (!baseUrl) {
    return jsonError("PROXY_BASE_URL_MISSING", `${config.baseUrlEnv} is not configured`, 400);
  }

  let target: URL;
  try {
    target = new URL(targetPath, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  } catch {
    return jsonError("PROXY_INVALID_URL", "Proxy target URL is invalid", 400);
  }

  if (!["http:", "https:"].includes(target.protocol) || privateHostPattern.test(target.hostname)) {
    return jsonError("PROXY_TARGET_BLOCKED", "Proxy target is not allowed", 400);
  }

  for (const [key, value] of Object.entries(req.query)) target.searchParams.set(key, value);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), getNumberEnv("PROXY_TIMEOUT", 30000));

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: buildHeaders(req, config),
      body: req.method === "GET" || req.method === "HEAD" ? undefined : req.rawBody || JSON.stringify(req.body ?? {}),
      signal: controller.signal
    });

    const contentType = upstream.headers.get("content-type") || "application/json";
    const body = contentType.includes("application/json") ? await upstream.json().catch(() => null) : await upstream.text();

    return {
      status: upstream.status,
      headers: { "content-type": contentType },
      body
    };
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "AbortError";
    return jsonError(timedOut ? "PROXY_TIMEOUT" : "PROXY_ERROR", timedOut ? "Proxy request timed out" : "Proxy request failed", 502);
  } finally {
    clearTimeout(timer);
  }
}
