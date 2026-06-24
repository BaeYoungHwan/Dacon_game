#!/bin/bash
# Claude Code 상태바 훅
# 설치: bash global-setup/install.sh → ~/.claude/hooks/context-bar.sh
# 표시: claude-sonnet-4-6 | 📁 Dacon_game | 🔀 develop (0 uncommitted, synced) | ████░ ~12% of 200k

COLOR="blue"

C_RESET=$'\033[0m'
C_GRAY=$'\033[38;5;245m'
C_BAR_EMPTY=$'\033[38;5;238m'
case "$COLOR" in
    orange)   C_ACCENT=$'\033[38;5;173m' ;;
    blue)     C_ACCENT=$'\033[38;5;74m' ;;
    teal)     C_ACCENT=$'\033[38;5;66m' ;;
    green)    C_ACCENT=$'\033[38;5;71m' ;;
    lavender) C_ACCENT=$'\033[38;5;139m' ;;
    rose)     C_ACCENT=$'\033[38;5;132m' ;;
    gold)     C_ACCENT=$'\033[38;5;136m' ;;
    slate)    C_ACCENT=$'\033[38;5;60m' ;;
    cyan)     C_ACCENT=$'\033[38;5;37m' ;;
    *)        C_ACCENT="$C_GRAY" ;;
esac

input=$(cat)

if ! command -v jq &>/dev/null; then
  printf '%s\n' "${C_ACCENT}Claude${C_GRAY} | jq 미설치 — choco install jq${C_RESET}"
  exit 0
fi

model=$(echo "$input" | jq -r '.model.display_name // .model.id // "?"')
cwd=$(echo "$input" | jq -r '.cwd // empty')
dir=$(basename "$cwd" 2>/dev/null || echo "?")
max_context=$(echo "$input" | jq -r '.context_window.context_window_size // 200000')
transcript_path=$(echo "$input" | jq -r '.transcript_path // empty')

branch=""
git_status=""
if [[ -n "$cwd" && -d "$cwd" ]]; then
    branch=$(git -C "$cwd" branch --show-current 2>/dev/null)
    if [[ -n "$branch" ]]; then
        file_count=$(git -C "$cwd" --no-optional-locks status --porcelain 2>/dev/null | wc -l | tr -d ' ')
        upstream=$(git -C "$cwd" rev-parse --abbrev-ref @{upstream} 2>/dev/null)
        if [[ -n "$upstream" ]]; then
            counts=$(git -C "$cwd" rev-list --left-right --count HEAD...@{upstream} 2>/dev/null)
            ahead=$(echo "$counts" | cut -f1)
            behind=$(echo "$counts" | cut -f2)
            if [[ "$ahead" -eq 0 && "$behind" -eq 0 ]]; then sync="synced"
            elif [[ "$ahead" -gt 0 && "$behind" -eq 0 ]]; then sync="${ahead} ahead"
            elif [[ "$ahead" -eq 0 && "$behind" -gt 0 ]]; then sync="${behind} behind"
            else sync="${ahead} ahead, ${behind} behind"
            fi
        else
            sync="no upstream"
        fi
        if [[ "$file_count" -eq 0 ]]; then
            git_status="(0 uncommitted, $sync)"
        else
            git_status="(${file_count} files uncommitted, $sync)"
        fi
    fi
fi

max_k=$((max_context / 1000))
[[ $max_k -ge 1000 ]] && max_display="$((max_k / 1000))M" || max_display="${max_k}k"

if [[ -n "$transcript_path" && -f "$transcript_path" ]]; then
    ctx_len=$(jq -s 'map(select(.message.usage and .isSidechain != true)) | last | if . then (.message.usage.input_tokens // 0) + (.message.usage.cache_read_input_tokens // 0) else 0 end' < "$transcript_path")
    [[ "$ctx_len" -gt 0 ]] && { pct=$((ctx_len * 100 / max_context)); pfx=""; } || { pct=$((20000 * 100 / max_context)); pfx="~"; }
else
    pct=$((20000 * 100 / max_context)); pfx="~"
fi
[[ $pct -gt 100 ]] && pct=100

bar=""
for ((i=0; i<10; i++)); do
    p=$((pct - i * 10))
    [[ $p -ge 8 ]] && bar+="${C_ACCENT}█${C_RESET}" || { [[ $p -ge 3 ]] && bar+="${C_ACCENT}▄${C_RESET}" || bar+="${C_BAR_EMPTY}░${C_RESET}"; }
done

out="${C_ACCENT}${model}${C_GRAY} | 📁 ${dir}"
[[ -n "$branch" ]] && out+=" | 🔀 ${branch} ${git_status}"
out+=" | ${bar} ${C_GRAY}${pfx}${pct}% of ${max_display} tokens${C_RESET}"

printf '%s\n' "$out"
