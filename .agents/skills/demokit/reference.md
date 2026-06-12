# DemoKit 参考 — 文件地图与模式

## 目录结构

```
src/
  app/App.tsx              # 路由注册
  pages/                   # 页面（一个 Demo 一路由）
  components/ui/           # Button, Card, Input, Textarea, Badge
  components/demo/         # DemoShell, AccessGate, LogPanel, ResultPanel 等
  config/demo.config.ts    # 首页 Demo 卡片
  hooks/useDemoRequest.ts  # 异步 Demo 请求状态
  lib/request.ts           # demoFetch 封装
  lib/env.ts               # 读取 VITE_* 公开配置
  styles/globals.css       # 全局主题变量
mock/                      # GET /api/mock/:name → mock/:name.json
server/
  core/                    # 业务逻辑（health, mock, proxy, access, chat）
  routes.manifest.ts       # API 路由声明 → generate:adapters
  adapters/                # 平台适配（勿写业务）
  local.ts                 # 本地 dev API 入口
```

## 内置路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | HomePage | 入口与 Demo 卡片 |
| `/chat` | ChatDemoPage | 流式对话 |
| `/tool` | ToolDemoPage | 输入/运行/结果 |
| `/workflow` | WorkflowDemoPage | 步骤流程 |
| `/api-debug` | ApiDebugPage | API 调试 |

## API 端点

| 方法 | 路径 | 用途 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/mock/:name` | 读 `mock/:name.json` |
| POST | `/api/chat/stream` | 对话流式（服务端） |
| * | `/api/proxy/:service/*` | 白名单代理（openai/custom） |
| GET | `/api/access/status` | 是否启用访问密码 |
| POST | `/api/access/verify` | 校验访问密码 |

## 环境变量速查

**前端可见（VITE_）**

- `VITE_APP_TITLE`、`VITE_APP_DESCRIPTION`、`VITE_APP_THEME`
- `VITE_DEMO_MODE`、`VITE_GITHUB_URL`

**仅服务端**

- `PORT`、`API_PORT`
- `DEMO_ACCESS_PASSWORD`、`DEMO_ACCESS_EXPIRES_HOURS`
- `OPENAI_API_KEY`、`OPENAI_BASE_URL`
- `CUSTOM_API_KEY`、`CUSTOM_API_BASE_URL`
- `PROXY_TIMEOUT`

## 常用组件

```tsx
// 页面外壳
<DemoShell title="" description="" badge="" compact={false}>...</DemoShell>

// UI
<Button disabled={loading} onClick={...}>运行</Button>
<Card>...</Card>
<Textarea value={} onChange={} />
<Input />
<Badge>标签</Badge>

// Demo 辅助
<ResultPanel loading={} error={} data={} />
<LogPanel logs={string[]} />
```

## useDemoRequest 模式

```tsx
const request = useDemoRequest(async (input: string) => {
  const res = await demoFetch<{ ok: true; data: unknown }>("/api/mock/result");
  return { input, result: res.data };
});

// JSX
<Button disabled={request.loading} onClick={() => request.run(input)}>运行</Button>
<ResultPanel loading={request.loading} error={request.error} data={request.data} />
```

## 新增 API 路由流程

1. 在 `server/core/` 实现 handler（用 `jsonOk` / `jsonError`）
2. 在 `server/routes.manifest.ts` 追加 `{ name, path, handler, importPath, methods }`
3. 运行 `pnpm generate:adapters`
4. 前端用 `demoFetch` 调用新路径

## Mock 文件示例

`mock/result.json`：

```json
{
  "ok": true,
  "data": {
    "summary": "示例结果",
    "items": ["a", "b"]
  }
}
```

请求：`GET /api/mock/result` → 返回上述 JSON。

## 样式定制要点

`:root` 变量：`--panel`、`--panel-strong`、`--line`、`--accent`、`--accent-2`

HomePage 与 Button 中硬编码了 `emerald-*` / `blue-*` Tailwind 类；换主题时需一并替换为与新 accent 协调的色类，或统一改为 `style={{ background: 'var(--accent)' }}` 少量点位。

## package.json 脚本

| 脚本 | 作用 |
|------|------|
| `pnpm dev` | 前端 + API 并行 |
| `pnpm dev:web` / `pnpm dev:api` | 单独启动 |
| `pnpm check` | tsc --noEmit |
| `pnpm build` | 生产构建（含 generate:adapters） |
| `pnpm generate:adapters` | 生成多平台 API 入口 |
| `pnpm deploy:vercel` / `deploy:netlify` / `deploy:cloudflare` | 部署 |
| `pnpm docker:up` | Docker Compose |

## 示例场景映射

| 用户需求 | 推荐做法 |
|----------|----------|
| AI 客服演示 | 改 ChatDemoPage + mock/chat.json 或 proxy openai |
| 文案/摘要工具 | 改 ToolDemoPage + 新 mock |
| 审批/Agent 流程 | 改 WorkflowDemoPage + mock/workflow.json |
| 商品/数据看板 | 新页面 + mock/products.json |
| 接口联调 | ApiDebugPage 或 ToolDemoPage 调 proxy |
| 客户 PoC 链接 | 设 DEMO_ACCESS_PASSWORD + Vercel/Netlify 部署 |
