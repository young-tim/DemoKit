# DemoKit - 轻量 Demo 工程模板

DemoKit 是一个用于快速搭建可访问 Web Demo 的轻量工程模板。它适合原型验证、产品演示、AI 应用 Demo、接口能力验证和客户 PoC，目标是让你少处理工程底座，多关注 Demo 本身要展示什么。

## 项目简介

DemoKit 内置 Vite + React + TypeScript 前端、Hono 服务端 Core、Mock 数据、服务端 API 代理、轻量访问保护，以及 Docker、Vercel、Netlify、Cloudflare Pages 等部署配置。

它不是生产级业务平台，也不绑定某个具体行业场景。你可以把它作为 GitHub Template、项目脚手架或演示工程基座，复制后快速替换页面、文案、Mock 数据和后端代理配置。

## 核心特性

- 开箱即用的 React Demo 页面结构，适合工具型、对话型和流程型演示。
- 统一的 `/api/*` 服务端入口，避免前端直接暴露密钥或感知部署平台差异。
- 内置 Mock 数据读取和服务端代理能力，方便验证第三方 API 或内部接口。
- 可选访问密码保护，适合临时演示链接和客户 PoC。
- 覆盖本地开发、Node 运行、Docker Compose 和主流 Serverless 平台部署。

## 快速开始

```bash
cp .env.example .env
pnpm install
pnpm dev
```

启动后访问 `http://localhost:3000`。开发模式下前端由 Vite 提供服务并支持 HMR，API 服务默认运行在 `8787`，会通过 `tsx watch` 在 `server/*` 相关文件变更后自动重启。前端请求会通过相对路径访问 `/api/*`。

## 本地开发

常用命令：

```bash
pnpm dev          # 同时启动前端和本地 API
pnpm dev:web      # 只启动 Vite 前端
pnpm dev:api      # 只启动本地 API 服务
pnpm check        # TypeScript 检查
pnpm lint         # ESLint 检查
pnpm build        # 生成部署产物
```

新增或调整平台适配路由时，需要先维护服务端 Core 和路由声明，再运行：

```bash
pnpm generate:adapters
```

## 部署方式

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyoung-tim%2FDemoKit)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/young-tim/DemoKit)

- Cloudflare Pages：[创建 Pages 项目](https://dash.cloudflare.com/?to=/:account/pages/new/provider/github)，选择 GitHub 仓库 `young-tim/DemoKit` 后按项目内 `wrangler.toml` 和构建配置部署。

### Docker Compose

```bash
cp .env.example .env
docker compose up -d --build
```

默认映射到 `http://localhost:3000`。也可以使用脚本：

```bash
pnpm docker:up
pnpm docker:down
```

### Vercel

项目已包含 `vercel.json`。部署前在 Vercel Project Settings 中配置需要的服务端环境变量，然后运行：

```bash
pnpm deploy:vercel
```

### Netlify

项目已包含 `netlify.toml`，构建产物发布到 `dist`，Serverless Functions 位于 `netlify/functions`。

```bash
pnpm deploy:netlify
```

### Cloudflare Pages

项目已包含 `wrangler.toml`，Pages 构建输出目录为 `dist`。

```bash
pnpm deploy:cloudflare
```

部署前请在 Cloudflare Pages 项目设置中配置需要的服务端环境变量。

### 本地Node

```bash
pnpm install
pnpm build
pnpm start
```

生产模式下默认使用 `PORT=3000`，可在 `.env` 或部署平台环境变量中调整。

## 环境变量

复制 `.env.example` 后按需修改：

- `VITE_APP_TITLE`、`VITE_APP_DESCRIPTION`、`VITE_APP_THEME`：前端展示配置。
- `PORT`、`API_PORT`：服务端口配置。
- `DEMO_ACCESS_PASSWORD`、`DEMO_ACCESS_EXPIRES_HOURS`：访问保护配置，密码为空时公开访问。
- `OPENAI_API_KEY`、`OPENAI_BASE_URL`、`CUSTOM_API_KEY`、`CUSTOM_API_BASE_URL`：服务端代理使用的上游配置。
- `PROXY_TIMEOUT`：代理请求超时时间。

只有 `VITE_*` 变量会进入前端构建产物。API Key、访问密码等敏感变量不要加 `VITE_` 前缀。

## 注意事项

- DemoKit 优先保证本地可跑、线上可访问、易复制改造，不建议在模板内扩展复杂权限、数据库或多租户能力。
- `api/`、`netlify/functions/`、`functions/api/`、`generated/adapter-map.json` 是生成产物，通常不要手写修改。
- Mock 数据适合演示和调试，不要放入真实密钥、客户数据或敏感信息。
- 部署到公开网络前，建议设置 `DEMO_ACCESS_PASSWORD` 并检查服务端环境变量。
