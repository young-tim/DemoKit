import type { CoreRequest } from "./request";
import { jsonOk } from "./response";

export async function handleHealth(_req: CoreRequest) {
  return jsonOk({ timestamp: Date.now() });
}
