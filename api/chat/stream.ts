// AUTO-GENERATED FILE.
// Do not edit manually.
// Run `pnpm generate:adapters` to regenerate.

import { handleChatStream } from "../../server/core/chat";
import { toCoreRequest, sendVercelResponse } from "../../server/adapters/vercel";

export default async function handler(req: any, res: any) {
  const coreReq = await toCoreRequest(req);
  const coreRes = await handleChatStream(coreReq);
  return sendVercelResponse(res, coreRes);
}
