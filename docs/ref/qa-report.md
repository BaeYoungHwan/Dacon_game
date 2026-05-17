# QA 통합 리포트

> 두 트랙으로 운영: **자동화 테스트**(Vitest 단위·통합, 배영환 영역) + **시나리오 검증**(UI/플로우 코드 워크스루, 송원호 영역)
> 최신 갱신: 2026-05-18 — 시나리오 검증 트랙 + 1.11 이슈 트래킹 추가

---

# Part 1 — 자동화 테스트 (Vitest)

**작성일:** 2026-05-17 초안 / 2026-05-18 케이스 수 갱신
**대상 브랜치:** WOHNO (master 동기화 상태)
**테스트 러너:** Vitest v4.1.6 + jsdom

## 실행 결과 요약

| 항목 | 값 |
|------|-----|
| 테스트 파일 | 5개 |
| 총 테스트 케이스 | **75개** (05/17 65개 → 05/18 75개, 1.12 뉴스 시스템 보강분 반영) |
| 통과 | **75개 (100%)** |
| 실패 | 0개 |
| pass^3 검증 | ✅ 3회 연속 동일 결과 |
| 실행 시간 | ~1.9s |

## 파일별 테스트 현황

| 파일 | 케이스 수 | 담당 |
|------|----------|------|
| `src/__tests__/lib/grade.test.js` | 12 | 배영환 |
| `src/__tests__/lib/gameLogic.test.js` | 14 (1.12.3 보강 +7) | 배영환 |
| `src/__tests__/store/gameStore.test.js` | 23 | 배영환 |
| `src/__tests__/components/chartUtils.test.js` | 19 + α (1.10.9 보강) | 배영환 |
| `src/__tests__/integration/gameTurnFlow.test.js` | 4 | 배영환 |

## 커버리지 (`npm run test:cover`, 2026-05-17 시점)

| 파일 | Stmts | Branch | Funcs | Lines | 비고 |
|------|-------|--------|-------|-------|------|
| `chartUtils.js` | **94.6%** | 81.7% | **100%** | 98.8% | ✅ 목표 초과 |
| `gameStore.js` | 41.5% | 47.8% | 30.8% | 48.7% | ⚠️ 미커버 영역 있음 |
| `supabase.js` | 71.4% | 75.0% | 100% | 71.4% | 연결 코드, 테스트 환경 외 |
| `audioManager.js` | 0% | 0% | 0% | 0% | 🔕 의도적 미포함 |
| `audioStore.js` | 0% | 100% | 0% | 0% | 🔕 의도적 미포함 |
| `leaderboardStore.js` | 9.1% | 0% | 20% | 5% | Supabase 의존, 테스트 환경 외 |

> `grade.js`, `gameLogic.js`는 커버리지 리포트에 별도 집계되지 않음 (v8 이슈).
> 해당 파일의 핵심 로직은 grade.test.js / gameLogic.test.js에서 전량 커버함.
> 커버리지 수치는 05/17 시점 기준. 05/18 케이스 추가분(+10) 반영 시 chartUtils·gameLogic 영역 추가 상승 예상.

## 커버리지 분석

### gameStore.js 미커버 영역 (의도적 제외)

| 함수 | 미커버 이유 |
|------|------------|
| `startGame` | `splitStocks` 랜덤 로직 + 실제 JSON 의존 — 통합테스트 범위 |
| `nextTurn` | `gameTurnFlow.test.js` 통합테스트에서 부분 커버 |
| `resetGame` | 상태 초기화 단순 로직, 리스크 낮음 |
| `navigateTo`, `setNickname` | 1줄 set 래퍼, 테스트 불필요 |

### audioManager / audioStore (0%)

Web Audio API는 jsdom 환경에서 구동 불가 → 의도적으로 커버리지 대상 제외.
실제 소리 재생 동작은 Part 2 시나리오 검증에서 수동 확인.

## 미작성 테스트 (송원호 영역)

| 파일 | 케이스 수 | 상태 |
|------|----------|------|
| `src/__tests__/components/StockChart.test.jsx` | 6 | ❌ 미작성 |
| `src/__tests__/pages/ResultPage.test.jsx` | 5 | ❌ 미작성 |

→ `src/components/`, `src/pages/` 담당자가 작성 필요.

## 검증된 핵심 시나리오

