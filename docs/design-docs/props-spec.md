# 컴포넌트 Props 명세서 -- 떡상러쉬

> 버전: v2 | 업데이트: 2026-05-14
> 신입 개발자 참고용 — UI 구현 전 이 명세를 기준으로 props 설계

---

## 목차

1. 공용 타입 정의
2. Pages (props 없음)
3. Game 컴포넌트
4. Modal 컴포넌트 (정보상/기술상/라운드결과)
5. UI 공용 컴포넌트
6. Leaderboard 컴포넌트
7. 스토어 상태 명세
8. 스타일 가이드

---

## 1. 공용 타입 정의

컴포넌트 props에 반복 등장하는 타입을 먼저 정의합니다.

### Stock (종목 기본 정보)
| 필드 | 타입 | 예시 | 설명 |
|------|------|------|------|
| id | string | stock_01 | 종목 고유 ID |
| realTicker | string | 005930 | 실제 코스피 티커 |
| mimeName | string | 반도체황제 | 게임 내 표시 이름 |
| sector | string | 반도체 | 섹터 분류 |

### StockPrice (주봉 OHLCV)
| 필드 | 타입 | 예시 | 설명 |
|------|------|------|------|
| open | number | 57500 | 시가 |
| high | number | 60200 | 고가 |
| low | number | 57000 | 저가 |
| close | number | 58000 | 종가 (거래에 사용) |
| volume | number | 12500000 | 거래량 (차트 지표 계산용) |

### NewsItem (news-events.json 형식)
| 필드 | 타입 | 예시 | 설명 |
|------|------|------|------|
| id | string | n01 | 뉴스 고유 ID |
| date | string | 2025-07-10 | 해당 라운드 날짜 (YYYY-MM-DD) |
| sector | string | 반도체 | 섹터 분류 (전체 = 국제뉴스) |
| headline | string | HBM 수출 호조 | 뉴스 헤드라인 |
| detail | string | ... | 상세 내용 (유료 구매 후 공개) |

### Ranking (Supabase rankings 테이블)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | number | DB 자동 생성 |
| nickname | string | 플레이어 닉네임 |
| final_assets | number | 최종 자산 (원) |

### TurnResult (gameLogic.progressTurn 반환값)
| 필드 | 타입 | 설명 |
|------|------|------|
| newPrices | Record(string, number) | 업데이트된 종가 맵 (stockId to 종가) |
| news | NewsItem[] or null | 이번 라운드 기업 뉴스 목록 (sector != 전체) |
| globalNews | NewsItem or null | 이번 라운드 국제 뉴스 1건 (sector == 전체) |
| newKospi | number | 업데이트된 코스피 지수 |
| newExchangeRate | number or null | 환율 (현재 null 고정) |

---

## 2. Pages

Page는 store에서 직접 상태를 구독합니다. **props 없음.**

| Page | 파일 | 역할 |
|------|------|------|
| StartPage | src/pages/StartPage.jsx | 닉네임 입력 + 게임 시작 |
| GamePage | src/pages/GamePage.jsx | 메인 화면 + 모달 관리 |
| ResultPage | src/pages/ResultPage.jsx | 최종 결과 + 랭킹 등록 |

GamePage는 거래소/정보상/기술상/라운드결과 모달의 열림/닫힘 상태를
로컬 useState로 관리합니다. 모달 컴포넌트에는 isOpen / onClose로 넘깁니다.

---

## 3. Game 컴포넌트

### TurnControl
화면 상단 라운드 진행 바 + 다음 라운드 버튼

| prop | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| turn | number | O | 현재 라운드 (1 시작) |
| totalTurns | number | O | 전체 라운드 수 (고정 50) |
| onNextTurn | () => void | O | 클릭 시 라운드 진행 |

---

### StockBoard (거래소)
공개 10종목 목록 -- 분석/매수/매도

