# k-stock-merchant — Claude 지침

> 대회: Daker 웹 미니게임 챌린지 | 배포: https://dacongame.vercel.app/
> 기획서 마감: 2026-05-26 | 최종 제출: 2026-06-08

---

## 핵심 규칙 (항상 적용)

- 코드·변수명: **영어** / 주석·커밋·소통: **한국어**
- 민감정보(API 키 등): `.env` 관리, 절대 커밋 금지
- AI 행동 원칙 (코딩 전 사고, 단순함, 수술적 변경, 목표 중심) → [`docs/ref/behavioral-principles.md`](docs/ref/behavioral-principles.md)

---

## 팀 Claude 영역 제한 ← 중요

> 배영환·송원호 **양측 모두** Claude Code 사용 — 영역 침범 방지 필수

| 사용자 | 수정 가능 영역 |
|--------|---------------|
| 배영환 | `src/store/`, `src/lib/`, `src/App.jsx`, `src/data/stockData.json`, Supabase 관련 |
| 송원호 | `src/pages/`, `src/components/`, `src/data/newsEvents.json` |

- 영역 외 파일 수정 전 → 카카오톡 먼저 확인
- Props 임의 추가 금지 → `docs/design-docs/props-spec.md` 확인 후 Issue 등록
- 커밋 전 `git status`로 담당 영역 외 파일 포함 여부 확인

상세 협업 플로우 → [`docs/ref/collaboration-rules.md`](docs/ref/collaboration-rules.md)

---

## 모델 사용 규칙

| 작업 유형 | 모델 |
|-----------|------|
| 탐색 / grep / 파일 검색 | Haiku |
| 개발 (코딩, 디버깅, 리팩터링) | Sonnet |
| 설계 / 계획 (Plan 모드) | Opus |

자세한 기준 → [`docs/ref/agent-model-routing.md`](docs/ref/agent-model-routing.md)

---

## 보안 규칙

- `--no-verify`, `curl | sh`, 자격증명 직접 입력 금지 (훅이 차단)
- 모든 Bash 명령은 `logs/claude-audit.log`에 자동 기록됨
- 자세한 보안 정책 → [`docs/SECURITY.md`](docs/SECURITY.md)

---

## 에이전트 사용 규칙

- `agents/` 폴더 에이전트: **병렬 처리 서브태스크** 전용
- Plan 모드로 설계 후 독립적으로 분리 가능한 작업은 반드시 에이전트로 병렬 실행
- 에이전트 분류 기준 → [`agents/LANES.md`](agents/LANES.md)

---

## 작업 흐름

| 상황 | 참조 문서 |
|------|-----------|
| 현재 작업 목록 | [`docs/exec-plans/active/WBS-v2.md`](docs/exec-plans/active/WBS-v2.md) |
| 커밋 작성 | [`docs/ref/commit-convention.md`](docs/ref/commit-convention.md) |
| 협업 규칙 | [`docs/ref/collaboration-rules.md`](docs/ref/collaboration-rules.md) |
| 테스트 전략 | [`docs/ref/testing-patterns.md`](docs/ref/testing-patterns.md) |
| 검증 전략 | [`docs/ref/verification-protocol.md`](docs/ref/verification-protocol.md) |

---

## 컨텍스트 재시작 시 ("다음 작업 하자")

1. `docs/exec-plans/active/WBS-v2.md` 읽기 (단일 진실 공급원)
2. `[🔄]` 항목부터 이어서 진행 / 없으면 `[ ]` 첫 번째 항목 시작

---

## 프로젝트 구조

```
k-stock-merchant/
├── CLAUDE.md                  # 이 파일
├── TODO.md                    # 작업 목록 (WBS-v2.md가 우선)
├── .claude/
│   ├── settings.json          # 권한 + 훅 등록
│   └── hooks/                 # 보안·감사·세션 훅
├── agents/                    # 병렬 에이전트
├── docs/
│   ├── ref/                   # 참조 문서 (필요할 때만 로드)
│   ├── design-docs/           # 아키텍처·Props 명세
│   ├── exec-plans/active/     # WBS-v2.md (단일 진실 공급원)
│   └── product-specs/         # PRD / 기획 문서
├── scripts/                   # pykrx 데이터 수집 등 스크립트
├── src/
│   ├── components/            # 공유 컴포넌트 (Props 명세 필수)
│   ├── data/                  # stockData.json (배영환) / newsEvents.json (송원호)
│   ├── lib/                   # gameLogic.js (배영환)
│   ├── pages/                 # 페이지 컴포넌트 (송원호)
│   └── store/                 # Zustand 스토어 (배영환)
├── logs/                      # gitignore 대상
└── .env                       # gitignore 대상
```

---

## 프로젝트 맞춤 규칙

### Claude 행동 지침

- 핵심 로직에 간결한 주석 추가 (신입 개발자 가독성)
- 단일 파일에 과도한 코드 집중 금지 — 컴포넌트 단위로 반드시 분리
- 의존성 라이브러리 추가 시 사전에 이유 설명 후 승인 필요
- '10분 플레이' 기획: UI 애니메이션 속도 100~200ms 이하 유지

### MVP 범위 제한

> 명시적 요청 없이 절대 구현 금지

- 백엔드 서버 및 별도 DB (랭킹 외 모든 데이터는 로컬 스토리지)
- 소셜 로그인 및 회원가입 시스템
- 실시간 주식 시장 데이터 연동

### 기술 스택 고정

React 18 + Vite + Tailwind CSS + Zustand + Supabase (랭킹만)

> 다른 라이브러리/프레임워크 임의 도입 금지 — 추가 필요 시 반드시 승인 먼저
