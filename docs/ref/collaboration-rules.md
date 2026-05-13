# 협업 규칙 (Collaboration Rules)

> 프로젝트: k-stock-merchant | 적용 대상: 배영환, 송원호 (양측 모두 Claude Code 사용)

---

## 팀 구성

| 이름 | 역할 | 담당 |
|------|------|------|
| 배영환 | 시니어 + Claude Code | 아키텍처, 게임 로직, store, 통합, 배포, 종목 선정, 가격 데이터 하드코딩 |
| 송원호 | 초급 React + Claude Code | 컴포넌트, 페이지, 상점 모달, 기업·국제 뉴스 콘텐츠 정리 |

---

## 의사소통 플로우

```
새 요소 추가 / 변경 발생
        ↓
카카오톡으로 배영환에게 먼저 확인 (30초 결정)
        ↓
OK → GitHub Issue 등록 (3줄 템플릿)
        ↓
Issue 번호 포함한 브랜치 생성 (feat/#12-xxx)
        ↓
PR 올릴 때 "Closes #12" 로 연결
        ↓
배영환 리뷰 → merge → Issue 자동 닫힘
```

**채널별 용도**

| 채널 | 용도 |
|------|------|
| 카카오톡 | 즉각 결정 필요한 사항, 막히는 것 빠른 질문 |
| GitHub Issue | 새 요소 추가·변경 요청 기록 (반드시 등록) |
| PR description | 코드 변경 이유·맥락 설명 |
| WBS-v2.md | 전체 작업 현황 단일 진실 공급원 |

---

## GitHub Issue 규칙

### 등록 기준
- 계획에 없던 UI 요소·로직 추가 시
- 기존 컴포넌트 Props 변경 시
- 파일 구조·네이밍 변경 시

### 3줄 템플릿
```
제목: [추가/변경/버그] 한 줄 요약

배경: 왜 필요한지
제안: 무엇을 할 것인지
영향 범위: 어떤 파일이 바뀌는지
```

### 하지 않아도 되는 것
- 같은 파일 내 오타 수정, 스타일 미세 조정
- WBS에 이미 정의된 태스크 내 작업

---

## PR 규칙

- **방향**: 송원호 → `develop` PR 생성 → 배영환 리뷰 후 merge
- **제목 형식**: `feat: 설명` / `fix: 설명` / `docs: 설명`
- **연결**: 관련 Issue 있으면 반드시 `Closes #번호` 명시
- **크기**: 하나의 PR = 하나의 태스크 (WBS 태스크 번호 포함 권장)
- **리뷰 대기**: 24시간 내 리뷰 없으면 카카오톡으로 알림

---

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

---

## WBS 업데이트 규칙

- 단일 진실 공급원: `docs/exec-plans/active/WBS-v2.md`
- 태스크 상태 변경(대기→진행중→완료)은 본인이 직접 업데이트
- 새 태스크 추가 시 배영환이 WBS에 반영 (송원호는 Issue로 요청)
- 완료된 WBS 버전은 `docs/exec-plans/completed/`로 이동

---

## Claude Code 협업 제약사항

> 양측 모두 Claude Code를 사용하므로 AI가 무단으로 영역을 침범하지 않도록 아래 규칙을 준수한다.

### 담당 영역 외 파일 수정 금지

| 이름 | 수정 가능 영역 |
|------|---------------|
| 배영환(Claude) | `src/store/`, `src/lib/`, `src/App.jsx`, `src/data/stockData.json`, Supabase 관련 |
| 송원호(Claude) | `src/pages/`, `src/components/`, `src/data/newsEvents.json` |

> 다른 사람 영역 파일을 수정해야 한다면 → 카카오톡 먼저 확인

### Claude Code 사용 시 필수 확인
- 작업 시작 전 **WBS-v2.md** 열어서 담당 태스크 확인
- **props-spec.md** 없는 Props 임의 추가 금지 → Issue 등록 후 배영환 확인
- 새 라이브러리 설치 전 배영환 승인 필수 (카카오톡)
- 커밋 전 `git status`로 담당 영역 외 파일 포함 여부 확인

### 금지 사항
- 다른 사람 브랜치에 직접 push
- `develop`, `master` 브랜치 직접 커밋
- WBS에 없는 기능을 "일단" 구현 후 나중에 보고