| prop | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| stocks | Stock[] | O | 이번 게임 공개 10종목 |
| prices | Record(string, number) | O | stockId to 현재 종가 |
| portfolio | Record(string, number) | O | stockId to 보유 수량 |
| cash | number | O | 현금 잔액 — 매수 버튼 비활성화 기준 |
| onBuy | (id, qty) => boolean | O | false = 잔액 부족 |
| onSell | (id, qty) => boolean | O | false = 보유 부족 |
| indicatorsPurchased | boolean | O | true면 차트 지표 탭 표시 |

---

### Portfolio
현금 잔액 + 보유 종목 평가

| prop | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| stocks | Stock[] | O | 종목 이름 조회용 |
| prices | Record(string, number) | O | 평가금액 계산용 |
| portfolio | Record(string, number) | O | 보유 수량 |
| cash | number | O | 현금 잔액 (원) |

---

### NewsPanel
이번 라운드 공개 뉴스 표시

| prop | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| companyNews | CompanyNews or null | O | null이면 기업 뉴스 없음 |
| globalNews | GlobalNews or null | O | null이면 국제 뉴스 없음 |

type이 호재이면 빨강, 악재이면 파랑 테두리로 표시합니다.

---

## 4. Modal 컴포넌트

화면 설계 3~5번 화면. GamePage에서 isOpen 상태를 제어합니다.

### InfoMerchantModal (정보상 모달)
국제/기업 뉴스 무료 조회 + 추천 종목 유료 구매

| prop | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| isOpen | boolean | O | 모달 표시 여부 |
| onClose | () => void | O | 닫기 핸들러 |
| cash | number | O | 현재 현금 잔액 |
| round | number | O | 현재 라운드 (표시용) |
| currentNews | CompanyNews or null | O | 이번 라운드 기업 뉴스 (자동 공개) |
| currentGlobalNews | GlobalNews or null | O | 이번 라운드 국제 뉴스 (자동 공개) |
| onBuyNews | (cost) => boolean | O | 추천 종목 유료 구매 전용 |
| availableNews | { recommended } | O | 추천 종목 미구매 시 blur 처리할 내용 |

availableNews 구조:
  recommended : string[] (추천 종목 ID 배열, 미구매 시 blur)

---

### TechMerchantModal (기술상 모달)
비공개 10종목 중 일부를 유료 공개 + 투자

| prop | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| isOpen | boolean | O | |
| onClose | () => void | O | |
| cash | number | O | |
| hiddenStocks | Stock[] | O | 전체 비공개 10종목 |
| unlockedStockIds | string[] | O | 이미 공개된 종목 IDs |
| prices | Record(string, number) | O | 공개 후 표시할 현재가 |
| onUnlockStock | (id, cost) => boolean | O | false = 잔액 부족 |
| onBuy | (id, qty) => boolean | O | 공개된 종목만 거래 가능 |
| onSell | (id, qty) => boolean | O | |
| portfolio | Record(string, number) | O | 보유 수량 표시용 |

---

### RoundResultModal (라운드 결과 모달)
라운드 종료 후 손익 요약 + 다음 라운드 진행

| prop | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| isOpen | boolean | O | |
| round | number | O | 방금 완료된 라운드 번호 |
| prevTotalAssets | number | O | 라운드 시작 총 자산 |
| currTotalAssets | number | O | 라운드 종료 총 자산 |
| priceChanges | { stockId, mimeName, changeRate }[] | O | 보유 종목 등락률 |
| onNextRound | () => void | O | 다음 라운드 버튼 클릭 시 |

---

## 5. UI 공용 컴포넌트

### Button

| prop | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| children | ReactNode | O | -- | 버튼 내용 |
| onClick | () => void | O | -- | 클릭 핸들러 |
| variant | primary / danger / ghost | -- | primary | 스타일 변형 |
| disabled | boolean | -- | false | 비활성화 |

### Modal

| prop | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| isOpen | boolean | O | false면 렌더링하지 않음 |
| onClose | () => void | O | x 버튼 클릭 핸들러 |
| title | string | O | 모달 헤더 제목 |
| children | ReactNode | O | 모달 본문 |

