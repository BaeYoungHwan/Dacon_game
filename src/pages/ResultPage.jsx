import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useGameStore, INITIAL_CASH } from "../store/gameStore"
import { useLeaderboardStore } from "../store/leaderboardStore"
import Leaderboard from "../components/leaderboard/Leaderboard"
import { getGrade, calcExcessPp, KOSPI_CHART_RETURN } from "../lib/grade"

const KOSPI_FINAL_ASSETS = Math.round(INITIAL_CASH * (1 + KOSPI_CHART_RETURN))

function AssetHistoryChart({ assetHistory, initial }) {
  const containerRef = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect
      setSize({ w: Math.round(width), h: Math.round(height) })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  if (!assetHistory.length) return (
    <div ref={containerRef} className='w-full h-full flex items-center justify-center text-[10px] text-gray-600 font-mono'>
      히스토리 없음
    </div>
  )

  const { w: W, h: H } = size
  if (!W || !H) return <div ref={containerRef} className='w-full h-full' />

  const points   = [initial, ...assetHistory]
  const minV     = Math.min(...points)
  const maxV     = Math.max(...points)
  const padding  = (maxV - minV) * 0.15 || initial * 0.08
  const lo       = minV - padding
  const hi       = maxV + padding
  const range    = hi - lo

  const PAD  = { l: 54, r: 52, t: 8, b: 8 }
  const cW   = W - PAD.l - PAD.r
  const cH   = H - PAD.t - PAD.b

  const toX = (i) => PAD.l + (i / (points.length - 1)) * cW
  const toY = (v) => PAD.t + cH - ((v - lo) / range) * cH

  const fmt = (v) => {
    const abs = Math.abs(v)
    if (abs >= 100_000_000) return `${(v / 100_000_000).toFixed(1)}억`
    return `${Math.round(v / 10_000)}만`
  }

  const linePath = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${toX(points.length - 1).toFixed(1)},${PAD.t + cH} L${PAD.l},${PAD.t + cH} Z`
  const baseY    = toY(initial)
  const endX     = toX(points.length - 1)
  const endY     = toY(points[points.length - 1])
  const isUp     = points[points.length - 1] >= initial
  const lineColor = isUp ? '#F87171' : '#60A5FA'
  const finalVal  = points[points.length - 1]

  // 최고/최저 인덱스
  const maxIdx = points.indexOf(maxV)
  const minIdx = points.indexOf(minV)

  // Y축 눈금 — 최고/최저는 항상 표시, 시작선은 겹치지 않을 때만
  const maxY     = toY(maxV)
  const minY     = toY(minV)
  const initY    = toY(initial)
  const showInit = Math.abs(initY - maxY) >= 13 && Math.abs(initY - minY) >= 13
  const yTicks = [
    { v: maxV,    label: `${fmt(maxV)}원`,    color: '#94a3b8', isBase: false },
    ...(showInit ? [{ v: initial, label: `${fmt(initial)}원`, color: '#475569', isBase: true }] : []),
    { v: minV,    label: `${fmt(minV)}원`,    color: '#94a3b8', isBase: false },
  ]

  return (
    <div ref={containerRef} className='w-full h-full'>
      <svg width={W} height={H}>
        <defs>
          <linearGradient id='assetAreaGrad' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor={lineColor} stopOpacity='0.25' />
            <stop offset='100%' stopColor={lineColor} stopOpacity='0' />
          </linearGradient>
          <filter id='assetGlow' x='-20%' y='-80%' width='140%' height='260%'>
            <feGaussianBlur stdDeviation='1' result='blur' />
            <feMerge><feMergeNode in='blur' /><feMergeNode in='SourceGraphic' /></feMerge>
          </filter>
          {/* 왼쪽→오른쪽 드로잉 클립 */}
          <clipPath id='assetClip'>
            <rect x={PAD.l} y={0} height={H}>
              <animate attributeName='width' from='0' to={cW} dur='1.5s' begin='0.3s' fill='freeze' calcMode='spline' keyTimes='0;1' keySplines='0.16 1 0.3 1' />
            </rect>
          </clipPath>
        </defs>

        {/* Y축 그리드 + 라벨 */}
        {yTicks.map(({ v, label, color, isBase }) => {
          const y = toY(v)
          return (
            <g key={v}>
              <line x1={PAD.l} y1={y} x2={PAD.l + cW} y2={y}
                stroke={isBase ? '#334155' : '#1e293b'}
                strokeWidth={isBase ? 0.8 : 0.5}
                strokeDasharray={isBase ? '4,4' : '2,5'}
              />
              <text x={PAD.l - 5} y={y + 3.5} textAnchor='end'
                fill={color} fontSize='9' fontFamily='ui-monospace,monospace'>
                {label}
              </text>
            </g>
          )
        })}

        {/* 최고/최저 마커 */}
        <circle cx={toX(maxIdx)} cy={toY(maxV)} r='2.5' fill='none' stroke='#94a3b8' strokeWidth='1' />
        <circle cx={toX(minIdx)} cy={toY(minV)} r='2.5' fill='none' stroke='#94a3b8' strokeWidth='1' />

        {/* 드로잉 애니메이션 */}
        <g clipPath='url(#assetClip)'>
          <path d={areaPath} fill='url(#assetAreaGrad)' />
          <path d={linePath} stroke={lineColor} strokeWidth='1.5' fill='none' filter='url(#assetGlow)' />
        </g>

        {/* 최종값 라벨 */}
        <text x={endX + 5} y={endY + 3.5} fill={lineColor}
          fontSize='10' fontFamily='ui-monospace,monospace' fontWeight='bold'>
          {fmt(finalVal)}원
        </text>

        {/* 끝점 펄스 */}
        <circle cx={endX} cy={endY} r='2' fill={lineColor} />
        <circle cx={endX} cy={endY} r='2' fill='none' stroke={lineColor} strokeWidth='1' opacity='0.6'>
          <animate attributeName='r' values='2;7;2' dur='2s' begin='1.8s' repeatCount='indefinite' />
          <animate attributeName='opacity' values='0.6;0;0.6' dur='2s' begin='1.8s' repeatCount='indefinite' />
        </circle>

        {/* X축 끝 라벨 */}
        <text x={PAD.l} y={H - 1} fill='#334155' fontSize='8' fontFamily='ui-monospace,monospace'>1주</text>
        <text x={PAD.l + cW} y={H - 1} textAnchor='end' fill='#334155' fontSize='8' fontFamily='ui-monospace,monospace'>50주</text>
      </svg>
    </div>
  )
}

export default function ResultPage() {
  const { nickname, getFinalAssets, resetGame, cash, portfolio, assetHistory } = useGameStore()
  const { submitScore, submitted } = useLeaderboardStore()
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const outerRef = useRef(null)
  const [contentScale, setContentScale] = useState(1)
  useLayoutEffect(() => {
    const el = outerRef.current
    if (!el) return
    const update = () => { const w = el.clientWidth; if (w > 0) setContentScale(w / 1280) }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

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
    <div className='h-screen w-screen flex items-center justify-center bg-slate-950 overflow-hidden'>
      {/* 다른 페이지와 동일한 16:9 비율 컨테이너 */}
      <div
        ref={outerRef}
        className='relative aspect-[16/9] overflow-hidden animate-page-enter'
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
      {/* 1280×720 고정 좌표계 — transform:scale로 창 크기에 맞게 비례 축소 */}
      <div
        className='absolute top-0 left-0 text-white flex flex-col px-8 py-5 gap-4'
        style={{ width: 1280, height: 720, transform: `scale(${contentScale})`, transformOrigin: 'top left' }}
      >

        {/* 헤더 */}
        <div className='flex-none text-center'>
          <div className='flex items-center justify-center gap-2 mb-2'>
            <span className='text-sm font-black tracking-widest font-mono border px-2 py-0.5 rounded' style={{ color: '#22D3EE', borderColor: '#22D3EE' }}>KRX</span>
            <span className='text-sm text-cyan-400/60 tracking-widest font-mono'>KOREA EXCHANGE</span>
          </div>
          <h1 className='text-5xl font-black tracking-widest font-mono leading-none' style={{ color: grade.titleColor, textShadow: `0 0 24px ${grade.titleColor}, 0 0 48px ${grade.titleColor}80` }}>GAME OVER</h1>
          <p className='text-gray-400 text-base tracking-wider mt-1 break-keep'>플레이어 닉네임 : <span className='text-cyan-200 font-semibold'>{nickname}</span></p>
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
            <p className={`text-3xl font-black tracking-wide ${grade.color}`}>{grade.label}</p>
            <p className='text-gray-400 text-sm italic leading-relaxed text-center px-2 break-keep'>&quot;{grade.comment}&quot;</p>
          </div>

          {/* 우측: 스탯 패널 */}
          <div className='flex-1 flex flex-col gap-3 min-h-0'>

            {/* 자산 비교 */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='bg-slate-900/80 border border-cyan-500/40 rounded-xl p-4'>
                <p className='text-sm text-cyan-400/70 font-mono tracking-wider mb-2'>내 최종 자산</p>
                <p className='text-xs text-gray-500 font-mono mb-1'>자산:</p>
                <p className='text-2xl font-black font-mono tabular-nums text-white leading-tight'>{finalAssets.toLocaleString()}원</p>
                <p className={`text-base font-bold font-mono mt-1 ${myReturn >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                  {myReturn >= 0 ? '+' : ''}{(myReturn * 100).toFixed(1)}%
                </p>
              </div>
              <div className='bg-slate-900/80 border border-cyan-500/40 rounded-xl p-4'>
                <p className='text-sm text-cyan-400/70 font-mono tracking-wider mb-2'>KOSPI 지수형 투자 시</p>
                <p className='text-xs text-gray-500 font-mono mb-1'>가상 자산:</p>
                <p className='text-2xl font-black font-mono tabular-nums text-cyan-200 leading-tight'>{KOSPI_FINAL_ASSETS.toLocaleString()}원</p>
                <p className='text-base font-bold font-mono mt-1 text-red-400'>+{(KOSPI_CHART_RETURN * 100).toFixed(1)}%</p>
              </div>
            </div>

            {/* 초과수익률 배지 */}
            <div
              className='text-center py-2 px-4 rounded-lg border font-mono font-bold text-base tracking-wide break-keep'
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
                { label: '보유 현금',  sub: null,                  value: cash.toLocaleString() + '원',                                         color: 'text-cyan-300',   accent: '#22D3EE' },
                { label: '주식 평가액', sub: `${stockCount}개 종목`, value: stockValue.toLocaleString() + '원',                                   color: 'text-violet-300', accent: '#A78BFA' },
                { label: '순 손익',    sub: null,                  value: (profitAmt >= 0 ? '+' : '') + profitAmt.toLocaleString() + '원',        color: profitAmt >= 0 ? 'text-red-400' : 'text-blue-400', accent: profitAmt >= 0 ? '#F87171' : '#60A5FA' },
              ].map(({ label, sub, value, color, accent }) => (
                <div key={label} className='relative rounded-lg p-3 text-center overflow-hidden'
                  style={{
                    background: 'linear-gradient(135deg, rgba(2,6,23,0.92), rgba(15,23,42,0.85))',
                    border: `1px solid ${accent}50`,
                    boxShadow: `0 0 18px ${accent}22, inset 0 0 14px ${accent}18`,
                  }}>
                  {/* 상단 강조선 */}
                  <div className='absolute top-0 left-0 right-0 h-0.5 rounded-t-lg'
                    style={{ background: `linear-gradient(90deg, transparent, ${accent}cc, transparent)` }} />
                  <p className='text-sm text-gray-400 font-mono'>{label}</p>
                  {sub && <p className='text-xs text-gray-500 font-mono'>{sub}</p>}
                  <p className={`text-lg font-black font-mono tabular-nums mt-1 ${color} leading-tight break-keep`}>{value}</p>
                </div>
              ))}
            </div>

            {/* 50주 자산 변동 차트 */}
            <div className='bg-slate-900/80 border border-cyan-500/30 rounded-xl px-3 pt-2 pb-1 flex flex-col flex-1 min-h-0'>
              <div className='flex items-center justify-between mb-1 flex-none'>
                <p className='text-xs text-cyan-400/60 font-mono tracking-widest'>자산 변동</p>
                <div className='flex items-center gap-3'>
                  <span className='text-xs text-gray-500 font-mono'>
                    {myReturnPct >= 0 ? '+' : ''}{myReturnPct.toFixed(1)}% 내 수익률
                  </span>
                  <span className='text-xs text-gray-600 font-mono'>
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
                  className='py-3 rounded-xl text-base font-black font-mono tracking-wide transition-all duration-150 hover:opacity-90 active:scale-95 flex items-center justify-center gap-2'
                  style={{ background: 'linear-gradient(135deg, #22D3EE, #0891B2)', color: '#0f172a', boxShadow: '0 0 24px rgba(34,211,238,0.6), 0 0 48px rgba(34,211,238,0.25)', textShadow: '0 0 8px rgba(2,6,23,0.6)' }}
                >
                  ⚡ 랭킹 등록
                </button>
              ) : (
                <button
                  onClick={handleShowLeaderboard}
                  className='py-3 rounded-xl text-base font-black font-mono tracking-wide border-2 border-cyan-400 text-cyan-300 transition-all duration-150 hover:bg-cyan-400/10 flex items-center justify-center gap-2'
                  style={{ boxShadow: '0 0 16px rgba(34,211,238,0.35)', textShadow: '0 0 10px rgba(34,211,238,0.8)' }}
                >
                  ⚡ 랭킹 확인
                </button>
              )}
              <button
                onClick={resetGame}
                className='py-3 rounded-xl text-base font-black font-mono tracking-wide transition-all duration-150 hover:opacity-90 active:scale-95 flex items-center justify-center gap-2'
                style={{
                  background: 'linear-gradient(135deg, #334155, #1e293b)',
                  color: '#CBD5E1',
                  border: '1px solid rgba(148,163,184,0.4)',
                  boxShadow: '0 0 20px rgba(148,163,184,0.2), inset 0 0 12px rgba(148,163,184,0.05)',
                  textShadow: '0 0 10px rgba(148,163,184,0.7)',
                }}
              >
                🔄 다시 하기
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 리더보드 오버레이 */}
      {showLeaderboard && (
        <div className='absolute inset-0 flex items-center justify-center bg-slate-950/90 z-50 p-8'>
          <div className='w-full max-w-2xl'>
            <Leaderboard />
            <button
              onClick={() => setShowLeaderboard(false)}
              className='mt-3 w-full py-3 rounded-xl text-base font-black font-mono tracking-wide transition-all duration-150 hover:opacity-90 active:scale-95'
              style={{
                background: 'linear-gradient(135deg, #334155, #1e293b)',
                color: '#CBD5E1',
                border: '1px solid rgba(148,163,184,0.4)',
                boxShadow: '0 0 20px rgba(148,163,184,0.2), inset 0 0 12px rgba(148,163,184,0.05)',
                textShadow: '0 0 10px rgba(148,163,184,0.7)',
              }}
            >
              ✕ 닫기
            </button>
          </div>
        </div>
      )}
      </div> {/* /aspect-[16/9] */}
    </div>
  )
}
