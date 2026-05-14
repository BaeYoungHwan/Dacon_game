# k-stock-merchant 🇰🇷📈

> 한국 주식 시장을 배경으로 한 1년(50주) 주봉 투자 시뮬레이션 미니게임

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwindcss)](https://tailwindcss.com)

**배포 URL: https://dacongame.vercel.app/**

---

## 게임 소개

닉네임만 입력하면 즉시 시작. 1,000만 원 시드머니로 1년(50주) 안에 자산을 불려라.

매주 뉴스 이벤트가 터지고 코스피와 환율이 흔들린다. 20개 종목 중 랜덤으로 배정된 10개 종목을 분석해 매수/매도 타이밍을 잡아라.

| 항목 | 내용 |
|------|------|
| 초기 자본 | 10,000,000원 |
| 총 턴(주수) | 50주 (1년 주봉) |
| 종목 풀 | 20개 (개별주 14 + Kodex ETF 6) |
| 게임당 활성 종목 | 10개 (매 게임 랜덤 선택) |
| 목표 플레이타임 | 10~20분 |

---

## 화면 구성 (Legend of Merchant 스타일)

```
StartPage  →  GamePage  ↔  MarketPage  →  ResultPage
(닉네임/설정)  (현황·뉴스·턴 진행)  (거래소 매매)   (결과 + 랭킹)
```

캐릭터가 거래소, 뉴스룸, 포트폴리오 화면 등 **장소를 이동하며** 매매를 진행하는 RPG 상인 게임 형식. 각 장소에서 서로 다른 정보와 액션이 제공된다.

> Legend of Merchant 참조: 장소 이동 → 정보 수집 → 투자 결정 흐름

---

## 종목 풀 (20개)

### 개별주 (14개)

| 종목코드 | 이름 | 섹터 |
|----------|------|------|
| 005930 | 삼성전자 | 반도체 |
| 000660 | SK하이닉스 | 반도체 |
| 035720 | 카카오 | IT |
| 035420 | NAVER | IT |
| 005380 | 현대차 | 자동차 |
| 000270 | 기아 | 자동차 |
| 068270 | 셀트리온 | 바이오 |
| 373220 | LG에너지솔루션 | 2차전지 |
| 247540 | 에코프로비엠 | 2차전지 |
| 105560 | KB금융 | 금융 |
| 051910 | LG화학 | 화학 |
| 005490 | 포스코홀딩스 | 소재 |
| 207940 | 삼성바이오로직스 | 바이오 |
| 259960 | 크래프톤 | 게임 |

### Kodex ETF (6개, 필수 포함)

| 종목코드 | 이름 | 추종 대상 |
|----------|------|-----------|
| 069500 | KODEX 200 | 코스피200 (시장 평균) |
| 229200 | KODEX KOSDAQ150 | 코스닥150 (성장주) |
| 091160 | KODEX 반도체 | 반도체 섹터 |
| 305720 | KODEX 2차전지 | 2차전지 섹터 |
| 091180 | KODEX 자동차 | 자동차 섹터 |
| 143860 | KODEX 바이오 | 바이오 섹터 |

> 매 게임 시작 시 20개 중 10개를 랜덤으로 선택. 플레이마다 다른 포트폴리오 구성이 등장한다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| UI | React 18 + Vite 5 + Tailwind CSS 3 |
| 상태 관리 | Zustand 5 (persist → localStorage) |
| 백엔드 | Supabase (랭킹 테이블 전용) |
| 배포 | Vercel (GitHub master 자동 배포) |

---

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일에 Supabase 프로젝트 정보 입력:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase 테이블 생성

```sql
create table rankings (
  id           bigint generated always as identity primary key,
  nickname     text not null,
  final_asset  bigint not null,
  created_at   timestamptz default now()
);

alter table rankings enable row level security;
create policy "anyone can insert" on rankings for insert with check (true);
create policy "anyone can select" on rankings for select using (true);
```

### 4. 개발 서버 실행

```bash
npm run dev
```

---

## 프로젝트 구조

```
src/
├── pages/
│   ├── StartPage.jsx
│   ├── GamePage.jsx        # 현황·뉴스·턴 진행
│   ├── MarketPage.jsx      # 거래소 (10종목 매수/매도)
│   └── ResultPage.jsx
├── components/
│   ├── game/
│   │   ├── StockBoard.jsx   # 활성 10종목 가격 표시
│   │   ├── NewsPanel.jsx    # 주간 뉴스 이벤트
│   │   ├── TurnControl.jsx  # 주차 진행 + 코스피/환율 지표
│   │   └── Portfolio.jsx    # 보유 주식 + 손익
│   ├── ui/
│   │   ├── Button.jsx
│   │   └── Modal.jsx
│   ├── merchant/
│   │   ├── InfoMerchantModal.jsx  # 정보상 (예정)
│   │   └── TechMerchantModal.jsx  # 기술상 (예정)
│   └── leaderboard/
│       └── Leaderboard.jsx
├── store/
│   ├── gameStore.js         # 게임 상태 + 랜덤 종목 선택
│   └── leaderboardStore.js
├── data/
│   ├── stocks.json          # 20종목 (개별주 14 + Kodex ETF 6)
│   ├── stockData.json       # 실제 주봉 OHLCV 50주치 (pykrx 수집)
│   └── news-events.json     # 호재/악재 이벤트 30개
├── lib/
│   ├── supabase.js
│   └── gameLogic.js         # 주봉 가격 변동 + 코스피/환율 시뮬레이션
└── App.jsx
```

---

## 게임 로직

### 주봉 가격 변동 알고리즘

```
매주(1턴)마다:
1. stockData.json에서 해당 주(turn) 실제 종가(close) 적용
2. 코스피 지수 누적 등락률 반영 (실제 데이터)
3. 뉴스 이벤트 풀(30개)에서 무작위 선택 → 화면 표시용
4. 가격은 실제 OHLCV 데이터를 그대로 재생 (랜덤 없음)
   └─ 2025-05-29 ~ 2026-05-07 기간의 실제 시장 데이터
```

### 데이터 출처

- 실제 주봉 OHLCV: pykrx로 수집 (2025-05-29 ~ 2026-05-07, 50주)
- 종목 초기가격: 2025-05-29 기준 종가

---

## 결과 등급 (수익률 배수 기준)

| 등급 | 배수 기준 | 최종 자산 | 설명 |
|------|-----------|-----------|------|
| 🏆 전설의 투자자 | 2.0x+ | 2,000만원+ | 100% 수익 달성 |
| 💎 고수 | 1.5x+ | 1,500만원+ | 50% 수익, 시장 대비 초과 |
| 📈 수익 실현 | 1.2x+ | 1,200만원+ | 20% 수익, KOSPI 평균 수준 |
| 😮 본전 | 1.0x+ | 1,000만원+ | 원금 보존 |
| 📉 손실 | ~1.0x | 1,000만원 미만 | 원금 손실 발생 |

---

## 보안

- Supabase anon key: `.env` 파일 관리, 코드 직접 노출 금지
- Supabase RLS: rankings 테이블 INSERT/SELECT만 허용
- 환경변수는 Vercel 대시보드에서 별도 등록

---

## 팀

| 역할 | 담당 |
|------|------|
| 게임 로직 / 상태 관리 / 배포 | 시니어 |
| UI 컴포넌트 구현 | 주니어 |
| AI 협업 | Claude Code (Sonnet 4.6) |

> 해커톤 스프린트: 2026-05-13 ~ 2026-05-18 (5일)
