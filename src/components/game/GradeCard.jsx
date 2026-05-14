// 등급 카드 — 코스피 대비 초과수익률로 등급을 판정해 표시
// Props: myReturn(내 수익률, 소수), kospiReturn(코스피 수익률, 소수)
// 명세 v2 컴포넌트 원칙: store 직접 접근 X — 부모(GamePage)가 계산해서 넘김
//
// ⚠️ 배영환 협의 필요: 등급 임계값은 proposal-v1.md 기준 임시값
//    추후 게임 디자인 확정 시 src/lib/grade.js 등으로 분리해 ResultPage와 공유

const GRADES = [
  { label: '전설의 동학개미', threshold: 200, color: 'text-yellow-300', emoji: '👑' },
  { label: '작전세력',        threshold: 50,  color: 'text-purple-400', emoji: '🎩' },
  { label: '큰손',            threshold: 0,   color: 'text-rise',       emoji: '💰' },
  { label: '슈퍼개미',        threshold: -10, color: 'text-blue-300',   emoji: '🐜' },
  { label: '개미',            threshold: -Infinity, color: 'text-fall', emoji: '😢' },
]

// 초과수익률(%p)로 등급 판정 — GRADES는 threshold 내림차순이므로 find가 곧 첫 매칭
function getGrade(excessPp) {
  return GRADES.find((g) => excessPp >= g.threshold)
}

export default function GradeCard({ myReturn, kospiReturn }) {
  const excessPp = (myReturn - kospiReturn) * 100
  const grade = getGrade(excessPp)

  return (
    <div className="flex-1 bg-gray-800 rounded-lg p-5">
      <p className="text-xs text-gray-400 mb-1">현재 등급 (코스피 대비)</p>
      <p className={`text-3xl font-bold mb-2 ${grade.color}`}>
        {grade.emoji} {grade.label}
      </p>
      <div className="grid grid-cols-3 gap-2 text-xs mt-4">
        <div className="bg-gray-700 rounded p-2">
          <p className="text-gray-400">내 수익률</p>
          <p className={`font-bold ${myReturn >= 0 ? 'text-rise' : 'text-fall'}`}>
            {(myReturn * 100).toFixed(2)}%
          </p>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <p className="text-gray-400">코스피</p>
          <p className={`font-bold ${kospiReturn >= 0 ? 'text-rise' : 'text-fall'}`}>
            {(kospiReturn * 100).toFixed(2)}%
          </p>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <p className="text-gray-400">초과수익</p>
          <p className={`font-bold ${excessPp >= 0 ? 'text-rise' : 'text-fall'}`}>
            {excessPp >= 0 ? '+' : ''}{excessPp.toFixed(1)}%p
          </p>
        </div>
      </div>
    </div>
  )
}
