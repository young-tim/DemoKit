# DemoKit 技术方案文档

## 一、文档信息

---

## 二、技术目标

DemoKit 的技术目标不是构建一个复杂的生产级应用框架，而是沉淀一个稳定、轻量、可复制的 Demo 工程模板。它需要让用户在每次做新 Demo 时，不再重复搭建前端项目、配置 UI 框架、处理 API 代理、管理环境变量、准备 Mock 数据、配置 Docker、配置 Vercel、配置 Netlify、配置 Cloudflare。

第一版技术目标包括：前端页面可快速改造，UI 组件开箱可用，API 代理逻辑统一，Mock 数据可直接返回，访问密码可通过环境变量启停，本地运行和线上部署行为一致，多平台部署目录清晰，并且平台差异不会污染核心 API 逻辑。

DemoKit 的核心设计原则是：

```Plain Text
前端负责演示体验；
后端负责轻量代理；
核心 API 逻辑只写一份；
API 路由只声明一份；
多平台适配代码自动生成；
所有平台统一暴露 /api/* 路径。
```

---

## 三、整体技术架构

DemoKit 采用轻量全栈架构，前端基于 Vite \+ React \+ TypeScript，UI 基于 shadcn/ui \+ Tailwind CSS，服务端核心逻辑基于统一的 `server/core` 模块实现。不同部署平台的 Serverless 入口文件不手写，而是由 `scripts/generate-adapters.ts` 根据 `server/routes.manifest.ts` 自动生成。

整体架构如下：

```Plain Text
Browser
  ↓
Vite React App
  ├─ Home Page
  ├─ Tool Demo Page
  ├─ Chat Demo Page
  ├─ Workflow Demo Page
  └─ API Debug Page
  ↓
Frontend Core
  ├─ shadcn/ui
  ├─ Tailwind CSS
  ├─ Demo Components
  ├─ Request Client
  ├─ AccessGate
  └─ Result Viewer
  ↓
Unified API Path
  └─ /api/*
      ├─ /api/health
      ├─ /api/mock/*
      ├─ /api/proxy/*
      └─ /api/access/*
  ↓
Generated Platform Entry
  ├─ api/*                       # Vercel Functions，自动生成
  ├─ netlify/functions/*         # Netlify Functions，自动生成
  └─ functions/api/*             # Cloudflare Pages Functions，自动生成
  ↓
Platform Adapters
  ├─ server/adapters/vercel.ts
  ├─ server/adapters/netlify.ts
  ├─ server/adapters/cloudflare.ts
  └─ server/adapters/node.ts
  ↓
Server Core
  ├─ health
  ├─ mock
  ├─ proxy
  ├─ access
  ├─ env
  ├─ request
  └─ response
```

架构重点是将“核心 API 能力”“API 路由声明”“平台适配入口”分离。`server/core` 负责实现真实业务逻辑；`server/routes.manifest.ts` 负责声明有哪些 API；`scripts/generate-adapters.ts` 负责生成 Vercel、Netlify、Cloudflare 对应的入口文件。平台目录只作为自动生成产物存在，不作为人工维护的核心代码。

---

## 四、技术选型

---

## 五、核心架构原则

## 5\.1 一套核心 API 逻辑

所有 API 能力只在 `server/core` 中实现一次，包括：

```Plain Text
health
mock
proxy
access
env
request
response
```

错误方式是给每个平台分别写一套 API 逻辑：

```Plain Text
api/proxy/[...path].ts 写一套代理逻辑
netlify/functions/proxy.ts 再写一套代理逻辑
functions/api/proxy/[[path]].ts 再写一套代理逻辑
```

正确方式是：

```Plain Text
server/core/proxy.ts 实现代理逻辑
api/proxy/[...path].ts 调用 core/proxy
netlify/functions/proxy.ts 调用 core/proxy
functions/api/proxy/[[path]].ts 调用 core/proxy
```

并且这些平台入口文件由生成器自动生成。

---

## 5\.2 一套路由声明

API 路由不应该散落在 Vercel、Netlify、Cloudflare 目录中，而应该统一声明在：

```Plain Text
server/routes.manifest.ts
```

新增、删除、修改 API 时，只改这一份路由清单，然后执行：

```Bash
pnpm generate:adapters
```

生成器会自动更新：

```Plain Text
api/*
netlify/functions/*
functions/api/*
netlify.toml redirects
adapter-map.json
```

---

## 5\.3 多平台薄适配

不同部署平台的请求对象、响应对象、路由约定不同，所以需要适配层。但适配层只负责格式转换，不负责业务判断。

适配层职责是：

```Plain Text
接收当前平台的请求对象；
解析 method、path、query、headers、body；
转换成统一 CoreRequest；
调用 server/core 对应 handler；
将 CoreResponse 转换成当前平台响应格式。
```

适配层不允许写访问密码校验、API 代理、Mock 数据读取等业务逻辑。

---

## 5\.4 统一 API 访问路径

不管部署在哪个平台，前端始终只调用：

```Plain Text
/api/health
/api/mock/*
/api/proxy/*
/api/access/*
```

前端不感知当前运行环境是本地、Docker、Vercel、Netlify 还是 Cloudflare。平台差异必须在构建配置、重定向配置、函数目录和平台适配器中处理。

---

## 5\.5 访问密码只做轻量保护

访问密码不是用户系统，不做账号、不做登录态服务端存储、不做 RBAC、不做用户权限。

访问密码只满足 Demo 级保护：

```Plain Text
如果 DEMO_ACCESS_PASSWORD 为空，则页面公开访问；
如果 DEMO_ACCESS_PASSWORD 有值，则访问页面前需要输入密码；
密码校验通过后，前端保存本地访问状态；
访问状态过期或清除后，需要重新输入密码。
```

密码必须只存在于服务端环境变量中，不允许暴露到前端构建产物。

