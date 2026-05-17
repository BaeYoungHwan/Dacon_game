import { useState } from 'react'
import { useGameStore, INITIAL_CASH } from "../store/gameStore"
import { useLeaderboardStore } from "../store/leaderboardStore"
import Leaderboard from "../components/leaderboard/Leaderboard"
import { getGrade, calcExcessPp, KOSPI_CHART_RETURN } from "../lib/grade"

const KOSPI_FINAL_ASSETS = Math.round(INITIAL_CASH * (1 + KOSPI_CHART_RETURN))

function AssetHistoryChart({ assetHistory, initial }) {
  if (!assetHistory.length) return (
    <div className='flex items-center justify-center h-full text-[10px] text-gray-600 font-mono'>히스토리 없음</div>
  )

  const points = [initial, ...assetHistory]
  const minV = Math.min(...points) * 0.98
  const maxV = Math.max(...points) * 1.02
  const range = maxV - minV || 1

  const W = 100, H = 52
  const PAD = { l: 1, r: 1, t: 7, b: 4 }
  const cW = W - PAD.l - PAD.r
  const cH = H - PAD.t - PAD.b

  const toX = (i) => PAD.l + (i / (points.length - 1)) * cW
  const toY = (v) => PAD.t + cH - ((v - minV) / range) * cH

  const linePath = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ')
  const areaPath = `${linePath} L${toX(points.length - 1).toFixed(2)},${H} L${PAD.l},${H} Z`
  const baseY    = toY(initial)
  const endX     = toX(points.length - 1)
  const endY     = toY(points[points.length - 1])
  const isUp     = points[points.length - 1] >= initial
  const lineColor = isUp ? '#F87171' : '#60A5FA'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width='100%' height='100%' preserveAspectRatio='none' style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id='assetAreaGrad' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor={lineColor} stopOpacity='0.3' />
          <stop offset='100%' stopColor={lineColor} stopOpacity='0' />
        </linearGradient>
        <filter id='assetGlow' x='-20%' y='-80%' width='140%' height='260%'>
          <feGaussianBlur stdDeviation='0.8' result='blur' />
          <feMerge><feMergeNode in='blur' /><feMergeNode in='SourceGraphic' /></feMerge>
        </filter>
        {/* 왼쪽→오른쪽 드로잉 클립 */}
        <clipPath id='assetClip'>
          <rect x='0' y='0' height={H}>
            <animate attributeName='width' from='0' to={W} dur='1.5s' begin='0.3s' fill='freeze' calcMode='spline' keyTimes='0;1' keySplines='0.16 1 0.3 1' />
          </rect>
        </clipPath>
      </defs>

      {/* 시작 기준선 */}
      <line x1={PAD.l} y1={baseY} x2={W - PAD.r} y2={baseY} stroke='#1e293b' strokeWidth='0.6' strokeDasharray='1.5,1.5' />
      <text x={PAD.l + 0.5} y={baseY - 1.5} fill='#475569' fontSize='3' fontFamily='monospace'>시작</text>

      {/* 드로잉 애니메이션 */}
      <g clipPath='url(#assetClip)'>
        <path d={areaPath} fill='url(#assetAreaGrad)' />
        <path d={linePath} stroke={lineColor} strokeWidth='1.5' fill='none' filter='url(#assetGlow)' />
      </g>

      {/* 끝점 펄스 */}
      <circle cx={endX} cy={endY} r='1.5' fill={lineColor} />
      <circle cx={endX} cy={endY} r='1.5' fill='none' stroke={lineColor} strokeWidth='0.8' opacity='0.6'>
        <animate attributeName='r' values='1.5;5;1.5' dur='2s' begin='1.8s' repeatCount='indefinite' />
        <animate attributeName='opacity' values='0.6;0;0.6' dur='2s' begin='1.8s' repeatCount='indefinite' />
      </circle>
    </svg>
  )
}

