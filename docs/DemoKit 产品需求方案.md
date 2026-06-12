# DemoKit 产品需求方案

## 一、产品定位

DemoKit 是一个面向原型验证、产品演示和 AI 应用 Demo 的轻量级工程模板项目。

它的核心目标不是构建生产级系统，而是帮助用户把一个想法、一个页面、一个接口能力、一个 AI 能力或一个业务流程，快速变成一个可以本地运行、可以线上访问、可以分享演示的 Web Demo。

它解决的是每次做 Demo 都要重复处理的底层工程问题：新建项目、配置 UI、写页面骨架、处理 API 请求、解决跨域、管理环境变量、准备 Mock 数据、配置 Docker、配置 Vercel、配置 Cloudflare、配置 Netlify。DemoKit 把这些重复工作提前封装好，让用户每次只需要关注“这个 Demo 要展示什么”。

一句话定位：

```Plain Text
DemoKit：把想法快速变成可访问 Demo 的轻量工程模板。
```

产品关键词：

```Plain Text
轻量、快速、模板化、本地可跑、一键部署、易演示、易复制、易改造
```

## 二、目标用户

DemoKit 面向的不是完全不懂技术的用户，而是具备基础工程能力、但不想每次从零搭建项目的人。

核心用户包括产品经理、AI 产品经理、独立开发者、售前工程师、技术型 PM、AI 应用开发者、内部工具开发者、小团队研发人员。尤其适合需要频繁验证想法、做 PoC、做客户演示、做 AI 原型、做业务流程 Demo 的人。

典型用户画像是：他不一定要做一个完整系统，但希望快速做出一个“看起来像产品、能点击、能调用接口、能展示结果、能部署访问”的 Demo。

## 三、核心使用场景

第一个场景是产品原型演示。产品经理想把一个功能想法做成可点击的页面，给老板、客户或团队评审。DemoKit 提供基础页面结构、表单、按钮、结果区、步骤条、示例数据，让用户不需要从零搭 UI。

第二个场景是 AI 能力 Demo。用户想快速接入大模型、图像生成、语音识别、RAG、Agent、工作流等能力。DemoKit 提供 API 代理、环境变量管理、Prompt 输入区、结果展示区、流式输出区、日志面板，帮助用户快速做出 AI 应用原型。

第三个场景是接口能力验证。用户拿到一个第三方 API 或内部接口，想快速做一个页面演示调用效果。DemoKit 提供 `/api/proxy`、Mock 数据、JSON Viewer、错误展示和请求状态管理，避免重复处理跨域、Header、密钥暴露等问题。

第四个场景是客户 PoC。售前或方案人员需要快速搭一个业务流程 Demo，并部署成线上链接给客户看。DemoKit 支持本地运行、Docker 部署、Vercel、Cloudflare、Netlify 等部署方式，方便快速交付可访问地址。

第五个场景是开源项目展示。开发者做了一个开源工具，需要一个轻量官网、Demo 页面或在线体验入口。DemoKit 可以提供 Landing Page、功能介绍、示例入口和部署配置。

## 四、产品边界

DemoKit 第一版只做“模板项目”，不做完整平台。

第一版不做用户注册登录，不做权限管理，不做复杂数据库，不做多租户，不做可视化拖拽搭建，不做任务队列，不做企业级监控，不做完整后台管理系统。

第一版要做的是：让用户复制模板后，能够快速本地启动、快速修改页面、快速接 API、快速部署上线。

也就是说，第一版产品形态应该是一个 GitHub Template Repository，而不是一个复杂 CLI 或 SaaS 平台。CLI 可以放到后续阶段。

## 五、第一版产品目标

第一版目标是做出一个标准模板项目，满足以下能力：

