import { useGameStore, INITIAL_CASH, INITIAL_KOSPI } from '../store/gameStore'
import { useLeaderboardStore } from '../store/leaderboardStore'
import Leaderboard from '../components/leaderboard/Leaderboard'
import GradeCard from '../components/game/GradeCard'

// 초과수익률(%p) → 등급 라벨 (리더보드 제출용)
const GRADE_LABELS = [
  { label: '전설의 동학개미', threshold: 200 },
  { label: '작전세력',        threshold: 50  },
  { label: '큰손',            threshold: 0   },
  { label: '슈퍼개미',        threshold: -10 },
  { label: '개미',            threshold: -Infinity },
]
function getGradeLabel(excessPp) {
  return GRADE_LABELS.find(g => excessPp >= g.threshold)?.label ?? '개미'
}

export default function ResultPage() {
  const { nickname, getFinalAssets, kospi, resetGame } = useGameStore()
  const { submitScore, submitted } = useLeaderboardStore()

  const finalAssets = getFinalAssets()
  const myReturn    = (finalAssets - INITIAL_CASH) / INITIAL_CASH
  const kospiReturn = (kospi - INITIAL_KOSPI) / INITIAL_KOSPI
  const excessPp    = (myReturn - kospiReturn) * 100
  const gradeLabel  = getGradeLabel(excessPp)

  const profit = finalAssets - INITIAL_CASH

  const handleSubmit = async () => {
    await submitScore(nickname, finalAssets, gradeLabel)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold mt-8 mb-4">{nickname}님의 결과</h2>

      <div className="w-full max-w-md">
        <GradeCard myReturn={myReturn} kospiReturn={kospiReturn} />
      </div>

      <p className="text-2xl font-bold mt-6">
        최종 자산: {finalAssets.toLocaleString()}원
      </p>
      <p className={`text-lg ${profit >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
        {profit >= 0 ? '+' : ''}{profit.toLocaleString()}원
        ({((profit / INITIAL_CASH) * 100).toFixed(1)}%)
      </p>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="mt-6 px-8 py-3 bg-yellow-500 hover:bg-yellow-400 rounded font-bold text-black transition-all duration-150"
        >
          랭킹 등록
        </button>
      ) : (
        <Leaderboard />
      )}

      <button
        onClick={resetGame}
        className="mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-all duration-150"
      >
        다시 하기
      </button>
    </div>
  )
}
