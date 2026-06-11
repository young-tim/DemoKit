import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { CoreRequest } from "./request";
import { jsonError, jsonOk } from "./response";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SAFE_NAME = /^[a-z0-9-]+$/i;

function getMockName(reqPath: string) {
  return reqPath.replace(/^\/api\/mock\/?/, "").split("/")[0] || "result";
}

export async function handleMock(req: CoreRequest) {
  const name = getMockName(req.path);
  if (!SAFE_NAME.test(name)) {
    return jsonError("MOCK_NOT_FOUND", "Mock file not found", 404);
  }

  try {
    const file = await readFile(path.join(ROOT, "mock", `${name}.json`), "utf-8");
    return jsonOk(JSON.parse(file));
  } catch {
    return jsonError("MOCK_NOT_FOUND", "Mock file not found", 404, { name });
  }
}
