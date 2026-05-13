# k-stock-merchant WBS v1.0

> 프로젝트: k-stock-merchant | 작성자: 배영환 | 작성일: 2026-05-13
> 전체 기간: 2026-05-13 ~ 2026-05-18 (5일)
> 팀: 배영환 (3년차 + Claude Code) / 신입 (초급 React)
> 협업: PR 기반 코드 리뷰 | 브랜치: feature/* → master

---

## 확정 화면 설계 (v1 — 2026-05-13)

> 화면구상 초안 기반 확정. `docs/ref_user/화면구상 초안.txt` 참조.

| # | 화면 | 파일 | 핵심 내용 |
|---|------|------|-----------|
| 0 | StartPage | `src/pages/StartPage.jsx` | 닉네임 입력, 새 게임 / 이어하기 (localStorage) |
| 1 | MainPage | `src/pages/MainPage.jsx` | 잔고, 보유종목 전주 대비 등락률, 라운드, 등급 목표, 장소 이동 버튼 |
| 2 | MarketPage | `src/pages/MarketPage.jsx` | 월스트리트 거래소 — 랜덤 선택된 10종목 분석·매수·매도 |
| 3 | InfoMerchantModal | `src/components/merchant/InfoMerchantModal.jsx` | 정보상 — 국제뉴스, 기업뉴스, 추천종목 (가격 라운드마다 변동) |
| 4 | TechMerchantModal | `src/components/merchant/TechMerchantModal.jsx` | 기술상 — 제외된 10종목 중 일부 유료 공개 (보너스 투자처) |
| 5 | RoundResultModal | `src/components/game/RoundResultModal.jsx` | 라운드 종료 — 수익/손실 요약, 다음 라운드 진행 |
| 6 | EndPage | `src/pages/EndPage.jsx` | 최종 등급 + 랭킹 등록 (Supabase) |

**종목 데이터**: 20개 하드코딩 → 새 게임 시작 시 랜덤 10개 선택(메인), 나머지 10개는 기술상에서 유료 공개

---

## 전체 진행률

| 구분 | 태스크 수 | 완료 | 진척도 |
|------|-----------|------|--------|
| 1.1 분석/기획 | 3 | 3 | 100% |
| 1.2 설계 | 3 | 0 | 0% |
| 1.3 P0 기반 구축 | 7 | 0 | 0% |
| 1.4 P1 핵심 기능 | 14 | 0 | 0% |
| 1.5 P1 통합 | 7 | 0 | 0% |
| 1.6 P2 QA + 배포 | 6 | 0 | 0% |
| 1.7 버퍼 | 2 | 0 | 0% |
| **전체** | **42** | **3** | **7.1%** |

---

## 범례

- 상태: `완료` / `진행중` / `대기`
- 담당자: `배영환` / `신입` / `공통`
- 접두어: `[공용]` `[Front]` `[Back]` `[통합]` `[QA]` `[배포]`
- 우선순위: `P0 (차단)` `P1 (필수)` `P2 (중요)` `P3 (선택)`

---

## 1.1 분석 / 기획 (AD)

> 기간: 2026-05-13 | 완료

| WBS | 태스크 | 담당자 | 상태 | 계획 시작 | 계획 종료 | 기간 | 산출물 | 우선순위 |
|-----|--------|--------|------|-----------|-----------|------|--------|----------|
| 1.1.1 | PRD 작성 v1.1 | 배영환 | 완료 | 05/13 | 05/13 | 1 | PRD-v1.md | P0 |
| 1.1.2 | 아키텍처 설계 | 배영환 | 완료 | 05/13 | 05/13 | 1 | architecture-v1.md, ARD-v1.md | P0 |
| 1.1.3 | WBS 작성 v1 | 배영환 | 완료 | 05/13 | 05/13 | 1 | WBS-v1.md | P0 |

---

## 1.2 설계 (TD)

> 기간: 2026-05-13 (Day 1 오전) | 담당: 배영환 + 신입 병렬

| WBS | 태스크 | 담당자 | 상태 | 계획 시작 | 계획 종료 | 기간 | 산출물 | 우선순위 |
|-----|--------|--------|------|-----------|-----------|------|--------|----------|
| 1.2.1 | [공용] 컴포넌트 Props 명세 작성 | 배영환 | 대기 | 05/13 | 05/13 | 0.5 | props-spec.md (신입에게 전달) | P0 |
| 1.2.2 | [Front] 화면 와이어프레임 스케치 | 신입 | 대기 | 05/13 | 05/13 | 0.5 | 와이어프레임 (화이트보드/Figma) | P1 |
| 1.2.3 | [Back] Supabase 스키마 설계 | 배영환 | 대기 | 05/13 | 05/13 | 0.5 | rankings 테이블 DDL | P0 |

---

## 1.3 P0 — 기반 구축

> 기간: 2026-05-13 (Day 1) | 목표: 배포 가능한 Hello World + 데이터 준비 완료

| WBS | 태스크 | 담당자 | 상태 | 계획 시작 | 계획 종료 | 기간(일) | 산출물 | 우선순위 |
|-----|--------|--------|------|-----------|-----------|----------|--------|----------|
| 1.3.1 | [공용] Vite + React 18 + Tailwind CSS 초기화 | 배영환 | 대기 | 05/13 | 05/13 | 1 | package.json, vite.config.js | P0 |
| 1.3.2 | [공용] 폴더 구조 생성 (src/pages, components, store, data, lib) | 배영환 | 대기 | 05/13 | 05/13 | 1 | 디렉토리 구조 | P0 |
| 1.3.3 | [공용] stocks.json 작성 (종목 20개 하드코딩 — 네이버 금융 참조; 새 게임 시작 시 랜덤 10개 선택) | 신입 | 대기 | 05/13 | 05/13 | 1 | src/data/stocks.json | P0 |
| 1.3.4 | [공용] news-events.json 작성 (호재/악재 30개, 실제 이벤트 패턴 참조) | 신입 | 대기 | 05/13 | 05/13 | 1 | src/data/news-events.json | P0 |
| 1.3.5 | [Back] Supabase 프로젝트 생성 + rankings 테이블 + RLS 설정 | 배영환 | 대기 | 05/13 | 05/13 | 1 | Supabase 프로젝트, .env | P0 |
| 1.3.6 | [배포] Vercel 연결 + Hello World 배포 확인 | 배영환 | 대기 | 05/13 | 05/13 | 1 | Vercel 프리뷰 URL | P0 |
| 1.3.7 | [Front] 공용 UI 컴포넌트 (Button.jsx, Modal.jsx) | 신입 | 대기 | 05/13 | 05/13 | 1 | src/components/ui/ | P1 |

---

## 1.4 P1 — 핵심 기능 개발

> 기간: 2026-05-14 (Day 2) | 목표: 게임 로직 완성 + UI 컴포넌트 퍼블리싱 병렬

| WBS | 태스크 | 담당자 | 상태 | 계획 시작 | 계획 종료 | 기간(일) | 산출물 | 우선순위 |
|-----|--------|--------|------|-----------|-----------|----------|--------|----------|
| 1.4.1 | [공용] gameStore 구현 (Zustand — 턴, 현금, 포트폴리오, 주가, persist) | 배영환 | 대기 | 05/14 | 05/14 | 1 | src/store/gameStore.js | P0 |
| 1.4.2 | [공용] gameLogic.js — 턴 진행 + 가격 변동 알고리즘 + 게임 시작 시 랜덤 10종목 선택(pickStocks) | 배영환 | 대기 | 05/14 | 05/14 | 1 | src/lib/gameLogic.js | P0 |
| 1.4.3 | [공용] 매수/매도 로직 구현 (buyStock, sellStock) | 배영환 | 대기 | 05/14 | 05/14 | 1 | gameStore.js 업데이트 | P0 |
| 1.4.4 | [공용] 로직 동작 검증 — UI 없이 콘솔 테스트 (이 시점에 게임이 돌아가야 함) | 배영환 | 대기 | 05/14 | 05/14 | 1 | 콘솔 출력 확인 | P0 |
| 1.4.5 | [Front] StartPage 구현 (닉네임 입력 + 새 게임 / 이어하기 버튼, localStorage 연동) | 신입 | 대기 | 05/14 | 05/14 | 1 | src/pages/StartPage.jsx | P0 |
| 1.4.6 | [Front] MainPage 레이아웃 골격 (잔고, 보유종목 등락률, 라운드, 등급 표시 + 장소 이동 버튼) | 신입 | 대기 | 05/14 | 05/14 | 1 | src/pages/MainPage.jsx | P1 |
| 1.4.7 | [Front] StockBoard 컴포넌트 (종목 목록 + 가격 + 등락률 표시) | 신입 | 대기 | 05/14 | 05/15 | 1 | src/components/game/StockBoard.jsx | P0 |
| 1.4.8 | [Front] NewsPanel 컴포넌트 (뉴스 헤드라인 텍스트 출력) | 신입 | 대기 | 05/14 | 05/15 | 1 | src/components/game/NewsPanel.jsx | P1 |
| 1.4.9 | [Front] TurnControl 컴포넌트 (다음 날 버튼 + 날짜/턴 카운터) | 신입 | 대기 | 05/14 | 05/15 | 1 | src/components/game/TurnControl.jsx | P0 |
| 1.4.10 | [Front] Portfolio 컴포넌트 (보유 주식 목록 + 현금 잔액) | 신입 | 대기 | 05/14 | 05/15 | 1 | src/components/game/Portfolio.jsx | P0 |
| 1.4.11 | [Front] MarketPage 구현 (월스트리트 거래소 — 10종목 분석·매수·매도) | 신입 | 대기 | 05/14 | 05/15 | 1 | src/pages/MarketPage.jsx | P0 |
| 1.4.12 | [Front] InfoMerchantModal 구현 (정보상 — 국제뉴스·기업뉴스·추천종목, 라운드별 가격 변동) | 신입 | 대기 | 05/14 | 05/15 | 1 | src/components/merchant/InfoMerchantModal.jsx | P1 |
| 1.4.13 | [Front] TechMerchantModal 구현 (기술상 — 제외된 10종목 중 일부 유료 공개) | 신입 | 대기 | 05/14 | 05/15 | 1 | src/components/merchant/TechMerchantModal.jsx | P1 |
| 1.4.14 | [Front] RoundResultModal 구현 (라운드 종료 — 수익/손실 요약, 다음 라운드 버튼) | 신입 | 대기 | 05/14 | 05/15 | 1 | src/components/game/RoundResultModal.jsx | P1 |

---

## 1.5 P1 — 통합 및 연동

> 기간: 2026-05-15 (Day 3) | 목표: 로직 + UI 병합 → 게임 완전 동작

| WBS | 태스크 | 담당자 | 상태 | 계획 시작 | 계획 종료 | 기간(일) | 산출물 | 우선순위 |
|-----|--------|--------|------|-----------|-----------|----------|--------|----------|
| 1.5.1 | [통합] App.jsx 페이지 전환 로직 (Start → Main ↔ Market/InfoMerchant/TechMerchant → RoundResult → End) | 배영환 | 대기 | 05/15 | 05/15 | 1 | src/App.jsx | P0 |
| 1.5.2 | [통합] MainPage/MarketPage에 gameStore 연결 (신입 컴포넌트 + 로직 연동) | 배영환 | 대기 | 05/15 | 05/15 | 1 | MainPage.jsx, MarketPage.jsx 업데이트 | P0 |
| 1.5.3 | [Back] leaderboardStore + Supabase insert/select 구현 | 배영환 | 대기 | 05/15 | 05/15 | 1 | src/store/leaderboardStore.js | P1 |
| 1.5.4 | [공용] localStorage persist 연동 (새로고침 복구) | 배영환 | 대기 | 05/15 | 05/15 | 1 | gameStore.js persist 미들웨어 | P1 |
| 1.5.5 | [Front] ResultPage 구현 (최종 자산 + 등급 표시) | 신입 | 대기 | 05/15 | 05/15 | 1 | src/pages/ResultPage.jsx | P0 |
| 1.5.6 | [Front] Leaderboard 컴포넌트 UI (순위 테이블) | 신입 | 대기 | 05/15 | 05/15 | 1 | src/components/leaderboard/Leaderboard.jsx | P1 |
| 1.5.7 | [통합] 통합 버그 수정 + PR 리뷰 (신입 Day 2~3 작업 리뷰) | 배영환 | 대기 | 05/15 | 05/15 | 1 | 버그 수정 커밋 | P0 |

---

## 1.6 P2 — QA 및 배포

> 기간: 2026-05-16 (Day 4) | 목표: 게임 완성도 + 프로덕션 배포

| WBS | 태스크 | 담당자 | 상태 | 계획 시작 | 계획 종료 | 기간(일) | 산출물 | 우선순위 |
|-----|--------|--------|------|-----------|-----------|----------|--------|----------|
| 1.6.1 | [QA] 게임 밸런스 플레이테스트 (5~10분 확인, 초기 자본·턴수 조정) | 공통 | 대기 | 05/16 | 05/16 | 1 | 수치 조정 커밋 | P0 |
| 1.6.2 | [Front] 조건부 스타일링 (상승 빨강, 하락 파랑, 애니메이션 100~200ms) | 신입 | 대기 | 05/16 | 05/16 | 1 | 스타일 업데이트 | P1 |
| 1.6.3 | [Front] 반응형 UI 최종 적용 (모바일 375px 기준) | 신입 | 대기 | 05/16 | 05/16 | 1 | 반응형 확인 | P1 |
| 1.6.4 | [배포] Vercel 환경변수 등록 + 프로덕션 배포 | 배영환 | 대기 | 05/16 | 05/16 | 1 | 프로덕션 URL | P0 |
| 1.6.5 | [QA] Lighthouse 성능 점수 확인 (목표: 90+) | 배영환 | 대기 | 05/16 | 05/16 | 1 | Lighthouse 리포트 | P2 |
| 1.6.6 | [QA] Supabase RLS 동작 최종 확인 | 배영환 | 대기 | 05/16 | 05/16 | 1 | 보안 체크리스트 | P1 |

---

## 1.7 버퍼

> 기간: 2026-05-17 (Day 5) | 목표: 예상치 못한 이슈 대응 + 최종 확인

| WBS | 태스크 | 담당자 | 상태 | 계획 시작 | 계획 종료 | 기간(일) | 산출물 | 우선순위 |
|-----|--------|--------|------|-----------|-----------|----------|--------|----------|
| 1.7.1 | [QA] 최종 크로스 브라우저/기기 테스트 + 잔여 버그 수정 | 공통 | 대기 | 05/17 | 05/17 | 1 | 최종 확인 체크리스트 | P1 |
| 1.7.2 | [배포] 최종 재배포 + 마감 제출 준비 | 배영환 | 대기 | 05/17 | 05/17 | 1 | 최종 배포 URL | P0 |

---

## 브랜치 전략

| 브랜치 | 담당자 | 연결 태스크 |
|--------|--------|-------------|
| `feature/p0-setup` | 배영환 | 1.3.1~1.3.6 |
| `feature/p0-data` | 신입 | 1.3.3~1.3.4 |
| `feature/p0-ui-common` | 신입 | 1.3.7 |
| `feature/p1-game-logic` | 배영환 | 1.4.1~1.4.4 |
| `feature/p1-ui-pages` | 신입 | 1.4.5~1.4.6 |
| `feature/p1-ui-components` | 신입 | 1.4.7~1.4.10 |
| `feature/p1-ui-merchants` | 신입 | 1.4.11~1.4.14 |
| `feature/p1-integration` | 배영환 | 1.5.1~1.5.4, 1.5.7 |
| `feature/p1-ui-result` | 신입 | 1.5.5~1.5.6 |
| `feature/p2-polish` | 신입 | 1.6.2~1.6.3 |

> PR 규칙: 신입 → master PR 생성 → 배영환 리뷰 후 merge

---

## 역할 요약

| 영역 | 배영환 (본인 + Claude) | 신입 |
|------|----------------------|------|
| 프로젝트 세팅 | Vite 초기화, 폴더 구조 | 환경 동기화 |
| 데이터 | gameLogic, gameStore | stocks.json, news-events.json |
| UI | App.jsx 라우팅, store 연결 | 모든 컴포넌트·페이지·상점 모달 퍼블리싱 |
| 백엔드 | Supabase 설정 + leaderboardStore | - |
| 통합 | GamePage store 연결, 버그 수정 | ResultPage, Leaderboard UI |
| QA/배포 | Vercel 배포, Lighthouse | 반응형, 스타일 폴리싱, 플레이테스트 |
