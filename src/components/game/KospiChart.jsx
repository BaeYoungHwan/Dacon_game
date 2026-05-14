// 메인 화면용 KOSPI 지수 라인 차트 위젯
// pregame 13주(회색) + 현재 턴까지 실제 KOSPI 종가 표시

import { useId } from "react"
import stockData from "../../data/stockData.json"
import { useGameStore } from "../../store/gameStore"
import AnimatedNumber from "../ui/AnimatedNumber"

const SVG_W = 500
const SVG_H = 110
const PAD = { top: 10, right: 0, bottom: 22, left: 54 }

function toX(i, total) {
  const drawW = SVG_W - PAD.left - PAD.right
  if (total <= 1) return PAD.left + drawW / 2
  return PAD.left + (i / (total - 1)) * drawW
}

function toY(val, minV, maxV) {
  const drawH = SVG_H - PAD.top - PAD.bottom
  if (maxV === minV) return PAD.top + drawH / 2
  return PAD.top + (1 - (val - minV) / (maxV - minV)) * drawH
}

export default function KospiChart() {
  const { turn } = useGameStore()
  // SVG defs id 충돌 방지 — KospiChart가 동시에 여러 곳에서 마운트되어도 unique
  // (예: 본문 작은 차트 + ChartExpandModal 확대 차트가 동시 마운트되면 같은 'kospiLineGlow' 두 개라 url(#...)이 모호)
  const uid = useId()
  const glowId  = `kospi-glow-${uid}`
  const upId    = `kospi-up-${uid}`
  const downId  = `kospi-down-${uid}`

  // pregame(회색) + game(컬러) 둘 다 같은 X 시간축에 표시
  const pregameCloses = stockData.pregame_kospi_closes ?? []
  const gameCloses = (stockData.kospi_closes ?? []).slice(0, Math.max(turn, 1))
  const pregameCount = pregameCloses.length

  const allCloses = [...pregameCloses, ...gameCloses]
  const allDates = [
    ...(stockData.meta.pregame_dates ?? []),
    ...stockData.meta.dates.slice(0, Math.max(turn, 1)),
  ]
  const total = allCloses.length

  if (total === 0) return null

  const minV = Math.min(...allCloses) * 0.998
  const maxV = Math.max(...allCloses) * 1.002

  const startClose = gameCloses[0] ?? pregameCloses[pregameCount - 1]
  const currentClose = gameCloses[gameCloses.length - 1] ?? startClose

  // "당일 대비 전날 변동률" — turn=1일 땐 pregame 마지막 종가와 비교, turn≥2일 땐 직전 게임 종가
  const previousClose = gameCloses.length > 1
    ? gameCloses[gameCloses.length - 2]
    : (pregameCloses[pregameCount - 1] ?? currentClose)
  const changePct = previousClose ? ((currentClose - previousClose) / previousClose) * 100 : 0
  const isUp = changePct >= 0

  // pregame 라인 점들 — X=0..pregameCount-1
  const pregamePoints = pregameCloses
    .map((v, i) => `${toX(i, total)},${toY(v, minV, maxV)}`)
    .join(" ")

  // 게임 라인 점들 — X=pregameCount..total-1
  const gamePoints = gameCloses
    .map((v, i) => `${toX(pregameCount + i, total)},${toY(v, minV, maxV)}`)
    .join(" ")

  const yLabels = [minV, (minV + maxV) / 2, maxV].map((v) => ({
    v: Math.round(v),
    y: toY(v, minV, maxV),
  }))

  // X축 라벨 — pregame 시작 + 게임 시작 + 마지막
  const xLabels = []
  if (allDates[pregameCount]) {
    xLabels.push({ idx: pregameCount, label: allDates[pregameCount].slice(2, 7) })
  }
  if (total > 1 && total - 1 !== pregameCount) {
    xLabels.push({ idx: total - 1, label: allDates[total - 1]?.slice(2, 7) ?? "" })
  }

  // 게임 라인 area fill용 polygon (게임 시작점부터 마지막까지 영역)
  const gameAreaPoints = gameCloses.length > 1
    ? `${gamePoints} ${toX(total - 1, total)},${SVG_H - PAD.bottom} ${toX(pregameCount, total)},${SVG_H - PAD.bottom}`
    : ''

  const upColor = "#f87171"   // 상승 빨강 (한국 주식 표준)
  const downColor = "#60a5fa" // 하락 파랑

  return (
    <div className="relative bg-slate-900/90 backdrop-blur rounded-lg px-3 pt-2 pb-1 border-2 border-cyan-500/60 shadow-[0_0_25px_rgba(34,211,238,0.2)]">
      {/* 좌상단 모서리 deco — 디지털 보드 느낌 */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg pointer-events-none" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg pointer-events-none" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400 rounded-br-lg pointer-events-none" />

      {/* 헤더: KOSPI INDEX 라벨 + 라이브 인디케이터 + LED 가격 + 화살표 변동률 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] text-cyan-300 font-bold tracking-[0.25em]">KOSPI</span>
          <span className="text-[8px] text-cyan-500/70 tracking-wider font-mono">INDEX</span>
          <span className="flex items-center gap-1 ml-1">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
            <span className="text-[8px] text-cyan-400/80 font-mono tracking-wider">LIVE</span>
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className="text-2xl font-bold text-cyan-100 font-mono tabular-nums leading-none"
            style={{ textShadow: '0 0 8px rgba(34,211,238,0.4)' }}
          >
            <AnimatedNumber value={currentClose} />
          </span>
          <span className={`text-xs font-bold flex items-center gap-0.5 tabular-nums font-mono ${isUp ? 'text-red-400' : 'text-blue-400'}`}>
            <span className="text-[10px]">{isUp ? '▲' : '▼'}</span>
            {isUp ? '+' : ''}<AnimatedNumber value={changePct} decimals={2} />%
          </span>
        </div>
      </div>

      {/* SVG 차트 — 컨테이너 px-3을 무효화하기 위해 inline style로 음수 margin + 확장 width */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{
          display: 'block',
          width: 'calc(100% + 24px)',
          marginLeft: '-12px',
          marginRight: '-12px',
        }}
      >
        <defs>
          {/* 게임 라인 글로우 필터 */}
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* 상승 영역 그라데이션 */}
          <linearGradient id={upId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={upColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={upColor} stopOpacity="0" />
          </linearGradient>
          {/* 하락 영역 그라데이션 */}
          <linearGradient id={downId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={downColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={downColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 격자 + Y축 라벨 */}
        {yLabels.map(({ v, y }, i) => (
          <g key={i}>
            <line
              x1={PAD.left} x2={SVG_W - PAD.right} y1={y} y2={y}
              stroke="rgba(34,211,238,0.15)" strokeDasharray="2 4"
            />
            <text x={PAD.left - 4} y={y} textAnchor="end" dominantBaseline="middle"
              fill="#67e8f9" fontSize={9} fontFamily="monospace" opacity="0.85">
              {v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}
            </text>
          </g>
        ))}

        {/* X축 라벨 — 마지막 라벨은 우측 정렬해서 잘리지 않게 */}
        {xLabels.map(({ idx, label }) => {
          const isLast = idx === total - 1
          return (
            <text key={idx} x={toX(idx, total)} y={SVG_H - PAD.bottom + 14}
              textAnchor={isLast ? 'end' : 'middle'} fill="#67e8f9" fontSize={9}
              fontFamily="monospace" opacity="0.85">
              {label}
            </text>
          )
        })}

        {/* pregame 영역 어두운 배경 (좌측) */}
        {pregameCount > 0 && pregameCount < total && (
          <rect
            x={PAD.left}
            y={PAD.top}
            width={toX(pregameCount - 1, total) - PAD.left}
            height={SVG_H - PAD.top - PAD.bottom}
            fill="rgba(15,23,42,0.4)"
          />
        )}

        {/* pregame ↔ game 경계 세로 점선 */}
        {pregameCount > 0 && pregameCount < total && (
          <line
            x1={toX(pregameCount - 1, total)} x2={toX(pregameCount - 1, total)}
            y1={PAD.top} y2={SVG_H - PAD.bottom}
            stroke="rgba(34,211,238,0.4)" strokeWidth={1} strokeDasharray="3 3"
          />
        )}

        {/* 게임 라인 아래 그라데이션 영역 (area chart) */}
        {gameAreaPoints && (
          <polygon
            points={gameAreaPoints}
            fill={isUp ? `url(#${upId})` : `url(#${downId})`}
          />
        )}

        {/* pregame 라인 (회색 점선) */}
        {pregameCloses.length > 1 && (
          <polyline
            points={pregamePoints}
            fill="none"
            stroke="#64748b"
            strokeWidth={1.3}
            strokeDasharray="3 2"
          />
        )}

        {/* 게임 라인 (글로우 적용) */}
        {gameCloses.length > 1 && (
          <polyline
            points={gamePoints}
            fill="none"
            stroke={isUp ? upColor : downColor}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            filter={`url(#${glowId})`}
          />
        )}

        {/* 현재 가격 마커 (글로우 링 + 코어) */}
        {gameCloses.length > 0 && (
          <>
            <circle
              cx={toX(total - 1, total)} cy={toY(currentClose, minV, maxV)}
              r={6} fill={isUp ? upColor : downColor} opacity="0.25"
            />
            <circle
              cx={toX(total - 1, total)} cy={toY(currentClose, minV, maxV)}
              r={3.5} fill={isUp ? upColor : downColor}
            />
          </>
        )}
      </svg>

      {/* 푸터: OPEN 가격 + 기간 표시 */}
      <div className="flex items-center justify-between text-[9px] mt-0.5 text-cyan-400/70 font-mono tracking-wider">
        <span>OPEN <span className="text-cyan-200">{Math.round(startClose).toLocaleString()}</span></span>
        <span>W{turn}/{50}</span>
      </div>
    </div>
  )
}
