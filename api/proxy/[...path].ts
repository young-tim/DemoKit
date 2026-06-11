// AUTO-GENERATED FILE.
// Do not edit manually.
// Run `pnpm generate:adapters` to regenerate.

import { handleProxy } from "../../server/core/proxy";
import { toCoreRequest, sendVercelResponse } from "../../server/adapters/vercel";

export default async function handler(req: any, res: any) {
  const coreReq = await toCoreRequest(req);
  const coreRes = await handleProxy(coreReq);
  return sendVercelResponse(res, coreRes);
}
