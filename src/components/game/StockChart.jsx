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

// ─── 메인 컴포넌트 ───────────────────────────────────────────
// props: stockId(realTicker), stockName, maPurchased, bollingerPurchased, macdPurchased, obvPurchased
export default function StockChart({ stockId, stockName, maPurchased, bollingerPurchased, macdPurchased, obvPurchased }) {
  const [activeTab, setActiveTab] = useState("volume")
  const turn = useGameStore((s) => s.turn)

  const stockEntry = stockData.stocks.find((s) => s.realTicker === stockId)
  if (!stockEntry) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
        차트 데이터 없음
      </div>
    )
  }

  // pregame 전체 + 현재 턴까지의 게임 데이터
  const pregame   = stockEntry.pregame_prices ?? []
  const gamePrices = (stockEntry.prices ?? []).slice(0, turn)
  const allCandles = [...pregame, ...gamePrices]
  const total = allCandles.length

  const dates   = allCandles.map((c) => c.date  ?? "")
  const closes  = allCandles.map((c) => c.close)
  const opens   = allCandles.map((c) => c.open  ?? c.close)
  const highs   = allCandles.map((c) => c.high  ?? c.close)
  const lows    = allCandles.map((c) => c.low   ?? c.close)
  const volumes = allCandles.map((c) => c.volume ?? 0)

  const minV = Math.min(...lows)  * 0.995
  const maxV = Math.max(...highs) * 1.005
  const cw   = candleWidth(total)

  const CANDLE_H = 220
  const SUB_H    = 80

  // 지표 계산 (구매 시에만)
  const ma5  = maPurchased        ? calcMA(closes, 5)         : []
  const ma20 = maPurchased        ? calcMA(closes, 20)        : []
  const boll = bollingerPurchased ? calcBollinger(closes)     : { upper: [], lower: [], mid: [] }
  const macd = macdPurchased      ? calcMACD(closes)          : { macd: [], signal: [], hist: [] }
  const obv  = obvPurchased       ? calcOBV(closes, volumes)  : []

  const maSignal   = maPurchased        ? getMaSignal(ma5, ma20)           : null
  const bollSignal = bollingerPurchased ? getBollingerSignal(boll, closes) : null
  const macdSignal = macdPurchased      ? getMacdSignal(macd)              : null
  const obvSignal  = obvPurchased       ? getObvSignal(obv)                : null

  return (
    <div className="bg-gray-900 rounded-lg p-3 text-white w-full">
      {/* 헤더: 종목명 + 신호 배지 */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-sm font-bold text-gray-200">{stockName}</span>
        {maSignal   && <SignalBadge text={maSignal.text}   type={maSignal.type} />}
        {bollSignal && <SignalBadge text={bollSignal.text} type={bollSignal.type} />}
        {macdSignal && <SignalBadge text={macdSignal.text} type={macdSignal.type} />}
        {obvSignal  && <SignalBadge text={obvSignal.text}  type={obvSignal.type} />}
      </div>

      {/* 범례 */}
      {(maPurchased || bollingerPurchased) && (
        <div className="flex flex-wrap gap-3 mb-1">
          {maPurchased && (
            <>
              <LegendLine color="#f59e0b" label="MA5" />
              <LegendLine color="#60a5fa" label="MA20" />
            </>
          )}
          {bollingerPurchased && (
            <LegendLine color="#a78bfa" dashed label="볼린저밴드" />
          )}
        </div>
      )}

      {/* 메인 캔들 차트 */}
      <div className="overflow-x-auto">
        <svg width={SVG_W} height={CANDLE_H} style={{ display: "block" }}>
          <YAxis minV={minV} maxV={maxV} svgH={CANDLE_H} />
          <XAxisLabels dates={dates} total={total} svgH={CANDLE_H} />

          {/* pregame / 게임 구분선 */}
          {pregame.length > 0 && (
            <>
              <line
                x1={toX(pregame.length - 1, total)} x2={toX(pregame.length - 1, total)}
                y1={PAD.top} y2={CANDLE_H - PAD.bottom}
                stroke="rgba(234,179,8,0.4)" strokeDasharray="4 3" strokeWidth={1.5}
              />
              <text x={toX(pregame.length - 1, total) + 4} y={PAD.top + 10}
                fill="rgba(234,179,8,0.7)" fontSize={8}>게임 시작</text>
            </>
          )}

          {/* 캔들스틱 */}
          {allCandles.map((c, i) => {
            const isUp  = c.close >= (c.open ?? c.close)
            const color = isUp ? "#ef4444" : "#3b82f6"
            const x      = toX(i, total)
            const openY  = toY(c.open  ?? c.close, minV, maxV, CANDLE_H)
            const closeY = toY(c.close,             minV, maxV, CANDLE_H)
            const highY  = toY(c.high  ?? c.close,  minV, maxV, CANDLE_H)
            const lowY   = toY(c.low   ?? c.close,  minV, maxV, CANDLE_H)
            return (
              <g key={i}>
                <line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} strokeWidth={1} />
                <rect
                  x={x - cw / 2} y={Math.min(openY, closeY)}
                  width={cw} height={Math.max(Math.abs(closeY - openY), 1)}
                  fill={color}
                />
              </g>
            )
          })}

          {/* MA 라인 */}
          {maPurchased && ma5.length > 0 && (
            <polyline points={buildPolylinePoints(ma5, total, minV, maxV, CANDLE_H)}
              fill="none" stroke="#f59e0b" strokeWidth={1.2} />
          )}
          {maPurchased && ma20.length > 0 && (
            <polyline points={buildPolylinePoints(ma20, total, minV, maxV, CANDLE_H)}
              fill="none" stroke="#60a5fa" strokeWidth={1.2} />
          )}

          {/* 볼린저 밴드 */}
          {bollingerPurchased && boll.upper.length > 0 && (
            <>
              <polyline points={buildPolylinePoints(boll.upper, total, minV, maxV, CANDLE_H)}
                fill="none" stroke="#a78bfa" strokeWidth={1} strokeDasharray="3 2" />
              <polyline points={buildPolylinePoints(boll.lower, total, minV, maxV, CANDLE_H)}
                fill="none" stroke="#a78bfa" strokeWidth={1} strokeDasharray="3 2" />
            </>
          )}
        </svg>
      </div>

      {/* 서브패널 탭 + 차트 */}
      <SubTabBar activeTab={activeTab} setActiveTab={setActiveTab}
        macdPurchased={macdPurchased} obvPurchased={obvPurchased} />

      <svg width={SVG_W} height={SUB_H} style={{ display: "block" }}>
        {activeTab === "volume" && (() => {
          const maxVol = Math.max(...volumes, 1)
          return (
            <>
              <PanelLabel label="VOL" />
              {volumes.map((v, i) => {
                const barH  = (v / maxVol) * (SUB_H - PAD.top - PAD.bottom)
                const isUp  = allCandles[i]?.close >= (allCandles[i]?.open ?? allCandles[i]?.close)
                return (
                  <rect key={i}
                    x={toX(i, total) - cw / 2}
                    y={SUB_H - PAD.bottom - barH}
                    width={cw} height={Math.max(barH, 0)}
                    fill={isUp ? "rgba(239,68,68,0.5)" : "rgba(59,130,246,0.5)"}
                  />
                )
              })}
            </>
          )
        })()}

        {activeTab === "macd" && macdPurchased && (() => {
          const vals = [...macd.macd, ...macd.signal].filter((v) => v !== null)
          const minM = Math.min(...vals, 0)
          const maxM = Math.max(...vals, 0.001)
          return (
            <>
              <PanelLabel label="MACD" />
              <polyline points={buildPolylinePoints(macd.macd,   total, minM, maxM, SUB_H)}
                fill="none" stroke="#f59e0b" strokeWidth={1.2} />
              <polyline points={buildPolylinePoints(macd.signal, total, minM, maxM, SUB_H)}
                fill="none" stroke="#60a5fa" strokeWidth={1} />
            </>
          )
        })()}

        {activeTab === "obv" && obvPurchased && obv.length > 0 && (() => {
          const minO = Math.min(...obv)
          const maxO = Math.max(...obv, minO + 1)
          return (
            <>
              <PanelLabel label="OBV" />
              <polyline points={buildPolylinePoints(obv, total, minO, maxO, SUB_H)}
                fill="none" stroke="#34d399" strokeWidth={1.2} />
            </>
          )
        })()}
      </svg>
    </div>
  )
}
