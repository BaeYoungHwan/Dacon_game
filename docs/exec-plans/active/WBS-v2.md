# k-stock-merchant WBS v2.0

> 프로젝트: k-stock-merchant | 작성자: 배영환 | 작성일: 2026-05-13 | 최종 업데이트: 2026-05-14 (송원호 UI 폴리시·인터랙션 12종 추가 반영)
> 전체 기간: 2026-05-13 ~ 2026-05-18 (5일)
> 팀: 배영환 (3년차 + Claude Code) / 송원호 (초급 React)
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
| 1.2 설계 | 3 | 3 | 100% |
| 1.3 P0 기반 구축 | 7 | 7 | 100% |
| 1.4 P1 핵심 기능 | 27 | 24 | 88.9% (1개 진행중 · 3개 대체됨) |
| 1.5 P1 통합 | 8 | 8 | 100% |
| 1.6 P2 QA + 배포 | 6 | 2 | 33.3% (1개 진행중) |
| 1.7 버퍼 | 2 | 0 | 0% |
| **전체** | **56** | **47** | **83.9%** |

---

## 범례

- 상태: `완료` / `진행중` / `대기`
- 진척도: `완료=100%` / `진행중=50%` / `대기=0%`
- 담당자: `배영환` / `송원호` / `공통`
- 접두어: `[공용]` `[Front]` `[Back]` `[통합]` `[QA]` `[배포]`
- 우선순위: `P0 (차단)` `P1 (필수)` `P2 (중요)` `P3 (선택)`

---

## 1.1 분석 / 기획 (AD)

> 기간: 2026-05-13 | 완료

| WBS | 태스크 | 담당자 | 상태 | 진척도 | 계획 시작 | 계획 종료 | 기간 | 산출물 | 우선순위 |
|-----|--------|--------|------|--------|-----------|-----------|------|--------|----------|
| 1.1.1 | PRD 작성 v1.1 | 배영환 | 완료 | 100% | 05/13 | 05/13 | 1 | PRD-v1.md | P0 |
| 1.1.2 | 아키텍처 설계 | 배영환 | 완료 | 100% | 05/13 | 05/13 | 1 | architecture-v1.md, ARD-v1.md | P0 |
| 1.1.3 | WBS 작성 v1 (원본) | 배영환 | 완료 | 100% | 05/13 | 05/13 | 1 | WBS-v1.md | P0 |

---

## 1.2 설계 (TD)

> 기간: 2026-05-13 (Day 1 오전) | 담당: 배영환 + 송원호 병렬

| WBS | 태스크 | 담당자 | 상태 | 진척도 | 계획 시작 | 계획 종료 | 기간 | 산출물 | 우선순위 |
|-----|--------|--------|------|--------|-----------|-----------|------|--------|----------|
| 1.2.1 | [공용] 컴포넌트 Props 명세 작성 | 배영환 | 완료 | 100% | 05/13 | 05/13 | 0.5 | props-spec.md (송원호에게 전달) | P0 |
| 1.2.2 | [Front] 화면 와이어프레임 스케치 | 송원호 | 완료 | 100% | 05/13 | 05/13 | 0.5 | 와이어프레임 (화이트보드/Figma) | P1 |
| 1.2.3 | [Back] Supabase 스키마 설계 | 배영환 | 완료 | 100% | 05/13 | 05/13 | 0.5 | rankings 테이블 DDL | P0 |

---

## 1.3 P0 — 기반 구축

> 기간: 2026-05-13 (Day 1) | 목표: 배포 가능한 Hello World + 데이터 준비 완료

