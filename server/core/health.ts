import type { CoreRequest } from "./request";
import { jsonOk } from "./response";
import { getRuntime } from "./env";

export async function handleHealth(_req: CoreRequest) {
  return jsonOk({ runtime: getRuntime(), timestamp: Date.now() });
}