---

## 六、推荐项目目录

```Plain Text
demokit-template/
  ├─ src/
  │   ├─ app/
  │   │   ├─ App.tsx
  │   │   ├─ routes.tsx
  │   │   └─ providers.tsx
  │   │
  │   ├─ pages/
  │   │   ├─ HomePage.tsx
  │   │   ├─ ToolDemoPage.tsx
  │   │   ├─ ChatDemoPage.tsx
  │   │   ├─ WorkflowDemoPage.tsx
  │   │   └─ ApiDebugPage.tsx
  │   │
  │   ├─ components/
  │   │   ├─ ui/
  │   │   └─ demo/
  │   │       ├─ AccessGate.tsx
  │   │       ├─ AccessPasswordForm.tsx
  │   │       ├─ DemoShell.tsx
  │   │       ├─ PromptInput.tsx
  │   │       ├─ ResultPanel.tsx
  │   │       ├─ JsonViewer.tsx
  │   │       ├─ MarkdownViewer.tsx
  │   │       ├─ LogPanel.tsx
  │   │       └─ StepRunner.tsx
  │   │
  │   ├─ config/
  │   │   ├─ app.config.ts
  │   │   ├─ demo.config.ts
  │   │   └─ api.config.ts
  │   │
  │   ├─ hooks/
  │   │   ├─ useDemoRequest.ts
  │   │   └─ useDemoTask.ts
  │   │
  │   ├─ lib/
  │   │   ├─ request.ts
  │   │   ├─ env.ts
  │   │   ├─ errors.ts
  │   │   └─ utils.ts
  │   │
  │   └─ styles/
  │       └─ globals.css
  │
  ├─ server/
  │   ├─ core/
  │   │   ├─ health.ts
  │   │   ├─ mock.ts
  │   │   ├─ proxy.ts
  │   │   ├─ access.ts
  │   │   ├─ env.ts
  │   │   ├─ request.ts
  │   │   └─ response.ts
  │   │
  │   ├─ adapters/
  │   │   ├─ node.ts
  │   │   ├─ vercel.ts
  │   │   ├─ netlify.ts
  │   │   └─ cloudflare.ts
  │   │
  │   ├─ routes.manifest.ts
  │   └─ local.ts
  │
  ├─ scripts/
  │   ├─ generate-adapters.ts
  │   ├─ clean-generated.ts
  │   └─ check-env.ts
  │
  ├─ generated/
  │   └─ adapter-map.json
  │
  ├─ api/
  │   ├─ health.ts
  │   ├─ proxy/
  │   │   └─ [...path].ts
  │   ├─ mock/
  │   │   └─ [...path].ts
  │   └─ access/
  │       ├─ status.ts
  │       └─ verify.ts
  │
  ├─ netlify/
  │   └─ functions/
  │       ├─ health.ts
  │       ├─ proxy.ts
  │       ├─ mock.ts
  │       ├─ access-status.ts
  │       └─ access-verify.ts
  │
  ├─ functions/
  │   └─ api/
  │       ├─ health.ts
  │       ├─ proxy/
  │       │   └─ [[path]].ts
  │       ├─ mock/
  │       │   └─ [[path]].ts
  │       └─ access/
  │           ├─ status.ts
  │           └─ verify.ts
  │
  ├─ mock/
  │   ├─ chat.json
  │   ├─ workflow.json
  │   ├─ products.json
  │   └─ result.json
  │
  ├─ public/
  │   ├─ logo.svg
  │   └─ favicon.ico
  │
  ├─ Dockerfile
  ├─ docker-compose.yml
  ├─ vercel.json
  ├─ netlify.toml
  ├─ wrangler.toml
  ├─ .env.example
  ├─ package.json
  ├─ vite.config.ts
  ├─ tsconfig.json
  ├─ tailwind.config.ts
  ├─ components.json
  └─ README.md
```

其中：

```Plain Text
server/core/*                 人工维护，核心 API 逻辑
server/adapters/*             人工维护，平台请求转换
server/routes.manifest.ts     人工维护，API 路由声明
scripts/generate-adapters.ts  人工维护，平台适配层生成器

api/*                         自动生成，Vercel 入口
netlify/functions/*           自动生成，Netlify 入口
functions/api/*               自动生成，Cloudflare 入口
generated/adapter-map.json    自动生成，路由映射文件
```

---

## 七、核心模块设计

## 7\.1 前端应用层

前端应用层负责 Demo 页面展示和交互。所有页面基于 React \+ TypeScript 实现，使用 React Router 管理页面路由，使用 shadcn/ui \+ Tailwind CSS 构建界面。

前端页面包括：

```Plain Text
/
  首页 Demo Gallery

/tool
  工具型 Demo 页面

/chat
  对话型 Demo 页面

/workflow
  流程型 Demo 页面

/api-debug
  API 调试页面
```

前端不直接访问第三方 API，不直接使用私密 API Key。所有第三方 API 请求都通过 `/api/proxy/*` 转发。

---

## 7\.2 UI 组件层

UI 组件分为两类。

第一类是 shadcn/ui 基础组件，放在：

```Plain Text
src/components/ui/
```

例如：

```Plain Text
button
input
textarea
card
tabs
dialog
badge
alert
select
toast
skeleton
table
scroll-area
```

第二类是 DemoKit 自定义业务组件，放在：

```Plain Text
src/components/demo/
```

例如：

```Plain Text
DemoShell
AccessGate
AccessPasswordForm
PromptInput
ResultPanel
JsonViewer
MarkdownViewer
LogPanel
StepRunner
```

`DemoShell` 是所有 Demo 页面的通用容器，用于统一标题、说明、输入区、操作区、结果区和日志区。这样每个新 Demo 可以复用一致的页面结构。

---

## 7\.3 请求封装层

请求封装放在：