---

## 6. Leaderboard 컴포넌트

### Leaderboard
Props 없음 -- useLeaderboardStore에서 rankings, loading을 직접 구독합니다.

---

## 7. 스토어 상태 명세

### gameStore (src/store/gameStore.js)
Zustand + localStorage persist

#### 상태 (State)
| 필드 | 타입 | 초기값 | 설명 |
|------|------|--------|------|
| page | start / game / result | start | 현재 화면 |
| nickname | string | (빈 문자열) | 플레이어 닉네임 |
| turn | number | 0 | 현재 라운드 (1~50) |
| totalTurns | number | 50 | 전체 라운드 수 |
| cash | number | 10,000,000 | 현금 잔액 |
| portfolio | Record(string, number) | {} | 보유 주식 (stockId to 수량) |
| activeStocks | Stock[] | [] | 이번 게임 공개 10종목 |
| hiddenStocks | Stock[] | [] | 이번 게임 비공개 10종목 |
| unlockedStockIds | string[] | [] | 기술상으로 공개한 종목 IDs |
| prices | Record(string, number) | {} | 전체 20종목 현재 종가 맵 |
| currentNews | NewsItem[] or null | null | 이번 라운드 기업 뉴스 목록 (sector != 전체) |
| currentGlobalNews | NewsItem or null | null | 이번 라운드 국제 뉴스 1건 (sector == 전체) |
| indicatorsPurchased | boolean | false | 차트 지표 영구 구매 여부 |
| kospi | number | 2600 | 코스피 지수 현재값 |

#### 액션 (Actions)
| 액션 | 시그니처 | 설명 |
|------|----------|------|
| setNickname | (name) => void | 닉네임 설정 |
| startGame | () => void | 게임 시작 -- 20종목 중 공개/비공개 10개씩 분리 |
| nextTurn | (result: TurnResult) => void | 라운드 진행 -- 가격/뉴스 업데이트 |
| buyStock | (stockId, qty) => boolean | 매수 (잔액 부족 시 false) |
| sellStock | (stockId, qty) => boolean | 매도 (보유 부족 시 false) |
| unlockStock | (stockId, cost) => boolean | 기술상 종목 공개 |
| buyIndicators | (cost) => boolean | 차트 지표 영구 구매 |
| getFinalAssets | () => number | 최종 자산 (현금 + 보유 평가액) |
| resetGame | () => void | 게임 초기화 |

---

### leaderboardStore (src/store/leaderboardStore.js)
Zustand, persist 없음

#### 상태 (State)
| 필드 | 타입 | 초기값 | 설명 |
|------|------|--------|------|
| rankings | Ranking[] | [] | 상위 20위 목록 |
| loading | boolean | false | API 호출 중 |
| error | string or null | null | 에러 메시지 |
| submitted | boolean | false | 점수 등록 완료 |

#### 액션 (Actions)
| 액션 | 시그니처 | 설명 |
|------|----------|------|
| submitScore | (nickname, finalAssets) => Promise | 랭킹 등록 |
| fetchRankings | () => Promise | 상위 20위 조회 |

---

## 8. 스타일 가이드

### Tailwind 색상
- 상승(빨강): text-rise / bg-rise  (tailwind.config에 정의)
- 하락(파랑): text-fall / bg-fall
- 앱 배경:  bg-gray-900
- 카드 배경: bg-gray-800
- 패널 배경: bg-gray-700

### 애니메이션 규칙
- 모든 hover/transition: transition-all duration-150 (150ms)
- fade-in 필요 시: CSS @keyframes 직접 작성
- 200ms 초과 애니메이션 금지 -- 빠른 게임 템포 유지 (기획안 조건)

### 컴포넌트 설계 원칙
- store 직접 접근은 Page 파일에만 -- 컴포넌트는 props만 받음
- 단일 파일 300줄 초과 시 분리 검토
