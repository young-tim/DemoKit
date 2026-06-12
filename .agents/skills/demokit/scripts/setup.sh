#!/usr/bin/env bash
# DemoKit 工程初始化：克隆（如需）、复制 .env、安装依赖
set -euo pipefail

REPO_URL="${DEMOKIT_REPO_URL:-https://github.com/young-tim/DemoKit.git}"
TARGET="${1:-./DemoKit}"

is_demokit_dir() {
  local dir="$1"
  [[ -f "$dir/package.json" ]] && [[ -f "$dir/server/routes.manifest.ts" ]] \
    && grep -q '"demokit-template"' "$dir/package.json" 2>/dev/null
}

if [[ -d "$TARGET" ]] && is_demokit_dir "$TARGET"; then
  echo "✓ 已在 DemoKit 目录: $TARGET（跳过 clone）"
elif [[ -d "$TARGET" ]] && [[ -n "$(ls -A "$TARGET" 2>/dev/null)" ]]; then
  echo "✗ 目录 $TARGET 已存在且不是 DemoKit，请指定空目录或 DemoKit 路径" >&2
  exit 1
else
  echo "→ 克隆 DemoKit 到 $TARGET"
  git clone --depth 1 "$REPO_URL" "$TARGET"
fi

cd "$TARGET"

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "✓ 已创建 .env（请按需修改 VITE_APP_TITLE 等）"
else
  echo "✓ .env 已存在，跳过"
fi

if command -v pnpm >/dev/null 2>&1; then
  pnpm install
elif command -v corepack >/dev/null 2>&1; then
  corepack enable
  corepack prepare pnpm@latest --activate
  pnpm install
else
  echo "⚠ 未找到 pnpm，请安装后在该目录执行: pnpm install" >&2
  exit 1
fi

echo ""
echo "✓ DemoKit 就绪"
echo "  cd $(pwd)"
echo "  pnpm dev    # http://localhost:3000"
