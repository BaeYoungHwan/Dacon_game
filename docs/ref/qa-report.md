# QA 테스트 리포트

**작성일:** 2026-05-17  
**대상 브랜치:** develop  
**테스트 러너:** Vitest v4.1.6 + jsdom

---

## 실행 결과 요약

| 항목 | 값 |
|------|-----|
| 테스트 파일 | 5개 |
| 총 테스트 케이스 | **65개** |
| 통과 | **65개 (100%)** |
| 실패 | 0개 |
| pass^3 검증 | ✅ 3회 연속 동일 결과 |

---

## 파일별 테스트 현황

| 파일 | 케이스 수 | 담당 |
|------|----------|------|
| `src/__tests__/lib/grade.test.js` | 12 | 배영환 |
| `src/__tests__/lib/gameLogic.test.js` | 7 | 배영환 |
| `src/__tests__/store/gameStore.test.js` | 23 | 배영환 |
| `src/__tests__/components/chartUtils.test.js` | 19 | 배영환 |
| `src/__tests__/integration/gameTurnFlow.test.js` | 4 | 배영환 |

---

## 커버리지 (`npm run test:cover`)

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

---

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
실제 소리 재생 동작은 수동 QA로 검증.

---

## 미작성 테스트 (송원호 영역)

| 파일 | 케이스 수 | 상태 |
|------|----------|------|
| `src/__tests__/components/StockChart.test.jsx` | 6 | ❌ 미작성 |
| `src/__tests__/pages/ResultPage.test.jsx` | 5 | ❌ 미작성 |

→ `src/components/`, `src/pages/` 담당자가 작성 필요.

---

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

---

## 실행 명령

```bash
npm test            # 단위 + 통합 (65개)
npm run test:3      # pass^3 검증
npm run test:cover  # 커버리지 리포트
```
