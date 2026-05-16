#!/usr/bin/env python3
"""
executor.py - WBS 체크박스 자동 실행 엔진

사용법:
    python scripts/executor.py --plan docs/exec-plans/active/WBS-v2.md
    python scripts/executor.py --plan docs/exec-plans/active/WBS-v2.md --dry-run
    python scripts/executor.py --plan docs/exec-plans/active/WBS-v2.md --retry-failed
"""

import argparse
import json
import subprocess
import sys
import re
from pathlib import Path
from datetime import datetime

STATE_DIR = Path(__file__).parent.parent / "logs"


def parse_plan(plan_path: str) -> list[dict]:
    path = Path(plan_path)
    if not path.exists():
        print(f"❌ 계획 파일 없음: {plan_path}", file=sys.stderr)
        sys.exit(1)
    tasks = []
    with open(path, encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            match = re.match(r"^- \[([\s🔄])\] (.+)", line.strip())
            if match:
                status_char = match.group(1)
                description = match.group(2)
                tasks.append({
                    "line": i,
                    "description": description,
                    "status": "running" if status_char == "🔄" else "pending",
                })
    return tasks


def get_state_file(plan_path: str) -> Path:
    return STATE_DIR / f"executor-{Path(plan_path).stem}.json"


def load_state(state_file: Path) -> dict:
    if not state_file.exists():
        return {"tasks": {}}
    try:
        with open(state_file, encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {"tasks": {}}


def save_state(state_file: Path, state: dict) -> None:
    with open(state_file, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def run_task(task: dict, dry_run: bool = False, timeout: int = 300) -> bool:
    description = task["description"]
    prompt = f"다음 작업을 완료하세요:

{description}

완료 후 결과를 간략히 요약해주세요."
    print(f"
🔄 실행 중: {description}")
    print(f"   시작: {datetime.now().strftime('%H:%M:%S')}")

    if dry_run:
        print(f"   [DRY-RUN] claude -p '{prompt[:50]}...'")
        return True

    try:
        result = subprocess.run(
            ["claude", "-p", prompt],
            capture_output=True, text=True, timeout=timeout, encoding="utf-8",
        )
        if result.returncode == 0:
            print(f"   ✅ 완료: {datetime.now().strftime('%H:%M:%S')}")
            if result.stdout:
                for line in result.stdout.strip().split("
")[:3]:
                    print(f"   {line}")
            return True
        else:
            print(f"   ❌ 실패 (exit {result.returncode})")
            if result.stderr:
                print(f"   에러: {result.stderr[:200]}")
            return False
    except subprocess.TimeoutExpired:
        print(f"   ⏰ 타임아웃 ({timeout}초 초과)")
        return False
    except FileNotFoundError:
        print("   ❌ claude CLI 없음. Claude Code가 설치되어 있는지 확인하세요.")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="WBS 체크박스 자동 실행 엔진")
    parser.add_argument("--plan", required=True, help="실행 계획 파일 경로")
    parser.add_argument("--dry-run", action="store_true", help="실제 실행 없이 계획만 출력")
    parser.add_argument("--retry-failed", action="store_true", help="실패한 태스크만 재실행")
    parser.add_argument("--timeout", type=int, default=300, help="태스크당 타임아웃 초 (기본값: 300)")
    args = parser.parse_args()

    try:
        STATE_DIR.mkdir(exist_ok=True)
    except OSError as e:
        print(f"❌ logs 디렉토리 생성 실패: {e}", file=sys.stderr)
        sys.exit(1)

    tasks = parse_plan(args.plan)
    if not tasks:
        print("✅ 미완료 작업이 없습니다.")
        return

    state_file = get_state_file(args.plan)
    state = load_state(state_file)
    print(f"
📋 실행 계획: {args.plan}")
    print(f"   미완료 작업 수: {len(tasks)}")
    if args.dry_run:
        print("   [DRY-RUN 모드]")

    results = {"done": 0, "failed": 0, "skipped": 0}

    for task in tasks:
        task_key = f"line_{task['line']}"
        prev_status = state["tasks"].get(task_key, {}).get("status")
        if prev_status == "done":
            results["skipped"] += 1
            continue
        if args.retry_failed and prev_status != "failed":
            results["skipped"] += 1
            continue

        success = run_task(task, dry_run=args.dry_run, timeout=args.timeout)
        state["tasks"][task_key] = {
            "description": task["description"],
            "status": "done" if success else "failed",
            "timestamp": datetime.now().isoformat(),
        }
        try:
            save_state(state_file, state)
        except OSError as e:
            print(f"   ⚠️  상태 저장 실패: {e}", file=sys.stderr)

        if success:
            results["done"] += 1
        else:
            results["failed"] += 1
            print(f"
⚠️  실패한 태스크가 있습니다. 계속 진행합니까? (y/N): ", end="")
            if not args.dry_run:
                try:
                    answer = input().strip().lower()
                except EOFError:
                    print("중단됩니다."); break
                if answer != "y":
                    print("중단됩니다."); break

    print(f"
{'='*40}")
    print(f"실행 완료: ✅ {results['done']} | ❌ {results['failed']} | ⏭️ {results['skipped']}")
    print(f"상태 저장: {state_file}")
    if results["failed"] > 0:
        print(f"
실패 재실행: python scripts/executor.py --plan {args.plan} --retry-failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
