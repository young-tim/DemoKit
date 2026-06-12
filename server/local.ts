import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { routeCoreRequest } from "./core/router";
import { toCoreRequest, toNodeResponse } from "./adapters/node";

// 本地开发从 .env 注入服务端变量（dev:api 监听 .env 变更后会重启本进程并再次执行）
// loadEnvFile 不覆盖已存在的 process.env，Docker/平台注入优先
if (existsSync(".env")) {
  loadEnvFile(".env");
}

const app = new Hono();
const serveDist = process.env.NODE_ENV === "production" || process.env.SERVE_STATIC === "true";
// 开发模式固定走 API_PORT，避免 .env 中 PORT（Vite 端口）抢占 API 服务
const port = Number(serveDist ? process.env.PORT || 3000 : process.env.API_PORT || 8787);

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
