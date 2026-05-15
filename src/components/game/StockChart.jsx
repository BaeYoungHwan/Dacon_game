// 종목별 주봉 캔들스틱 차트 - 하단 서브패널 탭(거래량/MACD/OBV) + 지표 신호 배지
// indicatorsPurchased 시 MA5, MA20, 볼린저, MACD, OBV 탭 제공

import { useState } from "react"
import stockData from "../../data/stockData.json"
import { useGameStore } from "../../store/gameStore"
import {
  calcMA, calcBollinger, calcMACD, calcOBV,
  getMaSignal, getBollingerSignal, getMacdSignal, getObvSignal,
} from "./chartUtils"

const SVG_W = 700
const PAD = { top: 10, right: 10, bottom: 22, left: 60 }

function toX(i, total) {
  const drawW = SVG_W - PAD.left - PAD.right
  if (total <= 1) return PAD.left + drawW / 2
  return PAD.left + (i / (total - 1)) * drawW
}

function toY(val, minV, maxV, svgH) {
  const drawH = svgH - PAD.top - PAD.bottom
  if (maxV === minV) return PAD.top + drawH / 2
  return PAD.top + (1 - (val - minV) / (maxV - minV)) * drawH
}

function candleWidth(total) {
  const drawW = SVG_W - PAD.left - PAD.right
  return Math.max(2, (drawW / Math.max(total, 1)) * 0.6)
}

function buildPolylinePoints(values, total, minV, maxV, svgH) {
  return values
    .map((v, i) => (v === null || v === undefined ? null : toX(i, total) + "," + toY(v, minV, maxV, svgH)))
    .filter(Boolean)
    .join(" ")
}

function YAxis({ minV, maxV, svgH, steps = 5 }) {
  const labels = Array.from({ length: steps }, (_, i) => {
    const frac = i / (steps - 1)
    const v = minV + (maxV - minV) * frac
    return { v, y: toY(v, minV, maxV, svgH) }
  })
  return (
    <>
      {labels.map(({ v, y }, i) => (
        <g key={i}>
          <line x1={PAD.left} x2={SVG_W - PAD.right} y1={y} y2={y}
            stroke="rgba(255,255,255,0.07)" strokeDasharray="2 4" />
          <text x={PAD.left - 4} y={y} textAnchor="end" dominantBaseline="middle"
            fill="#9ca3af" fontSize={9}>
            {Math.round(v).toLocaleString()}
          </text>
        </g>
      ))}
    </>
  )
}

function XAxisLabels({ dates, total, svgH }) {
  if (!total) return null
  const count = Math.min(7, total)
  const indices = Array.from({ length: count }, (_, i) =>
    Math.round((i / Math.max(count - 1, 1)) * (total - 1))
  )
  const seen = new Set()
  return (
    <>
      {indices.map((idx) => {
        if (seen.has(idx)) return null
        seen.add(idx)
        const d = dates[idx]
        if (!d) return null
        const label = d.slice(5, 7) + "/" + d.slice(8, 10)
        return (
          <text key={idx} x={toX(idx, total)} y={svgH - PAD.bottom + 13}
            textAnchor="middle" fill="#6b7280" fontSize={8}>
            {label}
          </text>
        )
      })}
    </>
  )
}

function PanelLabel({ label }) {
  return (
    <text x={PAD.left - 4} y={PAD.top + 7} textAnchor="end" fill="#6b7280" fontSize={8}>
      {label}
    </text>
  )
}

function SignalBadge({ text, type }) {
  const colors = {
    bull:    "bg-red-900/60 text-red-300 border-red-700",
    bear:    "bg-blue-900/60 text-blue-300 border-blue-700",
    warn:    "bg-yellow-900/60 text-yellow-300 border-yellow-700",
    neutral: "bg-gray-800 text-gray-400 border-gray-600",
  }
  return (
    <span className={"text-[10px] px-2 py-0.5 rounded border " + (colors[type] ?? colors.neutral)}>
      {text}
    </span>
  )
}

function LegendLine({ color, dashed, label }) {
  return (
    <div className="flex items-center gap-1">
      <svg width={14} height={8} viewBox="0 0 14 8">
        <line x1={0} x2={14} y1={4} y2={4} stroke={color} strokeWidth={2}
          strokeDasharray={dashed ? "3 2" : undefined} />
      </svg>
      <span className="text-[10px] text-gray-400">{label}</span>
    </div>
  )
}

function SubTabBar({ activeTab, setActiveTab, macdPurchased, obvPurchased }) {
  const tabs = [
    { id: "volume", label: "거래량", locked: false },
    { id: "macd",   label: "MACD",   locked: !macdPurchased },
    { id: "obv",    label: "OBV",    locked: !obvPurchased },
  ]
  return (
    <div className="flex border-b border-gray-700 mt-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          disabled={tab.locked}
          onClick={() => setActiveTab(tab.id)}
          className={[
            "px-3 py-1.5 text-xs font-medium transition-colors duration-100",
            tab.locked ? "text-gray-600 cursor-not-allowed" : "cursor-pointer",
            !tab.locked && activeTab === tab.id
              ? "text-white border-b-2 border-blue-400 -mb-px"
              : !tab.locked ? "text-gray-400 hover:text-gray-200" : "",
          ].join(" ")}
        >
          {tab.label}{tab.locked ? " 🔒" : ""}
        </button>
      ))}
    </div>
  )
}