```Plain Text
1. 克隆项目后可以快速本地运行
2. 内置 shadcn/ui + Tailwind CSS 基础 UI
3. 内置常见 Demo 页面模板
4. 内置 API 代理，支持转发第三方 API
5. 内置环境变量管理
6. 内置 Mock 数据
7. 内置统一请求状态处理
8. 内置结果展示组件
9. 支持 Docker 一键部署
10. 支持 Vercel Serverless Functions 部署
11. 支持 Netlify Serverless Functions 部署
12. 支持 Cloudflare Pages Functions 部署
```

验收目标可以定义为：

```Plain Text
用户 clone 项目后，5 分钟内本地启动；
改一个配置文件即可替换项目名称、描述和主题；
改一个 API 配置即可接入外部接口；
10 分钟内可以部署到至少一个线上平台。
```

## 六、技术选型

前端使用 Vite \+ React \+ TypeScript。这个组合启动快、结构轻、适合做 Demo 模板。

UI 使用 shadcn/ui \+ Tailwind CSS。shadcn/ui 的定位是可自定义、可扩展、可构建自己设计系统的组件集合；它不是传统 npm 组件库，而是把组件代码放到项目中，适合做可改造的模板项目。Tailwind CSS 与 shadcn/ui 的组合也适合快速搭建原型界面。

后端本地运行使用 Node\.js \+ Hono 或 Express。这里建议优先 Hono，因为它更适合轻量 API、Serverless、Cloudflare Workers/Pages Functions 场景。但如果你更追求简单熟悉，也可以用 Express。第一版如果重点是跨平台 Serverless，建议 Hono。

部署层支持四种路径：本地 Node 服务、Docker 容器、Vercel Functions、Netlify Functions、Cloudflare Pages Functions。Vercel Functions 支持在 `api` 目录中创建函数来运行服务端代码；Cloudflare Pages Functions 支持通过 `/functions` 目录在 Pages 项目中加入动态能力；Netlify Functions 则可以随站点一起版本管理、构建和部署，并通过内置 API Gateway 暴露函数。

推荐技术栈如下：

## 七、模板项目核心能力

### 页面模板能力

模板项目内置几个基础 Demo 页面，不是为了覆盖所有业务，而是提供最常见的起点。

第一版建议内置四类页面：

实际首页可以设计成 Demo Gallery：

```Plain Text
首页
  ├─ 项目介绍
  ├─ Demo 列表
  │   ├─ Tool Demo
  │   ├─ Chat Demo
  │   ├─ Workflow Demo
  │   └─ API Debug Demo
  └─ 部署状态 / 环境信息
```

这样用户复制模板后，打开首页就能看到一组可用示例，再按自己的场景改造。

### UI 基础组件能力

UI 基础组件直接基于 shadcn/ui \+ Tailwind CSS，不单独自研组件库。

第一版需要预置的组件包括：

在 Demo 场景下，还需要封装一层业务组件：

其中 `DemoShell` 很重要，它决定每个 Demo 的统一结构：

```Plain Text
DemoShell
  ├─ Header：Demo 名称、说明
  ├─ ConfigBar：模型、接口、模式选择
  ├─ InputArea：输入参数
  ├─ ActionArea：运行按钮
  ├─ ResultArea：结果展示
  └─ LogArea：可选执行日志
```

### API 代理能力

API 代理是这个模板的核心能力之一。

第一版提供统一代理接口：

```Plain Text
/api/proxy
```

支持能力：

```Plain Text
1. 支持 GET / POST
2. 支持配置目标 API 地址
3. 支持读取服务端环境变量中的 API Key
4. 支持自动附加请求头
5. 支持请求超时
6. 支持统一错误返回
7. 支持本地、Docker、Vercel、Netlify、Cloudflare 多环境运行
```

第一版不做复杂网关能力，不做用户鉴权，不做限流，不做缓存，不做审计。

代理配置示例：

