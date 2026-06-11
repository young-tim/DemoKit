# DemoKit AI 开发规范

## 项目定位
- DemoKit 是“把想法快速变成可访问 Demo”的轻量工程模板，用于原型验证、产品演示、AI 应用 Demo 和接口能力验证。
- 本项目优先保证本地可跑、线上可访问、易复制改造；不要按生产级平台或复杂业务系统扩展。

## 架构边界
- 前端在 `src/`：Vite + React + TypeScript，路由集中在 `src/app/App.tsx`，页面放 `src/pages/`，通用 UI 放 `src/components/ui/`，Demo 组件放 `src/components/demo/`。
- 服务端核心在 `server/core/`：只在这里实现 `/api/*` 业务逻辑，包括 health、mock、proxy、access。
- API 路由声明在 `server/routes.manifest.ts`；新增或调整 API 后运行 `pnpm generate:adapters`。
- `api/`、`netlify/functions/`、`functions/api/`、`generated/adapter-map.json` 是生成产物，原则上不要手写修改。
- `server/adapters/` 只做平台请求/响应转换，不写业务判断。

## 前端规范
- 维持现有 Demo 页面模式：`/`、`/tool`、`/chat`、`/workflow`、`/api-debug`，新增入口同步更新 `src/config/demo.config.ts`。
- 组件使用函数组件和 TypeScript；样式优先沿用 Tailwind 与现有 `components/ui` 基础组件。
- 前端只调用相对路径 `/api/*`，不要感知本地、Docker、Vercel、Netlify、Cloudflare 差异。
- 不要在前端读取或暴露 API Key、访问密码等服务端密钥；只有 `VITE_*` 可进入前端。

## 服务端/API 规范
- 新 API 先在 `server/core/*` 写纯核心逻辑，再在 `server/routes.manifest.ts` 声明路由，最后生成平台入口。
- `/api/mock/:name` 读取 `mock/*.json`，适合演示数据；不要把真实密钥或敏感数据放入 mock。
- `/api/proxy/:service/*` 只通过服务端环境变量配置上游地址和密钥，保持白名单式服务配置。
- 错误响应沿用 `jsonError`，成功响应沿用 `jsonOk` 或现有 `CoreResponse` 结构。

## 必要接口路径/约定
- `GET /api/health`：健康检查和运行环境探测，用于首页状态和部署验证。
- `GET /api/mock/*`：读取 `mock/*.json` 演示数据，路径名与 mock 文件名保持一致。
- `GET /api/access/status`：检查当前部署是否启用访问保护。
- `POST /api/access/verify`：校验 `DEMO_ACCESS_PASSWORD`，前端不要直接读取密码。
- `GET|POST /api/proxy/*`：统一服务端代理入口，只允许访问服务端白名单中配置的上游服务。

## 部署与环境变量
- 支持 Docker、Vercel、Netlify、Cloudflare Pages；部署配置分别在 `Dockerfile`、`vercel.json`、`netlify.toml`、`wrangler.toml`。
- 修改部署入口或 API 路由时，优先改生成器和 manifest，不直接改生成目录。
- 环境变量以 `.env.example` 为准：`DEMO_*`、`PORT`、`API_PORT` 控制运行时，`OPENAI_*`、`CUSTOM_*`、`PROXY_TIMEOUT` 仅服务端使用。
- `DEMO_ACCESS_PASSWORD` 为空表示公开访问；有值表示启用轻量访问保护。

## 测试验收
- 常规改动至少确认相关文件内容；涉及 TypeScript 或 API 时运行 `pnpm check`。
- 涉及生成入口或部署配置时运行 `pnpm generate:adapters`；必要时再运行 `pnpm lint`、`pnpm build`；纯文档修改无需完整构建。

## AI 修改边界
- 修改应小而聚焦，不做无关重构，不引入重型框架、状态管理或数据库。
- 保持模板通用性，不把单个客户/单个 Demo 的私有业务强绑定进核心架构。
