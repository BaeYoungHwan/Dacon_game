# 떡상러쉬 🇰🇷📈

> 한국 주식 시장을 배경으로 한 1년(50주) 주봉 투자 시뮬레이션 미니게임

> 🏆 **DACON Daker 웹 미니게임 챌린지 최종 결과: 336명 중 19위** (떡상연구소, 2026-06-25 발표)

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwindcss)](https://tailwindcss.com)
[![Vitest](https://img.shields.io/badge/Vitest-tested-6E9F18?logo=vitest)](https://vitest.dev)

**배포 URL: https://dacongame.vercel.app/**

---

## 게임 소개

닉네임만 입력하면 즉시 시작. 1,000만 원 시드머니로 1년(50주) 안에 코스피를 이겨라.

매주 실제 한국 금융시장 뉴스 이벤트가 터지고 코스피와 환율이 흔들린다. 21개 종목 중 랜덤으로 배정된 10개 종목을 분석하고, 거래소·정보상·기술상을 오가며 최적의 투자 타이밍을 잡아라.

| 항목 | 내용 |
|------|------|
| 초기 자본 | 10,000,000원 |
| 총 턴(주수) | 50주 (2025-05-29 ~ 2026-05-07 실제 주봉) |
| 종목 풀 | 21개 (매 게임 랜덤) |
| 게임당 활성 종목 | 10개 (나머지 11개는 기술상에서 해금 가능) |
| 등급 기준 | 코스피 대비 초과수익률 |
| 목표 플레이타임 | 10~20분 |

---

## 화면 구성 (Legend of Merchant 스타일)

```
StartPage → (IntroScene) → GamePage ↔ MarketPage        → ResultPage
(닉네임 입력)  (인트로 영상)  (허브·뉴스·턴) (거래소 매수/매도)  (결과 + 랭킹)
                                       ↕
                               InfoMerchantPage   (정보상: 뉴스·추천 종목)
                                       ↕
                               TechMerchantPage   (기술상: 차트 지표·깜짝 종목, 10턴 해금)
```

캐릭터가 장소를 이동하며 매매를 진행하는 RPG 상인 게임 형식. 각 장소에서 서로 다른 정보와 액션이 제공된다.

| 페이지 | 역할 |
|--------|------|
| **StartPage** | 닉네임 입력, 게임 규칙 안내 |
| **IntroScene** | 게임 시작 인트로 애니메이션 |
| **GamePage** | 메인 허브 — 포트폴리오 현황, 뉴스 패널, KOSPI compact 차트, 턴 진행 |
| **MarketPage** | 한국거래소 — 종목 분석 홀로그램 + 매수/매도 키오스크 (MAX 버튼) |
| **InfoMerchantPage** | 정보상 — 국제 뉴스 / 기업 뉴스 / 추천 종목 (총 자산 5% 수수료) |
| **TechMerchantPage** | 기술상 — 차트 지표 구매(MA·볼린저밴드·MACD·OBV) + 깜짝 종목 해금 (10턴 이후) |
| **ResultPage** | 최종 자산 평가(등급 + 자산 히스토리 차트), 랭킹 등록/조회 |

---

## 종목 풀 (21개)

| 종목코드 | 이름 | 섹터 |
|----------|------|------|
| 005930 | 삼성전자 | 반도체 |
| 006400 | 삼성SDI | 2차전지 |
| 051910 | LG화학 | 화학 |
| 000270 | 기아 | 자동차 |
| 068270 | 셀트리온 | 바이오 |
| 055550 | 신한지주 | 금융 |
| 294870 | 서울보증보험 | 보험 |
| 035720 | 카카오 | 인터넷 |
| 042660 | 한화오션 | 조선 |
| 012450 | 한화에어로스페이스 | 방산 |
| 000720 | 현대건설 | 건설 |
| 034020 | 두산에너빌리티 | 에너지/원전 |
| 352820 | HYBE | 엔터 |
| 263750 | 펄어비스 | 게임 |
| 054540 | 에스트래픽 | 교통/모빌리티 |
| 030200 | KT | 통신 |
| 005490 | 포스코홀딩스 | 철강/소재 |
| 139480 | 이마트 | 유통 |
| 003490 | 대한항공 | 항공 |
| 097950 | CJ제일제당 | 식품 |
| 252670 | KODEX 인버스2X | 인버스 |

> 매 게임 시작 시 21개 중 10개를 랜덤 선택. 나머지 11개는 기술상에서 현금을 소비해 해금 가능.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| UI | React 18 + Vite 5 + Tailwind CSS 3 |
| 상태 관리 | Zustand 5 (persist → localStorage) |
| 백엔드 | Supabase (랭킹 테이블 전용) |
| 테스트 | Vitest (단위·통합 테스트 65개+) |
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

Supabase SQL 에디터에서 실행:

```sql
create table rankings (
  id           bigint generated always as identity primary key,
  nickname     text not null,
  final_assets bigint not null,
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

### 5. 테스트 실행

```bash
npm test            # 단위·통합 테스트 전체 실행
npm run test:watch  # 파일 변경 감지 모드
npm run test:cover  # 커버리지 포함
```

### 6. 프로덕션 빌드

```bash
npm run build
```

---

## 프로젝트 구조

```
src/
├── __tests__/
│   ├── components/
│   │   └── chartUtils.test.js      # 차트 유틸 단위 테스트
│   ├── integration/
│   │   └── gameTurnFlow.test.js    # 턴 진행 통합 테스트
│   ├── lib/
│   │   ├── gameLogic.test.js       # 게임 로직 단위 테스트
│   │   └── grade.test.js           # 등급 계산 단위 테스트
│   ├── store/
│   │   └── gameStore.test.js       # Zustand 스토어 테스트
│   └── setup.js
├── pages/
│   ├── StartPage.jsx               # 닉네임 입력, 게임 규칙
│   ├── GamePage.jsx                # 메인 허브 (포트폴리오 + 뉴스 + 턴 진행)
│   ├── MarketPage.jsx              # 한국거래소 (종목 분석 + 매수/매도 키오스크)
│   ├── InfoMerchantPage.jsx        # 정보상 (국제뉴스 / 기업뉴스 / 추천 종목)
│   ├── TechMerchantPage.jsx        # 기술상 (차트 지표 구매 + 깜짝 종목, 10턴 해금)
│   └── ResultPage.jsx              # 결과 + 자산 히스토리 차트 + 랭킹
├── components/
│   ├── AudioController.jsx         # 음악/효과음 컨트롤러
│   ├── game/
│   │   ├── GradeCard.jsx           # 코스피 대비 등급 카드
│   │   ├── IntroScene.jsx          # 인트로 애니메이션 씬
│   │   ├── KospiChart.jsx          # 코스피 지수 차트 (compact/full 모드)
│   │   ├── NewsPanel.jsx           # 뉴스 이벤트 출력
│   │   ├── PageNav.jsx             # 페이지 우측 네비게이션 (장소 이동 버튼)
│   │   ├── Portfolio.jsx           # 보유 주식 + 현금 잔액
│   │   ├── SettingsModal.jsx       # 설정 모달 (배경음/효과음 토글)
│   │   ├── StockBoard.jsx          # 종목 목록 + 현재 가격
│   │   ├── StockChart.jsx          # 종목별 차트 (MA·볼린저밴드·MACD·OBV)
│   │   ├── TipBox.jsx              # 팁 박스 (라운드별 랜덤 1개)
│   │   ├── TurnControl.jsx         # 턴 진행 + 날짜 표시
│   │   └── chartUtils.js           # 차트 계산 유틸
│   ├── leaderboard/
│   │   └── Leaderboard.jsx         # 랭킹 보드
│   └── ui/
│       ├── AnimatedNumber.jsx      # 숫자 카운트업 애니메이션
│       ├── Marquee.jsx             # 하단 마퀴 텍스트
│       └── ScaledPanel.jsx         # 반응형 스케일 패널 (전 페이지 통일)
├── store/
│   ├── audioStore.js               # 음악/효과음 상태 (Zustand)
│   ├── gameStore.js                # 게임 상태 (Zustand + localStorage)
│   └── leaderboardStore.js         # 랭킹 상태
├── data/
│   ├── stockData.json              # 실제 주봉 OHLCV + 코스피 (pykrx 수집)
│   ├── stocks.json                 # 종목 메타 정보 (21개)
│   └── news-events.json            # 실제 한국 금융시장 이벤트 207개 (기업 157 + 국제 50)
├── lib/
│   ├── audioManager.js             # 오디오 재생 유틸 (페이지별 BGM 분기)
│   ├── gameLogic.js                # 주봉 진행 로직 (실제 데이터 재생)
│   ├── grade.js                    # 등급 계산 로직 (GradeCard·ResultPage 공유)
│   └── supabase.js                 # Supabase 클라이언트
└── App.jsx                         # 페이지 라우팅 (조건부 렌더링)
```

---

## 게임 로직

### 주봉 가격 재생

```
매주(1턴)마다:
1. stockData.json 실제 주봉 종가(close)를 turn 인덱스로 직접 적용
2. 코스피 지수 — 누적 등락률(%) → 절대 지수 변환 (기준: 2,600)
3. 뉴스 — news-events.json에서 해당 날짜 이벤트 매칭 (실제 한국 금융시장 207개)
   └─ 기업뉴스(sector ≠ '전체') 3~5개 / 국제뉴스(sector = '전체') 보장
4. 가격은 실제 OHLCV 재생 (랜덤 없음)
   └─ 수집 기간: 2025-05-29 ~ 2026-05-07 (50주)
```

### 등급 기준 (코스피 대비 초과수익률)

| 등급 | 초과수익률 | 설명 |
|------|-----------|------|
| 👑 전설의 동학개미 | +200%p 이상 | 코스피를 200%p 이상 초과 |
| 🎩 작전세력 | +50%p 이상 | 코스피를 50%p 이상 초과 |
| 💰 큰손 | 0%p 이상 | 코스피 수익률 이상 달성 |
| 🐜 슈퍼개미 | -10%p 이상 | 코스피 소폭 하회 |
| 😢 개미 | -10%p 미만 | 코스피를 크게 하회 |

### 상점별 주요 기능

| 상점 | 주요 기능 | 비용 |
|------|-----------|------|
| **정보상** | 추천 종목 공개 (다음 주 최고 상승 종목) | 총 자산의 5% |
| **기술상** | MA 지표 구매 | 20만원 |
| **기술상** | OBV 지표 구매 | 40만원 |
| **기술상** | 볼린저밴드 지표 구매 | 60만원 |
| **기술상** | MACD 지표 구매 | 80만원 |
| **기술상** | 깜짝 종목 해금 (3~5개, 10턴 이후) | 개별 가격 별도 |

---

## 보안

- Supabase anon key: `.env` 파일 관리, 코드 직접 노출 금지
- Supabase RLS: rankings 테이블 INSERT/SELECT만 허용, UPDATE/DELETE 차단
- 환경변수는 Vercel 대시보드에서 별도 등록

---

## 팀

| 역할 | 담당 |
|------|------|
| 게임 로직 / 상태 관리 / 배포 | 배영환 |
| UI 컴포넌트 구현 | 송원호 |
| AI 협업 | Claude Code (Sonnet 4.6) |

> 대회: Dacon 웹 미니게임 챌린지 | 기획서 마감: 2026-05-26 | 최종 제출: 2026-06-08
> **최종 결과: 336명 중 19위** (떡상연구소, 2026-06-25 발표)