```Plain Text
src/lib/request.ts
```

核心目标是统一前端请求行为，减少每个页面重复处理 loading、error、JSON 解析和异常判断。

推荐封装：

```TypeScript
export async function demoFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.ok === false) {
    throw data?.error || {
      code: "REQUEST_ERROR",
      message: "Request failed",
    };
  }

  return data;
}
```

前端页面不直接使用原始 `fetch`，而是统一使用 `demoFetch`。

---

## 7\.4 请求状态 Hook

请求状态 Hook 放在：

```Plain Text
src/hooks/useDemoRequest.ts
```

职责是统一处理 Demo 常见状态：

```Plain Text
idle
loading
success
error
```

推荐接口：

```TypeScript
export function useDemoRequest<TInput, TOutput>(
  requestFn: (input: TInput) => Promise<TOutput>
) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TOutput | null>(null);
  const [error, setError] = useState<any>(null);

  async function run(input: TInput) {
    setLoading(true);
    setError(null);

    try {
      const result = await requestFn(input);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setLoading(false);
    setData(null);
    setError(null);
  }

  return { run, loading, data, error, reset };
}
```

后续可以扩展 `useStreamRequest` 支持 AI 流式输出，但第一版不强制。

---

## 7\.5 访问控制模块

访问控制前端组件：

```Plain Text
src/components/demo/AccessGate.tsx
src/components/demo/AccessPasswordForm.tsx
```

访问控制服务端逻辑：

```Plain Text
server/core/access.ts
```

访问控制接口：

```Plain Text
GET /api/access/status
POST /api/access/verify
```

前端流程：

```Plain Text
App 外层包裹 AccessGate；
AccessGate 首次加载时请求 /api/access/status；
如果 enabled=false，直接渲染子组件；
如果 enabled=true，检查 localStorage 是否存在有效授权状态；
如果本地授权有效，渲染子组件；
如果本地授权无效，展示 AccessPasswordForm；
用户输入密码后请求 /api/access/verify；
校验成功后写入 localStorage；
页面展示正式内容。
```

本地存储字段：

```Plain Text
demokit_access_state
```

推荐存储值：

```JSON
{
  "granted": true,
  "expiresAt": 1234567890
}
```

服务端校验逻辑：

```Plain Text
读取 DEMO_ACCESS_PASSWORD；
如果未配置，则 status 返回 enabled=false；
如果已配置，则 status 返回 enabled=true；
verify 时比较用户输入密码和环境变量；
成功返回 ok=true 和 expiresInHours；
失败返回 INVALID_ACCESS_PASSWORD。
```

---

## 7\.6 API 核心服务层

API 核心服务层放在：

```Plain Text
server/core/
```

该目录只处理纯业务逻辑，不绑定任何部署平台。

核心文件职责：

统一内部请求结构建议：

```TypeScript
export interface CoreRequest {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body?: unknown;
  rawBody?: string;
}
```

统一内部响应结构建议：

```TypeScript
export interface CoreResponse {
  status: number;
  headers?: Record<string, string>;
  body: unknown;
}
```

所有核心 handler 都返回 `CoreResponse`。

---

## 7\.7 平台适配层

平台适配层放在：

```Plain Text
server/adapters/
```

不同平台适配器负责把平台请求格式转换成 `CoreRequest`，再把 `CoreResponse` 转回平台响应格式。

适配器包括：

适配层不允许写业务逻辑。例如不能在 `vercel.ts` 里判断访问密码，也不能在 `netlify.ts` 里写 API 代理逻辑。这些逻辑必须放在 `server/core` 中。

---

## 八、平台适配层生成器

## 8\.1 设计目的

为了避免手动维护 Vercel、Netlify、Cloudflare 三套函数入口，DemoKit 引入平台适配层生成器。

该生成器命名为：

```Plain Text
Platform Adapter Generator
```

中文名称：

```Plain Text
平台适配层生成器
```

它的职责是：

```Plain Text
读取统一 API 路由清单；
自动生成 Vercel Functions 入口；
自动生成 Netlify Functions 入口；
自动生成 Cloudflare Pages Functions 入口；
自动生成 Netlify redirects；
自动生成 adapter-map.json；
确保所有平台暴露一致的 /api/* 路径；
避免手写重复适配代码。
```

---

## 8\.2 人工维护与自动生成边界

人工维护：

```Plain Text
server/core/*
server/adapters/*
server/routes.manifest.ts
scripts/generate-adapters.ts
```

自动生成：

```Plain Text
api/*
netlify/functions/*
functions/api/*
generated/adapter-map.json
netlify.toml 中的 API redirects 区块
```

自动生成文件必须在文件头部添加提示：

```TypeScript
// AUTO-GENERATED FILE.
// Do not edit manually.
// Run `pnpm generate:adapters` to regenerate.
```

---

## 8\.3 API 路由清单

API 路由统一声明在：

```Plain Text
server/routes.manifest.ts
```

示例：

```TypeScript
export type ApiRoute = {
  name: string;
  path: string;
  handler: string;
  importPath: string;
  methods?: string[];
};

export const apiRoutes: ApiRoute[] = [
  {
    name: "health",
    path: "/api/health",
    handler: "handleHealth",
    importPath: "@/server/core/health",
    methods: ["GET"],
  },
  {
    name: "mock",
    path: "/api/mock/:path*",
    handler: "handleMock",
    importPath: "@/server/core/mock",
    methods: ["GET"],
  },
  {
    name: "proxy",
    path: "/api/proxy/:path*",
    handler: "handleProxy",
    importPath: "@/server/core/proxy",
    methods: ["GET", "POST"],
  },
  {
    name: "access-status",
    path: "/api/access/status",
    handler: "handleAccessStatus",
    importPath: "@/server/core/access",
    methods: ["GET"],
  },
  {
    name: "access-verify",
    path: "/api/access/verify",
    handler: "handleAccessVerify",
    importPath: "@/server/core/access",
    methods: ["POST"],
  },
];
```

