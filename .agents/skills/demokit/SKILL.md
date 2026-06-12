---
name: demokit
description: >-
  使用 DemoKit 模板快速搭建可访问的 Web Demo/原型页面：需求确认、克隆工程、
  定制品牌与样式、按规范创建页面、Mock/API 对接、本地预览与一键部署。
  Use when the user wants to build a demo, prototype, PoC, product preview,
  AI app demo, or mentions DemoKit, demokit, 演示页面, 原型, 快速搭建 Demo.
---

# DemoKit — 快速 Demo 搭建

**SKILL_ROOT** = 本 `SKILL.md` 所在目录。详细文件地图与页面模板见 [reference.md](reference.md)。

工作前若当前仓库已是 DemoKit（存在 `server/routes.manifest.ts` 且 `package.json` 含 `demokit-template`），直接在本仓库改；否则先执行「工程初始化」。

## 工作流总览

```
需求确认 → 初始化工程 → 品牌/样式定制 → 创建或改造 Demo 页 → 验收 → 预览/部署
```

复制 checklist 跟踪进度：

```
- [ ] 1. 需求确认（场景、风格、数据/API、部署）
- [ ] 2. 工程就绪（克隆或确认已在 DemoKit 目录）
- [ ] 3. 环境配置（.env、Mock、代理密钥）
- [ ] 4. 页面实现（路由 + demo.config + 页面组件）
- [ ] 5. 运行 pnpm check
- [ ] 6. 本地预览 pnpm dev
- [ ] 7. （可选）部署与访问保护
```

## 1. 需求确认

**不要跳过。** 用 AskQuestion 或简短对话确认以下项；用户已明确给出的项不再重复追问。

| 维度 | 选项/说明 |
|------|-----------|
| **Demo 类型** | 对话 `/chat`、工具 `/tool`、流程 `/workflow`、全新自定义页、或改造首页 |
| **展示目标** | 给谁看、核心要证明什么（1 句话） |
| **设计风格** | 默认暗色科技风；或指定主色/浅色/品牌色（见下方预设） |
| **数据来源** | 仅 Mock（`mock/*.json`）、真实 API（`/api/proxy/*`）、或 Chat 流式 |
| **访问控制** | 公开 / 需要 `DEMO_ACCESS_PASSWORD` |
| **部署目标** | 仅本地 / Vercel / Netlify / Cloudflare / Docker |

**设计预设**（改 `src/styles/globals.css` 的 `:root` 与 `body` 背景即可，勿引入新 CSS 框架）：

- **default**：保持 `--accent: #38e8b0`、`--accent-2: #68a7ff`
- **warm**：`--accent: #f59e0b`，背景偏 `#0f0a07`
- **minimal-light**：`color-scheme: light`，浅灰背景，`--panel` 用 `rgba(255,255,255,0.9)`
- **brand**：按用户提供 hex 替换 `--accent` / `--accent-2`，同步改 HomePage 按钮 Tailwind 色类

同步更新 `.env`：`VITE_APP_TITLE`、`VITE_APP_DESCRIPTION`、`VITE_APP_THEME`（预设名或 `custom`）。

## 2. 工程初始化

### 已在 DemoKit 仓库内

```bash
# 若缺少依赖或 .env
test -f .env || cp .env.example .env
pnpm install
```

### 用户工作区尚无 DemoKit

先确认目标目录（默认 `./DemoKit` 或用户指定路径），再执行：

```bash
bash "{SKILL_ROOT}/scripts/setup.sh" [目标目录]
```

脚本行为：目录已含 DemoKit 特征则跳过 clone；否则 `git clone`；复制 `.env.example` → `.env`；`pnpm install`。

克隆源：`https://github.com/young-tim/DemoKit.git`

初始化后 `cd` 到项目根，后续命令均在根目录执行。

## 3. 定制品牌与全局样式

**优先改这些文件，避免大范围重构：**

| 文件 | 用途 |
|------|------|
| `.env` | `VITE_APP_TITLE`、`VITE_APP_DESCRIPTION`、`VITE_GITHUB_URL` |
| `src/styles/globals.css` | 主题色、背景、面板变量 |
| `src/pages/HomePage.tsx` | 首页 hero 文案、CTA、部署按钮 |
| `src/config/demo.config.ts` | 首页 Demo 卡片列表 |

**规范约束**（与 `AGENTS.md` 一致）：

