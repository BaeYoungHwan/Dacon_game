// 초과수익률(%p) 기반 등급 정의 — GradeCard · ResultPage 공유 진실 공급원
export const GRADES = [
  { label: '전설의 동학개미', threshold: 200, color: 'text-yellow-300', emoji: '👑' },
  { label: '작전세력',        threshold: 50,  color: 'text-purple-400', emoji: '🎩' },
  { label: '큰손',            threshold: 0,   color: 'text-rise',       emoji: '💰' },
  { label: '슈퍼개미',        threshold: -10, color: 'text-blue-300',   emoji: '🐜' },
  { label: '개미',            threshold: -Infinity, color: 'text-fall', emoji: '😢' },
]

// GRADES는 threshold 내림차순 — find가 곧 첫 매칭
export function getGrade(excessPp) {
  return GRADES.find((g) => excessPp >= g.threshold)
}

export const calcExcessPp = (myReturn, kospiReturn) => (myReturn - kospiReturn) * 100