---

## 8\.4 路由到平台文件的映射规则

---

## 8\.5 生成后的 Vercel 入口示例

生成文件：

```Plain Text
api/health.ts
```

内容示例：

```TypeScript
// AUTO-GENERATED FILE.
// Do not edit manually.
// Run `pnpm generate:adapters` to regenerate.

import { handleHealth } from "../server/core/health";
import { toCoreRequest, sendVercelResponse } from "../server/adapters/vercel";

export default async function handler(req, res) {
  const coreReq = await toCoreRequest(req);
  const coreRes = await handleHealth(coreReq);
  return sendVercelResponse(res, coreRes);
}
```

---

## 8\.6 生成后的 Netlify 入口示例

生成文件：

```Plain Text
netlify/functions/health.ts
```

内容示例：

```TypeScript
// AUTO-GENERATED FILE.
// Do not edit manually.
// Run `pnpm generate:adapters` to regenerate.

import { handleHealth } from "../../server/core/health";
import { toCoreRequest, toNetlifyResponse } from "../../server/adapters/netlify";

export async function handler(event, context) {
  const coreReq = await toCoreRequest(event, context);
  const coreRes = await handleHealth(coreReq);
  return toNetlifyResponse(coreRes);
}
```

---

## 8\.7 生成后的 Cloudflare 入口示例

生成文件：

```Plain Text
functions/api/health.ts
```

内容示例：

```TypeScript
// AUTO-GENERATED FILE.
// Do not edit manually.
// Run `pnpm generate:adapters` to regenerate.

import { handleHealth } from "../../server/core/health";
import { toCoreRequest, toCloudflareResponse } from "../../server/adapters/cloudflare";

export async function onRequest(context) {
  const coreReq = await toCoreRequest(context.request, context);
  const coreRes = await handleHealth(coreReq);
  return toCloudflareResponse(coreRes);
}
```

---

## 8\.8 生成器代码雏形

生成器文件：

```Plain Text
scripts/generate-adapters.ts
```

代码雏形：

```TypeScript
import fs from "node:fs";
import path from "node:path";
import { apiRoutes } from "../server/routes.manifest";

const ROOT = process.cwd();

function ensureDir(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(filePath: string, content: string) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, content.trimStart(), "utf-8");
}

function banner() {
  return `// AUTO-GENERATED FILE.
// Do not edit manually.
// Run \`pnpm generate:adapters\` to regenerate.

`;
}

function toRelativeImport(fromFile: string, targetAliasPath: string) {
  const target = targetAliasPath.replace("@/", "");
  const fromDir = path.dirname(fromFile);
  let relative = path.relative(fromDir, target).replaceAll("\\", "/");

  if (!relative.startsWith(".")) {
    relative = `./${relative}`;
  }

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

function generateVercel(route: any) {
  const filePath = getVercelFilePath(route.path);
  const handlerImport = toRelativeImport(filePath, route.importPath);
  const adapterImport = toRelativeImport(filePath, "@/server/adapters/vercel");

  const content = `${banner()}import { ${route.handler} } from "${handlerImport}";
import { toCoreRequest, sendVercelResponse } from "${adapterImport}";

export default async function handler(req, res) {
  const coreReq = await toCoreRequest(req);
  const coreRes = await ${route.handler}(coreReq);
  return sendVercelResponse(res, coreRes);
}
`;

  writeFile(path.join(ROOT, filePath), content);
}

function generateNetlify(route: any) {
  const filePath = getNetlifyFilePath(route.name);
  const handlerImport = toRelativeImport(filePath, route.importPath);
  const adapterImport = toRelativeImport(filePath, "@/server/adapters/netlify");

  const content = `${banner()}import { ${route.handler} } from "${handlerImport}";
import { toCoreRequest, toNetlifyResponse } from "${adapterImport}";

export async function handler(event, context) {
  const coreReq = await toCoreRequest(event, context);
  const coreRes = await ${route.handler}(coreReq);
  return toNetlifyResponse(coreRes);
}
`;

  writeFile(path.join(ROOT, filePath), content);
}

function generateCloudflare(route: any) {
  const filePath = getCloudflareFilePath(route.path);
  const handlerImport = toRelativeImport(filePath, route.importPath);
  const adapterImport = toRelativeImport(filePath, "@/server/adapters/cloudflare");

  const content = `${banner()}import { ${route.handler} } from "${handlerImport}";
import { toCoreRequest, toCloudflareResponse } from "${adapterImport}";

export async function onRequest(context) {
  const coreReq = await toCoreRequest(context.request, context);
  const coreRes = await ${route.handler}(coreReq);
  return toCloudflareResponse(coreRes);
}
`;

  writeFile(path.join(ROOT, filePath), content);
}

function generateAdapterMap() {
  const map = Object.fromEntries(
    apiRoutes.map((route) => [
      route.path,
      {
        vercel: getVercelFilePath(route.path),
        netlify: getNetlifyFilePath(route.name),
        cloudflare: getCloudflareFilePath(route.path),
      },
    ])
  );

  writeFile(
    path.join(ROOT, "generated/adapter-map.json"),
    JSON.stringify(map, null, 2)
  );
}

function main() {
  for (const route of apiRoutes) {
    generateVercel(route);
    generateNetlify(route);
    generateCloudflare(route);
  }

  generateAdapterMap();

  console.log("Generated platform adapters successfully.");
}

main();
```

---

## 8\.9 Netlify redirects 自动生成

Netlify 的 `/api/*` 需要映射到 `/.netlify/functions/*`。生成器可以自动维护 `netlify.toml` 中的 API redirects 区块。

推荐做法是保留人工配置区和自动生成区：

