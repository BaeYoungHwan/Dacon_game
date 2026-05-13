# 컴포넌트 Props 명세서

> 신입 개발자 참고용 — Day 2~3 UI 구현 시 이 명세 기준으로 작성
> 업데이트: 2026-05-13

---

## 핵심 규칙

- **스텁 파일**이 이미 생성되어 있음 (`src/components/`, `src/pages/`)
- `TODO(신입):` 주석 위치를 찾아 해당 영역만 개선하면 됨
- store에 직접 접근하는 로직은 **Page 파일에만** 있음 — 컴포넌트는 props만 받음

---

## 페이지 (Pages)

### StartPage (`src/pages/StartPage.jsx`)
- store에서 직접 `setNickname`, `startGame` 사용
- **할 일**: 디자인 개선, 게임 규칙 안내 텍스트 추가

### GamePage (`src/pages/GamePage.jsx`)
- 모든 store 연결 완료 — 컴포넌트에 props 전달만 함
- **할 일**: 레이아웃 개선, 모바일 반응형 적용

### ResultPage (`src/pages/ResultPage.jsx`)
- 최종 자산 계산, 랭킹 등록 로직 완료
- **할 일**: 결과 화면 디자인 개선

---

## 게임 컴포넌트 (src/components/game/)

### StockBoard
```jsx
<StockBoard
  stocks={[{ id, name, sector, price }]}   // 종목 배열
  prices={{ "005930": 74800, ... }}          // 현재 주가
  portfolio={{ "005930": 3, ... }}           // 보유 주식
  onBuy={(stockId, quantity) => void}        // 매수 (1주씩)
  onSell={(stockId, quantity) => void}       // 매도 (1주씩)
/>
```
- **할 일**: 매수/매도 수량 선택 UI, 등락률 색상 적용, 섹터 뱃지

### NewsPanel
```jsx
<NewsPanel
  news={{ id, headline, detail, sector, effect } | null}
/>
```
- `news`가 null이면 렌더링하지 않음
- `effect > 0` → 호재(빨강), `effect < 0` → 악재(파랑)
- **할 일**: fade-in 애니메이션, 헤드라인 강조 스타일

### TurnControl
```jsx
<TurnControl
  turn={number}           // 현재 턴 (1부터 시작)
  totalTurns={number}     // 전체 턴 수 (기본 50)
  onNextTurn={() => void} // 다음 날 진행
/>
```
- **할 일**: 프로그레스 바 디자인, 날짜 형식 표시 (예: "1일차 / 50일")

### Portfolio
```jsx
<Portfolio
  stocks={[{ id, name }]}                 // 종목 배열
  prices={{ stockId: number }}             // 현재 주가
  portfolio={{ stockId: quantity }}        // 보유 주식
  cash={number}                            // 현금 잔액
/>
```
- **할 일**: 총 자산 강조, 수익률 표시, 보유 종목별 평가손익

---

## 공용 컴포넌트 (src/components/ui/)

### Button
```jsx
<Button
  onClick={() => void}
  variant="primary"    // 'primary' | 'danger' | 'ghost'
  disabled={false}
>
  버튼 텍스트
</Button>
```

### Modal
```jsx
<Modal
  isOpen={boolean}
  onClose={() => void}
  title="제목"
>
  <p>모달 내용</p>
</Modal>
```

---

## 랭킹 컴포넌트 (src/components/leaderboard/)

### Leaderboard
- Props 없음 — store에서 직접 rankings 가져옴
- **할 일**: 상위 3위 하이라이트, 내 점수 강조

---

## Tailwind 색상 가이드

```
상승(빨강):  text-rise  / bg-rise    (tailwind.config에 정의됨)
하락(파랑):  text-fall  / bg-fall
배경:        bg-gray-900 (앱 배경) / bg-gray-800 (카드)
```

## 애니메이션 규칙

- 모든 hover/transition: `transition-all duration-150` (150ms)
- fade-in 효과 필요 시: `animate-pulse` 또는 직접 CSS 작성
- **300ms 이상 애니메이션 금지** (빠른 게임 템포 유지)

---

# 🔵 Day 2 추가 — 송원호 요청 (배영환 확인 필요)

> 작성: 2026-05-14 송원호 / 상태: 배영환 합의 대기
> proposal-v1.md의 정보상/기술상 시스템을 반영하려면 store·App.jsx 확장이 필요합니다.

## 1. 페이지 라우팅 확장 요청

현재 `gameStore.page`는 `'start' | 'game' | 'result'` 3개. 다음 상태 추가 필요:

```
'start' → 'main' → 'market' / 'info' / 'tech' → (다시) 'main' → 'result'
```

| 추가 page 값 | 화면 | 비고 |
|---|---|---|
| `'main'` | MainPage (허브) | startGame() 호출 후 진입 지점을 'game'에서 **'main'으로 변경** 요청 |
| `'market'` | MarketPage (기존 GamePage 분리) | 거래소 — 매수/매도만 |
| `'info'` | 정보상 모달 (page가 아닌 모달 토글로 처리해도 OK) | |
| `'tech'` | 기술상 모달 (동일) | |

**요청 함수**: `setPage(target)` — 단순히 `set({ page: target })` 호출. MainPage의 장소 이동 버튼에서 사용.

## 2. MainPage Props (없음 — store 직접 사용)

`src/pages/MainPage.jsx` 작성 완료. 사용하는 store 상태:
- 읽기: `turn`, `totalTurns`, `cash`, `portfolio`, `prices`, `activeStocks`, `currentNews`, `kospi`, `exchangeRate`, `getFinalAssets()`
- 호출: `nextTurn(progressTurn 결과)`
- **필요**: `setPage` (위 1번 항목)

## 3. 등급 시스템 — gameLogic.js로 이전 요청

MainPage 안에 등급 계산을 임시로 구현했습니다 (proposal-v1 등급표). 추후 `src/lib/gameLogic.js`로 옮겨 ResultPage·EndPage에서도 재사용하면 좋습니다.

```js
// 시그니처 제안
export function getGrade(myReturn, kospiReturn) // → { label, threshold, color, emoji }
```

등급 임계값 (단위: 초과수익률 %p):
- `+200 초과` 전설의 동학개미
- `+50 ~ +200` 작전세력
- `0 ~ +50` 큰손
- `-10 ~ 0` 슈퍼개미
- `-10 이하` 개미

## 4. 정보상 시스템 — 명세 요청

proposal-v1 §2 "정보 비대칭 시스템"에 맞춰, 배영환이 정해줄 부분:

### 4-1. store 상태 (제안)
```js
// gameStore에 추가 예상
infoMerchant: {
  prices: { news: number, recommendation: number, intlNews: number }, // 라운드별 변동
  purchased: {
    nextRoundNewsPreview: News | null,   // 이번 라운드에 구매한 다음 라운드 뉴스
    recommendedStockId: string | null,
    intlNewsHistory: News[]
  }
}
buyInfo(type)  // 'news' | 'recommendation' | 'intlNews'
```

### 4-2. 정해야 할 게임 디자인 값
- [ ] 정보 카테고리별 기본 가격 (10만/30만/5만 어떤 비율?)
- [ ] 라운드별 가격 변동폭 (±20%?)
- [ ] "추천 종목"이 실제로 오를 확률 (마케팅용이라 거짓 정보도 섞일지?)
- [ ] 뉴스 미리보기 정확도 (100% 정확한 다음 라운드 뉴스인지, 방향만 알려주는지)

## 5. 기술상 시스템 — 명세 요청

### 5-1. store 상태 (제안)
```js
techMerchant: {
  hiddenStocks: Stock[],            // 게임 시작 시 제외된 10종목 (gameStore에서 셔플 시 분리)
  revealedStockIds: string[],       // 이미 공개한 종목 ID
  revealPrices: { [stockId]: number } // 종목별 공개 비용
}
revealStock(stockId)  // 비용 차감 + revealedStockIds에 추가
```

### 5-2. 정해야 할 게임 디자인 값
- [ ] 비공개 종목 공개 비용 (정액? 종목 시가총액 비례?)
- [ ] 라운드당 공개 가능 종목 수 제한 (무제한? 1개?)
- [ ] 공개된 종목은 거래소에 합류하는지, 기술상 모달 안에서만 매수 가능한지

## 6. 데이터 — stocks.json 분리 필요 여부

현재 `stocks.json` 20개에서 `pickActiveStocks`로 10개만 게임 시작 시 추출. **기술상에서 공개할 나머지 10개는 어떻게 추적할지** 결정 필요:
- (안 A) `startGame()`에서 `activeStocks` + `hiddenStocks`를 함께 분리해 store에 저장
- (안 B) 매번 `allStocks - activeStocks`로 계산
- 권장: A — 한 번만 셔플하면 되고 race 없음

## 7. 임시 라우팅 처리

MainPage의 거래소/정보상/기술상 버튼은 현재 `alert()` placeholder입니다 (`navigateTo` 함수). `setPage` 추가되면 5분 안에 교체 가능.

