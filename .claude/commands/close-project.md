# /close-project — 프로젝트 종료

프로젝트를 깔끔하게 닫습니다. 11단계 종료 흐름을 순서대로 실행합니다.

---

## 1단계 — 미커밋 파일 확인 + 최종 커밋

git status --short 실행. 변경사항이 있으면 /commit 스킬 호출 여부 질문.

## 2단계 — AI-Readiness 점수 측정

/ai-readiness-cartography 스킬 실행.
결과를 docs/exec-plans/completed/ai-readiness-final.json 에 저장.

## 3단계 — 토큰/비용 효율 분석

/improve-token-efficiency 스킬 실행.

## 4단계 — WBS 미완료 항목 집계

docs/exec-plans/active/WBS-v2.md 에서 [ ] grep.

## 5단계 — active/ -> completed/ 이동

mkdir -p docs/exec-plans/completed
mv docs/exec-plans/active/* docs/exec-plans/completed/

## 6단계 — README 정리

README.md 없으면 기본 README 생성 여부 질문.

## 7단계 — HTML 종료 보고서 생성

docs/project-close-report.html 생성.
프로젝트명: k-stock-merchant, 배포 URL: https://dacongame.vercel.app/

## 8단계 — 알림 발송

.env에 SMTP_HOST 없으면 건너뜀.

## 9단계 — .project-closed 플래그 생성

내용: closed: YYYY-MM-DD, project: k-stock-merchant

## 10단계 — 회고 인터뷰 (선택)

3가지 질문 후 docs/retrospective-[날짜].md 저장.

## 11단계 — 스케줄 중단 안내

등록된 AI-Readiness 주기 측정 작업 있으면 중단 방법 안내.

---

## 최종 완료 메시지

  종료일: [오늘 날짜]
  배포 URL: https://dacongame.vercel.app/
  종료 보고서: docs/project-close-report.html

각 단계는 실패해도 다음 단계로 계속 진행.
건너뜀 표시: [N단계] 건너뜀 — [이유]
