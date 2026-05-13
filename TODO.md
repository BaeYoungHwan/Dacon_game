# TODO — k-stock-merchant

> 워크플로우: `[ ]` 대기 → `[🔄]` 진행 중 → `[x]` 완료
> 재시작 시: `docs/ref/session-state.md` 확인 후 `[🔄]` 항목부터 재개

---

## 시작 전

- [x] `/init-project` 실행 완료
- [ ] `docs/design-docs/architecture-v1.md` 검토 및 확정
- [ ] `docs/design-docs/ARD-v1.md` 비기능 요건 확정
- [ ] Phase 분할 후 `docs/exec-plans/active/`에 실행 계획 생성

---

## P0 — 기반 구축

- [ ] Vite + React 18 + Tailwind CSS 프로젝트 초기화
- [ ] Zustand, @supabase/supabase-js 설치
- [ ] 폴더 구조 생성 (src/pages, src/components/game, src/store, src/data, src/lib)
- [ ] Supabase 프로젝트 생성 및 rankings 테이블 스키마 설정
- [ ] .env 파일 설정 (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] Vercel 배포 연결 및 Hello World 확인

---

## P1 — MVP 핵심 기능

- [ ] 게임 데이터 JSON 작성 (stocks.json — 종목 10개 내외)
- [ ] 게임 데이터 JSON 작성 (news-events.json — 호재/악재 이벤트 30개 내외)
- [ ] gameStore 구현 (Zustand — 턴, 현금, 포트폴리오, 주가, persist)
- [ ] gameLogic.js 구현 (턴 진행, 가격 변동 알고리즘)
- [ ] 매수/매도 로직 구현
- [ ] 로컬 스토리지 연동 (새로고침 후 복구)
- [ ] StartPage 구현 (닉네임 입력, 게임 규칙 안내)
- [ ] GamePage 구현 (StockBoard, NewsPanel, Portfolio, TurnControl)
- [ ] ResultPage 구현 (최종 자산 평가, 등급 표시)
- [ ] Leaderboard 컴포넌트 구현 (Supabase INSERT/SELECT)
- [ ] 반응형 UI 적용 (모바일/PC Tailwind 모바일 퍼스트)

---

## P2 — 검증 및 배포

- [ ] 게임 밸런스 플레이테스트 (5~10분 타임 확인)
- [ ] UI 애니메이션 속도 조정 (100~200ms 이하 확인)
- [ ] Lighthouse 성능 점수 확인 (초기 로딩 90+)
- [ ] 모바일(375px) 레이아웃 정상 표시 확인
- [ ] Supabase RLS 설정 확인
- [ ] Vercel 프로덕션 배포 및 환경변수 등록
- [ ] KPI 측정 기준 설정

---

## 대회 제출 (Daker 웹 미니게임 챌린지)

- [ ] 기획서 PDF 작성 및 제출 (마감: 2026-05-26 오전 10시)
- [ ] 배포 URL 외부 접속 확인 (심사 기간 내 유지)
- [ ] GitHub 저장소 공개(public) 설정 확인
- [ ] 시연 영상 촬영 — 시작화면 → 핵심 플레이 → 종료화면 전 단계 포함
- [ ] 유튜브 업로드 후 링크 확보
- [ ] 최종산출물 제출 (마감: 2026-06-08 오전 10시)