```Plain Text
export const proxyConfig = {
  services: {
    openai: {
      baseUrl: process.env.OPENAI_BASE_URL,
      apiKey: process.env.OPENAI_API_KEY,
      authHeader: "Authorization",
      authPrefix: "Bearer",
    },
    custom: {
      baseUrl: process.env.CUSTOM_API_BASE_URL,
      apiKey: process.env.CUSTOM_API_KEY,
      authHeader: "X-API-Key",
    },
  },
};
```

前端调用方式：

```Plain Text
await demoFetch("/api/proxy/openai/chat", {
  method: "POST",
  body: {
    messages: [{ role: "user", content: prompt }],
  },
});
```

### 环境变量能力

环境变量分为两类。

第一类是前端可见变量：

```Plain Text
VITE_APP_TITLE
VITE_APP_DESCRIPTION
VITE_APP_THEME
VITE_DEMO_MODE
```

第二类是服务端变量：

```Plain Text
OPENAI_API_KEY
OPENAI_BASE_URL
CUSTOM_API_KEY
CUSTOM_API_BASE_URL
PROXY_TIMEOUT
```

模板必须提供 `.env.example`，并明确哪些变量可以暴露到前端，哪些只能在服务端代理中使用。

`.env.example` 示例：

```Plain Text
VITE_APP_TITLE=DemoKit
VITE_APP_DESCRIPTION=Lightweight demo starter kit
VITE_DEMO_MODE=true

OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1

CUSTOM_API_KEY=
CUSTOM_API_BASE_URL=

PROXY_TIMEOUT=30000
```

### Mock 数据能力

第一版需要支持无后端接口时也能演示。

目录设计：

```Plain Text
mock/
  ├─ chat.json
  ├─ products.json
  ├─ workflow.json
  └─ api-result.json
```

接口设计：

```Plain Text
/api/mock/chat
/api/mock/products
/api/mock/workflow
/api/mock/result
```

用途是让 Demo 在没有真实 API Key、没有真实后端时也能跑起来。用户只需要修改 JSON 文件，就能模拟不同业务场景。

### 请求状态管理能力

所有 Demo 都会重复处理 loading、error、result。模板需要封装统一 Hook：

```Plain Text
useDemoRequest()
useDemoTask()
useStreamRequest()
```

第一版至少做 `useDemoRequest()`：

```Plain Text
const { run, loading, error, data, reset } = useDemoRequest();
```

它负责：

```Plain Text
1. 设置 loading
2. 捕获 error
3. 保存 result
4. 支持 reset
5. 支持超时
6. 统一错误格式
```

### 结果展示能力

模板需要支持常见结果展示形态：

```Plain Text
文本结果
Markdown 结果
JSON 结果
表格结果
步骤结果
日志结果
```

第一版至少提供：

```Plain Text
ResultPanel
JsonViewer
MarkdownViewer
LogPanel
```

AI Demo、API Demo、Workflow Demo 都可以共用这些组件。

## 八、部署能力需求

### 本地运行

用户执行：

```Plain Text
pnpm install
pnpm dev
```

本地运行要求：

```Plain Text
1. 前端页面可访问
2. API 代理可访问
3. Mock API 可访问
4. 环境变量可读取
5. 页面可展示当前运行模式
```

推荐本地端口：

```Plain Text
前端 + API 统一：http://localhost:3000
```

### Docker 部署

模板内置：

```Plain Text
Dockerfile
docker-compose.yml
.dockerignore
```

用户执行：

```Plain Text
docker compose up -d --build
```

要求：

```Plain Text
1. 容器启动后可访问 Web 页面
2. API 代理正常工作
3. 支持通过环境变量注入 API Key
4. 支持服务器部署
```

### Vercel 部署

模板内置：

```Plain Text
vercel.json
api/
  ├─ proxy/[...path].ts
  ├─ mock/[...path].ts
  └─ health.ts
```

用户执行：

```Plain Text
pnpm deploy:vercel
```

Vercel Functions 适合这个场景，因为它支持运行服务端代码而无需自己管理服务器，适合 Demo 项目的 API 代理和轻量动态能力。