### 비즈니스 로직
- 매수: 잔액 충분/부족/정확히 일치, purchaseRounds 최초 기록 및 유지
- 매도: 부분/전량, 전량 시 portfolio·purchaseRounds 키 삭제
- 종목 해금: hiddenStocks → activeStocks 이동
- 패키지 구매: cash 차감, portfolio에 quantity 추가, packagePrice 재합산
- 지표 구매: 4종(MA/볼린저/MACD/OBV) 정상 플래그 설정
- 내부자정보: last_turn, 중복, 잔액 부족, 수수료 계산(총자산×5%), 정상 구매

### 보안
- `insiderTip.nextClose`, `nextRatio` → localStorage 미저장 확인

### 기술 지표
- MA: 확장 평균, null 없음
- 볼린저밴드: 단일/동일 가격/분산 시 band 폭
- MACD: null 경계(index 25), histogram 정확도
- OBV: 상승/하락/동일 봉 처리
- 신호 감지: 골든크로스, 데드크로스, 과매수/과매도, MACD 크로스

### 등급 산출
- calcExcessPp: 양수/음수/동일
- getGrade: 10개 경계값 전량 검증, GRADES 내림차순 확인

### 뉴스 시스템 (1.12.3 추가)
- 기업뉴스 3~5개 보장 / 라운드 내 ID 중복 없음 / 결정성 / 날짜 매칭 우선
- globalNews 모든 턴 null 아님 / sector=전체 검증

## 실행 명령

```bash
npm test            # 단위 + 통합 (75개)
npm run test:3      # pass^3 검증
npm run test:cover  # 커버리지 리포트
```

---

# Part 2 — 시나리오 검증 (UI/플로우)

**작성일:** 2026-05-18
**베이스 커밋:** `33f6c61` "Merge 260518 결과집계 모달 생성 및 도움말 문구 보강"
**범위:** 최근 5개 커밋 변경분 — 50주차 결과 집계 모달, TIPS 전광판 cycle, 키보드 단축키, 우상단 아이콘, 좌측 카드 라벨

## 환경 베이스라인

| 항목 | 결과 |
|------|------|
| `npm install` | ✅ 107 packages 추가 설치 (devDeps 누락 상태였음 — 이슈 1.11.5) |
| `npm run build` (vite) | ✅ 3.35s 통과, 106 modules |
| `npm test` (vitest run) | ✅ 5 files / **75/75 tests passed** (1.92s) |
| `npm run dev` (HTTP 200) | ✅ 로컬 5173 응답 확인 |

### 빌드 산출물
- `dist/index.html` 1.24 KB
- `dist/assets/index-*.css` 72.05 KB (gzip 10.77 KB)
- `dist/assets/index-*.js` **679.69 KB** (gzip 221.08 KB) ⚠️ 500KB 임계치 초과

## 시나리오별 결과 (7건 / 6 Pass · 1 Partial)

### 시나리오 A — Start → Game 진입 (✅ Pass)

흐름: StartPage → 닉네임 입력 → Enter/GAME START → `startGame()` → `page: 'intro'` → IntroScene → `finishIntro()` → `page: 'main'` → `isFirstPlay=true` → GamePage 마운트 시 도움말 자동 오픈 → `clearFirstPlay()`.

- `StartPage.jsx:55-56`: Enter 키 입력 시 `handleStart()` 호출 ✓
- `gameStore.js:107-141 startGame`: 캐시·portfolio·purchaseRounds·indicator 플래그 모두 리셋 ✓
- `GamePage.jsx:76-81`: `isFirstPlay` true면 `setOpenHelp(true)` + `clearFirstPlay()` (mount 1회) ✓
- 좌측 카드 ROUND `01 / 50` 표시, 우상단 아이콘 3개 (도움말/설정/종료), 우하단 "다음 주 ▶" 버튼 ✓

### 시나리오 B — 50주차 결과 집계 분기 (✅ Pass)

`isLastTurn = turn >= totalTurns` (GamePage.jsx:225)

| 위치 | 일반 라운드 | 50주차 |
|------|------------|--------|
| 다음 주 버튼 라벨 | `다음 주 ▶` | `결과 집계 🏁` |
| Popover 헤더 | `NEXT TURN` | `FINAL RESULT` |
| Popover 제목 | `다음 주로 이동하시겠습니까?` | `최종 결과를 집계하시겠습니까?` |
| Popover 부제 | `⚠️ 진행 후엔 되돌릴 수 없습니다.` | `🏁 50주 게임 끝. 결과 화면으로 이동합니다.` |
| 확인 버튼 라벨 | `ENTER` (1.11.1에서 통일) | `ENTER` (1.11.1에서 통일) |
| 트랜지션 텍스트 | `WEEK 51` | `🏁 GAME OVER · 50주 게임이 끝났습니다 ·` |

