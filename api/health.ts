// AUTO-GENERATED FILE.
// Do not edit manually.
// Run `pnpm generate:adapters` to regenerate.

import { handleHealth } from "../server/core/health";
import { toCoreRequest, sendVercelResponse } from "../server/adapters/vercel";

export default async function handler(req: any, res: any) {
  const coreReq = await toCoreRequest(req);
  const coreRes = await handleHealth(coreReq);
  return sendVercelResponse(res, coreRes);
}
