// AUTO-GENERATED FILE.
// Do not edit manually.
// Run `pnpm generate:adapters` to regenerate.

import { handleHealth } from "../../server/core/health";
import { toCoreRequest, toCloudflareResponse } from "../../server/adapters/cloudflare";

export async function onRequest(context: { request: Request }) {
  const coreReq = await toCoreRequest(context.request);
  const coreRes = await handleHealth(coreReq);
  return toCloudflareResponse(coreRes);
}
