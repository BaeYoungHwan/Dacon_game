# k-stock-merchant WBS v2.0

> 프로젝트: k-stock-merchant | 작성자: 배영환 | 작성일: 2026-05-13 | 최종 업데이트: 2026-05-18 (1.10.30 메인화면 TIPS 전광판 cycle/turn 진행 시 새 팁 갱신 픽스 — Marquee key remount + GamePage TIPS 전체 셔플 전달 / 이전: 1.10.29 전 모달·페이지 키보드 단축키)
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
| 1.7 버퍼 | 2 | 1 | 50% |
| 1.8 추가 작업 | 7 | 5 | 71.4% |
| 1.9 하네스 업그레이드 | 11 | 11 | 100% |
| 1.10 QA 자동화 (배영환) | 9 | 9 | 100% |
| 1.11 UI 폴리시 (송원호) | 22 | 13 | 59.1% |
| 1.12 뉴스 시스템 고도화 (배영환) | 6 | 6 | 100% |
| 1.13 뉴스 실제이벤트 교체 + 브라우저 호환 (배영환) | 4 | 4 | 100% |
| **전체** | **133** | **116** | **87.2%** |

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
| 1.6.1 | [QA] 게임 밸런스 플레이테스트 (15~20분 확인, 초기 자본·턴수 조정) | 공통 | 완료 | 100% | 05/16 | 05/16 | 1 | 수치 조정 커밋 | P0 |
| 1.6.2 | [Front] 조건부 스타일링 — ▲ 빨강 / ▼ 파랑 (한국 표준) + HTS 슬레이트+시안 톤 + LED 글로우 + 모서리 deco 통일 (GamePage·KospiChart·Marquee·Popover·NPC라벨·IconButton·ExitConfirmModal 전체 PopupOverlay 패턴 통일 — 1.4.30, 1.4.31에서 완료) | 송원호 | 완료 | 100% | 05/14 | 05/15 | 2 | GamePage·KospiChart·Marquee·Popover 스타일 통일 | P1 |
| 1.6.3 | [Front] 반응형 UI 최종 적용 — 1695×928 wrapper에 ResizeObserver + transform:scale로 viewport 크기에 따라 모든 absolute 요소 비례 축소 (1.4.33). 다른 페이지(Info/Market/Tech)는 16:9 viewport 클램프로 이미 대응 | 송원호 | 완료 | 100% | 05/15 | 05/15 | 1 | 반응형 확인 | P1 |
| 1.6.4 | [배포] Vercel 환경변수 등록 + 프로덕션 배포 (https://dacongame.vercel.app/) | 배영환 | 완료 | 100% | 05/16 | 05/16 | 1 | 프로덕션 URL | P0 |
| 1.6.5 | [QA] Lighthouse 성능 점수 확인 (목표: 90+) | 배영환 | 완료 | 100% | 05/16 | 05/16 | 1 | Lighthouse 리포트 | P2 |
| 1.6.6 | [QA] Supabase RLS 동작 최종 확인 | 배영환 | 완료 | 100% | 05/16 | 05/16 | 1 | 보안 체크리스트 | P1 |

---

## 1.7 버퍼

> 기간: 2026-05-17 (Day 5) | 목표: 예상치 못한 이슈 대응 + 최종 확인

| WBS | 태스크 | 담당자 | 상태 | 진척도 | 계획 시작 | 계획 종료 | 기간(일) | 산출물 | 우선순위 |
|-----|--------|--------|------|--------|-----------|-----------|----------|--------|----------|
| 1.7.1 | [QA] 최종 크로스 브라우저/기기 테스트 + 잔여 버그 수정 | 공통 | **완료** | 100% | 05/17 | 05/17 | 1 | PR #63 (browserslist·build.target·Safari14 webkit·IE 안내 배너) | P1 |
| 1.7.2 | [배포] 최종 재배포 + 마감 제출 준비 | 배영환 | 완료 | 100% | 05/17 | 05/17 | 1 | 최종 배포 URL | P0 |

---

## 1.8 2026-05-16 배영환 추가 작업

> 기간: 2026-05-16 | 담당: 배영환

| WBS | 태스크 | 담당자 | 상태 | 진척도 | 계획 시작 | 계획 종료 | 기간(일) | 산출물 | 우선순위 |
|-----|--------|--------|------|--------|-----------|-----------|----------|--------|----------|
| 1.8.1 | [공용] KODEX 200 종목 추가 + 인버스 PINNED_IDS 고정 최상위 (stockData.json + stocks.json + gameStore.js 업데이트) | 배영환 | 완료 | 100% | 05/16 | 05/16 | 1 | stockData.json, stocks.json, gameStore.js | P1 |
| 1.8.2 | [공용] activeStocks 고정 정렬 — splitStocks 교체, KODEX 200·인버스 PINNED_IDS 최상위 + 나머지 8개 가나다순 랜덤 (gameStore.js) | 배영환 | 완료 | 100% | 05/16 | 05/16 | 1 | gameStore.js | P1 |
| 1.8.3 | [기획] 추천 종목 기능 설계 (/deep-interview 진행) | 배영환 | 완료 | 100% | 05/16 | 05/16 | 0.5 | 기획 메모 | P1 |
| 1.8.4 | [QA] 볼린저 밴드 및 OBV 차트 동작 확인 | 배영환 | 완료 | 100% | 05/16 | 05/16 | 0.5 | QA 체크 | P1 |
| 1.8.5 | [버그] 국제뉴스 초기값 미표시 수정 — startGame에서 progressTurn(1) 호출로 첫 라운드 currentGlobalNews 즉시 반영 (gameStore.js) | 배영환 | 완료 | 100% | 05/16 | 05/16 | 0.5 | gameStore.js | P0 |
| 1.8.6 | [기획] 깜짝 구매 기능 설계 (/deep-interview 진행) | 배영환 | 완료 | 100% | 05/16 | 05/16 | 0.5 | 기획 메모 | P1 |
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

## 1.10 QA 자동화 — Vitest 단위·통합 테스트 (배영환)

| ID | 작업 | 담당 | 상태 | 완료% | 시작 | 종료 | 예상h | 산출물 | 우선순위 |
|----|------|------|------|--------|------|------|--------|--------|---------|
| 1.10.1 | [QA] Vitest + jsdom 환경 설정 — vite.config.js test 블록, package.json scripts(test/test:watch/test:cover/test:3) | 배영환 | 완료 | 100% | 05/17 | 05/17 | 0.5 | vite.config.js, package.json | P0 |
| 1.10.2 | [QA] src/__tests__/setup.js — @testing-library/jest-dom 초기화 | 배영환 | 완료 | 100% | 05/17 | 05/17 | 0.1 | src/__tests__/setup.js | P0 |
| 1.10.3 | [QA] grade.test.js — calcExcessPp 3케이스, getGrade 경계값 10케이스, GRADES 내림차순 검증 | 배영환 | 완료 | 100% | 05/17 | 05/17 | 0.5 | src/__tests__/lib/grade.test.js | P1 |
| 1.10.4 | [QA] gameLogic.test.js — progressTurn 가격·KOSPI·뉴스 7케이스 (실제 JSON 사용, mock 없음) | 배영환 | 완료 | 100% | 05/17 | 05/17 | 0.5 | src/__tests__/lib/gameLogic.test.js | P1 |
| 1.10.5 | [QA] gameStore.test.js — buyStock·sellStock·unlockStock·unlockPackageStock·buyIndicator·purchaseInsiderInfo·localStorage 보안·getFinalAssets 23케이스 | 배영환 | 완료 | 100% | 05/17 | 05/17 | 1 | src/__tests__/store/gameStore.test.js | P0 |
| 1.10.6 | [QA] chartUtils.test.js — calcMA·calcBollinger·calcMACD·calcOBV·신호감지 5종·getRecentCloses 20케이스 | 배영환 | 완료 | 100% | 05/17 | 05/17 | 1 | src/__tests__/components/chartUtils.test.js | P1 |
| 1.10.7 | [QA] gameTurnFlow.test.js — gameStore+progressTurn 통합 4케이스, pass^3 검증 | 배영환 | 완료 | 100% | 05/17 | 05/17 | 0.5 | src/__tests__/integration/gameTurnFlow.test.js | P1 |
| 1.10.8 | [QA] qa-report.md — 테스트 결과·커버리지·갭 분석 리포트 작성 | 배영환 | 완료 | 100% | 05/17 | 05/17 | 0.3 | docs/ref/qa-report.md | P2 |
| 1.10.9 | [fix] getBollingerSignal 제로 밴드 NaN 버그 수정 — bandWidth===0 시 pctB=0.5 고정 | 배영환 | 완료 | 100% | 05/17 | 05/17 | 0.2 | src/components/game/chartUtils.js:113 | P1 |

---

## 1.11 UI 폴리시 (송원호 — 2026-05-17 추가 배치)

> 기간: 2026-05-17 ~ 2026-05-18 | 담당: 송원호 | 출처: 사용자 직접 요청 (별표 우선순위)
> 우선순위 표기: ★★★★★(P0) / ★★★★(P1) / ★★★(P1-) / ★★(P2) / ★(P3)
> 영역: 모두 `src/pages/`, `src/components/` — 송원호 담당 영역 내부

| WBS | 태스크 | 담당자 | 상태 | 진척도 | 계획 시작 | 계획 종료 | 기간(일) | 산출물 | 우선순위 |
|-----|--------|--------|------|--------|-----------|-----------|----------|--------|----------|
| 1.10.1 | [Front] ★★★★★ 메인화면 호버 작업 — GamePage NPC 3인 / 좌측 자산 카드 / KOSPI 차트 / 우상단 IconButton / 다음 주 버튼 / TIPS Marquee 호버 인터랙션 보강 — **1.10.19~1.10.21로 통합 해결**: NPC 호버 풍선 NPC별 오프셋 prop(hoverBubbleTop) 신설, 좌측 카드·KOSPI 차트·Marquee 디지털 보드 톤 통일 + 정보계층 재구성, 도움말 풍선 위치 재배치 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.5 | src/pages/GamePage.jsx | P0 |
| 1.10.2 | [Front] ★★★★★ 기술상 컨텐츠 UI 개선 — TechMerchantPage PopupOverlay 3종(indicators/hiddenStocks/locked)을 추천종목.webp 배경(4:3) + 3-zone 레이아웃(topFrame / midFrame / button)으로 리뉴얼. 기존 max-w-2xl 모달 사이즈 유지(`width: min(72vw, calc(78vh*4/3))`, `maxWidth: 46rem`). HOTSPOT.popup 상수(close/topFrame/midFrame/button) 추가, LockedView/IndicatorsView/HiddenStocksView 재구성: LED 인디케이터 도트 + StatusDot 컴포넌트(cyan/emerald/slate 색상별 상태) + scrollbar-cyan 적용. 한글 문구 유지(보유 현금/구매/구매완료/잠김/닫기/10턴 이후 사용 가능) + 폰트 크기 확대(text-sm→text-base, text-[10px]→text-xs). 하단 그린 버튼 닫기 ✕(에메랄드 글로우). | 송원호 | 완료 | 100% | 05/17 | 05/17 | 1 | src/pages/TechMerchantPage.jsx | P0 |
| 1.10.3 | [Front] ★★★★ 거래소 매수/매도 MAX 버튼 + 수량 input UX 보완 + 매도 문구 정리 — ① `BulkBuyPanel` 종목 행 `＋` 옆에 `MAX` 버튼 신설: 다른 종목에 입력 중인 매수액을 제외한 사용 가능 잔액으로 살 수 있는 최대 주수 자동 계산(`Math.floor((cash - totalCost + subTotal) / stockPrice)`), 1주도 못 사면 비활성. ② `BulkSellPanel` 종목 행 `＋` 옆에 `MAX` 버튼 신설: 보유 수량(`stockHeld`) 자동 입력, 이미 전량 입력(`qty >= stockHeld`) 시 비활성. ③ 수량 input UX 보완 — 패널별 `focusedId` state 도입 + `value={focusedId === stock.id && qty === 0 ? '' : qty}` → 첫 진입 시 `0` 그대로 표시, 클릭(포커스) 시 입력칸 빈 칸으로 전환되어 초기 0이 안 사라지던 문제 해결. `onFocus={(e) => { setFocusedId(stock.id); e.target.select() }}`로 비-0 값일 때도 클릭 즉시 selectAll되어 다음 키 입력에 자연 대체. `onBlur` 시 다시 0 표시로 복귀. ④ 단축 액션 `전량 매도` → `전체 매도`로 문구 변경 (매도 모달 단축 버튼 + 매도 헬프 섹션 strong 라벨 + 내부 주석). 시안/로즈 톤 작은 MAX 버튼(`px-2 h-8`) 배치 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.3 | src/pages/MarketPage.jsx | P1 |
| 1.10.4 | [Front] ★★★★ 정보상 3종 팝업 UI 개선 + 뉴스 갱신 애니메이션 — 국제뉴스/기업뉴스/추천종목 팝업 배경을 각각 국제뉴스.webp(16:9, 2560×1440) / 기업뉴스.webp(16:9, 2560×1440) / 추천종목.webp(4:3, 1408×1056) 시안 이미지로 교체. 그려진 X 버튼 위치에 투명 클릭 영역 + hover 시안 글로우. 콘텐츠 디자인: ① 국제뉴스 BREAKING 카드(시안 모서리 deco + 배지 라인 + 헤드라인 + 그라데이션 구분선 + 디테일) ② 기업뉴스 섹터별 그리드(개수 적응 1/2/3/4+ — 1개 max-w-2xl, 2개 2열, 3개 3열, 4+개 2x2 / 3열, 정보 없는 섹터는 숨김) ③ 추천종목 3-zone(잠금: LOCKED 상태바+자물쇠 본문+안내 footer / 공개: UNLOCKED · 다음 주 최고 상승 예상 상태바 + 종목명·현재가/등락률 비공개 2단 카드 + RECEIPT 영수증 라인). HOTSPOT.{globalPopup/companyPopup/recommendPopup} 상수에 close + content/topFrame/midFrame/button 좌표 모음. **새 라운드 뉴스 슬라이드 인 애니메이션은 1.10.4-anim 분리 추후 작업** | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.7 | src/pages/InfoMerchantPage.jsx, public/images/info-global-news-bg.webp, public/images/info-company-news-bg.webp, public/images/info-recommendation-bg.webp | P1 |
| 1.10.5 | [Front] ★★★★ 공용 버튼 UI 통일 — 4개 페이지(GamePage / MarketPage / InfoMerchantPage / TechMerchantPage) 우상단·우하단 네비게이션 버튼을 단일 컴포넌트 `src/components/game/PageNav.jsx`로 분리. ① `IconButton` (정사각 → **네온 칩 rounded-full w-14 h-14**) — `bg-transparent + border-2 border-cyan-300/80 + hover:bg-cyan-400/20` 라인 버튼 톤, 외광 halo(`box-shadow + filter: blur(6px)`)가 평소에도 은은하게 빛남, hover 시 글로우 1.5배 강화 + 라벨 풍선 등장. ② `LocationButton` (캡슐 rounded-full + `px-7 h-12`) — `▶ 거래소/정보상/기술상` 라벨 표시. ③ `TopRightNav(onHelp, navigateTo)` / `BottomRightNav(current, navigateTo)` 컨테이너로 우상단 도움말·설정·메인 3아이콘 + 우하단 현재 페이지 제외 2곳 이동 자동 렌더. ④ `HelpIcon/SettingsIcon/HomeIcon/ExitIcon` SVG export — GamePage가 인라인 정의 4개(IconButton + 3 SVG) 제거하고 PageNav에서 import. 시도 이력: 슬레이트+border-cyan-500/60(원형) → HUD lock-on 4모서리 대괄호(중간) → 최종 **네온 칩 아웃라인**(사용자 선택) | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.6 | src/components/game/PageNav.jsx, src/pages/GamePage.jsx, MarketPage.jsx, InfoMerchantPage.jsx, TechMerchantPage.jsx | P1 |
| 1.10.6 | [Front] ★★★★ 각 화면별 설정 버튼 추가 — 1.10.5 `TopRightNav`로 일괄 해결. `SettingsModal`을 PageNav 내부에서 `useState(openSettings)`로 마운트하여 설정 아이콘 클릭 시 자체 오픈. 거래소/정보상/기술상 모두 도움말·설정·메인 3아이콘이 우상단에 동일 톤으로 노출 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.2 | src/components/game/PageNav.jsx | P1 |
| 1.10.7 | [Front] ★★★ 모멘텀 펄스 차트 → 라인 차트로 교체 — `StockChart.jsx` MACD 패널 히스토그램 막대(rect 반복 렌더 + `histBarW` 계산) 전체를 제거하고 **단일 polyline**으로 교체. 한국 증시 컨벤션 유지를 위해 동일 polyline 2개를 `clipPath`(0선 기준 위/아래 사각형 `macdAboveClip`/`macdBelowClip`)로 분리 렌더 → 0선 위(양수=상승 모멘텀) 빨강(`#ef4444`), 0선 아래(음수=하락 모멘텀) 파랑(`#3b82f6`)으로 자연 색 전환. `validHist` 인덱스 재매핑(워밍업 35주 우측 쏠림 방지)·네온 글로우(`#macdGlow`)·0 기준선·`SubYAxis`/`XAxisLabels`는 그대로. `MarketPage.jsx` `AnalysisHelpOverlay`의 MACD 헬프 섹션도 "빨강/파랑 막대" → "빨강/파랑 라인" + 라인 칩(글로우 box-shadow)으로 동기화. 사용자 요청: "막대대신 라인으로 교체" | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.2 | src/components/game/StockChart.jsx, src/pages/MarketPage.jsx | P1 |
| 1.10.8 | [Front] ★★★ 거래소 모멘텀 펄스 ↔ OBV 위치 스왑 — `StockChart.jsx`의 세로 스택 순서를 (메인 → MACD → OBV)에서 **(메인 → OBV → MACD)** 로 변경. 모든 패널이 `aspectRatio` SVG라 Y좌표 추가 조정 불필요 — 두 `PanelFrame` 블록 위치만 교체. 도움말 오버레이 섹션 순서는 학습 흐름(가벼움→무거움) 우선이라 유지(차트 시각 순서와 헬프 순서 별개 관리) | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.1 | src/components/game/StockChart.jsx | P1 |
| 1.10.9 | [Front] ★★ 거래소 합계/금액 텍스트 15px 좌측 이동 — 사용자 요청 변경(좌우 swap → 우측 여백 15px 추가). `BulkBuyPanel` 합계 박스(`text-right` div, MarketPage.jsx:1081) + 매수 후 예상 잔액 금액 span(:1094)에 `mr-[15px]` 추가. `BulkSellPanel` 매도 수익 박스(`text-right` div, :1360) + 매도 후 예상 현금 금액 span(:1373)에도 동일 적용. 라벨/값 정렬 구조는 유지하고 우측 끝에서 15px 안쪽으로 들여옴 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.1 | src/pages/MarketPage.jsx | P2 |
| 1.10.10 | [Front] ★ 메인화면 설정 모달 UI 개선 + 게임 초기화 버튼 로직 삭제 + 배경음/효과음 토글 일관화 — ① `SettingsModal.jsx` 회색 베이스(`bg-gray-800`)를 다른 모달(PopupOverlay) 톤(슬레이트+시안 디지털 보드, 4모서리 L자 코너 deco, 외광 halo, 백드롭 `bg-slate-950/75 + backdrop-blur-sm` + 외부 클릭 닫힘)으로 리뉴얼. 헤더 "SETTINGS" 모노 폰트 + 시안 텍스트 글로우. 볼륨 슬라이더 `accent-cyan-400`. ② **게임 초기화 버튼 + `handleReset`/`localStorage.removeItem`/`window.location.reload` 핸들러 완전 제거** + 상단 구분선 섹션 삭제(사용자 요청 변경, 당초 로즈 톤 유지 → 전면 제거). ③ **배경음악 → 배경음** 라벨 변경. ④ 효과음 섹션을 배경음과 동일한 2행 레이아웃(라벨+스피커 토글 / 슬라이더+%)으로 통일. ⑤ **스피커 아이콘을 토글 버튼으로 통합** — 기존 ON/OFF 텍스트 토글 제거. BGM 스피커 클릭: `muted` 플래그 토글(volume=0이면 이전 값 복원). SFX 스피커 클릭: `sfxVolume` 0 ↔ 이전 볼륨(audioStore에 `sfxMuted` 없어 `prevSfxVolRef` useRef로 직전 볼륨 기억해 복원). 슬라이더 onChange 시 ref 동기 갱신. ⑥ 무음 판정 통일 — BGM `muted \|\| volume === 0`, SFX `sfxVolume === 0` → 🔇/🔉/🔊 3단계 아이콘 일관 반영(이전엔 BGM은 muted 플래그, SFX는 sfxVolume=0만 봐서 슬라이더 0 드래그 시 두 섹션 아이콘이 불일치) | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.3 | src/components/game/SettingsModal.jsx | P3 |
| 1.10.11 | [Front] ★ 메인화면 KOSPI 차트·TIPS 위로 이동 — GamePage 차트(`chartButtonRef` 부근)와 TIPS Marquee 위치를 현재보다 상단으로 옮겨 시각적 무게 중심 재배치. 1695×928 좌표계에서 top 값 조정 (다른 absolute 요소 충돌 없는지 확인) | 송원호 | 대기 | 0% | 05/18 | 05/18 | 0.2 | src/pages/GamePage.jsx | P3 |
| 1.10.12 | [Front] 거래소·정보상·기술상 3개 배경 동시 교체 — `docs/ref_user/화면구성안/{거래소,정보상,기술상}.webp` 신규 시안을 각각 `public/images/{market-bg,info-merchant-bg,tech-merchant-bg}.webp`로 덮어씀. 16:9 비율 동일, JSX `backgroundImage` 경로 변경 없음(이미지만 교체). 신규 배경은 모서리에 그려진 도움말/메인/거래소/기술상 등 네비 버튼이 없는 디자인이라 기존 투명 Hotspot 4종(`HOTSPOT.*.help/main/cross-nav`) 제거 + 1.10.5 `PageNav` 가시 버튼으로 대체. 책상 위 오브젝트 핫스팟(globe/briefcase/tablet/analysis/buy/sell)은 그대로 정합 유지 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.2 | public/images/market-bg.webp, info-merchant-bg.webp, tech-merchant-bg.webp, src/pages/{Market,InfoMerchant,TechMerchant}Page.jsx | P3 |
| 1.10.13 | [Front] 메인화면 배경 교체 + NPC 핫스팟 정렬 — `메인화면.webp`(KRX 거래소 + 3 캐릭터: 여성·남성·여성 클러스터) 시안 이미지를 `public/images/game-bg.webp`로 덮어씀(596KB). GamePage NPC 핫스팟 좌표 HOTSPOT.npc 상수 추출(market/infoMerchant/techMerchant), 기존 inline `left=35%/48%/62%`·hardcoded width=14%/top=42%/height=55% → 새 배경 캐릭터 클러스터에 맞춰 width=8%/top=28%/height=64%, left 미세조정(거래소 누적 좌 -190px, 정보상 좌 -50px, 기술상 57%). NPCHotspot 시그니처에 top/width/height props 추가하여 호출부에서 좌표 전체 주입 가능 + 기존 bubbleOffsetX·glowOffsetX 보정값 제거 (클릭 영역이 캐릭터에 정확히 위치) | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.3 | src/pages/GamePage.jsx, public/images/game-bg.webp | P1 |
| 1.10.14 | [Front] 핫스팟 좌표 상수화 리팩터 — MarketPage HOTSPOT 패턴(PR #44 리뷰)을 InfoMerchantPage / TechMerchantPage / GamePage 3페이지에 동일 적용. 각 파일 상단에 HOTSPOT 객체 정의: ① InfoMerchantPage: infoMerchant(globe/briefcase/tablet/help/main/market/techMerchant 7개) + globalPopup·companyPopup·recommendPopup(close/content/topFrame/midFrame/button) ② TechMerchantPage: popup(close/topFrame/midFrame/button 4개) ③ GamePage: npc(market/infoMerchant/techMerchant 3개). 호출부는 `style={HOTSPOT.section.label}` 단일 라인 / props spread로 단순화 — InfoMerchantPage 70여 줄 inline calc → 8줄, 픽셀 미세조정(`calc(X% + Npx)`) 한곳 관리. 모든 X 버튼 클릭 영역 위치/크기 픽셀 단위 미세조정 작업이 상수 한곳 수정으로 즉시 반영 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.4 | src/pages/InfoMerchantPage.jsx, src/pages/TechMerchantPage.jsx, src/pages/GamePage.jsx | P2 |
| 1.10.15 | [Front] StockChart 캔들·거래량 막대 Y축 라벨 겹침 수정 — `StockChart.jsx` `EDGE=8→11`로 좌측 내부 여백 3px 확장. 첫/마지막 캔들과 거래량 막대가 Y축 라벨과 시각적으로 떨어지도록 보정. `toX()`/`candleWidth()`가 EDGE를 공유하므로 단일 상수 변경으로 메인 차트·거래량·MACD 히스토그램·OBV 라인 모두 일관되게 3px 우측 이동 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.1 | src/components/game/StockChart.jsx | P3 |
| 1.10.16 | [Front] 정보상 추천종목 UNLOCKED 카드 전면 리뉴얼 + 거래소 자동 매수 진입 — ① 카드 디자인 전면 개편(`InfoMerchantPage.jsx`): 헤더 `▣ INSIDER REPORT · TURN 05` → **`◆ 내부정보 단독입수 ◆`** 단독(라운드 제거) + 좌우 대칭 그라디언트 라인. 본문 좌(`flex-1`)에 **`StockChart` 통합** — 추천 종목(`insiderTip.id`)의 메인 차트 + 거래량 + 구매 지표(MA/Bollinger/MACD/OBV) 모두 노출(MarketPage 종목분석 패널과 동일 props/`scrollbar-cyan pt-3` 컨테이너). 본문 우(`w-36 md:w-44 lg:w-56`)에 **종목명 hero**(`text-xl md:text-2xl lg:text-3xl` emerald 글로우) + 가는 separator + 펄스 점·현재가 + **`주식 구매 ▶` 이동 버튼**(emerald 보더 + hover 시 `group-hover:translate-x-1` + 글로우 1.5배). 푸터 RECEIPT 영수증 라인 폐기 → `● 다음 라운드 공개` 펄스 점만. 시도 톤 이력: Data Sheet(`▣ INSIDER REPORT` 행렬 4행) → Ticker Tape(`> 라벨 ······ 값` 와이어 4행 + 점선 perforation) → 라벨 전면 제거 + StockChart 통합 + 구매 이동 버튼(최종 사용자 선택). `ReportRow`/`WireRow` 라벨 헬퍼 dead code 정리. ② 거래소 자동 매수 진입(`InfoMerchantPage.jsx` + `MarketPage.jsx`): `주식 구매 ▶` 버튼 onClick에서 `sessionStorage['market-auto-select-stock'] = insiderTip.id` + `sessionStorage['market-auto-open'] = 'buy'` 저장 후 `navigateTo('market')`. MarketPage 마운트 시 useEffect 추가하여 두 키 읽고 `setSelectedStockId(autoStock)` + `setActivePopup('buy')` 실행 후 키 즉시 제거(1회용 보장 — 새로고침/재방문 재발동 방지). autoOpen 화이트리스트(`'buy' \| 'sell' \| 'analysis'`)로 동일 패턴 다른 페이지에서도 거래소 모달 자동 오픈 재사용 가능. RecommendationView가 `useGameStore` 셀렉터로 `navigateTo` + 지표 4종 직접 구독(props drilling 회피). 결과 흐름: 정보상 추천 종목 구매 → UNLOCKED 카드에 차트 즉시 확인 → 버튼 한 번에 거래소 이동 + 추천 종목 선택된 매수 모달 자동 오픈 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.4 | src/pages/InfoMerchantPage.jsx, src/pages/MarketPage.jsx | P1 |
| 1.10.17 | [Front] PR #57 리뷰 후속 — InfoMerchantPage / MarketPage 4건 보완 — ① **권장 1** (`CompanyNewsView` 헤드라인 truncate): 헤드라인 `<p>`에 `flex-1 min-w-0` 추가. flex 자식의 기본 min-content(=`min-width: auto`)로 인해 긴 헤드라인이 `truncate` 적용되지 않고 컨테이너를 늘리던 잠재 버그 차단(1.10.16의 종목명 fix `8aa272b`와 동일 패턴). ② **권장 2** (`MarketPage` 자동 진입 useEffect): `autoStock` 사용 전 `useGameStore.getState().activeStocks`로 활성 종목 존재 검증. 유효하지 않으면 `setSelectedStockId` 스킵하고 키만 제거(1회용 보장 유지). persist 복원·라운드 진행 직후 등 엣지에서 비활성 종목 id가 들어와도 안전. useEffect 1회 실행이라 reactive 구독 불필요 → `getState()` 스냅샷. ③ **정보 3** (`MarketPage` 도움말 자동 오픈 useEffect): `sessionStorage.getItem('market-auto-open')` 가드 추가. 자동 매수 진입 신호 있을 땐 도움말 + 매수 모달 중첩을 피하려 도움말 노출 보류. `MARKET_HELP_SEEN_KEY`도 set 안 함 → 다음 일반 방문 때 정상 노출. ④ **정보 4** (`RecommendationView` 종목명): 종목명 `<p>`에 `font-sans` 추가. 상위 UNLOCKED 카드 wrapper의 `font-mono` 상속을 무효화 → 한글 종목명이 monospace로 렌더돼 자간이 어색해지던 문제 해결(Ticker Tape 톤은 헤더/구분 텍스처에만 한정) | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.2 | src/pages/InfoMerchantPage.jsx, src/pages/MarketPage.jsx | P2 |
| 1.10.18 | [Front] 거래소 배경 재교체 + 종목분석 핫스팟 원형 변환 — ① `docs/ref_user/화면구성안/거래소.webp` 신규 시안(중앙 원형 차트 홀로그램 + 좌하 주식구매 키오스크 + 우하 주식판매 키오스크 + 우측 NPC 구성)을 `public/images/market-bg.webp`로 덮어씀(1.10.12에서 1차 교체 후 시안 재수정 반영). ② `HOTSPOT.market.analysis` 좌표를 기존 wide 사각형(top 9.48% / left 27.94% / width 43.85% / height 64.14% — 중앙 컬럼 전체 커버)에서 **정사각형 비율**로 변경(top 23.63% / left 41.05% / width 18% / height `calc(18% * 16/9) = 32%`). 16:9 컨테이너에서 width%×16/9 = height%로 보정하여 픽셀 단위 정원 보장. ③ `<Hotspot label="종목분석 열기">` className `rounded-[15px]` → `rounded-full`로 교체. 내부 cyan glow border가 `rounded-[inherit]`이라 자동으로 정원 border 적용. ④ 사용자 미세조정 반복: top 19→22→21.8→23.58→23.63%, left 40→41→40.95→41.05%, 크기 20→18%(중심 고정). 결과: 새 배경의 중앙 원형 차트 링 위치에 정확히 정합되는 원형 클릭/호버 영역 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.2 | src/pages/MarketPage.jsx, public/images/market-bg.webp | P2 |
| 1.10.19 | [Front] ★★★★★ GamePage 메인 영역 디지털 보드 톤 통일 + 정보계층 재구성 + KOSPI compact/full 분기 + 확대 차트 헤더·통계 정리 — ① **3개 보드 통일** (좌측 자산 카드 / KOSPI 차트 / TIPS 전광판): `rounded-xl` + `border-2 border-cyan-500/60` + `shadow-[0_0_40px_rgba(34,211,238,0.2)]` + slate-900→950 그라데이션 일관 적용. Marquee `rounded-lg`→`rounded-xl`, shadow 20px→40px. 좌측 카드에 4모서리 L자 deco(KospiChart과 동일 시그니처). ② **좌측 카드 정보계층 재구성**: ROUND `text-4xl` 별도 줄 → 상단 컴팩트 헤더 한 줄(`● ROUND ··· 01/50`), TOTAL ASSET을 카드 최상단 히어로(`text-[2rem]` 글로우 강화 + ▲+5.00% 증감액)로 승격, 현금/평가액은 디바이더로 분리된 보조 행(`💵`/`📈` 이모지 라벨), HOLDINGS에 종목 수 표시(`3종목`). `AssetRow` highlight/delta 분기 제거(dead code). ③ **HOLDINGS 고정 높이 + scrollbar-cyan**: `h-[14rem] overflow-y-auto` + 빈 상태 수직 중앙 정렬. 종목 수와 무관하게 카드 전체 크기 통일(0종목·10종목 동일 높이), 4종목 이상부터 카드 내부 스크롤. ④ **좌측 카드 30px 우측 이동**: `left-4`(16px) → `left-[46px]`. 카드 우측 도움말 풍선 좌표도 동기화. ⑤ **KOSPI compact/non-compact 분기**: `if (compact) return <ticker />` 패턴으로 분리. compact는 단일 행 ticker(SVG 차트·footer·모서리 deco 모두 제거, 높이 188px→44px ~4배 컴팩트), non-compact는 전체 차트 + 모서리 deco + 모든 디테일 유지. ⑥ **KOSPI 헤더 한 줄 컴팩트**: 2단(메타+히어로 ~60px) → 1단(~32px) 압축. 좌측 LED+KOSPI / 우측 큰 가격 + 변동률 컬러 배지(▲상승 red-500/15 bg + 글로우 / ▼하락 blue-500/15 bg + 글로우). W/T 헤더 제거(좌측 카드 ROUND와 중복, non-compact는 footer로 이관). ⑦ **확대 차트 보강 후 정리** (사용자 반복 피드백): 현재가 우측 태그·PREGAME 라벨·세로 그리드 추가 후 모두 제거 결정, PAD.right 44→10으로 차트 우측 끝까지 펼침. 컨테이너 padding `px-3 pt-2 pb-1`→`px-4 pt-3 pb-4`(하단 4px→16px). KOSPI 헤더 텍스트 단계적 확대: LED `w-2.5`→`w-3` / 라벨 `text-base`→`text-xl` / 가격 `text-2xl`→`text-3xl` / 배지 `text-xs`→`text-sm`. 통계 footer: `OPEN/HIGH/LOW/RANGE` 4셀 → **한 줄 inline + flex justify-between**(라벨·값 baseline gap-2.5, 차트 좌→우 전체 폭 균등 배치). 박스 컨테이너 제거하고 top-border만(차트와 자연스럽게 이어짐). 라벨 `text-[11px]`→`text-base`, 값 `text-base`→`text-2xl`. ⑧ `StatCell` 헬퍼 신설(라벨+값 한 줄 inline, color로 상승/하락 톤). 결과: 메인 화면 핵심 정보가 좌측 카드(자산) + 상단 ticker(KOSPI) + 우측 NPC(이동) 3개 클러스터로 명확히 정돈, 모든 보드가 동일한 디지털 보드 시그니처로 통일 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 1.5 | src/pages/GamePage.jsx, src/components/ui/Marquee.jsx, src/components/game/KospiChart.jsx | P0 |
| 1.10.20 | [Front] ★★★★ TIPS 전광판 속도 18s → 12s 단축 + reduce-motion 오버라이드 제거 — ① `index.css` `@keyframes marquee-single` 애니메이션 duration `18s` → `12s`, `Marquee.jsx` `CYCLE_MS = 18000` → `12000`(CSS 애니메이션과 setInterval 동기 유지). ② `@media (prefers-reduced-motion: reduce)` 블록 내부의 `.animate-marquee-single { animation-duration: 40s !important }` 오버라이드 완전 제거. OS 접근성 설정("애니메이션 줄이기")이 켜진 환경에서도 의도된 12s 속도 유지 — 다른 큰 화면 전환 애니메이션(`page-enter`/`turn-transition`/`week-text`/`clock-spin`)은 reduce-motion 적용 유지(접근성 차등). ③ **트리거**: 사용자가 "전광판 속도가 의도한 대로 안나오고 있음, 다른 로직 때문에 뭔가 문제있는지 분석해봐" 요청 → 코드 정상(12s 설정) 확인 후 reduce-motion 오버라이드가 단일 원인으로 식별됨 → 사용자 선택 "reduce-motion도 12s로 통일" | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.1 | src/index.css, src/components/ui/Marquee.jsx | P1 |
| 1.10.21 | [Front] ★★★★ 메인화면 도움말 풍선 위치 재배치 + NPC 호버 풍선 NPC별 오프셋 + EXPAND 호버칩 제거 — ① **NPC 도움말 풍선 좌표 정렬** (`HelpOverlay`): 새 메인화면 배경(1.10.13)에 맞춰 NPC 3인 풍선 위치 보정. 거래소 `left: 42%` → `calc(46.5% - 190px)` (HOTSPOT center 정렬), 정보상 `calc(55% + 50px)` → `calc(52% - 50px)`, 기술상 `calc(69% + 100px)` → `61%` → 사용자 4회 좌우 ±3~10% 미세조정 후 `64%` (+3% 우측 오프셋) 확정. ② **NPC 풍선 수직 위치 단계적 하향** (사용자 2회 5% 요청): `top: 38%`(NPC 몸체 잘못 위치) → `25%`(차트와 NPC 사이) → `30%` → `35%`(NPC 얼굴 영역과 정렬). ③ **KOSPI 도움말 풍선 위로 5% 이동**: `top: calc(0.75rem + 85px)` → `calc(0.75rem + 39px)` (~46px 위로). compact ticker 위 KOSPI 라벨에 정확히 정렬. ④ **NPC 호버 풍선 NPC별 오프셋 prop 신설** (`NPCHotspot` 시그니처): `hoverBubbleTop` prop(기본 `0`) 추가. 거래소 `28px`(≈3% 아래), 기술상 `9px`(≈1% 아래), 정보상 `0`(기본). NPC별로 호버 라벨 풍선 Y 위치 미세조정 — 새 배경에서 각 NPC의 머리 위 여백이 달라서 통일 위치로는 어색한 문제 해결. ⑤ **KOSPI 차트 위 EXPAND 호버칩 제거** (`GamePage.jsx`): 새 compact ticker가 작아져서 우측 변동률 배지와 겹침. `<span>🔍 EXPAND</span>` 제거하고 cursor-pointer + `hover:scale-[1.02]` → `hover:scale-[1.03]`로 클릭 가능 시각 단서 강화. ⑥ **도움말 텍스트 갱신**: KOSPI 도움말 "올라가면 시장 분위기가 좋아요" → "빨강▲ 상승 · 파랑▼ 하락" (차트 라인 없는 compact ticker에 맞춰 배지 위주 설명) | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.4 | src/pages/GamePage.jsx | P1 |
| 1.10.22 | [Front] ★★ 정보상 국제뉴스 팝업 흐름 정리 + 도움말 풍선 입문자용 리라이팅 — ① **GlobalNewsView 상하 흐름 전환** (`InfoMerchantPage.jsx`): 기존 카드가 `flex items-center justify-center` + 내부 `<div className="my-auto">`로 콘텐츠를 카드 안에서 수직 가운데 정렬하던 구조를 CompanyNewsView처럼 카드 상단부터 위→아래로 자연스럽게 흐르도록 변경. 외부 래퍼 `h-full w-full`만 유지, 내부 wrapper `my-auto` 제거. ② **가로 스크롤 차단 + 세로 스크롤 톤 통일**: 카드에 `overflow-x-hidden` + `scrollbar-cyan` 추가(이전 `overflow-y-auto`만 있어 가로 스크롤이 잠재 노출 + 기본 회색 스크롤바). 부모 팝업 콘텐츠 컨테이너(`HOTSPOT.globalPopup.content`)는 `overflow-y-auto` → `overflow-hidden`으로 변경해 스크롤바 중첩 방지 — 실제 스크롤은 내부 카드만 담당. 헤드라인 `<p>`에 `break-keep` 추가로 가로 폭 초과 방지. ③ **globalPopup 상하 여백 균형**: `HOTSPOT.globalPopup.content.bottom` `8%` → `11%` (companyPopup과 동일). 가운데 정렬 해제 후 위→아래 흐름에서 top 14% / bottom 11%로 상하 여백 균형. ④ **도움말 풍선 3개 입문자용 리라이팅** (`HelpOverlay`): 전문 용어("섹터", "활성 종목", "헤드라인", "단독 공개") → 일상어("업종별", "소식", "알려줘요")로 변환 + 각 항목의 **플레이 영향**을 2번째 줄에 명확히 기술. 🌐 국제 뉴스 "글로벌 시장 동향 / 환율·금리·정세 영향" → "세계 시장 소식 / 전체 주가에 영향을 줘요". 💼 기업 뉴스 "활성 종목 섹터별 / 호재·악재 헤드라인" → "업종별 호재·악재 소식 / 해당 업종 주가가 움직여요". 📈 내부 정보 "총 자산의 5% 수수료로 / 다음 주 최고 상승 종목을 / 단독 공개 (라운드당 1회)" → "수수료(총자산 5%)를 내면 / 다음 주 가장 많이 오를 / 종목 1개를 알려줘요 / (라운드당 1회)" | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.2 | src/pages/InfoMerchantPage.jsx | P2 |
| 1.10.23 | [Front] ★★★ 메인화면 NPC 호버 풍선 역보정 — GamePage 스케일 래퍼(`transform: scale(scale)`) 안에 들어있는 NPC 라벨 풍선이 작은 화면에서 함께 축소되어 가독성 떨어지는 문제 해결. `NPCHotspot`에 `bubbleScale` prop 신설(기본 1), 외부 호출부에서 `Math.max(1, 1/scale)` 전달 → 화면이 클 땐 1, 작을 땐 1/scale로 풍선만 역보정. 내부 구조 분리: 외층 span은 위치(`translate(-50%, -100%)`) 유지, 내층 span에 `transform: scale(bubbleScale)` + `transformOrigin: 'bottom center'` → 화살표 끝점이 NPC 머리 위에 고정된 채 풍선 본체만 원본 사이즈 유지. (도움말 풍선/HelpOverlay 동시 수정은 사용자 요청으로 롤백 — NPC 호버 풍선만 적용) | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.2 | src/pages/GamePage.jsx | P1 |
| 1.10.24 | [Front] ★★★★ 트레이드 페이지 3종 1920×1080 scale 래퍼 도입 — MarketPage / InfoMerchantPage / TechMerchantPage 셋 다 GamePage 동일 패턴(`transform: scale`) 적용. 기존: 16:9 컨테이너 안에 `top-4 right-4` 등 고정 px의 PageNav 버튼·핫스팟 → 화면 축소 시 배경은 줄지만 버튼이 고정 크기라 비율 깨지고 NPC·키오스크 영역 침범. 변경: 각 페이지의 16:9 배경 컨테이너에 `ref` + `useLayoutEffect` + `ResizeObserver`로 `scale = clientWidth/1920` 측정 후, 그 안에 `width:1920px / height:1080px / transform:scale(scale)` 스케일 래퍼 신설. 기존 % 좌표 HOTSPOT들과 PageNav 버튼이 모두 1920×1080 캔버스 좌표계에 들어가 일관 축소. 팝업 모달은 스케일 래퍼 밖(기존 `fixed inset-0` 시블링) 유지로 영향 없음 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.4 | src/pages/MarketPage.jsx, InfoMerchantPage.jsx, TechMerchantPage.jsx | P1 |
| 1.10.25 | [Front] ★★★★ ScaledPanel 컴포넌트 신설 + 거래소 매수/매도/분석 모달 내부 비례 축소 — ① `src/components/ui/ScaledPanel.jsx` 신규: 고정 캔버스(`canvasWidth × canvasHeight`)를 부모 컨테이너에 letterbox-fit하는 transform: scale 래퍼. `maxScale` prop으로 상한 cap(과도한 확대 방지). `useLayoutEffect` + `ResizeObserver`로 컨테이너 사이즈 변화 추적, scale = `min(min(w/canvasW, h/canvasH), maxScale)`. ② MarketPage 3개 모달(analysis / buy / sell) 콘텐츠 영역(`ANALYSIS_CONTENT_BOUNDS`, `TRADE_CONTENT_BOUNDS`)을 `<ScaledPanel canvasWidth={1000} canvasHeight={620} maxScale={1.5}>`로 래핑 → 모달 축소 시 내부 종목 행/차트/버튼이 비례 축소(이전 rem/px 고정 크기로 인한 잘림 해결), 큰 화면에서 자연 확대(1920p에서 ~1.21배, 2560p+ cap 1.5배). ③ 사용자 미세조정 이력: 첫 시도 캔버스 1600×1000(letterbox만, cap 없음) → "최대화 시 작아짐" 피드백 → cap=1 + 캔버스 1335×820(자연 콘텐츠 크기, 1920p에서 scale=1) → "큰 화면 작아" → maxScale=1.5 + 캔버스 1100×680 → "작은 화면 글자 작음" → 최종 캔버스 1000×620(글자 8~9% 더 크게) | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.4 | src/components/ui/ScaledPanel.jsx, src/pages/MarketPage.jsx | P1 |
| 1.10.26 | [Front] ★★ 거래소 매수 모달 닫기/도움말 hotspot soft halo 통일 — 매수 모달의 닫기/도움말 hotspot이 `Hotspot` 컴포넌트 기본값(`glowColor='cyan'`) 사용 시 박스 윤곽(border + inset shadow) 효과로 그려져 배경의 X/? 버튼과 겹치지 않고 어색하게 보이는 문제. `glowColor="emerald"` 추가 → 매도(`glowColor='red'`)와 동일한 soft halo 패턴(radial-gradient + blur), 색상은 매수 톤(emerald)에 맞춤. 메인 화면 매수 핫스팟(`HOTSPOT.market.buy`, emerald)과 톤 일관 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.05 | src/pages/MarketPage.jsx | P2 |
| 1.10.27 | [Front] ★★ 기술상 모달 X 닫기 hotspot ObjectGlow 교체 + 좌측 8px 미세조정 — TechMerchantPage `PopupOverlay`의 X 버튼이 인라인 `<button>` + cyan 박스 윤곽(border + inset shadow)으로 그려져 매수/매도 soft halo와 톤 불일치 + 배경 X 버튼 위치와 미세 어긋남. 변경: ① 인라인 button을 같은 파일의 `<ObjectGlow>` 컴포넌트로 교체 (radial-gradient blur halo). ② `activePopup`에 따라 톤 분기 — `hiddenStocks` → **blue** (메인 ObjectGlow 깜짝종목 톤), `indicators`/`locked` → **cyan**. ③ `HOTSPOT.popup.close.right` `3.5%` → `calc(3.5% + 8px)` (사용자 2회 미세조정: +5px → +3px 누적, 좌측으로 8px 이동하여 배경 X 버튼과 정렬) | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.1 | src/pages/TechMerchantPage.jsx | P2 |
| 1.10.28 | [Front] ★★ 정보상 3종 모달 X 닫기 hotspot ObjectGlow 교체 + 톤 분기 — InfoMerchantPage `PopupOverlay`의 X 버튼이 인라인 `<button>` + cyan 박스 윤곽으로 그려지던 것을 같은 파일의 `<ObjectGlow>`로 교체 (soft halo). `activePopup`에 따라 메인 화면 책상 위 ObjectGlow와 동일 톤 분기 — `globalNews`(지구본) → **cyan**, `companyNews`(서류가방) → **amber**, `recommendation`(태블릿) → **emerald**. 한 곳 수정으로 3개 팝업 X 버튼 모두 적용 | 송원호 | 완료 | 100% | 05/17 | 05/17 | 0.1 | src/pages/InfoMerchantPage.jsx | P2 |
| 1.10.29 | [Front] ★★★★ 전 모달·페이지 키보드 단축키 — ESC 닫기 / 메인 / 종료 + Enter 확인 + 트리거 버튼 blur 픽스 — ① **공용 훅 신설**(`src/components/hooks/useEscapeKey.js` + `useEnterKey.js`): 스택 기반 키 핸들러. 가장 최근 마운트된 핸들러만 호출되어 중첩 모달(예: 매수 모달 안 도움말 오버레이) 시 ESC 1번 → 도움말만, 2번 → 매수 모달 닫힘. `enabled` 인자로 인라인 팝오버(상태 토글로 마운트되는 비-컴포넌트 모달)에도 대응. ② **ESC 닫기 — 16개 모달/오버레이 적용**: `HelpModal` / `SettingsModal` / GamePage 4종(`ExitConfirmModal` / `ChartExpandModal` / `ModalContainer` / `HelpOverlay`) + 인라인 다음 주 확인 팝오버 / InfoMerchantPage(`PopupOverlay` 3종 + `HelpOverlay`) / TechMerchantPage(`PopupOverlay` 3종 + `HelpOverlay`) / MarketPage(`PopupOverlay` 3종 + `HelpOverlayShell` 3종 + `HelpOverlay`). ③ **장소별 메인 버튼 ESC**(`PageNav.jsx` `TopRightNav`): `useEscapeKey(() => navigateTo('main'))` — 거래소·정보상·기술상에서 페이지에 모달이 떠 있을 땐 스택상 모달 핸들러 먼저 닫히고, 모달이 없을 땐 ESC가 메인으로 이동. ④ **메인화면 종료 ESC**(`GamePage.jsx`): `useEscapeKey(() => setOpenExit(true))` — 모달 없을 때 ESC = 종료 버튼 클릭(확인 모달 오픈). 토글 동작: 확인 모달이 열린 상태에서 ESC 다시 누르면 모달 ESC 핸들러(cancel)가 우선. ⑤ **Enter 확인**(`ExitConfirmModal` `useEnterKey(onConfirm)` + 다음 주 팝오버 부모 `useEnterKey(confirmNextTurn, 활성 조건)`): 종료 모달 Enter = "종료", 다음 주 팝오버 Enter = "진행 ▶". Tab으로 "취소" 버튼 잡고 Enter 시 그 버튼만 실행되도록 글로벌 Enter 훅은 `<button>`/`<input>`/`<textarea>`/`<select>` 포커스 시 스킵. ⑥ **버그 수정 — 트리거 버튼 blur**(`handleNextTurn` / `handleExit`): "다음 주" / "종료" 버튼이 클릭 후 포커스를 유지한 상태로 모달이 열려, Enter를 누르면 브라우저가 그 포커스된 버튼의 click을 발생시켜 `handleNextTurn` 토글이 다시 실행(off) → 모달만 꺼지던 버그. 상태 변경 직전 `document.activeElement?.blur?.()` 호출로 포커스를 body로 빼서 글로벌 Enter 훅이 정상 작동. ⑦ 빌드 검증 3회(ESC 1차 / 메인·종료 추가 / Enter 추가 + blur 픽스) 모두 Vite 프로덕션 빌드 통과 | 송원호 | 완료 | 100% | 05/18 | 05/18 | 0.3 | src/components/hooks/useEscapeKey.js, src/components/hooks/useEnterKey.js, src/components/game/HelpModal.jsx, SettingsModal.jsx, PageNav.jsx, src/pages/GamePage.jsx, MarketPage.jsx, InfoMerchantPage.jsx, TechMerchantPage.jsx | P1 |
| 1.10.30 | [Front] ★★★ 메인화면 TIPS 전광판 — 한 팁 끝나면 다음 팁 안 나오던 cycle 정지 + turn 진행 시 새 팁 화면 밖 머무름 두 가지 버그 픽스 — ① **버그 1 (cycle 정지)**: `GamePage`가 `<Marquee items={[currentTip]} />`로 **단일 아이템 1개만** 넘기던 호출 패턴이 문제. `Marquee` 내부 `if (!items \|\| items.length <= 1) return` 가드로 setInterval 자체가 등록 안 됨 → 한 팁(12s CSS animation forwards) 끝나면 텍스트가 화면 밖 왼쪽에 멈춰 영구적인 빈 화면. **수정**: `GamePage`에 `[...TIPS].sort(() => Math.random() - 0.5)`로 매 게임 1회 셔플한 `shuffledTips` state 신설(`useState` 초기값 lazy). `<Marquee items={shuffledTips} />`로 전체 배열 전달 → Marquee 내부 setInterval(12000ms)이 활성화되어 한 팁 끝나자마자 다음 팁 자동 cycle. `currentTip` 단일 state 및 `useEffect([turn])`로 turn마다 setCurrentTip하던 로직 완전 제거(dead code). ② **버그 2 (turn 진행 시 새 팁 안 보임)**: `Marquee` inner div `key={idx}` 고정 → 외부에서 items가 바뀔 때(turn 진행으로 currentTip 갱신 시) idx는 그대로 0이므로 React가 동일 key로 div 재사용 → CSS 애니메이션 재시작되지 않고 텍스트 내용만 갈아끼워짐 → 애니메이션이 forwards로 화면 밖에 멈춘 위치에 새 팁이 그대로 머물러 안 보임. **수정**: `key={\`${idx}-${items[idx]}\`}`로 변경 → 표시 텍스트가 바뀌면 강제 remount → CSS 애니메이션 처음부터 재시작. 다중 아이템 cycle(idx 0→1→2→0) 케이스도 매번 key가 달라져 정상 동작. ③ **트리거**: 사용자가 "한 문구가 끝나고 다음 문구가 안 나오는데?" + "텍스트가 전부 사라지고 잠시 빈 공간일 때 다음 주 버튼을 진행시 문구가 안 나옴" 두 가지 시나리오 제보 — 분석 결과 호출 측 단일 아이템 패턴(버그 1)과 Marquee 내부 key 재사용(버그 2)이 독립적 원인으로 식별됨 | 송원호 | 완료 | 100% | 05/18 | 05/18 | 0.1 | src/components/ui/Marquee.jsx, src/pages/GamePage.jsx | P1 |
| 1.10.31 | [Front] ★★ 메인화면 50주차 결과 집계 분기 + 우상단 아이콘 사이즈 통일 + 좌측 카드 라벨 확대 + 다음 주 popover 인디케이터 톤 통일 — ① **마지막 턴 UX 분기**(`GamePage.jsx`): `isLastTurn = turn >= totalTurns` 플래그 신설, 50주차에서만 "다음 주" 흐름 카피를 "결과 집계" 톤으로 전환. 우하단 버튼 `다음 주 ▶` → `결과 집계 🏁`, popover 인디케이터 `NEXT TURN` → `FINAL RESULT`, 타이틀 `다음 주로 이동하시겠습니까?` → `최종 결과를 집계하시겠습니까?`, 경고문 `⚠️ 진행 후엔 되돌릴 수 없습니다.` → `🏁 50주 게임 끝. 결과 화면으로 이동합니다.`(사용자 카피 단축), 확인 버튼 `진행 ▶` → `결과 보기 🏁`. 기존 `nextTurn` 마지막 턴 처리(`page: 'result'`)는 그대로 — UI 카피만 분기. ② **우상단 아이콘 사이즈 통일**(`GamePage.jsx`): 4개 페이지(GamePage / MarketPage / InfoMerchantPage / TechMerchantPage) 우상단 IconButton 시각 사이즈 풀스크린 통일. 원인 — GamePage 캔버스(1695×928) vs 다른 페이지(1920×1080)로 동일 `w-14 h-14` 아이콘이 GamePage 스케일 래퍼에서 ~13% 크게 렌더(1920p 기준 63.4px vs 56px). 해결: GamePage 우상단 아이콘 그룹을 `transform: scale(1695/1920)` + `transformOrigin: 'top right'` counter-scale 래퍼로 감쌈 + 위치/간격을 `TopRightNav`와 통일(`top-3 right-3 gap-2` → `top-4 right-4 gap-3`). PageNav 공용 IconButton 자체는 변경 없음. ③ **좌측 자산 카드 라벨 확대**(`GamePage.jsx`): 디지털 보드 시그니처(`font-mono tracking-[0.3em]` + 시안 톤) 유지하면서 라벨 가독성 강화. ROUND 라벨 `text-[11px]` → `text-lg + font-bold`(사용자 1회 추가 확대 요청 후 sm → lg), ROUND 카운터(01/50) `text-sm` → `text-lg`, TOTAL ASSET/HOLDINGS/종목수 라벨 모두 `text-[10px]` → `text-sm + font-bold`. ④ **다음 주 popover 인디케이터 통일**(`GamePage.jsx`): NEXT TURN / FINAL RESULT 인디케이터 라벨을 모두 `text-base + font-bold + textShadow: 0 0 10px rgba(34,211,238,0.6)` 시안 글로우로 통일. popover 내부에서 너무 작던 `text-[10px]` 인식성 문제 해결. ⑤ **트리거**: 풀스크린에서 페이지별 우상단 버튼 사이즈 차이 + 50주차 "다음 주" 카피 어색 + 좌측 카드 라벨 가독성 부족을 사용자가 차례로 제보 → 5개 마이크로 작업으로 통합 | 송원호 | 완료 | 100% | 05/18 | 05/18 | 0.2 | src/pages/GamePage.jsx | P2 |
| 1.10.32 | [Front] ★ 다음 주 / 결과 집계 흐름 도움말·버튼 카피 정리 (PR #80 리뷰 후속) — ① **HelpBubble 분기 제거**(`GamePage.jsx`): 우하단 "다음 주" 버튼 위 도움말 풍선이 50주차에 버튼 라벨이 "결과 집계"로 바뀌면 카피와 어긋나던 문제(PR #80 리뷰에서 지적). turn별 분기 대신 **상시 동일 카피**로 두 동작 함께 안내. 헤더 `▶ 다음 주로` → `▶ 다음 주 / 결과 집계`. 본문 `한 주를 보내고 주가 갱신 / ⚠️ 누르면 되돌릴 수 없어요` → `한 주 보내고 주가 갱신 / 50주차: 최종 결과 화면으로 이동 / ⚠️ 누르면 되돌릴 수 없어요`. 사용자 2회 카피 단축 요청: 헤더의 🏁 이모지 제거 / 본문 첫 줄 "평소:" 접두 제거. ② **popover 확인 버튼 아이콘 제거**(`GamePage.jsx`): 50주차 popover 확인 버튼 `결과 보기 🏁` → `결과 보기`, 평소 popover 확인 버튼 `진행 ▶` → `진행`. 버튼 라벨을 한 단어로 간결하게 — 모달 본문 카피가 이미 맥락(`최종 결과를 집계하시겠습니까?` / `다음 주로 이동하시겠습니까?`) 제공. ③ **트리거**: PR #80 리뷰의 "HelpBubble 카피 드리프트" 지적 → 사용자가 turn별 분기 대신 풍선 자체에 두 동작 설명을 넣는 방향 제시 → 헤더/본문 단계적 다듬기 + popover 버튼 아이콘 시각 잡음 정리 | 송원호 | 완료 | 100% | 05/18 | 05/18 | 0.05 | src/pages/GamePage.jsx | P3 |

---

---

## 1.12 뉴스 시스템 고도화 (배영환 — 2026-05-17 추가)

> 기간: 2026-05-17 | 담당: 배영환 | PR: #54 (머지 가능)
> 목적: 라운드당 기업뉴스 0~3개 → 3~5개 보장, 국제뉴스 detail 가시성 개선

| WBS | 태스크 | 담당자 | 상태 | 진척도 | 계획 시작 | 계획 종료 | 기간(일) | 산출물 | 우선순위 |
|-----|--------|--------|------|--------|-----------|-----------|----------|--------|----------|
| 1.12.1 | [데이터] news-events.json 85→170개 확장 — 기업뉴스 n86~n170 추가(날짜별 ≥3개 보장), 국제뉴스 14개 detail 30~60자 → 100~150자 리라이팅 | 배영환 | 완료 | 100% | 05/17 | 05/17 | 0.5 | src/data/news-events.json | P0 |
| 1.12.2 | [로직] gameLogic.js 기업뉴스 3~5개 보장 로직 — 날짜 매칭 → ±4턴 윈도우 → 전체 pool 3단계 보충, dateIndexMap Map O(1) 최적화(indexOf 반복 제거), nearbyIds Set 중복 방지, mulberry32 시드 RNG 결정적 셔플 | 배영환 | 완료 | 100% | 05/17 | 05/17 | 0.5 | src/lib/gameLogic.js | P0 |
| 1.12.3 | [QA] gameLogic.test.js 보강 — 7케이스→14케이스: 기업뉴스 3~5개 보장·라운드 내 ID 중복 없음·결정성·날짜 매칭 우선, globalNews 모든 턴 null 아님·sector=전체 검증 추가 | 배영환 | 완료 | 100% | 05/17 | 05/17 | 0.3 | src/__tests__/lib/gameLogic.test.js | P1 |
| 1.12.4 | [UI] NewsPanel.jsx 뉴스 detail 가시성 개선 — 국제/기업뉴스 detail text-xs text-gray-400 → text-sm text-gray-200 + leading-relaxed + 구분선(border-t) + TODO 주석 제거 | 배영환 | 완료 | 100% | 05/17 | 05/17 | 0.1 | src/components/game/NewsPanel.jsx | P1 |
| 1.12.5 | [UI] InfoMerchantPage.jsx CompanyNewsView detail 가시성 개선 — text-xs text-cyan-100/80 → text-sm text-cyan-100/90 + border-t border-cyan-500/25 + pt-2 mt-2 | 배영환 | 완료 | 100% | 05/17 | 05/17 | 0.1 | src/pages/InfoMerchantPage.jsx | P1 |
| 1.12.6 | [QA] PR #54 생성 + 2차 코드 리뷰 완료 — filler 중복 버그 수정, dateIndexMap 성능 개선, 테스트 보강, 리뷰 결론: 필수 수정 없음 머지 가능 | 배영환 | 완료 | 100% | 05/17 | 05/17 | 0.2 | GitHub PR #54 | P1 |

---

## 1.13 뉴스 실제이벤트 교체 + 브라우저 호환 (배영환 — 2026-05-17 추가)

> 기간: 2026-05-17 | 담당: 배영환 | PR: #65
> 목적: 픽션 뉴스 → 실제 2025~2026 한국 금융시장 이벤트 기반으로 전면 교체, 브라우저 호환성 강화

| WBS | 태스크 | 담당자 | 상태 | 진척도 | 계획 시작 | 계획 종료 | 기간(일) | 산출물 | 우선순위 |
|-----|--------|--------|------|--------|-----------|-----------|----------|--------|----------|
| 1.13.1 | [데이터] 국제뉴스 50개 실제 한국 금융시장 이벤트 기반 전면 교체 — 기존 13개 픽션 → 실제 이벤트 기반 교체, n171~n207 37개 신규 추가로 게임 50일 전체 커버 (이재명 당선 6.3, 한미관세 15% 타결, 코스피 4000~7000 돌파, 미이란 전쟁 충격, HBM 슈퍼사이클) | 배영환 | 완료 | 100% | 05/17 | 05/17 | 1.0 | src/data/news-events.json | P1 |
| 1.13.2 | [데이터] 국제뉴스 전체 detail 1000자 이상 보장 — 모든 50개 항목 1000자 이상 검증, n13(809자→1059자) 포함 전수 수정 | 배영환 | 완료 | 100% | 05/17 | 05/17 | 0.3 | src/data/news-events.json | P1 |
| 1.13.3 | [데이터] 기업뉴스 157개 실제 한국 시장 이벤트 기반 전면 교체 — 반도체·바이오·2차전지·자동차·조선·방산·금융 등 20개 섹터 전부 실제 기업·정책·계약 사건으로 교체 (유한양행 렉라자 FDA, 한화오션 미해군 MRO, K9 폴란드, KF-21 인도네시아, 체코 원전 등) | 배영환 | 완료 | 100% | 05/17 | 05/17 | 0.5 | src/data/news-events.json | P1 |
| 1.13.4 | [chore] PC 브라우저 호환성 패치 — browserslist 설정으로 autoprefixer webkit 접두사 자동화, @keyframes에 -webkit-backdrop-filter 추가, Vite build.target 명시, IE/구형 Edge 안내 배너 | 배영환 | 완료 | 100% | 05/17 | 05/17 | 0.2 | index.html, package.json, src/index.css, vite.config.js | P2 |

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
| `WOHNO` (현재) / `feature/ui-polish-1.10` | 송원호 | 1.10.1~1.10.21 |

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
