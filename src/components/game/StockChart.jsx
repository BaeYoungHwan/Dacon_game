// 종목별 주봉 캔들스틱 차트 - MarketPage 종목분석 팝업에서 사용
// indicatorsPurchased 시 MA5, MA20, 볼린저, MACD, OBV 추가

import stockData from "../../data/stockData.json"
import { useGameStore } from "../../store/gameStore"
import { calcMA, calcBollinger, calcMACD, calcOBV } from "./chartUtils"

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
          <line
            x1={PAD.left} x2={SVG_W - PAD.right} y1={y} y2={y}
            stroke="rgba(255,255,255,0.07)" strokeDasharray="2 4"
          />
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

export default function StockChart({ stockId, stockName, maPurchased, bollingerPurchased, macdPurchased, obvPurchased }) {
  const { turn } = useGameStore()
  const entry = stockData.stocks.find(s => s.realTicker === stockId)
  const ohlcv = entry?.prices.slice(0, turn) ?? []
  const dates = stockData.meta.dates.slice(0, turn)
  const total = ohlcv.length

  if (total === 0) {
    return <p className="text-gray-400 text-center py-8 text-sm">차트 데이터 없음</p>
  }

  const closes = ohlcv.map(c => c.close)
  const cw = candleWidth(total)

  const allPrices = ohlcv.flatMap(c => [c.open, c.high, c.low, c.close])
  const rawMin = Math.min(...allPrices)
  const rawMax = Math.max(...allPrices)
  const margin = (rawMax - rawMin) * 0.05 || rawMax * 0.02
  const priceMin = rawMin - margin
  const priceMax = rawMax + margin
  const PRICE_H = 280

  const maxVol = Math.max(...ohlcv.map(c => c.volume))
  const VOL_H = 90

  const ma5 = maPurchased ? calcMA(closes, 5) : []
  const ma20 = maPurchased ? calcMA(closes, 20) : []
  const bollinger = bollingerPurchased ? calcBollinger(closes, 20) : []
  const macdData = macdPurchased ? calcMACD(closes) : []
  const obvData = obvPurchased ? calcOBV(ohlcv) : []

  const allMacdVals = macdData.flatMap(d => [d.macd, d.signal, d.histogram]).filter(v => v !== null)
  const macdMin = allMacdVals.length ? Math.min(...allMacdVals) : -1
  const macdMax = allMacdVals.length ? Math.max(...allMacdVals) : 1
  const MACD_H = 80

  const obvMin = obvData.length ? Math.min(...obvData) : 0
  const obvMax = obvData.length ? Math.max(...obvData) : 1
  const OBV_H = 70

  const upperPts = bollinger
    .map((b, i) => b.upper !== null ? toX(i, total) + "," + toY(b.upper, priceMin, priceMax, PRICE_H) : null)
    .filter(Boolean)
  const lowerPtsRev = bollinger
    .map((b, i) => b.lower !== null ? toX(i, total) + "," + toY(b.lower, priceMin, priceMax, PRICE_H) : null)
    .filter(Boolean).reverse()
  const bollingerFill = upperPts.length
    ? "M " + upperPts.join(" L ") + " L " + lowerPtsRev.join(" L ") + " Z"
    : ""

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1 px-1">
        <span>{dates[0] ?? ""} ~ {dates[total - 1] ?? ""}</span>
        <span>{total}주봉</span>
      </div>

      <svg width="100%" height={PRICE_H} viewBox={"0 0 " + SVG_W + " " + PRICE_H} className="block">
        <YAxis minV={priceMin} maxV={priceMax} svgH={PRICE_H} />
        <XAxisLabels dates={dates} total={total} svgH={PRICE_H} />

        {bollingerPurchased && bollingerFill && (
          <>
            <path d={bollingerFill} fill="rgba(168,85,247,0.1)" />
            <polyline points={upperPts.join(" ")} fill="none" stroke="#a855f7" strokeWidth={1} strokeDasharray="4 2" opacity={0.7} />
            <polyline points={lowerPtsRev.slice().reverse().join(" ")} fill="none" stroke="#a855f7" strokeWidth={1} strokeDasharray="4 2" opacity={0.7} />
          </>
        )}

        {ohlcv.map((c, i) => {
          const x = toX(i, total)
          const isRise = c.close >= c.open
          const color = isRise ? "#ef4444" : "#3b82f6"
          const bodyTop = toY(Math.max(c.open, c.close), priceMin, priceMax, PRICE_H)
          const bodyBot = toY(Math.min(c.open, c.close), priceMin, priceMax, PRICE_H)
          return (
            <g key={i}>
              <line x1={x} x2={x}
                y1={toY(c.high, priceMin, priceMax, PRICE_H)}
                y2={toY(c.low, priceMin, priceMax, PRICE_H)}
                stroke={color} strokeWidth={1} />
              <rect x={x - cw / 2} y={bodyTop} width={cw} height={Math.max(1, bodyBot - bodyTop)} fill={color} />
            </g>
          )
        })}

        {maPurchased && (
          <polyline points={buildPolylinePoints(ma5, total, priceMin, priceMax, PRICE_H)} fill="none" stroke="#f59e0b" strokeWidth={1.5} opacity={0.9} />
        )}
        {maPurchased && (
          <polyline points={buildPolylinePoints(ma20, total, priceMin, priceMax, PRICE_H)} fill="none" stroke="#a855f7" strokeWidth={1.5} opacity={0.9} />
        )}
      </svg>

      <svg width="100%" height={VOL_H} viewBox={"0 0 " + SVG_W + " " + VOL_H} className="block">
        <PanelLabel label="거래량" />
        {ohlcv.map((c, i) => {
          const x = toX(i, total)
          const isRise = c.close >= c.open
          const barH = maxVol > 0 ? (c.volume / maxVol) * (VOL_H - PAD.top - PAD.bottom) : 0
          return (
            <rect key={i}
              x={x - cw / 2} y={VOL_H - PAD.bottom - barH}
              width={cw} height={barH}
              fill={isRise ? "#ef4444" : "#3b82f6"} opacity={0.7}
            />
          )
        })}
      </svg>

      {macdPurchased && (
        <svg width="100%" height={MACD_H} viewBox={"0 0 " + SVG_W + " " + MACD_H} className="block">
          <PanelLabel label="MACD" />
          <line x1={PAD.left} x2={SVG_W - PAD.right}
            y1={toY(0, macdMin, macdMax, MACD_H)} y2={toY(0, macdMin, macdMax, MACD_H)}
            stroke="#4b5563" strokeWidth={1} strokeDasharray="3 3" />
          {macdData.map((d, i) => {
            if (d.histogram === null) return null
            const x = toX(i, total)
            const zeroY = toY(0, macdMin, macdMax, MACD_H)
            const valY = toY(d.histogram, macdMin, macdMax, MACD_H)
            return (
              <rect key={i}
                x={x - cw / 2} y={Math.min(valY, zeroY)}
                width={cw} height={Math.abs(valY - zeroY)}
                fill={d.histogram >= 0 ? "#ef4444" : "#3b82f6"} opacity={0.6} />
            )
          })}
          <polyline points={buildPolylinePoints(macdData.map(d => d.macd), total, macdMin, macdMax, MACD_H)} fill="none" stroke="#38bdf8" strokeWidth={1.5} />
          <polyline points={buildPolylinePoints(macdData.map(d => d.signal), total, macdMin, macdMax, MACD_H)} fill="none" stroke="#fb923c" strokeWidth={1.5} />
        </svg>
      )}

      {obvPurchased && (
        <svg width="100%" height={OBV_H} viewBox={"0 0 " + SVG_W + " " + OBV_H} className="block">
          <PanelLabel label="OBV" />
          <polyline points={buildPolylinePoints(obvData, total, obvMin, obvMax, OBV_H)} fill="none" stroke="#4ade80" strokeWidth={1.5} />
        </svg>
      )}

      {(maPurchased || bollingerPurchased || macdPurchased || obvPurchased) && (
        <div className="flex gap-4 flex-wrap px-1 pt-1">
          {maPurchased && ["MA5-#f59e0b", "MA20-#a855f7"].map(item => {
            const [label, color] = item.split("-")
            return (
              <div key={label} className="flex items-center gap-1.5">
                <svg width={16} height={10} viewBox="0 0 16 10">
                  <line x1={0} x2={16} y1={5} y2={5} stroke={color} strokeWidth={2} />
                </svg>
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            )
          })}
          {bollingerPurchased && (
            <div className="flex items-center gap-1.5">
              <svg width={16} height={10} viewBox="0 0 16 10">
                <line x1={0} x2={16} y1={5} y2={5} stroke="#a855f7" strokeWidth={2} strokeDasharray="3 2" />
              </svg>
              <span className="text-xs text-gray-400">볼린저</span>
            </div>
          )}
          {macdPurchased && ["MACD-#38bdf8", "시그널-#fb923c"].map(item => {
            const [label, color] = item.split("-")
            return (
              <div key={label} className="flex items-center gap-1.5">
                <svg width={16} height={10} viewBox="0 0 16 10">
                  <line x1={0} x2={16} y1={5} y2={5} stroke={color} strokeWidth={2} />
                </svg>
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            )
          })}
          {obvPurchased && (
            <div className="flex items-center gap-1.5">
              <svg width={16} height={10} viewBox="0 0 16 10">
                <line x1={0} x2={16} y1={5} y2={5} stroke="#4ade80" strokeWidth={2} />
              </svg>
              <span className="text-xs text-gray-400">OBV</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
