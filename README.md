# k-stock-merchant 🇰🇷📈

> 한국 주식 시장을 배경으로 한 10분 웹 시뮬레이션 미니게임

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwindcss)](https://tailwindcss.com)

---

## 게임 소개

닉네임만 입력하면 즉시 시작. 1,000만 원 시드머니로 10일 안에 자산을 불려라.

매일 뉴스 이벤트가 터지고 주가가 요동친다. 호재·악재를 읽고 매수/매도 타이밍을 잡아 랭킹 1위를 노려라.

| 항목 | 내용 |
|------|------|
| 초기 자본 | 10,000,000원 |
| 총 턴(일수) | 10일 |
| 종목 수 | 10개 (실제 한국 주식 기반) |
| 목표 플레이타임 | 5~10분 |

---

## 화면 구성

```
StartPage  →  GamePage  →  ResultPage
(닉네임 입력)   (매매/뉴스)   (결과 + 랭킹)
```

- **StartPage**: 닉네임 입력, 게임 규칙 안내
- **GamePage**: 종목 보드 + 뉴스 패널 + 포트폴리오 + 턴 진행
- **ResultPage**: 최종 자산 평가(6등급), 랭킹 등록/조회

---

## 종목 목록

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

### 5. 프로덕션 빌드

```bash
npm run build
```

---

## 프로젝트 구조

```
src/
├── pages/
│   ├── StartPage.jsx       # 닉네임 입력, 게임 규칙
│   ├── GamePage.jsx        # 메인 게임 화면
│   └── ResultPage.jsx      # 결과 + 랭킹
├── components/
│   ├── game/
│   │   ├── StockBoard.jsx  # 종목 목록 + 현재 가격
│   │   ├── NewsPanel.jsx   # 뉴스 이벤트 출력
│   │   ├── TurnControl.jsx # 턴 진행 + 날짜 표시
│   │   └── Portfolio.jsx   # 보유 주식 + 현금 잔액
│   ├── ui/
│   │   ├── Button.jsx
│   │   └── Modal.jsx
│   └── leaderboard/
│       └── Leaderboard.jsx # 랭킹 보드
├── store/
│   ├── gameStore.js        # 게임 상태 (Zustand + localStorage)
│   └── leaderboardStore.js # 랭킹 상태
├── data/
│   ├── stocks.json         # 종목 데이터 (실제 시장 기반 하드코딩)
│   └── news-events.json    # 호재/악재 이벤트 30개
├── lib/
│   ├── supabase.js         # Supabase 클라이언트
│   └── gameLogic.js        # 가격 변동 알고리즘
└── App.jsx                 # 페이지 전환 (조건부 렌더링)
```

---

## 게임 로직

### 가격 변동 알고리즘

```
매 턴(1일)마다:
1. 뉴스 이벤트 풀(30개)에서 무작위 선택
2. 이벤트 섹터와 일치하는 종목에 effect 배율 적용
3. 전체 종목에 기본 랜덤 변동(±5%) 적용
4. 변동 상한: ±20% (하루 최대 등락)
5. 최종 가격 100원 단위 반올림
```

### 결과 등급 기준

| 등급 | 조건 |
|------|------|
| 워런 버핏 | 2,000만원 이상 |
| 주식 고수 | 1,500만원 이상 |
| 수익 달성 | 1,100만원 이상 |
| 본전치기 | 900만원 이상 |
| 손실 발생 | 600만원 이상 |
| 반대매매 | 600만원 미만 |

---

## 보안

- Supabase anon key: `.env` 파일 관리, 코드 직접 노출 금지
- Supabase RLS: rankings 테이블 INSERT/SELECT만 허용, UPDATE/DELETE 차단
- 환경변수는 Vercel 대시보드에서 별도 등록

---

## 팀

| 역할 | 담당 |
|------|------|
| 게임 로직 / 상태 관리 / 배포 | 시니어 |
| UI 컴포넌트 구현 | 주니어 |
| AI 협업 | Claude Code (Sonnet 4.6) |

> 해커톤 스프린트: 2026-05-13 ~ 2026-05-18 (5일)
