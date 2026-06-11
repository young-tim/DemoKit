// AUTO-GENERATED FILE.
// Do not edit manually.
// Run `pnpm generate:adapters` to regenerate.

import { handleProxy } from "../../server/core/proxy";
import { toCoreRequest, toNetlifyResponse } from "../../server/adapters/netlify";

export async function handler(event: any, context: any) {
  void context;
  const coreReq = await toCoreRequest(event);
  const coreRes = await handleProxy(coreReq);
  return toNetlifyResponse(coreRes);
}