| WBS | 태스크 | 담당자 | 상태 | 진척도 | 계획 시작 | 계획 종료 | 기간(일) | 산출물 | 우선순위 |
|-----|--------|--------|------|--------|-----------|-----------|----------|--------|----------|
| 1.3.1 | [공용] Vite + React 18 + Tailwind CSS 초기화 | 배영환 | 완료 | 100% | 05/13 | 05/13 | 1 | package.json, vite.config.js | P0 |
| 1.3.2 | [공용] 폴더 구조 생성 (src/pages, components, store, data, lib) | 배영환 | 완료 | 100% | 05/13 | 05/13 | 1 | 디렉토리 구조 | P0 |
| 1.3.3 | [공용] stocks.json 작성 (종목 20개 하드코딩 — 네이버 금융 참조; 새 게임 시작 시 랜덤 10개 선택) | 송원호 | 완료 | 100% | 05/13 | 05/13 | 1 | src/data/stocks.json | P0 |
| 1.3.4 | [공용] news-events.json 85개 확장 (21개 섹터, date 기반 매칭, 기업/국제 분리) | 배영환 | 완료 | 100% | 05/13 | 05/14 | 1 | src/data/news-events.json | P0 |
| 1.3.5 | [Back] Supabase 프로젝트 생성 + rankings 테이블 + RLS 설정 | 배영환 | 완료 | 100% | 05/13 | 05/13 | 1 | Supabase 프로젝트, .env | P0 |
| 1.3.6 | [배포] Vercel 연결 + Hello World 배포 확인 | 배영환 | 완료 | 100% | 05/13 | 05/13 | 1 | Vercel 프리뷰 URL | P0 |
| 1.3.7 | [Front] 공용 UI 컴포넌트 (Button.jsx, Modal.jsx) | 송원호 | 완료 | 100% | 05/13 | 05/13 | 1 | src/components/ui/ | P1 |

---

## 1.4 P1 — 핵심 기능 개발

> 기간: 2026-05-14 (Day 2) | 목표: 게임 로직 완성 + UI 컴포넌트 퍼블리싱 병렬

