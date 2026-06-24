#!/usr/bin/env bash
# global-setup/install.sh
# context-bar.sh와 notify.ps1을 ~/.claude/hooks/에 설치합니다.
# 사용법: bash global-setup/install.sh (Git Bash 필요)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
HOOKS_DIR="$CLAUDE_DIR/hooks"

echo "=== Claude Code 전역 훅 설치 ==="

mkdir -p "$HOOKS_DIR"

echo "[1/3] Hook 파일 복사..."
cp "$SCRIPT_DIR/context-bar.sh" "$HOOKS_DIR/context-bar.sh"
cp "$SCRIPT_DIR/notify.ps1"     "$HOOKS_DIR/notify.ps1"
chmod +x "$HOOKS_DIR/context-bar.sh"
echo "  context-bar.sh, notify.ps1 → $HOOKS_DIR/"

echo ""
echo "[2/3] ~/.claude/settings.json 에 추가할 훅:"
cat << SETTINGS_EOF
  "hooks": {
    "PreToolUse": [
      { "matcher": ".*", "hooks": [{ "type": "command", "command": "bash ~/.claude/hooks/context-bar.sh" }] }
    ],
    "Stop": [
      { "hooks": [{ "type": "command", "command": "powershell -File ~/.claude/hooks/notify.ps1", "async": true }] }
    ]
  }
SETTINGS_EOF

echo ""
echo "[3/3] 설치 결과"
for f in context-bar.sh notify.ps1; do
    [[ -f "$HOOKS_DIR/$f" ]] && echo "  ✓ $f" || echo "  ✗ $f (실패)"
done

echo "=== 완료 — Claude Code 재시작 후 활성화 ==="
