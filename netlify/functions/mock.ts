// AUTO-GENERATED FILE.
// Do not edit manually.
// Run `pnpm generate:adapters` to regenerate.

import { handleMock } from "../../server/core/mock";
import { toCoreRequest, toNetlifyResponse } from "../../server/adapters/netlify";

export async function handler(event: any, context: any) {
  void context;
  const coreReq = await toCoreRequest(event);
  const coreRes = await handleMock(coreReq);
  return toNetlifyResponse(coreRes);
}