| WBS | 태스크 | 담당자 | 상태 | 진척도 | 계획 시작 | 계획 종료 | 기간(일) | 산출물 | 우선순위 |
|-----|--------|--------|------|--------|-----------|-----------|----------|--------|----------|
| 1.4.1 | [공용] gameStore 구현 (Zustand — 턴, 현금, 포트폴리오, 주가, persist) | 배영환 | 완료 | 100% | 05/14 | 05/14 | 1 | src/store/gameStore.js | P0 |
| 1.4.2 | [공용] gameLogic.js — 주봉 재생 + CompanyNews/GlobalNews 분리 반환 완료 | 배영환 | 완료 | 100% | 05/14 | 05/14 | 1 | src/lib/gameLogic.js | P0 |
| 1.4.3 | [공용] 매수/매도 로직 구현 (buyStock, sellStock) | 배영환 | 완료 | 100% | 05/14 | 05/14 | 1 | gameStore.js 업데이트 | P0 |
| 1.4.4 | [공용] 로직 동작 검증 — UI 없이 콘솔 테스트 (이 시점에 게임이 돌아가야 함) | 배영환 | 완료 | 100% | 05/14 | 05/14 | 1 | 콘솔 출력 확인 | P0 |
| 1.4.5 | [Front] StartPage 구현 (닉네임 입력 + 새 게임 / 이어하기 버튼, localStorage 연동) | 송원호 | 완료 | 100% | 05/14 | 05/14 | 1 | src/pages/StartPage.jsx | P0 |
| 1.4.6 | [Front] GamePage 전면 리뉴얼 — NYSE 거래소 배경 + NPC 3 클릭(navigateTo) + 좌측 자산 카드 + 우상단 IconButton + 라운드 전환 애니메이션 통합 | 송원호 | 완료 | 100% | 05/14 | 05/14 | 1 | src/pages/GamePage.jsx | P1 |
| 1.4.7 | [Front] StockBoard 컴포넌트 (종목 목록 + 가격 + 등락률 표시) | 송원호 | 완료 | 100% | 05/14 | 05/15 | 1 | src/components/game/StockBoard.jsx | P0 |
| 1.4.8 | [Front] NewsPanel — Marquee 전광판으로 통합·대체 (별도 UI 제거) | 송원호 | 대체됨 | — | 05/14 | 05/15 | 1 | 1.4.18로 대체 | P1 |
| 1.4.9 | [Front] TurnControl — GamePage 우하단 "다음 주" 버튼으로 통합 | 송원호 | 대체됨 | — | 05/14 | 05/15 | 1 | GamePage.jsx 내부 | P0 |
| 1.4.10 | [Front] Portfolio — GamePage 좌측 자산 카드 HOLDINGS 영역으로 통합 | 송원호 | 대체됨 | — | 05/14 | 05/15 | 1 | GamePage.jsx 내부 | P0 |
| 1.4.11 | [Front] MarketPage 구현 (월스트리트 거래소 — 10종목 분석·매수·매도) | 송원호 | 완료 | 100% | 05/14 | 05/15 | 1 | src/pages/MarketPage.jsx | P0 |
| 1.4.12 | [Front] InfoMerchantPage — 정보상 (모달 → 페이지 라우팅으로 변경, master 통합) | 공통 | 완료 | 100% | 05/14 | 05/15 | 1 | src/pages/InfoMerchantPage.jsx | P1 |
| 1.4.13 | [Front] TechMerchantPage — 기술상 (모달 → 페이지 라우팅, master 통합) | 공통 | 완료 | 100% | 05/14 | 05/15 | 1 | src/pages/TechMerchantPage.jsx | P1 |
| 1.4.14 | [Front] RoundResultModal — 별도 모달 대신 1000ms WEEK 화면 전환 애니메이션으로 대체 (1.4.23) | 송원호 | 대체됨 | — | 05/14 | 05/15 | 1 | 1.4.23으로 대체 | P1 |
| 1.4.15 | [공용] stockData.json pregame 13주 차트 배경 데이터 완료 (2025-02-27~2025-05-22) | 배영환 | 완료 | 100% | 05/14 | 05/14 | 0.5 | scripts/collect-stock-data.py + stockData.json | P1 |
| 1.4.16 | [Front] KospiChart — master에서 통합 + NYSE 디지털 보드 톤 재스타일링 (slate+cyan, LED 가격, LIVE 인디케이터, 모서리 deco, 라인 글로우, area gradient, useId로 SVG ID 충돌 방지) | 공통 | 완료 | 100% | 05/14 | 05/14 | 1 | src/components/game/KospiChart.jsx | P1 |
| 1.4.17 | [Front] StartPage 빈티지 월스트리트 배경 통합 (`public/images/start-bg.png`) + 닉네임 입력 + 게임 시작 | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.5 | StartPage.jsx, public/images/ | P1 |
| 1.4.18 | [Front] AnimatedNumber 컴포넌트 — 200ms ease-out 카운트업/다운 + sessionStorage 캐싱 (페이지 이동 후 복귀해도 직전 값 유지) | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.5 | src/components/ui/AnimatedNumber.jsx | P1 |
| 1.4.19 | [Front] Marquee 전광판 — 한 팁씩 우→좌 순환 (hover 일시정지) + GAMEPLAY_TIPS 9개 | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.5 | src/components/ui/Marquee.jsx, index.css(@keyframes marquee-single) | P1 |
| 1.4.20 | [Front] 좌측 자산 카드 — 라운드/현금/평가액(▲▼trend)/총자산/HOLDINGS(종목별 현재가+전날 대비 등락률) | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.5 | GamePage.jsx 내부 | P1 |
| 1.4.21 | [Front] 우상단 IconButton 3개 (도움말/설정/종료) + Heroicons outline SVG + hover 라벨 | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.5 | GamePage.jsx 내부 | P1 |
| 1.4.22 | [Front] 도움말 오버레이 (HelpOverlay + HelpBubble) — 6개 UI 위치에 풍선 설명 + 배경 클릭 시 닫힘 | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.5 | GamePage.jsx 내부 | P1 |
| 1.4.23 | [Front] 라운드 전환 애니메이션 — 1000ms (시계 회전 + WEEK N 텍스트 + 어두운 오버레이) / 50주 도달 시 GAME OVER + index.css keyframes 3종 | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.5 | GamePage.jsx + index.css | P1 |
| 1.4.24 | [Front] "다음 주" 확인 popover — NYSE 디지털 보드 톤 + 화살표 노치 + LED 인디케이터 | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.3 | GamePage.jsx 내부 | P1 |
| 1.4.25 | [Front] 차트 확대 모달 (ChartExpandModal) — 작은 차트 좌표/사이즈에서 출발하는 스케일 애니메이션 (getBoundingClientRect) | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.5 | GamePage.jsx 내부 | P2 |
| 1.4.26 | [Front] 게임 종료 확인 모달 (ExitConfirmModal) — 화면 중앙, 확인/취소 | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.2 | GamePage.jsx 내부 | P1 |
| 1.4.27 | [Front] 설정 모달 audioStore 연결 — 볼륨 슬라이더 (0=음소거, mute 토글 제거) | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.3 | GamePage.jsx 내부 (useAudioStore) | P1 |