`confirmNextTurn` → `progressTurn(51, ...)` → 1000ms 트랜지션 → `nextTurn`에서 `isLast=true` 분기 → `prices: prevPrices`(가격 동결) + `page: 'result'`. ResultPage가 마운트되어 등급/자산 차트/랭킹 버튼이 표시됨. (`gameStore.js:143-158`) ✓

### 시나리오 C — TIPS 전광판 cycle (✅ Pass)

- `GamePage.jsx:72`: `useState(() => [...TIPS].sort(...))`로 한 게임당 1회 셔플, 안정적 reference.
- `Marquee.jsx:19-26`: items prop이 바뀔 때만 `setIdx(0) + setInterval(12s)` 재시작. shuffledTips reference가 stable이므로 매 렌더마다 reset되지 않음. ✓
- `key={`${idx}-${items[idx]}`}` — idx 변경 시 새 요소 마운트 → CSS animation 재시작. animation duration과 CYCLE_MS 12000ms 일치. ✓
- 단일 팁만 넘기는 회귀를 막기 위해 length>1 가드 존재. ✓

### 시나리오 D — 키보드 단축키 (⚠️ Partial → 1.11.1 완료 후 ✅)

- `useEscapeKey`: 스택 기반으로 가장 최근 등록된 핸들러만 실행. 중첩 모달 ESC 1회당 1개만 닫힘. ✓
- `useEnterKey`: `BUTTON/INPUT/TEXTAREA/SELECT` 포커스 시 스킵하여 이중 트리거 방지. ✓
- GamePage `useEnterKey(confirmNextTurn, openNextTurn && !isTurnTransition)` — 다음 주 popover에서 Enter = 진행. ✓
- 거래소/정보상/기술상 페이지의 `TopRightNav`: ESC = `navigateTo('main')` ✓
- StartPage input: Enter = `handleStart()` ✓

⚠️ **발견된 이슈 → 1.11.1로 트래킹·해결 완료** (Part 3 참조): `ExitConfirmModal`이 `useEnterKey(onConfirm)`을 묶고 있어 ESC로 종료 모달 열린 직후 Enter 시 즉시 게임 종료되던 위험. 2026-05-18 1.11.1에서 키 바인딩 제거 + 효과음 부작용 fix까지 처리됨.

### 시나리오 E — HelpOverlay 풍선 위치 (✅ Pass)

- TIPS / KOSPI ticker / 좌측 자산 카드 / 우상단 메뉴 / 우하단 다음 주 풍선 5개 배치. ✓
- NPC 풍선 좌표 검증:
  - 거래소 `HOTSPOT.market.left = calc(42.5% - 190px)` width 8% → center = `calc(46.5% - 190px)` ↔ HelpBubble `left: 'calc(46.5% - 190px)'` ✓
  - 정보상 `HOTSPOT.infoMerchant.left = calc(48% - 50px)` width 8% → center = `calc(52% - 50px)` ↔ HelpBubble `left: 'calc(52% - 50px)'` ✓
  - 기술상 `HOTSPOT.techMerchant.left = 57%` width 8% → center 61%, HelpBubble은 `left: '64%'` (의도적 +3% 우측 오프셋, 주석 명시) ✓
- "다음 주 / 결과 집계" 풍선 카피가 50주차에도 동일하게 노출 → turn 분기 도움말 없음(의도). ✓

### 시나리오 F — 우상단 아이콘 사이즈 통일 (✅ Pass)

- GamePage 캔버스 1695×928 / 다른 페이지 1920×1080 → `transform: scale(1695/1920)` counter-scale (GamePage.jsx:400-403)로 시각 사이즈 통일. ✓
- IconButton 공통 클래스 `w-14 h-14 rounded-full` (PageNav.jsx:82) ✓

### 시나리오 G — 좌측 카드 라벨 확대 (✅ Pass)

- ROUND/TOTAL ASSET/HOLDINGS 모두 `font-mono tracking-[0.3em] font-bold` 적용 (GamePage.jsx:264, 273, 307).
- 'TOTAL ASSET' 히어로 영역 `text-[2rem]` + textShadow 시안 글로우, 직전 라운드 대비 ▲/▼ % + 금액 표시(`Math.abs(...) >= 0.005` 가드로 미세 변동 숨김). ✓
- HOLDINGS 영역 고정 높이 14rem + scrollbar-cyan으로 4종목 이상부터 내부 스크롤. ✓

---

# Part 3 — 발견된 이슈 / 트래킹

