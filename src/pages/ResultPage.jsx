// TODO(신입): 최종 결과 화면 UI 구현
// 참고: docs/design-docs/props-spec.md

import { useGameStore } from '../store/gameStore'
import { useLeaderboardStore } from '../store/leaderboardStore'
import Leaderboard from '../components/leaderboard/Leaderboard'

const INITIAL_CASH = 10_000_000

function getRank(finalAssets) {
  const rate = finalAssets / INITIAL_CASH
  if (rate >= 2.0) return { label: '🏆 전설의 투자자', color: 'text-yellow-400' }
  if (rate >= 1.5) return { label: '💎 고수', color: 'text-blue-400' }
  if (rate >= 1.2) return { label: '📈 수익 실현', color: 'text-green-400' }
  if (rate >= 1.0) return { label: '😮 본전', color: 'text-gray-300' }
  return { label: '📉 손실', color: 'text-red-400' }
}

export default function ResultPage() {
  const { nickname, getFinalAssets, resetGame } = useGameStore()
  const { submitScore, fetchRankings, submitted } = useLeaderboardStore()

  const finalAssets = getFinalAssets()
  const profit = finalAssets - INITIAL_CASH
  const rank = getRank(finalAssets)

  const handleSubmit = async () => {
    // submitScore 내부에서 fetchRankings + myRank 계산까지 처리
    await submitScore(nickname, finalAssets, rank.label)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center">
      {/* TODO(신입): 결과 화면 디자인 개선 */}
      <h2 className="text-2xl font-bold mt-8 mb-2">{nickname}님의 결과</h2>
      <p className={`text-4xl font-bold mb-1 ${rank.color}`}>{rank.label}</p>
      <p className="text-2xl font-bold mt-4">
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
