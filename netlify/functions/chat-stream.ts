// AUTO-GENERATED FILE.
// Do not edit manually.
// Run `pnpm generate:adapters` to regenerate.

import { handleChatStream } from "../../server/core/chat";
import { toCoreRequest, toNetlifyResponse } from "../../server/adapters/netlify";

export async function handler(event: any, context: any) {
  void context;
  const coreReq = await toCoreRequest(event);
  const coreRes = await handleChatStream(coreReq);
  return toNetlifyResponse(coreRes);
}
