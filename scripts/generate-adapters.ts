import fs from "node:fs";
import path from "node:path";
import { apiRoutes, type ApiRoute } from "../server/routes.manifest";

const ROOT = process.cwd();

function banner() {
  return `// AUTO-GENERATED FILE.
// Do not edit manually.
// Run \`pnpm generate:adapters\` to regenerate.

`;
}

function ensureDir(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(filePath: string, content: string) {
  const absolute = path.join(ROOT, filePath);
  ensureDir(absolute);
  fs.writeFileSync(absolute, content.trimStart(), "utf-8");
}

function toRelativeImport(fromFile: string, targetAliasPath: string) {
  const target = targetAliasPath.replace("@/", "");
  const fromDir = path.dirname(fromFile);
  let relative = path.relative(fromDir, target).replaceAll("\\", "/");
  if (!relative.startsWith(".")) relative = `./${relative}`;
  return relative;
}

function getVercelFilePath(routePath: string) {
  if (routePath === "/api/health") return "api/health.ts";
  if (routePath === "/api/access/status") return "api/access/status.ts";
  if (routePath === "/api/access/verify") return "api/access/verify.ts";
  if (routePath.startsWith("/api/mock")) return "api/mock/[...path].ts";
  if (routePath.startsWith("/api/proxy")) return "api/proxy/[...path].ts";
  throw new Error(`Unsupported Vercel route: ${routePath}`);
}

function getNetlifyFilePath(routeName: string) {
  return `netlify/functions/${routeName}.ts`;
}

function getCloudflareFilePath(routePath: string) {
  if (routePath === "/api/health") return "functions/api/health.ts";
  if (routePath === "/api/access/status") return "functions/api/access/status.ts";
  if (routePath === "/api/access/verify") return "functions/api/access/verify.ts";
  if (routePath.startsWith("/api/mock")) return "functions/api/mock/[[path]].ts";
  if (routePath.startsWith("/api/proxy")) return "functions/api/proxy/[[path]].ts";
  throw new Error(`Unsupported Cloudflare route: ${routePath}`);
}

function generateVercel(route: ApiRoute) {
  const filePath = getVercelFilePath(route.path);
  writeFile(filePath, `${banner()}import { ${route.handler} } from "${toRelativeImport(filePath, route.importPath)}";
import { toCoreRequest, sendVercelResponse } from "${toRelativeImport(filePath, "@/server/adapters/vercel")}";

export default async function handler(req: any, res: any) {
  const coreReq = await toCoreRequest(req);
  const coreRes = await ${route.handler}(coreReq);
  return sendVercelResponse(res, coreRes);
}
`);
}

function generateNetlify(route: ApiRoute) {
  const filePath = getNetlifyFilePath(route.name);
  writeFile(filePath, `${banner()}import { ${route.handler} } from "${toRelativeImport(filePath, route.importPath)}";
import { toCoreRequest, toNetlifyResponse } from "${toRelativeImport(filePath, "@/server/adapters/netlify")}";

export async function handler(event: any, context: any) {
  void context;
  const coreReq = await toCoreRequest(event);
  const coreRes = await ${route.handler}(coreReq);
  return toNetlifyResponse(coreRes);
}
`);
}

function generateCloudflare(route: ApiRoute) {
  const filePath = getCloudflareFilePath(route.path);
  writeFile(filePath, `${banner()}import { ${route.handler} } from "${toRelativeImport(filePath, route.importPath)}";
import { toCoreRequest, toCloudflareResponse } from "${toRelativeImport(filePath, "@/server/adapters/cloudflare")}";

export async function onRequest(context: { request: Request }) {
  const coreReq = await toCoreRequest(context.request);
  const coreRes = await ${route.handler}(coreReq);
  return toCloudflareResponse(coreRes);
}
`);
}

function updateNetlifyToml() {
  const filePath = path.join(ROOT, "netlify.toml");
  const start = "# <demokit-api-redirects>";
  const end = "# </demokit-api-redirects>";
  const redirects = `${start}
# This block is auto-generated. Do not edit manually.

[[redirects]]
  from = "/api/health"
  to = "/.netlify/functions/health"
  status = 200

[[redirects]]
  from = "/api/access/status"
  to = "/.netlify/functions/access-status"
  status = 200

[[redirects]]
  from = "/api/access/verify"
  to = "/.netlify/functions/access-verify"
  status = 200

[[redirects]]
  from = "/api/mock/*"
  to = "/.netlify/functions/mock"
  status = 200

[[redirects]]
  from = "/api/proxy/*"
  to = "/.netlify/functions/proxy"
  status = 200

${end}`;
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : "";
  const next = current.includes(start) && current.includes(end)
    ? current.replace(new RegExp(`${start}[\\s\\S]*?${end}`), redirects)
    : `${current.trim()}

${redirects}
`;
  fs.writeFileSync(filePath, next.trimStart(), "utf-8");
}

function generateAdapterMap() {
  const map = Object.fromEntries(apiRoutes.map((route) => [route.path, { vercel: getVercelFilePath(route.path), netlify: getNetlifyFilePath(route.name), cloudflare: getCloudflareFilePath(route.path) }]));
  writeFile("generated/adapter-map.json", JSON.stringify(map, null, 2));
}

for (const route of apiRoutes) {
  generateVercel(route);
  generateNetlify(route);
  generateCloudflare(route);
}
updateNetlifyToml();
generateAdapterMap();
console.log("Generated platform adapters successfully.");
