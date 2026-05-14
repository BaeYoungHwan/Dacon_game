// 메인 화면용 KOSPI 지수 라인 차트 위젯
// pregame 13주(회색) + 현재 턴까지 실제 KOSPI 종가 표시

import stockData from "../../data/stockData.json"
import { useGameStore } from "../../store/gameStore"

const SVG_W = 500
const SVG_H = 80
const PAD = { top: 8, right: 8, bottom: 18, left: 52 }

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

  const pregameCloses = stockData.pregame_kospi_closes ?? []
  const gameCloses = (stockData.kospi_closes ?? []).slice(0, Math.max(turn, 1))

  const allCloses = [...pregameCloses, ...gameCloses]
  const allDates = [
    ...stockData.meta.pregame_dates,
    ...stockData.meta.dates.slice(0, Math.max(turn, 1)),
  ]
  const total = allCloses.length
  const pregameCount = pregameCloses.length

  if (total === 0) return null

  const minV = Math.min(...allCloses) * 0.998
  const maxV = Math.max(...allCloses) * 1.002

  const startClose = gameCloses[0] ?? pregameCloses[pregameCloses.length - 1]
  const currentClose = gameCloses[gameCloses.length - 1] ?? startClose
  const changePct = startClose ? ((currentClose - startClose) / startClose) * 100 : 0
  const isUp = changePct >= 0

  const pregamePoints = pregameCloses
    .map((v, i) => `${toX(i, total)},${toY(v, minV, maxV)}`)
    .join(" ")
  const gamePoints = gameCloses
    .map((v, i) => `${toX(pregameCount + i, total)},${toY(v, minV, maxV)}`)
    .join(" ")

  const yLabels = [minV, (minV + maxV) / 2, maxV].map((v) => ({
    v: Math.round(v),
    y: toY(v, minV, maxV),
  }))

  const xLabels = []
  if (allDates[pregameCount]) {
    xLabels.push({ idx: pregameCount, label: allDates[pregameCount].slice(2, 7) })
  }
  if (total > 1 && total - 1 !== pregameCount) {
    xLabels.push({ idx: total - 1, label: allDates[total - 1]?.slice(2, 7) ?? "" })
  }

  return (
    <div className="bg-gray-800 rounded-lg px-3 py-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400 font-medium">KOSPI</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">
            {Math.round(currentClose).toLocaleString()}
          </span>
          <span className={`text-xs font-medium ${isUp ? "text-red-400" : "text-blue-400"}`}>
            {isUp ? "+" : ""}{changePct.toFixed(2)}%
          </span>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: "block" }}>
        {yLabels.map(({ v, y }, i) => (
          <g key={i}>
            <line
              x1={PAD.left} x2={SVG_W - PAD.right} y1={y} y2={y}
              stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4"
            />
            <text x={PAD.left - 3} y={y} textAnchor="end" dominantBaseline="middle"
              fill="#6b7280" fontSize={8}>
              {v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}
            </text>
          </g>
        ))}
        {xLabels.map(({ idx, label }) => (
          <text key={idx} x={toX(idx, total)} y={SVG_H - PAD.bottom + 12}
            textAnchor="middle" fill="#6b7280" fontSize={8}>
            {label}
          </text>
        ))}
        {pregameCount > 0 && pregameCount < total && (
          <rect
            x={PAD.left}
            y={PAD.top}
            width={toX(pregameCount - 1, total) - PAD.left}
            height={SVG_H - PAD.top - PAD.bottom}
            fill="rgba(255,255,255,0.03)"
          />
        )}
        {pregameCloses.length > 1 && (
          <polyline points={pregamePoints} fill="none" stroke="#4b5563" strokeWidth={1.5} />
        )}
        {gameCloses.length > 1 && (
          <polyline
            points={gamePoints}
            fill="none"
            stroke={isUp ? "#f87171" : "#60a5fa"}
            strokeWidth={1.8}
          />
        )}
        {gameCloses.length > 0 && (
          <circle
            cx={toX(total - 1, total)}
            cy={toY(currentClose, minV, maxV)}
            r={3}
            fill={isUp ? "#f87171" : "#60a5fa"}
          />
        )}
      </svg>
    </div>
  )
}
