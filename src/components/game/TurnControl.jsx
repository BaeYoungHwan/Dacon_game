// TODO(신입): 턴 컨트롤 UI 구현
// Props:
//   turn        - 현재 턴 (number)
//   totalTurns  - 전체 턴 수 (number)
//   onNextTurn  - 다음 날 진행 함수 ()

export default function TurnControl({ turn, totalTurns, onNextTurn }) {
  const progress = (turn / totalTurns) * 100

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      {/* TODO(신입): 프로그레스 바 + 날짜 표시 디자인 개선 */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold">{turn}일차 / {totalTurns}일</span>
        <button
          onClick={onNextTurn}
          className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded font-bold transition-all duration-150"
        >
          다음 날 →
        </button>
      </div>

      {/* 진행 바 */}
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
