import { existsSync } from "node:fs";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { routeCoreRequest } from "./core/router";
import { toCoreRequest, toNodeResponse } from "./adapters/node";

const app = new Hono();
const serveDist = process.env.NODE_ENV === "production" || process.env.SERVE_STATIC === "true";
const port = Number(process.env.PORT || (serveDist ? 3000 : process.env.API_PORT || 8787));

app.all("/api/*", async (c) => {
  const coreReq = await toCoreRequest(c);
  const coreRes = await routeCoreRequest(coreReq);
  return toNodeResponse(c, coreRes);
});

if (serveDist && existsSync("dist")) {
  app.use("/*", serveStatic({ root: "./dist" }));
  app.get("*", serveStatic({ path: "./dist/index.html" }));
}

serve({ fetch: app.fetch, port });
console.log(`DemoKit server running at http://localhost:${port}`);
