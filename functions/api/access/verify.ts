// AUTO-GENERATED FILE.
// Do not edit manually.
// Run `pnpm generate:adapters` to regenerate.

import { handleAccessVerify } from "../../../server/core/access";
import { toCoreRequest, toCloudflareResponse } from "../../../server/adapters/cloudflare";

export async function onRequest(context: { request: Request }) {
  const coreReq = await toCoreRequest(context.request);
  const coreRes = await handleAccessVerify(coreReq);
  return toCloudflareResponse(coreRes);
}