### Netlify 部署

模板内置：

```Plain Text
netlify.toml
netlify/functions/
  ├─ proxy.ts
  ├─ mock.ts
  └─ health.ts
```

用户执行：

```Plain Text
pnpm deploy:netlify
```

Netlify Functions 会随站点一起构建、部署，并通过内置 API Gateway 暴露函数，适合把前端 Demo 和轻量 API 放在同一个部署流程里。

### Cloudflare 部署

模板内置：

```Plain Text
wrangler.toml
functions/
  ├─ api/
  │   ├─ proxy/[[path]].ts
  │   ├─ mock/[[path]].ts
  │   └─ health.ts
```

用户执行：

```Plain Text
pnpm deploy:cloudflare
```

Cloudflare Pages Functions 允许在 Pages 项目中通过 Functions 增加动态能力，底层运行在 Cloudflare Workers 网络上，适合轻量边缘 Demo、API 代理、表单处理等场景。

## 十、页面需求

### 首页 HomePage

首页用于说明当前 Demo 项目，并提供多个 Demo 入口。

页面内容：

```Plain Text
1. 项目标题
2. 项目描述
3. 当前运行环境
4. Demo 卡片列表
5. 部署说明入口
6. GitHub 链接入口
```

Demo 卡片包括：

```Plain Text
Tool Demo
Chat Demo
Workflow Demo
API Debug Demo
```

### Tool Demo Page

用于演示“输入 → 运行 → 输出”的工具型 Demo。

页面结构：

```Plain Text
左侧：输入区域
右侧：结果区域
底部：执行日志
```

适合场景：

```Plain Text
文案生成
文本改写
SKU 分析
JSON 转换
图片 Prompt 生成
数据清洗
```

### Chat Demo Page

用于演示对话型 AI 应用。

页面结构：

```Plain Text
消息列表
输入框
模型选择
发送按钮
清空按钮
```

第一版可以先不支持真正流式输出，但组件结构要预留。

### Workflow Demo Page

用于演示流程型业务。

页面结构：

```Plain Text
步骤条
当前步骤说明
运行按钮
每步结果
总结果
日志面板
```

适合场景：

```Plain Text
选品分析流程
Agent 执行流程
审批流程
内容生成流程
数据处理流程
```

### API Debug Page

用于快速测试 API 代理和 Mock API。

页面结构：

```Plain Text
接口选择
请求方法
请求 Body
运行按钮
JSON 结果展示
错误展示
```

这个页面非常关键，它可以验证模板项目的代理层是否正常。

## 十一、服务端接口需求

第一版只需要几个接口。

### 健康检查

```Plain Text
GET /api/health
```

返回：

```Plain Text
{
  "ok": true,
  "timestamp": 1234567890
}
```

### Mock 接口

```Plain Text
GET /api/mock/:name
```

示例：

```Plain Text
GET /api/mock/chat
GET /api/mock/products
GET /api/mock/workflow
```

返回对应 `mock/*.json` 文件。

### 代理接口

```Plain Text
POST /api/proxy/:service/:path*
GET /api/proxy/:service/:path*
```

示例：

```Plain Text
POST /api/proxy/openai/chat/completions
GET /api/proxy/custom/products
```

代理逻辑：

```Plain Text
1. 读取 service 配置
2. 拼接目标 URL
3. 注入 API Key
4. 转发请求
5. 获取响应
6. 统一返回
```

统一错误格式：

```Plain Text
{
  "ok": false,
  "error": {
    "code": "PROXY_ERROR",
    "message": "Proxy request failed",
    "detail": {}
  }
}
```

## 十二、package\.json 命令需求

模板项目至少提供这些命令：

