# k-stock-merchant WBS v2.0

> 프로젝트: k-stock-merchant | 작성자: 배영환 | 작성일: 2026-05-13 | 최종 업데이트: 2026-05-17 (1.4.37~1.4.45 추가 — MarketPage 3종 모달 KRX 디지털 보드 풀 리뉴얼 + PR #44 리뷰 후속 + 데드 코드 정리. 종목분석 16:9 + 멀티 패널 차트(메인/MACD/OBV 동시 노출, 네온 글로우, 워밍업 X축 재구성) + 주식구매 BulkBuyPanel + 주식판매 BulkSellPanel + chartUtils 확장 평균 + calcOBV 시그니처 수정 + 등락률 4곳 저번 주 대비 통일 + gameStore purchaseRounds 추가 + 3개 도움말 오버레이 + 시안/로즈 스크롤바 + number input 스피너 숨김 + PR 리뷰 후속 4건(MACD 매핑 주석/StockChart useMemo/HOTSPOT 상수/PopupOverlay props drilling 14→4) + 데드 코드 정리(SignalBadge·signal 계산·WeekInfoPanel·StatCard·미사용 import + macdArr 잠재 TypeError 동시 해결))
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
| 2 | MarketPage | `src/pages/MarketPage.jsx` | 한국거래소 — 랜덤 선택된 10종목 분석·매수·매도 |
| 3 | InfoMerchantModal | `src/components/merchant/InfoMerchantModal.jsx` | 정보상 — 국제/기업뉴스 무료 조회 + 추천종목 유료 구매 |
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
| 1.4 P1 핵심 기능 | 45 | 42 | 93.3% (3개 대체됨) |
| 1.5 P1 통합 | 8 | 8 | 100% |
| 1.6 P2 QA + 배포 | 6 | 4 | 66.7% |
| 1.7 버퍼 | 2 | 0 | 0% |
| 1.8 추가 작업 | 7 | 5 | 71.4% |
| **전체** | **81** | **72** | **88.9%** |

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
| 1.4.6 | [Front] GamePage 전면 리뉴얼 — 한국거래소 배경 + NPC 3 클릭(navigateTo) + 좌측 자산 카드 + 우상단 IconButton + 라운드 전환 애니메이션 통합 | 송원호 | 완료 | 100% | 05/14 | 05/14 | 1 | src/pages/GamePage.jsx | P1 |
| 1.4.7 | [Front] StockBoard 컴포넌트 (종목 목록 + 가격 + 등락률 표시) | 송원호 | 완료 | 100% | 05/14 | 05/15 | 1 | src/components/game/StockBoard.jsx | P0 |
| 1.4.8 | [Front] NewsPanel — Marquee 전광판으로 통합·대체 (별도 UI 제거) | 송원호 | 대체됨 | — | 05/14 | 05/15 | 1 | 1.4.18로 대체 | P1 |
| 1.4.9 | [Front] TurnControl — GamePage 우하단 "다음 주" 버튼으로 통합 | 송원호 | 대체됨 | — | 05/14 | 05/15 | 1 | GamePage.jsx 내부 | P0 |
| 1.4.10 | [Front] Portfolio — GamePage 좌측 자산 카드 HOLDINGS 영역으로 통합 | 송원호 | 대체됨 | — | 05/14 | 05/15 | 1 | GamePage.jsx 내부 | P0 |
| 1.4.11 | [Front] MarketPage 구현 (한국거래소 — 10종목 분석·매수·매도) | 송원호 | 완료 | 100% | 05/14 | 05/15 | 1 | src/pages/MarketPage.jsx | P0 |
| 1.4.12 | [Front] InfoMerchantPage — 정보상 (모달 → 페이지 라우팅 + 정보상.webp 배경 리뉴얼 + 16:9 viewport 클램프 + 핫스팟 4종(도움말/메인/거래소/기술상) + ObjectGlow 3종(국제뉴스 지구본 cyan/기업뉴스 서류가방 amber/추천종목 태블릿 emerald — 보이는 마커 없이 radial-gradient + blur 호버 글로우만) + HelpOverlay 풍선 3개(arrow="down") + 새 게임당 도움말 1회 자동 노출(sessionStorage info-merchant-help-seen) + 추천종목 자동 매칭(currentNews 섹터→활성 종목→가격 변동률 기반 ▲매수/▼매도 권유) + HTS 슬레이트+시안 톤 팝업 3종 + 기술상 진입 잠금 해제(TECH_MERCHANT_UNLOCK_TURN 제거) + 1680×945 기준 calc % 좌표로 책상 위 오브젝트와 정렬) | 공통 | 완료 | 100% | 05/14 | 05/15 | 1 | src/pages/InfoMerchantPage.jsx, public/images/info-merchant-bg.webp | P1 |
| 1.4.13 | [Front] TechMerchantPage — 기술상 (모달 → 페이지 라우팅 + 기술상.webp 배경 리뉴얼 + 16:9 viewport 클램프 + 핫스팟 4종(도움말/메인/거래소/정보상) + ObjectGlow 2종(차트지표 cyan / 깜짝종목 blue — 보이는 마커 없이 radial-gradient + blur 호버 글로우만) + HelpOverlay 풍선 2개(arrow="down") + 새 게임당 도움말 1회 자동 노출(sessionStorage tech-merchant-help-seen) + 10턴 잠금 안내 팝업(turn < TECH_MERCHANT_UNLOCK_TURN=10 클릭 시 '10턴 이후 사용 가능' 안내, 실제 구매 UI 비활성) + 차트 지표 구매(MA/볼린저/MACD/OBV) + 깜짝 종목 판매상(비공개 종목 유료 공개) + HTS 슬레이트+시안 톤 팝업 3종(indicators/hiddenStocks/locked) + 1680×945 기준 calc % 좌표로 코너 버튼·풍선 미세조정) | 공통 | 완료 | 100% | 05/14 | 05/15 | 1 | src/pages/TechMerchantPage.jsx, public/images/tech-merchant-bg.webp | P1 |
| 1.4.14 | [Front] RoundResultModal — 별도 모달 대신 1000ms WEEK 화면 전환 애니메이션으로 대체 (1.4.23) | 송원호 | 대체됨 | — | 05/14 | 05/15 | 1 | 1.4.23으로 대체 | P1 |
| 1.4.15 | [공용] stockData.json pregame 13주 차트 배경 데이터 완료 (2025-02-27~2025-05-22) | 배영환 | 완료 | 100% | 05/14 | 05/14 | 0.5 | scripts/collect-stock-data.py + stockData.json | P1 |
| 1.4.16 | [Front] KospiChart — master에서 통합 + HTS 디지털 보드 톤 재스타일링 (slate+cyan, LED 가격, LIVE 인디케이터, 모서리 deco, 라인 글로우, area gradient, useId로 SVG ID 충돌 방지) | 공통 | 완료 | 100% | 05/14 | 05/14 | 1 | src/components/game/KospiChart.jsx | P1 |
| 1.4.17 | [Front] StartPage 한국거래소 배경 통합 (`public/images/start-bg.png`) + 닉네임 입력 + 게임 시작 | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.5 | StartPage.jsx, public/images/ | P1 |
| 1.4.18 | [Front] AnimatedNumber 컴포넌트 — 200ms ease-out 카운트업/다운 + sessionStorage 캐싱 (페이지 이동 후 복귀해도 직전 값 유지) | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.5 | src/components/ui/AnimatedNumber.jsx | P1 |
| 1.4.19 | [Front] Marquee 전광판 — 한 팁씩 우→좌 순환 (hover 일시정지) + GAMEPLAY_TIPS 9개 | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.5 | src/components/ui/Marquee.jsx, index.css(@keyframes marquee-single) | P1 |
| 1.4.20 | [Front] 좌측 자산 카드 — 라운드/현금/평가액(▲▼trend)/총자산/HOLDINGS(종목별 현재가+전날 대비 등락률) | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.5 | GamePage.jsx 내부 | P1 |
| 1.4.21 | [Front] 우상단 IconButton 3개 (도움말/설정/종료) + Heroicons outline SVG + hover 라벨 | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.5 | GamePage.jsx 내부 | P1 |
| 1.4.22 | [Front] 도움말 오버레이 (HelpOverlay + HelpBubble) — 6개 UI 위치에 풍선 설명 + 배경 클릭 시 닫힘 | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.5 | GamePage.jsx 내부 | P1 |
| 1.4.23 | [Front] 라운드 전환 애니메이션 — 1000ms (시계 회전 + WEEK N 텍스트 + 어두운 오버레이) / 50주 도달 시 GAME OVER + index.css keyframes 3종 | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.5 | GamePage.jsx + index.css | P1 |
| 1.4.24 | [Front] "다음 주" 확인 popover — HTS 디지털 보드 톤 + 화살표 노치 + LED 인디케이터 | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.3 | GamePage.jsx 내부 | P1 |
| 1.4.25 | [Front] 차트 확대 모달 (ChartExpandModal) — 작은 차트 좌표/사이즈에서 출발하는 스케일 애니메이션 (getBoundingClientRect) | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.5 | GamePage.jsx 내부 | P2 |
| 1.4.26 | [Front] 게임 종료 확인 모달 (ExitConfirmModal) — 화면 중앙, 확인/취소 | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.2 | GamePage.jsx 내부 | P1 |
| 1.4.27 | [Front] 설정 모달 audioStore 연결 — 볼륨 슬라이더 (0=음소거, mute 토글 제거) | 송원호 | 완료 | 100% | 05/14 | 05/14 | 0.3 | GamePage.jsx 내부 (useAudioStore) | P1 |
| 1.4.28 | [Front] MarketPage KRX 거래소 리뉴얼 — 거래소.webp 배경 + 16:9 viewport 클램프 + 핫스팟 오버레이 5종(종목분석/주식구매/주식판매/도움말/메인/정보상/기술상) + 호버 글로우(cyan·emerald·red) + 1920×1080 기준 비례 % 좌표(창 크기 무관 정렬 유지) + HelpOverlay 풍선 5개 + 새 게임당 도움말 1회 자동 노출(`sessionStorage` + `useGameStore.subscribe` page 전환 감지) + 기술상 진입 제한 해제(페이지 내부 기능 잠금은 TechMerchantPage 책임) | 송원호 | 완료 | 100% | 05/15 | 05/15 | 1 | src/pages/MarketPage.jsx, public/images/market-bg.webp | P1 |
| 1.4.29 | [Front] PR 리뷰 후속 — HMR 구독 누수 정리 + 핫스팟·도움말 풍선 dead code 제거 (3개 페이지 모듈 레벨 `useGameStore.subscribe`에 `import.meta.hot.dispose()` 추가하여 HMR 시 좀비 구독 누적 방지 / `Hotspot` `disabled` prop 제거(호출부 미사용) / `HelpBubble` 도달 불가능한 arrow 분기 제거(MarketPage `down`, TechMerchant·InfoMerchant `up`) / `eslint-disable-next-line react-hooks/exhaustive-deps` 주석 제거(ESLint 미설치 + `setOpenHelp`는 stable reference라 어차피 안 떴음) — 모든 변경 사항 Vite HMR 9건 무에러 통과·기능 동작 변화 0) | 송원호 | 완료 | 100% | 05/15 | 05/15 | 0.3 | src/pages/MarketPage.jsx, src/pages/TechMerchantPage.jsx, src/pages/InfoMerchantPage.jsx | P2 |
| 1.4.30 | [Front] GamePage 디자인 톤 통일 — 좌측 자산 카드(ROUND/HOLDINGS 헤더에 LED 인디케이터 + `bg-slate-800/70 border-cyan-500/30` 카드로 자산row·보유종목 감쌈) / IconButton(hover 시 inset+outer cyan 글로우, 라벨 풍선을 HelpBubble 톤으로) / ExitConfirmModal(PopupOverlay 패턴: `font-mono tracking-wider` 헤더 + ✕ + slate-800/70 카드) / NPC 라벨 풍선(`bg-slate-900/95 + cyan-400 border + glow + font-mono`) / KospiChart·Marquee outer(`bg-gradient-to-b from-slate-900 to-slate-950 + rounded-xl + shadow-[0_0_40px]`) — 다른 3개 페이지(Info/Market/Tech) PopupOverlay 패턴과 일관성 확보 | 송원호 | 완료 | 100% | 05/15 | 05/15 | 0.5 | src/pages/GamePage.jsx, src/components/game/KospiChart.jsx, src/components/ui/Marquee.jsx | P1 |
| 1.4.31 | [Front] KospiChart compact 모드 + SVG 디테일 보강 — `compact` prop 도입(GamePage 미니 차트 vs ChartExpandModal 풀 차트), compact 시 격자/X·Y 라벨/경계 점선/현재가 기준선/푸터 숨김 + PAD 좁게(8px) / 풀 모드 글로우 강화(stdDeviation 1.8→3.0) + Area fill 3-stop 그라데이션(0.55/0.2/0) + 게임 라인 strokeWidth 2.5 + 현재가 펄스 ring(SVG `<animate>` 2s 주기 r 4↔14, opacity 0.7↔0) / pregame↔game 라인 연결(game 첫 점에 pregame 마지막 점 prepend) — turn=1 첫 라운드부터도 라인 표시 / Y축 라벨 textAnchor="start" + x=7로 좌측 정렬, PAD.left 54→34 / 헤더 폰트 사이즈 조정(KOSPI text-sm/INDEX·LIVE text-[10px]/수치 text-xl/증감률 text-sm) / 푸터 OPEN·W{turn}/50 폰트 키움(text-[9px]→text-sm + font-bold) | 송원호 | 완료 | 100% | 05/15 | 05/15 | 0.5 | src/components/game/KospiChart.jsx | P1 |
| 1.4.32 | [Front] 좌측 자산 카드 총자산 전주 대비 표시 — `AssetRow`에 `deltaPct`/`deltaAmount` prop 확장, 직전 라운드 totalAssets sessionStorage 캐시(`game-total-assets-prev`) + trend/증감률/증감액 계산. 총자산 라인 하단에 `▲ X.XX% (+27,000원)` 우측 정렬 + 변동 없음(±0.005% 미만) 시 두 번째 줄 숨김. 색상: 상승 red-400/300(韓 표준) / 하락 blue-400/300 | 송원호 | 완료 | 100% | 05/15 | 05/15 | 0.3 | src/pages/GamePage.jsx | P1 |
| 1.4.33 | [Front] GamePage 반응형 (ResizeObserver + transform:scale wrapper) — 외곽 구조를 다른 페이지와 동일 패턴(`h-screen w-screen` + `width: min(100vw, calc(100vh * 1695 / 928))`)으로 통일. 1695×928 고정 좌표 wrapper에 `transform: scale(${scale})` + `transform-origin: top-left` 적용, ResizeObserver로 컨테이너 너비 변화 감지해 scale 갱신. 모든 absolute 요소(자산 카드/TIPS/차트/NPC/우상단 아이콘/다음 주 버튼)가 viewport 크기에 따라 비례 축소. 모달은 wrapper 밖 fixed라 정상 표시 | 송원호 | 완료 | 100% | 05/15 | 05/15 | 0.3 | src/pages/GamePage.jsx | P1 |
| 1.4.34 | [Front] 도움말 보강 — KOSPI 차트 박스 추가(arrow="down", 차트 위쪽 위치) + `HelpBubble` arrow="up" 분기 추가(다른 페이지와 통일) + 8개 풍선 문구 입문자용 리라이팅(전문 용어 풀어쓰기, "매수/매도"→"사고팔기", "퀀트"→생략, 정보상에 "뉴스→주가 변동" 인과 설명 추가). TIPS는 원래 "떡상 꿀팁이 흐릅니다 ✨"로 롤백 | 송원호 | 완료 | 100% | 05/15 | 05/15 | 0.3 | src/pages/GamePage.jsx | P1 |
| 1.4.35 | [Front] 페이지 진입 애니메이션 — index.css `@keyframes page-enter`(450ms, opacity 0→1 + scale 0.96→1 + blur 4px→0, cubic-bezier(0.16,1,0.3,1) easeOutExpo 풍) + GamePage/MarketPage/InfoMerchantPage/TechMerchantPage 최상위 div에 `animate-page-enter` class 적용. 페이지 전환 시 부드러운 fade-in + 줌인 + 블러 풀림 효과 | 송원호 | 완료 | 100% | 05/15 | 05/15 | 0.2 | src/index.css, 4개 페이지 .jsx | P1 |
| 1.4.36 | [Front] 새 게임 첫 라운드 trend/delta 초기화 — `prev*Ref(useRef)`를 `useState`로 마이그레이션. 초기값 함수에서 `turn === 1` 시 sessionStorage 캐시(`game-stock-value-prev`, `game-total-assets-prev`) `removeItem` + null 반환. 게임 종료 후 재시작 시 첫 라운드에 ▲/▼ 아이콘 및 증감률·증감액이 이전 게임 마지막 값과 비교되어 잘못 표시되던 버그 수정. `confirmNextTurn`에서 `setPrev*`로 baseline 저장 | 송원호 | 완료 | 100% | 05/15 | 05/15 | 0.2 | src/pages/GamePage.jsx | P1 |
| 1.4.37 | [Front] MarketPage 종목분석 모달 — 16:9 이미지 배경(`stock-analysis-bg.webp`) + 좌측 사이드바(10종목 컴팩트 카드, 시안 스크롤바) + 우측 멀티 패널 차트(메인 차트 violet / MACD violet / OBV emerald 세로 스택) + `StockChart.jsx` 전면 재작성(`PanelFrame`/`LockedHint` + `NeonGlowDefs` SVG 글로우 필터) + `SubTabBar` 폐기(모든 패널 동시 노출, 미구매 지표는 LockedHint) + 캔들 색상 녹/적(이미지 톤) + MACD 히스토그램만(0 중심 대칭, 워밍업 우측 쏠림 해결 위해 유효 데이터만 X축 재구성) + OBV 청록 라인 + `SubYAxis`(K/M/B 단축 표기 + extraGap) + 모든 서브 패널에 `XAxisLabels` 추가 + 도움말 오버레이(`AnalysisHelpOverlay` — 캔들/MA/볼린저/MACD/OBV 6개 섹션) + hotspot 픽셀 단위 미세조정 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 1 | src/pages/MarketPage.jsx, src/components/game/StockChart.jsx, public/images/stock-analysis-bg.webp | P1 |
| 1.4.38 | [Front] MarketPage 주식구매 모달 — 16:9 이미지 배경(`stock-buy-bg.webp`) + 기존 `StockBoard` 폐기 → 신규 `BulkBuyPanel`(시안 디지털 보드 톤): 종목별 자체 수량 컨트롤(수량 > 0 자동 매수 대상, 별도 체크박스 없음) + 단축 액션(`전체 1주`/`전체 해제`) + 종목 행(섹터 태그/보유 배지/8주 미니 스파크라인/등락률+전주대비/소계) + 하단 시장 분위기·합계·매수 후 예상 잔액·🛒 일괄 매수 + 도움말 오버레이(`BuyHelpOverlay` 8개 섹션) + 합계 박스 검정 text-shadow로 캐릭터 배경 가독성 확보 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 1 | src/pages/MarketPage.jsx, public/images/stock-buy-bg.webp | P1 |
| 1.4.39 | [Front] MarketPage 주식판매 모달 — 16:9 이미지 배경(`stock-sell-bg.webp`, 로즈/레드 톤) + 기존 시안 카드 폐기 → 신규 `BulkSellPanel`(BulkBuyPanel 동일 구조, 로즈 톤): 보유 종목만 노출, 매도 수량 max=보유수량 제약 + 단축 액션(`전량 매도`/`전체 해제`) + 하단 매도 수익·매도 후 예상 현금·💸 일괄 매도 + `.scrollbar-rose` 커스텀 스크롤바 + 도움말 오버레이(`SellHelpOverlay` 7개 섹션, `SellHelpSection` 로즈 헬퍼) | 송원호 | 완료 | 100% | 05/17 | 05/17 | 1 | src/pages/MarketPage.jsx, src/index.css, public/images/stock-sell-bg.webp | P1 |
| 1.4.40 | [Front] chartUtils 확장 평균 + calcOBV 시그니처 수정 — `calcMA` 워밍업 기간 사용 가능한 데이터로 부분 평균(expanding MA) 방식 → MA20 라인이 차트 좌측부터 그려짐. `calcBollinger`도 동기. `calcOBV(ohlcv)` 시그니처 호출 오류(`(closes, volumes)` → `(allCandles)`) 수정으로 OBV 값이 0만 나오던 버그 해결. 차트 Y축 스케일에 볼린저 상/하단 포함 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.3 | src/components/game/chartUtils.js, src/components/game/StockChart.jsx | P1 |
| 1.4.41 | [Front] 등락률·변동 표시 저번 주 대비로 통일 — 사이드바/BulkBuyPanel/BulkSellPanel/분석 모달 헤더 4곳 모두 `stockChange = (weekDiff/prevWeekClose) × 100`. 헤더 텍스트 `시작가와 거의 같아요` → `지난 주와 거의 같아요`. `friendlyChange` 이모지 🔺🔻➖ → 유니코드 ▲▼— (CSS color 적용). `TONE_CLASS` 한국 증시 컨벤션(up=빨강/down=파랑/flat=흰색). MACD 히스토그램도 동일 적용 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.3 | src/pages/MarketPage.jsx, src/components/game/StockChart.jsx | P1 |
| 1.4.42 | [공용] gameStore `purchaseRounds` 필드 추가 — 종목별 최초 매수 라운드 기록(`{stockId: turn}`). `buyStock`은 보유 0→>0 첫 진입 시에만 현재 turn 기록(추가 매수 시 유지). `sellStock`은 전량 매도 시 삭제. `startGame`/`resetGame` 초기화 + `persist` partialize 포함. 매도 모달 "이번 주 매수 종목" 안내용으로 도입했으나 후속 변경으로 미사용 — 추후 평가손익 정확 구현·보유 기간 표시 등 재활용 가능 | 배영환·송원호 | 완료 | 100% | 05/17 | 05/17 | 0.2 | src/store/gameStore.js, src/pages/MarketPage.jsx | P2 |
| 1.4.43 | [Front] 공통 UI 폴리시 — `.scrollbar-cyan`/`.scrollbar-rose` 커스텀 스크롤바(6px, 색상 thumb + 글로우, hover 밝아짐). `input[type='number']` 기본 스피너 숨김(Webkit `::-webkit-inner/outer-spin-button` + Firefox `-moz-appearance: textfield`) — 자체 +/− 버튼 중복 제거. 3개 모달 hotspot 픽셀 단위 미세조정 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.2 | src/index.css, src/pages/MarketPage.jsx | P2 |
| 1.4.44 | [Front] PR #44 리뷰 후속 — 코드 품질 4건 반영: (1) `chartUtils.js` MACD 인덱스 매핑(`signalSlice[j] → result[firstMacd + j]`) 함수 위 + 인라인 주석으로 부분 배열 변환 흐름 명시 (2) `StockChart.jsx` 캔들 배열·OHLCV·MA/볼린저/MACD/OBV 지표·Y축 min/max 스케일을 `useMemo`로 묶음(deps: stockEntry/turn/4개 구매 플래그) + `CANDLE_H`/`SUB_H` 모듈 상수로 외부 이동 → 종목 전환·매수·매도 외 재계산 차단 (3) `MarketPage.jsx` 핫스팟 좌표 `HOTSPOT` 상수 객체로 추출(market/analysis/buy/sell 4그룹) + `MODAL_CONTENT_BOUNDS`/`SELL_MODAL_CONTENT_BOUNDS` 콘텐츠 영역 상수 → 모든 hotspot 호출부 `style={HOTSPOT.section.label}` 단순화 (4) `PopupOverlay` props 14 → 4(activePopup/selectedStockId/setSelectedStockId/onClose), store 의존 데이터 10개(activeStocks/prices/portfolio/cash/buyStock/sellStock/4 구매 플래그)는 `useGameStore((s) => s.X)` 셀렉터로 내부 직접 구독 → 부모-자식 props 거리 단축. MarketPage 본체 destructure도 `navigateTo`만 남김 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.5 | src/components/game/chartUtils.js, src/components/game/StockChart.jsx, src/pages/MarketPage.jsx | P2 |
| 1.4.45 | [Front] 데드 코드 정리 — `StockChart.jsx`: `SignalBadge` 컴포넌트 + `maSignal`/`bollSignal`/`macdSignal`/`obvSignal` 계산 4줄 제거(SignalBadge 렌더 제거 후 잔존), `getMaSignal`/`getBollingerSignal`/`getMacdSignal`/`getObvSignal` import 4개 제거, useMemo 반환에서 미사용 필드(`highs`/`lows`/`closes`/`bollArr`/`macdArr`) 제거. `MarketPage.jsx`: `WeekInfoPanel` + `StatCard` 함수 제거(`StockAnalysisPanel` 멀티 패널 재설계 후 호출처 없음). **부수 효과**: `macdSignal = getMacdSignal(macdArr)` 라인에서 `macdArr`이 useMemo destructure 누락으로 `undefined`였던 잠재 TypeError 버그 자연 해결. 보존: `gameStore.purchaseRounds` 필드(향후 평가손익·보유 기간 표시 재활용 가능) | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.2 | src/components/game/StockChart.jsx, src/pages/MarketPage.jsx | P2 |

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
| 1.6.2 | [Front] 조건부 스타일링 — ▲ 빨강 / ▼ 파랑 (한국 표준) + HTS 슬레이트+시안 톤 + LED 글로우 + 모서리 deco 통일 (GamePage·KospiChart·Marquee·Popover·NPC라벨·IconButton·ExitConfirmModal 전체 PopupOverlay 패턴 통일 — 1.4.30, 1.4.31에서 완료) | 송원호 | 완료 | 100% | 05/14 | 05/15 | 2 | GamePage·KospiChart·Marquee·Popover 스타일 통일 | P1 |
| 1.6.3 | [Front] 반응형 UI 최종 적용 — 1695×928 wrapper에 ResizeObserver + transform:scale로 viewport 크기에 따라 모든 absolute 요소 비례 축소 (1.4.33). 다른 페이지(Info/Market/Tech)는 16:9 viewport 클램프로 이미 대응 | 송원호 | 완료 | 100% | 05/15 | 05/15 | 1 | 반응형 확인 | P1 |
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

## 1.8 2026-05-16 배영환 추가 작업

> 기간: 2026-05-16 | 담당: 배영환

| WBS | 태스크 | 담당자 | 상태 | 진척도 | 계획 시작 | 계획 종료 | 기간(일) | 산출물 | 우선순위 |
|-----|--------|--------|------|--------|-----------|-----------|----------|--------|----------|
| 1.8.1 | [공용] KODEX 200 종목 추가 + 인버스 PINNED_IDS 고정 최상위 (stockData.json + stocks.json + gameStore.js 업데이트) | 배영환 | 완료 | 100% | 05/16 | 05/16 | 1 | stockData.json, stocks.json, gameStore.js | P1 |
| 1.8.2 | [공용] activeStocks 고정 정렬 — splitStocks 교체, KODEX 200·인버스 PINNED_IDS 최상위 + 나머지 8개 가나다순 랜덤 (gameStore.js) | 배영환 | 완료 | 100% | 05/16 | 05/16 | 1 | gameStore.js | P1 |
| 1.8.3 | [기획] 추천 종목 기능 설계 (/deep-interview 진행) | 배영환 | 대기 | 0% | 05/16 | 05/16 | 0.5 | 기획 메모 | P1 |
| 1.8.4 | [QA] 볼린저 밴드 및 OBV 차트 동작 확인 | 배영환 | 완료 | 100% | 05/16 | 05/16 | 0.5 | QA 체크 | P1 |
| 1.8.5 | [버그] 국제뉴스 초기값 미표시 수정 — startGame에서 progressTurn(1) 호출로 첫 라운드 currentGlobalNews 즉시 반영 (gameStore.js) | 배영환 | 완료 | 100% | 05/16 | 05/16 | 0.5 | gameStore.js | P0 |
| 1.8.6 | [기획] 깜짝 구매 기능 설계 (/deep-interview 진행) | 배영환 | 대기 | 0% | 05/16 | 05/16 | 0.5 | 기획 메모 | P1 |
| 1.8.7 | [Front] ResultPage 코스피 수익률 연동 + GradeCard 기반 초과수익률 등급 적용 — INITIAL_KOSPI export, myReturn vs kospiReturn %p 계산, 리더보드 등급 라벨 통일 (ResultPage.jsx, gameStore.js) | 배영환 | 완료 | 100% | 05/16 | 05/16 | 0.5 | src/pages/ResultPage.jsx, src/store/gameStore.js | P1 |

---


## 1.9 하네스 업그레이드 — claude-code-template 반영 (배영환)

> 기간: 2026-05-16 | 담당: 배영환 | 출처: https://github.com/BaeYoungHwan/claude-code-template

| WBS | 태스크 | 담당자 | 상태 | 진척도 | 계획 시작 | 계획 종료 | 기간(일) | 산출물 | 우선순위 |
|-----|--------|--------|------|--------|-----------|-----------|----------|--------|----------|
| 1.9.1 | [하네스] `.claude/commands/commit.md` 생성 — 커밋 자동화 슬래시 스킬 | 배영환 | 완료 | 100% | 05/16 | 05/16 | 0.1 | .claude/commands/commit.md | P1 |
| 1.9.2 | [하네스] `.claude/commands/PR.md` 생성 — PR 생성 자동화 슬래시 스킬 | 배영환 | 완료 | 100% | 05/16 | 05/16 | 0.1 | .claude/commands/PR.md | P1 |
| 1.9.3 | [하네스] `.claude/commands/ralph.md` 생성 — 완료 보장 루프 (plan→exec→verify→fix) | 배영환 | 완료 | 100% | 05/16 | 05/16 | 0.1 | .claude/commands/ralph.md | P1 |
| 1.9.4 | [하네스] `.claude/commands/ultrawork.md` 생성 — 병렬 작업 최대화 (20~40% 토큰 절약) | 배영환 | 완료 | 100% | 05/16 | 05/16 | 0.1 | .claude/commands/ultrawork.md | P1 |
| 1.9.5 | [하네스] `.claude/commands/deep-interview.md` 생성 — 소크라테스식 스펙 구체화 | 배영환 | 완료 | 100% | 05/16 | 05/16 | 0.1 | .claude/commands/deep-interview.md | P1 |
| 1.9.6 | [하네스] `.claude/commands/close-project.md` 생성 — 11단계 프로젝트 종료 체크리스트 | 배영환 | 완료 | 100% | 05/16 | 05/16 | 0.1 | .claude/commands/close-project.md | P1 |
| 1.9.7 | [하네스] `agents/security-reviewer.md` 생성 — OWASP Top 10 보안 심층 분석 에이전트 | 배영환 | 완료 | 100% | 05/16 | 05/16 | 0.1 | agents/security-reviewer.md | P1 |
| 1.9.8 | [하네스] `agents/step-validator.md` 생성 — ultrawork 완료 후 lint/빌드/diff 검증 에이전트 | 배영환 | 완료 | 100% | 05/16 | 05/16 | 0.1 | agents/step-validator.md | P1 |
| 1.9.9 | [하네스] `global-setup/` 생성 — notify.ps1(Windows 알림), context-bar.sh(상태바), install.sh | 배영환 | 완료 | 100% | 05/16 | 05/16 | 0.2 | global-setup/ | P2 |
| 1.9.10 | [하네스] `scripts/executor.py` 생성 — WBS 체크박스 자동 실행기 (--dry-run/--retry-failed) | 배영환 | 완료 | 100% | 05/16 | 05/16 | 0.1 | scripts/executor.py | P2 |
| 1.9.11 | [하네스] `docs/exec-plans/completed/` 디렉토리 생성 — 완료 플랜 아카이브 | 배영환 | 완료 | 100% | 05/16 | 05/16 | 0.1 | docs/exec-plans/completed/ | P2 |

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