```TOML
[build]
  command = "pnpm build"
  publish = "dist"
  functions = "netlify/functions"

# <demokit-api-redirects>
# This block is auto-generated. Do not edit manually.
# </demokit-api-redirects>

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

生成器更新中间区块：

```TOML
# <demokit-api-redirects>
# This block is auto-generated. Do not edit manually.

[[redirects]]
  from = "/api/health"
  to = "/.netlify/functions/health"
  status = 200

[[redirects]]
  from = "/api/mock/*"
  to = "/.netlify/functions/mock"
  status = 200

[[redirects]]
  from = "/api/proxy/*"
  to = "/.netlify/functions/proxy"
  status = 200

[[redirects]]
  from = "/api/access/status"
  to = "/.netlify/functions/access-status"
  status = 200

[[redirects]]
  from = "/api/access/verify"
  to = "/.netlify/functions/access-verify"
  status = 200

# </demokit-api-redirects>
```

---

## 8\.10 生成目录是否提交 Git

建议提交生成后的平台目录。

原因是 DemoKit 是模板项目，用户 clone 后应该尽量少做额外步骤。提交生成后的 `api/`、`netlify/functions/`、`functions/` 可以让用户直接部署，不需要先理解生成器。

但 README 必须说明：

```Plain Text
api/、netlify/functions/、functions/api/ 是自动生成目录；
不要直接修改这些目录下的文件；
新增或修改 API 时，请修改 server/routes.manifest.ts；
然后执行 pnpm generate:adapters。
```

生成目录的文件头也必须写明：

```TypeScript
// AUTO-GENERATED FILE.
// Do not edit manually.
```

---

## 九、API 设计

## 9\.1 健康检查接口

```Plain Text
GET /api/health
```

返回：

```JSON
{
  "ok": true,
  "timestamp": 1234567890
}
```

核心实现：

```Plain Text
server/core/health.ts
```

---

## 9\.2 Mock 接口

```Plain Text
GET /api/mock/:name
```

示例：

```Plain Text
GET /api/mock/chat
GET /api/mock/products
GET /api/mock/workflow
GET /api/mock/result
```

返回：

```JSON
{
  "ok": true,
  "data": {}
}
```

失败返回：

```JSON
{
  "ok": false,
  "error": {
    "code": "MOCK_NOT_FOUND",
    "message": "Mock file not found"
  }
}
```

Mock 文件目录：

```Plain Text
mock/
  ├─ chat.json
  ├─ workflow.json
  ├─ products.json
  └─ result.json
