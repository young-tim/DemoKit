import type { CoreRequest } from "./request";
import { jsonError, jsonOk } from "./response";
import { getNumberEnv } from "./env";

export async function handleAccessStatus(_req: CoreRequest) {
  return jsonOk({ enabled: Boolean(process.env.DEMO_ACCESS_PASSWORD), expiresInHours: getNumberEnv("DEMO_ACCESS_EXPIRES_HOURS", 24) });
}

export async function handleAccessVerify(req: CoreRequest) {
  const expected = process.env.DEMO_ACCESS_PASSWORD;
  const password = typeof req.body === "object" && req.body && "password" in req.body ? String((req.body as { password?: unknown }).password || "") : "";

  if (!expected || password === expected) {
    return jsonOk({ expiresInHours: getNumberEnv("DEMO_ACCESS_EXPIRES_HOURS", 24) });
  }

  return jsonError("INVALID_ACCESS_PASSWORD", "Invalid access password", 401);
}
