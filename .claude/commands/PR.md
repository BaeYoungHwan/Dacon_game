# /PR — PR 자동화

Staged 변경사항을 커밋하고 GitHub PR을 자동으로 생성합니다.
**push 전 반드시 사용자 확인을 받습니다.**

---

## 실행 흐름

### 1단계 — 브랜치 및 staged 변경사항 확인

현재 브랜치가 main 또는 master이면 즉시 중단.
staged 변경사항이 없으면 중단.

### 2단계 — 커밋 (/commit 스킬 호출)

.claude/commands/commit.md 의 /commit 스킬을 실행한다.

### 3단계 — push 확인 (필수)

사용자에게 push 여부 명시적 확인을 받는다.
- no → 커밋은 로컬 유지, PR 생성 중단
- yes → 4단계 진행

### 4단계 — push

git push origin [현재 브랜치]
업스트림 없는 경우: git push -u origin [현재 브랜치]

push 실패 시:
- 권한 거부 → gh auth status 확인
- non-fast-forward → git pull --rebase 후 재시도

### 5단계 — PR 생성

gh pr create --title "[자동 생성된 제목]" --body "..."

gh CLI가 없으면 수동 PR 생성 안내 출력.

### 6단계 — 완료 안내

PR URL 출력.

---

## 주의사항

- main/master 브랜치에서 실행 불가 (settings.json deny 규칙)
- 배포 URL: https://dacongame.vercel.app/
