# k-stock-merchant 아키텍처 v1

> 작성일: 2026-05-13 | 버전: v1 | 상태: Draft
> 참조 ARD: `docs/design-docs/ARD-v1.md`

---

## 1. 시스템 개요

브라우저에서 완전히 실행되는 CSR(Client Side Rendering) 웹 게임.
Vite로 빌드된 React 앱이 Vercel에서 정적 파일로 서빙되며,
게임 로직과 상태는 Zustand + 로컬 스토리지로 관리하고,
게임 종료 후 랭킹 등록/조회만 Supabase를 통해 처리한다.

---

## 2. 컴포넌트 다이어그램

```
+--------------------------------------------------+
|                     Browser                      |
|                                                  |
|  +--------------------------------------------+ |
|  |            React App (Vite)                | |
|  |                                            | |
|  |  +-------------+   +------------------+   | |
|  |  |    Pages    |   |  Zustand Store   |   | |
|  |  | StartPage   |<->|  gameStore       |   | |
|  |  | GamePage    |   |  leaderboardStore|   | |
|  |  | ResultPage  |   +------------------+   | |
|  |  +------+------+                          | |
|  |         |                                 | |
|  |  +------v---------------------------+     | |
|  |  |         Components               |     | |
|  |  |  game/ | ui/ | leaderboard/      |     | |
|  |  +------+-----------------+---------+     | |
|  |         |                 |               | |
|  |  +------v------+  +-------v-----------+   | |
|  |  |   data/     |  |  Local Storage    |   | |
|  |  | stocks.json |  | (게임 진행 상황)  |   | |
|  |  | news.json   |  +-------------------+   | |
|  |  +-------------+                          | |
|  +----------------------------+--------------+ |
+-------------------------------|-----------------+
                                | HTTPS (랭킹만)
                    +-----------v----------+
                    |      Supabase        |
                    |   rankings 테이블    |
                    +----------------------+
```

---

## 3. 폴더 구조

```
src/
├── pages/
│   ├── StartPage.jsx       # 닉네임 입력, 게임 규칙 안내
│   ├── GamePage.jsx        # 메인 게임 화면
│   └── ResultPage.jsx      # 최종 자산 평가 + 랭킹 등록
├── components/
│   ├── game/
│   │   ├── StockBoard.jsx  # 종목 목록 + 현재 가격 표시
│   │   ├── NewsPanel.jsx   # 뉴스 이벤트 텍스트 출력
│   │   ├── TurnControl.jsx # 턴 진행 버튼 + 날짜 표시
│   │   └── Portfolio.jsx   # 보유 주식 + 현금 잔액
│   ├── ui/
│   │   ├── Button.jsx
│   │   └── Modal.jsx
│   └── leaderboard/
│       └── Leaderboard.jsx # 랭킹 보드 (Supabase 조회)
├── store/
│   ├── gameStore.js        # 게임 상태 (Zustand + localStorage persist)
│   └── leaderboardStore.js # 랭킹 상태 (Zustand)
├── data/
│   ├── stocks.json         # 종목 초기 데이터 (하드코딩)
│   └── news-events.json    # 호재/악재 이벤트 (하드코딩)
├── lib/
│   ├── supabase.js         # Supabase 클라이언트 초기화
│   └── gameLogic.js        # 가격 변동 알고리즘
└── App.jsx                 # 페이지 전환 (조건부 렌더링)
```

---

## 4. 데이터 흐름

### 게임 진행 흐름

```
StartPage
  → 닉네임 입력 → gameStore.setNickname()
  → "게임 시작" 클릭 → page = 'game'

GamePage
  → TurnControl "다음 날" 클릭
      → gameLogic.progressTurn()
      → news-events.json 에서 랜덤 이벤트 선택
      → 이벤트 기반 가격 변동 계산
      → gameStore.nextTurn({ newPrices, news })
  → StockBoard "매수" 클릭 → gameStore.buyStock(stockId, quantity)
  → StockBoard "매도" 클릭 → gameStore.sellStock(stockId, quantity)
  → 최종 턴 도달 → page = 'result'

ResultPage
  → gameStore.getFinalAssets() 로 최종 자산 계산
  → "랭킹 등록" 클릭 → supabase.from('rankings').insert(...)
  → Leaderboard 조회 → supabase.from('rankings').select(...)
```

### 새로고침 복구 흐름

```
App 마운트
  → Zustand persist 미들웨어가 localStorage 자동 복구
  → gameState.page 값에 따라 해당 페이지 렌더링
```

---

## 5. 주요 설계 결정

| 결정 | 선택 | 이유 | ADR |
|------|------|------|-----|
| 상태 관리 | Zustand | 신입 친화적, 보일러플레이트 최소 | - |
| 라우팅 | 조건부 렌더링 | 3페이지 단순 구조 — react-router 불필요 | - |
| 데이터 영속성 | Zustand persist (localStorage) | 서버 의존 없이 새로고침 복구 | - |
| 백엔드 | Supabase (랭킹만) | 서버리스, 무료, SQL 직관적 | - |

---

## 6. 비기능 요건 달성 전략

| 속성 | 전략 |
|------|------|
| 초기 로딩 최적화 | Vite 코드 스플리팅, 텍스트 위주 UI로 이미지 최소화 |
| 반응형 UI | Tailwind 모바일 퍼스트 (sm: 브레이크포인트 활용) |
| 게임 상태 지속성 | Zustand persist 미들웨어로 localStorage 자동 동기화 |
| 빠른 게임 템포 | CSS 트랜지션 duration 100~200ms 이하 유지 |

---

## 7. 보안 고려사항

- Supabase API 키: `.env` 파일 관리 (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- Supabase Row Level Security: rankings 테이블에 INSERT/SELECT만 허용, DELETE/UPDATE 차단
- anon key는 공개 읽기 수준으로 제한 — 민감 데이터 없음
- Vercel 환경변수로 프로덕션 키 관리

---

## 8. 배포 구성

```
GitHub (master 브랜치 push)
  → Vercel 자동 빌드 (vite build)
    → 정적 파일 CDN 서빙
    → 환경변수: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (Vercel 대시보드 등록)

feature/* 브랜치 push
  → Vercel 프리뷰 URL 자동 생성 (팀 내 확인용)
```

### Supabase rankings 테이블 스키마

```sql
create table rankings (
  id           bigint generated always as identity primary key,
  nickname     text not null,
  final_assets bigint not null,
  created_at   timestamptz default now()
);

-- 삽입/조회만 허용
alter table rankings enable row level security;
create policy "anyone can insert" on rankings for insert with check (true);
create policy "anyone can select" on rankings for select using (true);
```
