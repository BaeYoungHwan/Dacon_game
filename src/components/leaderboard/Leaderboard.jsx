import { useEffect } from 'react'
import { useLeaderboardStore } from '../../store/leaderboardStore'
import { useGameStore } from '../../store/gameStore'

const MEDAL = ['🥇', '🥈', '🥉']

const ROW_STYLES = [
  { bg: 'rgba(245,158,11,0.06)', border: 'border-b border-amber-500/20', nameColor: 'text-amber-300' },
  { bg: 'rgba(148,163,184,0.05)', border: 'border-b border-slate-500/20', nameColor: 'text-slate-300' },
  { bg: 'rgba(234,88,12,0.05)',   border: 'border-b border-orange-500/20', nameColor: 'text-orange-300' },
]

export default function Leaderboard() {
  const { rankings, myRank, loading, fetchRankings } = useLeaderboardStore()
  const { nickname } = useGameStore()

  useEffect(() => {
    fetchRankings()
  }, [fetchRankings])

  return (
    <div
      className='w-full rounded-xl border border-cyan-500/40 overflow-hidden'
      style={{
        background: 'rgba(2,6,23,0.95)',
        boxShadow: '0 0 32px rgba(34,211,238,0.25), inset 0 0 20px rgba(34,211,238,0.06)',
      }}
    >
      {/* 헤더 */}
      <div className='flex items-center justify-between px-5 py-3 border-b border-slate-700/60'>
        <div className='flex items-center gap-2'>
          <span
            className='text-xs font-black tracking-widest font-mono border px-2 py-0.5 rounded'
            style={{ color: '#22D3EE', borderColor: '#22D3EE' }}
          >
            KRX
          </span>
          <span className='text-xs text-cyan-400/60 tracking-widest font-mono'>GLOBAL RANKING</span>
        </div>
        {myRank != null && (
          <span
            className='text-xs font-black font-mono tracking-wide px-3 py-1 rounded-full border'
            style={{
              color: '#22D3EE',
              borderColor: 'rgba(34,211,238,0.4)',
              background: 'rgba(34,211,238,0.08)',
              textShadow: '0 0 8px rgba(34,211,238,0.8)',
            }}
          >
            내 순위 #{myRank}
          </span>
        )}
      </div>

      {/* 로딩 */}
      {loading && (
        <div className='flex items-center justify-center gap-2 py-10 text-cyan-400/60 font-mono text-sm'>
          <span className='animate-pulse'>●</span>
          <span className='animate-pulse' style={{ animationDelay: '0.2s' }}>●</span>
          <span className='animate-pulse' style={{ animationDelay: '0.4s' }}>●</span>
          <span className='ml-1'>랭킹 불러오는 중</span>
        </div>
      )}

      {/* 랭킹 테이블 */}
      {!loading && (
        rankings.length === 0 ? (
          <div className='py-10 text-center text-gray-500 font-mono text-sm'>
            아직 등록된 랭킹이 없습니다
          </div>
        ) : (
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-slate-700/60'>
                <th className='py-2 pl-5 text-left text-xs text-cyan-400/50 font-mono tracking-widest font-normal w-14'>순위</th>
                <th className='py-2 text-left text-xs text-cyan-400/50 font-mono tracking-widest font-normal'>닉네임</th>
                <th className='py-2 pr-5 text-right text-xs text-cyan-400/50 font-mono tracking-widest font-normal'>최종 자산</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r, i) => {
                const isMe = r.nickname === nickname
                const rowStyle = ROW_STYLES[i] ?? {}
                return (
                  <tr
                    key={r.id}
                    className={`transition-colors ${rowStyle.border ?? 'border-b border-slate-800/40'} ${!isMe ? 'hover:bg-slate-800/20' : ''}`}
                    style={{
                      background: isMe
                        ? 'rgba(34,211,238,0.07)'
                        : (rowStyle.bg ?? 'transparent'),
                      outline: isMe ? '1px solid rgba(34,211,238,0.35)' : 'none',
                    }}
                  >
                    {/* 순위 */}
                    <td className='py-2.5 pl-5 font-mono font-bold text-base w-14'>
                      {i < 3
                        ? <span>{MEDAL[i]}</span>
                        : <span className='text-gray-500 text-sm'>{i + 1}위</span>
                      }
                    </td>

                    {/* 닉네임 */}
                    <td className={`py-2.5 font-mono font-semibold ${isMe ? 'text-cyan-200' : (rowStyle.nameColor ?? 'text-gray-300')}`}>
                      {r.nickname}
                      {isMe && (
                        <span
                          className='ml-2 text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded'
                          style={{ color: '#22D3EE', background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.3)' }}
                        >
                          ME
                        </span>
                      )}
                    </td>

                    {/* 최종 자산 */}
                    <td className='py-2.5 pr-5 text-right font-mono font-bold tabular-nums text-white'>
                      {(r.final_asset ?? 0).toLocaleString()}
                      <span className='text-gray-500 text-xs ml-0.5'>원</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )
      )}
    </div>
  )
}