---

## 1.5 P1 — 통합 및 연동

> 기간: 2026-05-15 (Day 3) | 목표: 로직 + UI 병합 → 게임 완전 동작

| WBS | 태스크 | 담당자 | 상태 | 진척도 | 계획 시작 | 계획 종료 | 기간(일) | 산출물 | 우선순위 |
|-----|--------|--------|------|--------|-----------|-----------|----------|--------|----------|
| 1.5.1 | [통합] App.jsx 페이지 전환 로직 (Start → Main ↔ Market/InfoMerchant/TechMerchant → RoundResult → End) | 배영환 | 완료 | 100% | 05/15 | 05/15 | 1 | src/App.jsx | P0 |
| 1.5.2 | [통합] MainPage/MarketPage에 gameStore 연결 (송원호 컴포넌트 + 로직 연동) | 배영환 | 완료 | 100% | 05/15 | 05/15 | 1 | MainPage.jsx, MarketPage.jsx 업데이트 | P0 |
| 1.5.3 | [Back] leaderboardStore + Supabase insert/select 구현 | 배영환 | 완료 | 100% | 05/15 | 05/15 | 1 | src/store/leaderboardStore.js | P1 |
| 1.5.4 | [공용] localStorage persist 연동 (새로고침 복구) | 배영환 | 완료 | 100% | 05/15 | 05/15 | 1 | gameStore.js persist 미들웨어 | P1 |
| 1.5.5 | [Front] ResultPage 구현 (최종 자산 + 등급 표시) | 송원호 | 완료 | 100% | 05/15 | 05/15 | 1 | src/pages/ResultPage.jsx | P0 |
| 1.5.6 | [Front] Leaderboard 컴포넌트 UI (순위 테이블) | 송원호 | 완료 | 100% | 05/15 | 05/15 | 1 | src/components/leaderboard/Leaderboard.jsx | P1 |
| 1.5.7 | [통합] 통합 버그 수정 + PR 리뷰 (unlockStock 거래소 연동 + resetGame 랭킹 초기화) | 배영환 | 완료 | 100% | 05/15 | 05/15 | 1 | 버그 수정 커밋 | P0 |
| 1.5.8 | [통합] master pull 충돌 해결 — GamePage 송원호 버전(`--ours`) 유지 + master KospiChart·stockData·HelpModal·TipBox·StockChart 정상 통합 (백업: backup/before-pull-2, backup/before-conflict-fix) | 공통 | 완료 | 100% | 05/14 | 05/14 | 0.5 | merge commit (8ae1a3a, f51dfb7) | P0 |

---

## 1.6 P2 — QA 및 배포

> 기간: 2026-05-16 (Day 4) | 목표: 게임 완성도 + 프로덕션 배포