```Plain Text
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "dev:server": "tsx server/app.ts",
    "build": "tsc && vite build",
    "preview": "vite preview --host 0.0.0.0",
    "check": "tsc --noEmit",
    "lint": "eslint .",
    "docker:build": "docker build -t demokit-template .",
    "docker:up": "docker compose up -d --build",
    "deploy:vercel": "vercel --prod",
    "deploy:netlify": "netlify deploy --prod",
    "deploy:cloudflare": "wrangler pages deploy dist"
  }
}
```

本地开发如果要同时运行前端和 API，可以用一种方式统一处理：

```Plain Text
方式一：Vite dev server + API middleware
方式二：Hono server 同时 serve 静态资源和 API
```

为了跨平台部署更简单，第一版建议本地用 Hono 统一 API 逻辑，但前端仍然用 Vite。

## 十三、部署配置需求

### Dockerfile

要求：

```Plain Text
1. 多阶段构建
2. 安装依赖
3. 构建前端
4. 启动 Node 服务
5. 暴露 3000 端口
```

### docker\-compose\.yml

要求：

```Plain Text
1. 支持 env_file: .env
2. 映射 3000:3000
3. 支持 restart: unless-stopped
```

### vercel\.json

要求：

```Plain Text
1. 前端静态资源正常构建
2. /api/* 使用 Vercel Functions
3. SPA fallback 到 index.html
```

### netlify\.toml

要求：

```Plain Text
1. 设置 build command
2. 设置 publish directory
3. 设置 functions directory
4. 配置 SPA fallback
```

### wrangler\.toml

要求：

```Plain Text
1. 配置项目名称
2. 配置 Pages 输出目录
3. 配置兼容日期
4. 支持环境变量说明
```

## 十四、第一版验收标准

第一版完成后，应该满足以下验收项：

```Plain Text
1. clone 项目后，pnpm install 成功
2. pnpm dev 后，本地页面可访问
3. 首页能看到 Demo 列表
4. Tool Demo 可以输入内容并展示 Mock 结果
5. Chat Demo 可以发送消息并展示 Mock 回复
6. Workflow Demo 可以展示步骤执行过程
7. API Debug Demo 可以调用 /api/health
8. API Debug Demo 可以调用 /api/mock/result
9. /api/proxy 能够代理一个配置好的测试接口
10. .env.example 清晰区分前端变量和服务端变量
11. Docker 构建成功
12. docker compose up -d 后页面可访问
13. Vercel 部署配置可用
14. Netlify 部署配置可用
15. Cloudflare Pages Functions 配置可用
16. README 说明如何本地运行、配置环境变量、部署到各平台
```

## 十五、后续迭代方向

第一版只是模板项目。稳定之后可以再做 CLI。

第二版可以做：

```Plain Text
npx create-demokit my-demo
```

支持选择模板：

```Plain Text
Landing Page
Tool Demo
Chat Demo
Workflow Demo
API Debug Demo
```

第三版可以做模板市场或模板集合：

```Plain Text
AI Chat Demo
Agent Workflow Demo
SKU Analyzer Demo
Image Generation Demo
Document QA Demo
Dashboard Demo
Search Demo
```

第四版再考虑更复杂能力：

```Plain Text
可视化配置
模板插件系统
在线部署向导
环境变量检查器
Demo 发布页面
```

## 十六、第一版最终定义

第一版 DemoKit 不应该追求“功能多”，而应该追求“工程起点稳定”。

最终交付物就是一个模板仓库：

```Plain Text
demokit-template
```

它的价值是：

```Plain Text
每次做 Demo，不再重新搭项目、不再重新配 UI、不再重新写 API 代理、不再重新写 Dockerfile、不再重新配 Vercel/Netlify/Cloudflare。
```

最小闭环是：

```Plain Text
git clone demokit-template my-demo
cd my-demo
cp .env.example .env
pnpm install
pnpm dev
```

部署闭环是：

```Plain Text
pnpm deploy:vercel
```

或者：

```Plain Text
docker compose up -d --build
```

这就是第一版应该完成的核心目标。

