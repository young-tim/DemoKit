import type { CoreRequest } from "./request";
import { jsonError } from "./response";
import { handleAccessStatus, handleAccessVerify } from "./access";
import { handleChatStream } from "./chat";
import { handleHealth } from "./health";
import { handleMock } from "./mock";
import { handleProxy } from "./proxy";

export async function routeCoreRequest(req: CoreRequest) {
  if (req.path === "/api/health" && req.method === "GET") return handleHealth(req);
  if (req.path.startsWith("/api/mock") && req.method === "GET") return handleMock(req);
  if (req.path === "/api/chat/stream" && req.method === "POST") return handleChatStream(req);
  if (req.path.startsWith("/api/proxy") && ["GET", "POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return handleProxy(req);
  if (req.path === "/api/access/status" && req.method === "GET") return handleAccessStatus(req);
  if (req.path === "/api/access/verify" && req.method === "POST") return handleAccessVerify(req);
  return jsonError("API_NOT_FOUND", "API route not found", 404, { path: req.path, method: req.method });
}
