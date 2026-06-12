# DemoKit 使用示例

## 示例 1：AI 写作工具 Demo

**需求**：输入主题，生成结构化大纲，Mock 即可，暗色默认风。

**步骤**：

1. `.env` → `VITE_APP_TITLE=AI 写作助手`
2. 复制 `ToolDemoPage.tsx` 逻辑，改标题/placeholder
3. 新增 `mock/outline.json`，Tool 页请求 `/api/mock/outline`
4. 更新 `demo.config.ts` 卡片文案
5. `pnpm check && pnpm dev`

## 示例 2：客户 PoC + 密码保护

**需求**：对话 Demo，部署 Vercel，链接仅客户可见。

**步骤**：

1. `.env` → `DEMO_ACCESS_PASSWORD=客户临时密码`
2. 改 `ChatDemoPage` 系统提示与模型展示名
3. 配置 `OPENAI_API_KEY`（部署平台环境变量，非 VITE_）
4. 用户确认后 `pnpm deploy:vercel`
5. 验证 `/api/health` 与 `/chat`，告知客户密码

## 示例 3：全新「数据看板」页

**需求**：展示销售 Mock 数据，路径 `/dashboard`。

**步骤**：

1. `mock/sales.json` 准备数据
2. `src/pages/DashboardDemoPage.tsx` + `DemoShell` + `Card` 列表
3. `App.tsx` 注册 `/dashboard`
4. `demo.config.ts` 添加入口
5. `pnpm check`

## 示例 4：从空目录开始

用户工作区无 DemoKit：

```bash
bash .cursor/skills/demokit/scripts/setup.sh ~/projects/my-demo
cd ~/projects/my-demo
# 编辑 .env 与页面
pnpm dev
```

## 示例 5：品牌色浅色主题

1. 与用户确认主色 `#2563eb`
2. `globals.css`：`--accent: #2563eb`，`color-scheme: light`，调整 `body` 背景为浅灰
3. `HomePage.tsx`：按钮 `emerald-*` → `blue-*`
4. `VITE_APP_THEME=brand-blue`