> 🔴 차단(P0) · 🟡 권고(P1) · 🟢 제안(P2~3)
> 상태: ✅ 완료 / ⏳ 잔여

### ✅ 1.11.1 (🟡 P1) — ExitConfirmModal Enter = 즉시 게임 종료 위험
- **위치**: `src/pages/GamePage.jsx:543` `useEnterKey(onConfirm)`
- **원인**: 모달이 자동 포커스를 안 줘서 Enter의 `e.target`이 body → `useEnterKey`의 BUTTON 가드 통과 → 글로벌 핸들러 실행 → `confirmExit` → `resetGame` (게임 진행 상황 전체 소실 + StartPage 이동)
- **해결 (2026-05-18)**: Enter 키 바인딩 제거 + `handleExit` 인라인 + 효과음 잔존 부작용도 fix (`useEffect`로 모달 마운트 시 외부 트리거 button blur). 추가로 popover 확인 버튼 라벨을 `진행/결과 보기` → `ENTER`로 통일

### ✅ 1.11.2 (🟡 P2) — HelpModal.jsx 데드코드 + stale 등급 설명
- **위치**: `src/components/game/HelpModal.jsx`
- **원인**: import 0건 데드코드. 추가로 `2배 이상 — 레전드 / 1.5배 — 마스터` 옛 단순 배수 기반 등급 설명 (실제 시스템은 `src/lib/grade.js`의 KOSPI 대비 초과수익률 기반 6단계)
- **해결 (2026-05-18)**: 파일 삭제 + README.md:184 폴더 트리에서 해당 줄 제거

### ⏳ 1.11.3 (🟢 P2) — 번들 679KB 단일 청크
- **위치**: 빌드 산출물 `dist/assets/index-*.js`
- **현황**: gzip 221KB, 임계치 500KB 초과 경고. 모든 페이지/모달이 단일 청크
- **권장**: `vite.config.js` `build.rollupOptions.output.manualChunks`로 page 단위 dynamic import 또는 vendor 청크 분리. 첫 페인트는 StartPage뿐이므로 Game/Market/InfoMerchant/TechMerchant/Result는 lazy 로딩 후보
- **담당**: 배영환 영역 (vite config) — 카카오톡 협의 필요

### ⏳ 1.11.4 (🟢 P2) — Vite 6 oxc deprecation warning
- **위치**: 빌드 로그 — `"esbuild" option was specified by "vite:react-babel" plugin. This option is deprecated, please use "oxc" instead.`
- **현황**: 빌드는 통과하지만 다음 메이저 Vite/플러그인 버전에서 깨질 수 있음
- **권장**: `@vitejs/plugin-react` 최신화 또는 vite.config의 esbuild 옵션을 `optimizeDeps.rolldownOptions`/`oxc`로 마이그레이션
- **담당**: 배영환 영역 (vite config) — 카카오톡 협의 필요

### ⏳ 1.11.5 (🟢 P3) — devDependencies 누락 환경 `npm test` 즉시 실패
- **재현**: 새 클론 또는 `npm install --omit=dev` 상태에서 `npx vitest`/`npm test` → jsdom 미발견으로 5개 worker 모두 실패. 메시지만으로는 원인 파악이 어려움
- **권장**: README 또는 `docs/ref/testing-patterns.md`에 "devDependencies 포함 `npm install` 필수" 명시. 또는 `npm test`에 사전 가드(예: `node -e "require('jsdom')"`) 또는 `postinstall` 점검 스크립트 추가
- **담당**: 배영환 영역 — 카카오톡 협의 필요

### ⏳ 1.11.6 (🟢 P3) — `TipBox` 컴포넌트 default export 미사용 가능성
- **위치**: `src/components/game/TipBox.jsx`
- **현황**: 외부에서 `import { TIPS }`로 배열만 사용. `export default function TipBox()` 컴포넌트 자체는 grep 상 사용처 없음
- **권장**: 사용처 재확인 후 미사용이면 `TipBox.jsx`를 `tips.js` 등 데이터 모듈로 단순화
- **담당**: 송원호 영역 (components/game)

---

## 변경 이력

| 일자 | 변경 |
|------|------|
| 2026-05-17 | Part 1 자동화 테스트 초안 작성 (1.10.8) — 65개 케이스 / Vitest + 커버리지 |
| 2026-05-18 | Part 2 시나리오 검증 추가 (HEAD `33f6c61`) — 7건 시나리오 / 6 이슈 발견 |
| 2026-05-18 | 1.11.1 · 1.11.2 해결, Part 3 트래킹 상태 갱신 / Part 1 케이스 수 65→75 동기화 |
