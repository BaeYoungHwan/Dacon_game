// TODO(신입): 랭킹 보드 UI 구현
// store에서 직접 rankings를 가져옴 (props 없음)

import { useEffect } from 'react'
import { useLeaderboardStore } from '../../store/leaderboardStore'

export default function Leaderboard() {
  const { rankings, loading, fetchRankings } = useLeaderboardStore()

  useEffect(() => {
    fetchRankings()
  }, [fetchRankings])

  if (loading) return <p className="text-center text-gray-400 mt-4">랭킹 불러오는 중...</p>

  return (
    <div className="w-full max-w-md mt-6">
      {/* TODO(신입): 랭킹 테이블 디자인 개선 */}
      <h3 className="font-bold text-lg mb-3 text-center">🏆 글로벌 랭킹</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 border-b border-gray-700">
            <th className="py-2 text-left">순위</th>
            <th className="py-2 text-left">닉네임</th>
            <th className="py-2 text-right">최종 자산</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((r, i) => (
            <tr key={r.id} className="border-b border-gray-800 hover:bg-gray-800">
              <td className="py-2 font-bold">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}위`}
              </td>
              <td className="py-2">{r.nickname}</td>
              <td className="py-2 text-right text-yellow-400 font-bold">
                {r.final_asset.toLocaleString()}원
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
