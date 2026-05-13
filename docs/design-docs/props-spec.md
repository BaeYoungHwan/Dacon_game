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