- 前端只调 `/api/*`，密钥只放服务端环境变量
- 不改 `api/`、`netlify/functions/`、`functions/api/`、`generated/` 手写内容
- 小步修改，不引入 Redux/数据库/复杂权限

## 4. 创建或改造 Demo 页面

### 选型

| 类型 | 基座页面 | 适用 |
|------|----------|------|
| 对话 | `src/pages/ChatDemoPage.tsx` | 聊天、Copilot、流式 AI |
| 工具 | `src/pages/ToolDemoPage.tsx` | 输入→运行→结构化结果 |
| 流程 | `src/pages/WorkflowDemoPage.tsx` | 多步骤 Agent / 业务流 |
| 调试 | `src/pages/ApiDebugPage.tsx` | 验证 API 连通性 |

**默认策略**：在对应基座上改文案、字段、Mock 路径或 proxy 调用；只有场景差异大时才新建 `src/pages/XxxDemoPage.tsx`。

### 新建页面必做三步

1. **`src/app/App.tsx`** — 增加 `<Route path="/your-path" element={<YourPage />} />`
2. **`src/config/demo.config.ts`** — 增加卡片 `{ title, description, href }`
3. **页面文件** — 用 `DemoShell` 包裹，复用 `components/ui/*` 与 `components/demo/*`

页面结构模板：

```tsx
import { DemoShell } from "../components/demo/DemoShell";
import { Card } from "../components/ui/Card";

export function YourDemoPage() {
  return (
    <DemoShell title="标题" badge="标签" description="一句话说明">
      <Card>{/* 交互内容 */}</Card>
    </DemoShell>
  );
}
```

异步请求用 `useDemoRequest` + `demoFetch`（见 `ToolDemoPage.tsx`）。

### Mock 数据

- 在 `mock/` 新增 `{name}.json`，前端请求 `GET /api/mock/{name}`
- 演示数据即可，禁止真实密钥与客户敏感信息

### 真实 API

- 在 `.env` 配置 `OPENAI_*` 或 `CUSTOM_*`
- 前端：`demoFetch("/api/proxy/openai/...")` 或 `/api/proxy/custom/...`
- 新增服务端路由：仅当 mock/proxy 不够时，改 `server/core/*` + `server/routes.manifest.ts`，再 `pnpm generate:adapters`

## 5. 验收

```bash
pnpm check          # TypeScript，涉及 TS/API 必跑
pnpm generate:adapters   # 仅当改过 routes.manifest 或 server/core 路由
pnpm lint           # 大改动可选
pnpm build          # 部署前建议跑
```

## 6. 本地预览

```bash
pnpm dev
```

- 前端：`http://localhost:3000`（Vite HMR）
- API：默认 `8787`，前端通过 `/api/*` 代理访问

只改静态页面时可告知用户刷新浏览器；改 `server/*` 或 `.env` 后 dev 会自动重启 API。

## 7. 部署与访问保护

部署前建议：

1. 设置 `DEMO_ACCESS_PASSWORD`（临时链接 / PoC）
2. 在部署平台配置服务端 env（`OPENAI_*`、`CUSTOM_*` 等，**不要**加 `VITE_` 前缀）

| 平台 | 命令 / 方式 |
|------|-------------|
| Vercel | `pnpm deploy:vercel` 或 README 一键按钮 |
| Netlify | `pnpm deploy:netlify` |
| Cloudflare Pages | `pnpm build && pnpm deploy:cloudflare` |
| Docker | `pnpm docker:up` → `http://localhost:3000` |
| Node 生产 | `pnpm build && pnpm start` |

**须用户确认后再执行 deploy**（涉及账号与线上环境）。部署后让用户访问 `GET /api/health` 与目标 Demo 路径做冒烟验证。

## 8. 与用户沟通

完成后简要说明：

- 改了哪些页面/路由，本地访问路径
- Mock 还是真实 API，需要哪些 env
- 如何 `pnpm dev` 预览
- 若已部署：URL 与访问密码（如有）

## 反模式

- 在前端读 `OPENAI_API_KEY` 或 `DEMO_ACCESS_PASSWORD`
- 手写修改 `api/`、`generated/adapter-map.json`
- 为单个客户把私有业务写进 `server/core` 通用逻辑
- 未确认需求就 clone 或 deploy
- 跳过 `pnpm check` 就声称「已完成」

## 延伸阅读

- 项目 AI 规范：`AGENTS.md`（仓库根目录）
- 文件地图、Hook、组件清单：[reference.md](reference.md)
