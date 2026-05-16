// Props: myReturn(내 수익률, 소수), kospiReturn(코스피 수익률, 소수)
// 명세 v2 원칙: store 직접 접근 X — 부모가 계산해서 넘김
import { getGrade, calcExcessPp } from '../../lib/grade'

export default function GradeCard({ myReturn, kospiReturn }) {
  const excessPp = calcExcessPp(myReturn, kospiReturn)
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