```

注意：在 Serverless 环境中读取本地文件可能受构建产物路径影响，第一版需要确保 mock 目录被包含到构建产物中。更稳的方案是将 mock JSON 作为 TypeScript 模块导入，或者在构建时复制到函数可访问目录。

---

## 9\.3 API 代理接口

```Plain Text
GET /api/proxy/:service/:path*
POST /api/proxy/:service/:path*
```

示例：

```Plain Text
POST /api/proxy/openai/chat/completions
GET /api/proxy/custom/products
```

代理流程：

```Plain Text
从路径中解析 service 和 path；
根据 service 查找代理配置；
读取 baseUrl、apiKey、authHeader、authPrefix；
拼接目标 URL；
复制必要请求头；
注入认证 Header；
转发请求；
返回目标 API 响应；
如果失败，返回统一错误结构。
```

代理配置：

```TypeScript
export const proxyConfig = {
  services: {
    openai: {
      baseUrlEnv: "OPENAI_BASE_URL",
      apiKeyEnv: "OPENAI_API_KEY",
      authHeader: "Authorization",
      authPrefix: "Bearer",
    },
    custom: {
      baseUrlEnv: "CUSTOM_API_BASE_URL",
      apiKeyEnv: "CUSTOM_API_KEY",
      authHeader: "X-API-Key",
    },
  },
};
```

错误返回：

```JSON
{
  "ok": false,
  "error": {
    "code": "PROXY_ERROR",
    "message": "Proxy request failed"
  }
}
```

安全要求：

```Plain Text
不允许代理 file://、localhost、127.0.0.1、内网地址；
不允许前端直接传任意完整 URL 进行开放代理；
第一版采用 service 白名单机制；
API Key 只能从服务端环境变量读取；
不允许把服务端密钥返回给前端。
```

建议第一版不要做 `/api/proxy?url=xxx` 这种开放代理，避免被滥用。应该使用 `/api/proxy/:service/:path*`，由服务端维护 service 白名单。

---

## 9\.4 访问控制接口

```Plain Text
GET /api/access/status
POST /api/access/verify
```

`GET /api/access/status` 返回：

```JSON
{
  "enabled": true
}
```

`POST /api/access/verify` 请求：

```JSON
{
  "password": "input-password"
}
```

成功返回：

```JSON
{
  "ok": true,
  "expiresInHours": 24
}
```

失败返回：

```JSON
{
  "ok": false,
  "error": {
    "code": "INVALID_ACCESS_PASSWORD",
    "message": "Invalid access password"
  }
}
```

---

## 十、多平台路由映射

## 10\.1 本地 Node / Docker

本地和 Docker 共享 Node 服务入口：

```Plain Text
server/local.ts
```

本地服务需要同时处理：

```Plain Text
静态资源；
SPA fallback；
/api/health；
/api/mock/*；
/api/proxy/*；
/api/access/*。
```

本地开发阶段推荐使用：

```Plain Text
Vite 负责前端开发服务；
Node/Hono 负责 API 服务；
Vite 通过 proxy 将 /api 转发到本地 API 服务。
```

Docker 运行时推荐使用 Node/Hono 同时托管静态资源和 API。

---

## 10\.2 Vercel Functions

Vercel 目录由生成器生成：

```Plain Text
api/
  ├─ health.ts
  ├─ proxy/
  │   └─ [...path].ts
  ├─ mock/
  │   └─ [...path].ts
  └─ access/
      ├─ status.ts
      └─ verify.ts
```

每个文件只做适配，不写业务逻辑。

---

## 10\.3 Netlify Functions

Netlify 目录由生成器生成：

```Plain Text
netlify/functions/
  ├─ health.ts
  ├─ proxy.ts
  ├─ mock.ts
  ├─ access-status.ts
  └─ access-verify.ts
```

通过 `netlify.toml` 将 `/api/*` 转发到对应函数。

示例映射：

```Plain Text
/api/health          → /.netlify/functions/health
/api/mock/*          → /.netlify/functions/mock
/api/proxy/*         → /.netlify/functions/proxy
/api/access/status   → /.netlify/functions/access-status
/api/access/verify   → /.netlify/functions/access-verify
```

---

## 10\.4 Cloudflare Pages Functions

Cloudflare 目录由生成器生成：

```Plain Text
functions/
  └─ api/
      ├─ health.ts
      ├─ proxy/
      │   └─ [[path]].ts
      ├─ mock/
      │   └─ [[path]].ts
      └─ access/
          ├─ status.ts
          └─ verify.ts
```

Cloudflare Pages Functions 使用 `onRequest` 作为入口。

---

## 十一、环境变量设计

`.env.example`：

```Plain Text
# -----------------------------
# 前端公开配置
# 仅 VITE_* 前缀会进入前端构建产物，可用于页面展示
# -----------------------------
# 应用标题，显示在浏览器标签和首页
VITE_APP_TITLE=DemoKit
# 应用简介，显示在首页描述区域
VITE_APP_DESCRIPTION=Lightweight demo starter kit
# 是否启用 Demo 模式标识
VITE_DEMO_MODE=true
# 主题标识，预留用于切换样式主题
VITE_APP_THEME=default
# GitHub 仓库地址，首页可展示跳转链接；留空则不显示
VITE_GITHUB_URL=https://github.com/young-tim/DemoKit

# -----------------------------
# 服务端口
# -----------------------------
# 前端或生产模式下的 Web 服务端口
PORT=3000
# 本地开发时 API 服务端口（pnpm dev:api）
API_PORT=8787

# -----------------------------
# 访问控制
# -----------------------------
# Demo 访问密码；留空表示公开访问，有值则启用轻量密码保护
DEMO_ACCESS_PASSWORD=
# 访问凭证有效期（小时），通过密码验证后在此时间内免重复输入
DEMO_ACCESS_EXPIRES_HOURS=24

# -----------------------------
# API 代理配置
# 以下变量仅服务端使用，不会暴露给前端
# 前端通过 /api/proxy/{服务名}/* 调用，密钥由服务端自动注入
# -----------------------------
# OpenAI API 密钥，用于 /api/proxy/openai/*
OPENAI_API_KEY=
# OpenAI API 根地址，默认官方地址；可改为兼容 OpenAI 协议的中转地址
OPENAI_BASE_URL=https://api.openai.com/v1

# 自定义上游 API 密钥，用于 /api/proxy/custom/*，会通过 X-API-Key 请求头注入
CUSTOM_API_KEY=
# 自定义上游 API 根地址，例如 https://httpbin.org 用于本地代理测试
CUSTOM_API_BASE_URL=

# 代理请求超时时间（毫秒）
PROXY_TIMEOUT=30000
```

变量分类：

实现要求：

```Plain Text
所有 VITE_ 变量可以在前端读取；
非 VITE_ 变量只能在服务端读取；
README 必须明确说明不要把 API Key 写入前端代码；
部署平台的环境变量需要分别在平台控制台配置。
```

---

## 十二、部署方案

## 12\.1 本地运行

本地命令：

```Bash
pnpm install
pnpm generate:adapters
pnpm dev
```

推荐开发模式：

```Plain Text
Vite 负责前端开发服务；
Node/Hono 负责 API 服务；
Vite 通过 proxy 将 /api 转发到本地 API 服务。
```

可以提供一个统一命令同时启动前端和 API：

```JSON
{
  "scripts": {
    "dev": "concurrently \"pnpm dev:web\" \"pnpm dev:api\"",
    "dev:web": "vite --host 0.0.0.0",
    "dev:api": "tsx server/local.ts"
  }
}
```

---

## 12\.2 Docker 部署

Docker 部署用于私有服务器、内网演示或长期运行 Demo。

Dockerfile 要求：

```Plain Text
使用多阶段构建；
安装 pnpm；
安装依赖；
执行 pnpm generate:adapters；
构建前端 dist；
复制服务端代码；
启动 Node 服务；
暴露 3000 端口。
```

docker\-compose\.yml 要求：

```YAML
services:
  demokit:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
```

启动命令：

```Bash
docker compose up -d --build
```

---

## 12\.3 Vercel 部署

Vercel 部署用于最快获取线上预览链接。

配置文件：

```Plain Text
vercel.json
```

基本要求：

```Plain Text
build command 使用 pnpm build；
output directory 使用 dist；
API 使用 api/ 目录；
SPA 路由 fallback 到 index.html；
环境变量在 Vercel Project Settings 中配置；
部署前确保平台入口文件已生成。
```

部署命令：

```Bash
pnpm deploy:vercel
```

---

## 12\.4 Netlify 部署

Netlify 部署用于静态站点 \+ Functions 场景。

配置文件：

```Plain Text
netlify.toml
```

推荐配置：

```TOML
[build]
  command = "pnpm build"
  publish = "dist"
  functions = "netlify/functions"

# <demokit-api-redirects>
# This block is auto-generated. Do not edit manually.
# </demokit-api-redirects>

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

部署命令：

```Bash
pnpm deploy:netlify
```

---

## 12\.5 Cloudflare Pages 部署

Cloudflare 部署用于边缘网络、轻量 Demo 和 Pages Functions 场景。

配置文件：

```Plain Text
wrangler.toml
```

基本要求：

```Plain Text
构建命令使用 pnpm build；
输出目录为 dist；
Functions 目录位于项目根目录 functions/；
环境变量在 Cloudflare Pages 项目设置中配置；
部署前确保 functions/api/* 已生成。
```

部署命令：

```Bash
pnpm deploy:cloudflare
```

---

## 十三、package\.json 脚本设计

```JSON
{
  "scripts": {
    "generate:adapters": "tsx scripts/generate-adapters.ts",
    "clean:generated": "tsx scripts/clean-generated.ts",
    "dev": "concurrently \"pnpm dev:web\" \"pnpm dev:api\"",
    "dev:web": "vite --host 0.0.0.0",
    "dev:api": "tsx server/local.ts",
    "prebuild": "pnpm generate:adapters",
    "build": "tsc && vite build",
    "preview": "vite preview --host 0.0.0.0",
    "check": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "docker:build": "docker build -t demokit-template .",
    "docker:up": "docker compose up -d --build",
    "docker:down": "docker compose down",
    "deploy:vercel": "pnpm generate:adapters && vercel --prod",
    "deploy:netlify": "pnpm generate:adapters && netlify deploy --prod",
    "deploy:cloudflare": "pnpm generate:adapters && wrangler pages deploy dist"
  }
}
```

说明：

```Plain Text
prebuild 会自动生成平台适配入口，保证构建时文件是最新的；
deploy:* 命令也会先执行 generate:adapters；
生成器稳定后可以保留 prebuild；
如果调试阶段不想每次 build 自动生成，也可以临时去掉 prebuild。
```

---

## 十四、访问密码技术细节

访问密码的技术实现需要注意：密码不能进入前端构建产物，前端只能知道是否启用密码保护，不能知道真实密码。

推荐实现：

```Plain Text
server/core/access.ts
```

核心方法：

```TypeScript
export function isAccessEnabled() {
  return Boolean(process.env.DEMO_ACCESS_PASSWORD);
}

export function verifyAccessPassword(password: string) {
  const expected = process.env.DEMO_ACCESS_PASSWORD;

  if (!expected) {
    return true;
  }

  return password === expected;
}

export function getAccessExpiresHours() {
  return Number(process.env.DEMO_ACCESS_EXPIRES_HOURS || 24);
}
```

前端 `AccessGate` 不判断密码，只判断本地状态和调用服务端接口。

前端本地授权状态结构：

```TypeScript
interface AccessState {
  granted: boolean;
  expiresAt: number;
}
```

存储 key：

```Plain Text
demokit_access_state
```

推荐存储值：

```JSON
{
  "granted": true,
  "expiresAt": 1234567890
}
```

---

## 十五、API 代理安全设计

虽然 DemoKit 不做复杂鉴权，但 API 代理仍然需要避免成为开放代理。

第一版至少做以下限制：

```Plain Text
只允许代理配置在 proxyConfig.services 中的 service；
不允许前端传入任意完整 URL；
不允许代理本地地址和内网地址；
不转发敏感响应头；
不返回服务端 API Key；
默认设置请求超时。
```

需要过滤的请求头和响应头包括：

```Plain Text
host
connection
content-length
set-cookie
cookie
authorization
x-api-key
```

其中 `authorization` 和 `x-api-key` 是否转发，需要由服务端代理配置决定，不能直接使用前端传入的值。

---

## 十六、Mock 数据技术方案

第一版 Mock 数据使用 JSON 文件。Mock 文件放在项目根目录：

```Plain Text
mock/
```

核心方法：

```TypeScript
export async function handleMock(req: CoreRequest): Promise<CoreResponse> {
  const name = getMockNameFromPath(req.path);
  const data = await loadMockJson(name);

  if (!data) {
    return jsonError("MOCK_NOT_FOUND", "Mock file not found", 404);
  }

  return jsonOk(data);
}
```

需要考虑不同平台文件读取差异。为了减少 Serverless 文件路径问题，推荐将 Mock JSON 放到 `src/mock-data` 并以模块方式导入，或者在构建时复制 mock 目录到函数可访问路径。

第一版如果优先简单，可以保留 `mock/*.json` 文件读取，但需要在 README 中说明如果某个平台读取失败，需要检查构建产物是否包含 mock 目录。

---

## 十七、构建与运行模式

DemoKit 支持五种部署方式：

```Plain Text
local      # 本地开发（pnpm dev）
docker     # Docker Compose
vercel     # Vercel Serverless
netlify    # Netlify Functions
cloudflare # Cloudflare Pages Functions
```

前端只调用相对路径 `/api/*`，不感知具体运行环境。部署验证可通过 `GET /api/health` 确认 API 是否正常响应。

---

## 十八、前端路由设计

前端使用 React Router。

路由建议：

```TypeScript
export const routes = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/tool",
    element: <ToolDemoPage />,
  },
  {
    path: "/chat",
    element: <ChatDemoPage />,
  },
  {
    path: "/workflow",
    element: <WorkflowDemoPage />,
  },
  {
    path: "/api-debug",
    element: <ApiDebugPage />,
  },
];
```

`App.tsx` 外层结构：

```TypeScript
export function App() {
  return (
    <AppProviders>
      <AccessGate>
        <RouterProvider router={router} />
      </AccessGate>
    </AppProviders>
  );
}
```

这样访问密码保护覆盖所有页面。

---

## 十九、错误处理设计

统一错误结构：

```TypeScript
export interface AppError {
  code: string;
  message: string;
  detail?: unknown;
}
```

统一成功响应：

```JSON
{
  "ok": true,
  "data": {}
}
```

统一失败响应：

```JSON
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "detail": {}
  }
}
```

常见错误码：

---

## 二十、开发阶段实现顺序

建议按以下顺序实现，避免一开始就陷入多平台适配复杂度。

第一阶段实现本地模板：

```Plain Text
初始化 Vite + React + TypeScript；
接入 Tailwind CSS；
接入 shadcn/ui；
实现基础页面 Home / Tool / Chat / Workflow / API Debug；
实现 DemoShell、ResultPanel、JsonViewer、LogPanel；
实现 useDemoRequest；
实现本地 /api/health、/api/mock。
```

第二阶段实现核心 API：

```Plain Text
建立 server/core；
实现 CoreRequest 和 CoreResponse；
实现 health；
实现 mock；
实现 access；
实现 proxy；
实现统一错误响应。
```

第三阶段实现访问密码：

```Plain Text
实现 /api/access/status；
实现 /api/access/verify；
实现 AccessGate；
实现 AccessPasswordForm；
实现 localStorage 授权过期逻辑。
```

第四阶段实现平台适配层生成器：

```Plain Text
定义 server/routes.manifest.ts；
实现 scripts/generate-adapters.ts；
生成 Vercel Functions 入口；
生成 Netlify Functions 入口；
生成 Cloudflare Pages Functions 入口；
生成 adapter-map.json；
生成或更新 netlify.toml redirects；
为自动生成文件添加 AUTO-GENERATED 头部声明。
```

第五阶段实现 Docker：

```Plain Text
编写 server/local.ts 托管静态资源和 API；
编写 Dockerfile；
编写 docker-compose.yml；
验证 .env 注入；
验证访问密码；
验证 API 代理。
```

第六阶段实现 Serverless 验证：

```Plain Text
验证 Vercel /api/health；
验证 Vercel /api/mock；
验证 Vercel /api/access；
验证 Vercel /api/proxy；

验证 Netlify /api/health；
验证 Netlify /api/mock；
验证 Netlify /api/access；
验证 Netlify /api/proxy；

验证 Cloudflare /api/health；
验证 Cloudflare /api/mock；
验证 Cloudflare /api/access；
验证 Cloudflare /api/proxy。
```

第七阶段补齐 README 和部署文档。

---

## 二十一、技术验收标准

---

## 二十二、风险与处理策略

## 22\.1 多平台函数差异

风险：Vercel、Netlify、Cloudflare 的函数入口、请求对象、构建方式不同，容易导致三套代码重复。

处理策略：所有核心逻辑放到 `server/core`，平台目录由生成器生成，平台请求格式转换放在 `server/adapters`。

---

## 22\.2 生成器规则不完整

风险：新增复杂路由后，生成器无法正确映射到不同平台。

处理策略：第一版只支持明确的 API 路由模式，例如 `/api/health`、`/api/mock/:path*`、`/api/proxy/:path*`、`/api/access/status`、`/api/access/verify`。复杂路由后续再扩展。

---

## 22\.3 自动生成文件被手动修改

风险：用户直接修改 `api/`、`netlify/functions/`、`functions/api/` 下的文件，下次生成时被覆盖。

处理策略：生成文件头部添加 `AUTO-GENERATED FILE`，README 明确说明不要手动修改。必要时生成器可以在覆盖前提示或强制覆盖。

---

## 22\.4 Mock 文件在 Serverless 环境读取失败

风险：部分平台的 Serverless 函数在运行时读取本地文件路径可能不稳定。

处理策略：第一版可以先使用 JSON 文件读取，但要在构建中确保 mock 目录被包含。更稳的方案是将 mock 数据编译进 TypeScript 模块。

---

## 22\.5 API 代理被滥用

风险：如果允许前端传任意 URL，DemoKit 可能变成开放代理。

处理策略：第一版只支持 service 白名单代理，不支持任意 URL 代理。service 的 baseUrl 和 API Key 必须由服务端环境变量控制。

---

## 22\.6 访问密码被误认为生产鉴权

风险：访问密码只是 Demo 保护，不具备正式登录系统能力。

处理策略：README 和页面说明中明确标注：该能力仅用于 Demo 访问保护，不适合作为生产认证系统。

---

## 22\.7 平台环境变量配置不一致

风险：不同部署平台配置环境变量的位置不同，用户容易漏配。

处理策略：README 分别提供 Vercel、Netlify、Cloudflare、Docker 的环境变量配置说明，并提供 `/api/health` 用于快速排查 API 是否可用。

---

## 二十三、第一版最终技术结论

DemoKit 第一版应该采用“轻量前端 \+ 统一 API Core \+ 路由清单 \+ 平台适配层生成器”的技术架构。

最终结构不是三套 API 服务，而是：

```Plain Text
一套核心 API 逻辑：
  server/core/*

一套 API 路由声明：
  server/routes.manifest.ts

一套平台适配转换：
  server/adapters/*

一个适配层生成器：
  scripts/generate-adapters.ts

多套自动生成入口：
  api/*                 Vercel
  netlify/functions/*   Netlify
  functions/api/*       Cloudflare
  server/local.ts       Local / Docker
```

前端始终调用：

```Plain Text
/api/*
```

后端核心只维护一份：

```Plain Text
health
mock
proxy
access
env
request
response
```

新增 API 的标准流程是：

```Plain Text
在 server/core 中实现 handler；
在 server/routes.manifest.ts 中声明路由；
执行 pnpm generate:adapters；
本地验证 /api/*；
再部署到目标平台。
```

这样既能满足本地运行、Docker 部署、Vercel 部署、Netlify 部署和 Cloudflare 部署，又能避免多平台适配导致代码重复失控。

DemoKit 的第一版不追求复杂能力，而是把每次做 Demo 都会重复建设的工程底座沉淀下来。只要它能稳定做到页面可改、接口可接、Mock 可用、密码可控、部署可选、适配可生成，就已经完成技术闭环。