| WBS | 태스크 | 담당자 | 상태 | 진척도 | 계획 시작 | 계획 종료 | 기간(일) | 산출물 | 우선순위 |
|-----|--------|--------|------|--------|-----------|-----------|----------|--------|----------|
| 1.6.1 | [QA] 게임 밸런스 플레이테스트 (15~20분 확인, 초기 자본·턴수 조정) | 공통 | 대기 | 0% | 05/16 | 05/16 | 1 | 수치 조정 커밋 | P0 |
| 1.6.2 | [Front] 조건부 스타일링 — ▲ 빨강 / ▼ 파랑 (한국 표준) 적용 완료, NYSE 슬레이트+시안 톤 + LED 글로우 + 모서리 deco 통일 진행 중 | 송원호 | 진행중 | 70% | 05/14 | 05/16 | 2 | GamePage·KospiChart·Marquee·Popover 스타일 통일 | P1 |
| 1.6.3 | [Front] 반응형 UI 최종 적용 (모바일 375px 기준) | 송원호 | 대기 | 0% | 05/16 | 05/16 | 1 | 반응형 확인 | P1 |
| 1.6.4 | [배포] Vercel 환경변수 등록 + 프로덕션 배포 (https://dacongame.vercel.app/) | 배영환 | 완료 | 100% | 05/16 | 05/16 | 1 | 프로덕션 URL | P0 |
| 1.6.5 | [QA] Lighthouse 성능 점수 확인 (목표: 90+) | 배영환 | 대기 | 0% | 05/16 | 05/16 | 1 | Lighthouse 리포트 | P2 |
| 1.6.6 | [QA] Supabase RLS 동작 최종 확인 | 배영환 | 완료 | 100% | 05/16 | 05/16 | 1 | 보안 체크리스트 | P1 |

---

## 1.7 버퍼

> 기간: 2026-05-17 (Day 5) | 목표: 예상치 못한 이슈 대응 + 최종 확인

| WBS | 태스크 | 담당자 | 상태 | 진척도 | 계획 시작 | 계획 종료 | 기간(일) | 산출물 | 우선순위 |
|-----|--------|--------|------|--------|-----------|-----------|----------|--------|----------|
| 1.7.1 | [QA] 최종 크로스 브라우저/기기 테스트 + 잔여 버그 수정 | 공통 | 대기 | 0% | 05/17 | 05/17 | 1 | 최종 확인 체크리스트 | P1 |
| 1.7.2 | [배포] 최종 재배포 + 마감 제출 준비 | 배영환 | 대기 | 0% | 05/17 | 05/17 | 1 | 최종 배포 URL | P0 |

---

## 브랜치 전략

| 브랜치 | 담당자 | 연결 태스크 |
|--------|--------|-------------|
| `feature/p0-setup` | 배영환 | 1.3.1~1.3.6 |
| `feature/p0-data` | 송원호 | 1.3.3~1.3.4 |
| `feature/p0-ui-common` | 송원호 | 1.3.7 |
| `feature/p1-game-logic` | 배영환 | 1.4.1~1.4.4 |
| `feature/p1-ui-pages` | 송원호 | 1.4.5~1.4.6 |
| `feature/p1-ui-components` | 송원호 | 1.4.7~1.4.10 |
| `feature/p1-ui-merchants` | 송원호 | 1.4.11~1.4.14 |
| `feature/p1-integration` | 배영환 | 1.5.1~1.5.4, 1.5.7 |
| `feature/p1-ui-result` | 송원호 | 1.5.5~1.5.6 |
| `feature/p2-polish` | 송원호 | 1.6.2~1.6.3 |

> PR 규칙: 송원호 → master PR 생성 → 배영환 리뷰 후 merge

---

## 역할 요약

| 영역 | 배영환 (본인 + Claude) | 송원호 |
|------|----------------------|------|
| 프로젝트 세팅 | Vite 초기화, 폴더 구조 | 환경 동기화 |
| 데이터 | gameLogic, gameStore | stocks.json, news-events.json |
| UI | App.jsx 라우팅, store 연결 | 모든 컴포넌트·페이지·상점 모달 퍼블리싱 |
| 백엔드 | Supabase 설정 + leaderboardStore | - |
| 통합 | GamePage store 연결, 버그 수정 | ResultPage, Leaderboard UI |
| QA/배포 | Vercel 배포, Lighthouse | 반응형, 스타일 폴리싱, 플레이테스트 |