export default function ResultPage() {
  const { nickname, getFinalAssets, resetGame, cash, portfolio, assetHistory } = useGameStore()
  const { submitScore, submitted } = useLeaderboardStore()
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const finalAssets = getFinalAssets()
  const myReturn    = (finalAssets - INITIAL_CASH) / INITIAL_CASH
  const excessPp    = calcExcessPp(myReturn, KOSPI_CHART_RETURN)
  const grade       = getGrade(excessPp)
  const isPositive  = excessPp >= 0

  const stockValue     = finalAssets - cash
  const profitAmt      = finalAssets - INITIAL_CASH
  const stockCount     = Object.values(portfolio).filter(qty => qty > 0).length

  const myReturnPct    = myReturn * 100
  const kospiReturnPct = KOSPI_CHART_RETURN * 100

  const handleSubmit = async () => {
    await submitScore(nickname, finalAssets, grade.label)
    setShowLeaderboard(true)
  }

  const handleShowLeaderboard = () => setShowLeaderboard(true)

  return (
    <div className='h-screen w-screen flex items-center justify-center bg-slate-950 overflow-hidden animate-page-enter'>
      {/* 다른 페이지와 동일한 16:9 비율 컨테이너 */}
      <div
        className='relative aspect-[16/9]'
        style={{
          width: 'min(100vw, calc(100vh * 16 / 9))',
          height: 'min(100vh, calc(100vw * 9 / 16))',
          backgroundImage: "url('/images/result-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
      {/* 배경 어둡게 오버레이 — 카드 가독성 확보 */}
      <div className='absolute inset-0 bg-slate-950/60' />
      <div className='absolute inset-0 text-white flex flex-col px-8 py-5 gap-4'>

        {/* 헤더 */}
        <div className='flex-none text-center'>
          <div className='flex items-center justify-center gap-2 mb-2'>
            <span className='text-xs font-black tracking-widest font-mono border px-2 py-0.5 rounded' style={{ color: '#22D3EE', borderColor: '#22D3EE' }}>KRX</span>
            <span className='text-xs text-cyan-400/60 tracking-widest font-mono'>KOREA EXCHANGE</span>
          </div>
          <h1 className='text-5xl font-black tracking-widest font-mono leading-none' style={{ color: grade.titleColor, textShadow: `0 0 24px ${grade.titleColor}, 0 0 48px ${grade.titleColor}80` }}>GAME OVER</h1>
          <p className='text-gray-400 text-sm tracking-wider mt-1'>플레이어 닉네임 : <span className='text-cyan-200 font-semibold'>{nickname}</span></p>
        </div>

        {/* 메인 2열 */}
        <div className='flex-1 flex gap-6 min-h-0'>

          {/* 좌측: 등급 패널 */}
          <div
            className='flex-none w-72 flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-5'
            style={{
              borderColor: grade.borderColor,
              boxShadow: `0 0 32px ${grade.glowColor}, inset 0 0 20px ${grade.glowColor}`,
              background: 'rgba(2,6,23,0.85)',
            }}
          >
            <img
              src={`/images/grades/${grade.label}.png`}
              alt={grade.label}
              className='w-56 h-56 object-contain'
              style={{ filter: `drop-shadow(0 0 20px ${grade.glowColor})` }}
            />
            <p className={`text-2xl font-black tracking-wide ${grade.color}`}>{grade.label}</p>
            <p className='text-gray-400 text-xs italic leading-relaxed text-center px-2'>&quot;{grade.comment}&quot;</p>
          </div>

          {/* 우측: 스탯 패널 */}
          <div className='flex-1 flex flex-col gap-3 min-h-0 justify-center'>

            {/* 자산 비교 */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='bg-slate-900/80 border border-cyan-500/40 rounded-xl p-4'>
                <p className='text-xs text-cyan-400/70 font-mono tracking-wider mb-2'>내 최종 자산</p>
                <p className='text-xs text-gray-500 font-mono mb-1'>자산:</p>
                <p className='text-lg font-black font-mono tabular-nums text-white leading-tight'>{finalAssets.toLocaleString()}원</p>
                <p className={`text-sm font-bold font-mono mt-1 ${myReturn >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                  {myReturn >= 0 ? '+' : ''}{(myReturn * 100).toFixed(1)}%
                </p>
              </div>
              <div className='bg-slate-900/80 border border-cyan-500/40 rounded-xl p-4'>
                <p className='text-xs text-cyan-400/70 font-mono tracking-wider mb-2'>KOSPI 지수형 투자 시</p>
                <p className='text-xs text-gray-500 font-mono mb-1'>가상 자산:</p>
                <p className='text-lg font-black font-mono tabular-nums text-cyan-200 leading-tight'>{KOSPI_FINAL_ASSETS.toLocaleString()}원</p>
                <p className='text-sm font-bold font-mono mt-1 text-red-400'>+{(KOSPI_CHART_RETURN * 100).toFixed(1)}%</p>
              </div>
            </div>

            {/* 초과수익률 배지 */}
            <div
              className='text-center py-2 px-4 rounded-lg border font-mono font-bold text-sm tracking-wide'
              style={{
                borderColor: isPositive ? '#F87171' : '#6B7280',
                color: isPositive ? '#F87171' : '#9CA3AF',
                background: isPositive ? 'rgba(248,113,113,0.08)' : 'rgba(107,114,128,0.08)',
              }}
            >
              KOSPI 대비 수익률 차이: {isPositive ? '+' : ''}{excessPp.toFixed(1)}%p
            </div>

            {/* 상세 스탯 3종 */}
            <div className='grid grid-cols-3 gap-2'>
              {[
                { label: '보유 현금', sub: null, value: cash.toLocaleString() + '원', color: 'text-cyan-300' },
                { label: '주식 평가액', sub: `${stockCount}개 종목`, value: stockValue.toLocaleString() + '원', color: 'text-violet-300' },
                { label: '순 손익', sub: null, value: (profitAmt >= 0 ? '+' : '') + profitAmt.toLocaleString() + '원', color: profitAmt >= 0 ? 'text-red-400' : 'text-blue-400' },
              ].map(({ label, sub, value, color }) => (
                <div key={label} className='bg-slate-900/80 border border-cyan-500/30 rounded-lg p-2 text-center'>
                  <p className='text-[10px] text-gray-500 font-mono'>{label}</p>
                  {sub && <p className='text-[9px] text-gray-600 font-mono'>{sub}</p>}
                  <p className={`text-xs font-black font-mono tabular-nums mt-0.5 ${color} leading-tight`}>{value}</p>
                </div>
              ))}
            </div>

            {/* 50주 자산 변동 차트 */}
            <div className='bg-slate-900/80 border border-cyan-500/30 rounded-xl px-3 pt-2 pb-1 flex flex-col' style={{ height: '96px' }}>
              <div className='flex items-center justify-between mb-1 flex-none'>
                <p className='text-[10px] text-cyan-400/60 font-mono tracking-widest'>ASSET HISTORY</p>
                <div className='flex items-center gap-3'>
                  <span className='text-[10px] text-gray-500 font-mono'>
                    {myReturnPct >= 0 ? '+' : ''}{myReturnPct.toFixed(1)}% 내 수익률
                  </span>
                  <span className='text-[10px] text-gray-600 font-mono'>
                    +{kospiReturnPct.toFixed(1)}% KOSPI
                  </span>
                </div>
              </div>
              <div className='flex-1 min-h-0'>
                <AssetHistoryChart assetHistory={assetHistory ?? []} initial={INITIAL_CASH} />
              </div>
            </div>

            {/* 버튼 */}
            <div className='grid grid-cols-2 gap-3 flex-none'>
              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  className='py-3 rounded-xl font-black font-mono tracking-wide transition-all duration-150 hover:opacity-90 active:scale-95'
                  style={{ background: 'linear-gradient(135deg, #22D3EE, #0891B2)', color: '#0f172a', boxShadow: '0 0 20px rgba(34,211,238,0.45)' }}
                >
                  랭킹 등록
                </button>
              ) : (
                <button
                  onClick={handleShowLeaderboard}
                  className='py-3 rounded-xl font-black font-mono tracking-wide border-2 border-cyan-400 text-cyan-300 transition-all duration-150 hover:bg-cyan-400/10'
                >
                  랭킹 확인
                </button>
              )}
              <button
                onClick={resetGame}
                className='py-3 rounded-xl font-black font-mono tracking-wide border-2 border-slate-600 text-slate-300 transition-all duration-150 hover:bg-slate-700/40 hover:border-slate-500'
              >
                다시 하기
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 리더보드 오버레이 */}
      {showLeaderboard && (
        <div className='absolute inset-0 flex items-center justify-center bg-slate-950/90 z-50 px-8'>
          <div className='w-full max-w-lg'>
            <Leaderboard />
            <button
              onClick={() => setShowLeaderboard(false)}
              className='mt-4 w-full py-3 rounded-xl font-black font-mono tracking-wide border-2 border-slate-600 text-slate-300 transition-all duration-150 hover:bg-slate-700/40'
            >
              닫기
            </button>
          </div>
        </div>
      )}
      </div> {/* /aspect-[16/9] */}
    </div>
  )
}
