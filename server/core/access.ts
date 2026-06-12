import { createHash } from "node:crypto";
import type { CoreRequest } from "./request";
import { jsonError, jsonOk } from "./response";
import { getNumberEnv } from "./env";

/** 密码指纹，用于前端检测服务端密码是否已变更 */
function getCredentialKey(password: string) {
  return createHash("sha256").update(password).digest("hex").slice(0, 16);
}

export async function handleAccessStatus(_req: CoreRequest) {
  const password = process.env.DEMO_ACCESS_PASSWORD || "";
  const enabled = Boolean(password);

  return jsonOk({
    enabled,
    expiresInHours: getNumberEnv("DEMO_ACCESS_EXPIRES_HOURS", 24),
    ...(enabled ? { credentialKey: getCredentialKey(password) } : {})
  });
}

export async function handleAccessVerify(req: CoreRequest) {
  const expected = process.env.DEMO_ACCESS_PASSWORD;
  const password = typeof req.body === "object" && req.body && "password" in req.body ? String((req.body as { password?: unknown }).password || "") : "";

  if (!expected || password === expected) {
    return jsonOk({
      expiresInHours: getNumberEnv("DEMO_ACCESS_EXPIRES_HOURS", 24),
      ...(expected ? { credentialKey: getCredentialKey(expected) } : {})
    });
  }

  return jsonError("INVALID_ACCESS_PASSWORD", "Invalid access password", 401);
}
