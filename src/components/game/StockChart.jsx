// 종목별 주봉 캔들스틱 차트 - 세로 스택 멀티 패널 (메인 차트 + MACD + OBV)
// 각 지표 패널은 항상 노출되며 미구매 시 잠금 상태(LockedHint) 표시

import { useMemo } from "react"
import stockData from "../../data/stockData.json"
import { useGameStore } from "../../store/gameStore"
import { calcMA, calcBollinger, calcMACD, calcOBV } from "./chartUtils"

const SVG_W = 700
const PAD = { top: 10, right: 10, bottom: 22, left: 60 }
// 첫/마지막 캔들이 Y축 라벨·우측 경계를 침범하지 않도록 양 끝에 두는 내부 여백
// 좌측 여백을 우측보다 더 크게 확보해 첫 막대가 Y축 라벨과 겹치지 않도록 함
const EDGE = 11

function toX(i, total) {
  const drawW = SVG_W - PAD.left - PAD.right - 2 * EDGE
  if (total <= 1) return PAD.left + EDGE + drawW / 2
  return PAD.left + EDGE + (i / (total - 1)) * drawW
}

function toY(val, minV, maxV, svgH) {
  const drawH = svgH - PAD.top - PAD.bottom
  if (maxV === minV) return PAD.top + drawH / 2
  return PAD.top + (1 - (val - minV) / (maxV - minV)) * drawH
}

function candleWidth(total) {
  const drawW = SVG_W - PAD.left - PAD.right - 2 * EDGE
  return Math.max(2, (drawW / Math.max(total, 1)) * 0.6)
}

function buildPolylinePoints(values, total, minV, maxV, svgH) {
  return values
    .map((v, i) => (v === null || v === undefined ? null : toX(i, total) + "," + toY(v, minV, maxV, svgH)))
    .filter(Boolean)
    .join(" ")
}

// 거래소 디지털 보드 톤 — 시안 그리드선·시안 축 라벨·모노스페이스 숫자로 통일
const AXIS_FONT = "ui-monospace, SFMono-Regular, Menlo, monospace"

// 차트 데이터(캔들·라인·막대)에 적용할 네온 글로우 SVG 필터
// 각 SVG에 동일 ID로 정의 — 필터 ID는 SVG 단위로 스코프
function NeonGlowDefs({ id = 'neonGlow', stdDeviation = 1.6 }) {
  return (
    <defs>
      <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation={stdDeviation} result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  )
}

// 캔들 색상 — 이미지 톤(녹=상승, 적=하락)에 맞춤
const CANDLE_UP   = '#22c55e' // green-500
const CANDLE_DOWN = '#ef4444' // red-500

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
            stroke="rgba(34,211,238,0.22)" strokeDasharray="2 4" />
          <text x={PAD.left - 4} y={y} textAnchor="end" dominantBaseline="middle"
            fill="#a5f3fc" fontSize={9} fontFamily={AXIS_FONT}>
            {Math.round(v).toLocaleString()}
          </text>
        </g>
      ))}
    </>
  )
}

// 큰 숫자 단축 표기 — OBV 같은 누적 거래량용 (1.2B / 600M / 12K)
function formatCompactNumber(v) {
  const abs = Math.abs(v)
  if (abs >= 1e9) return (v / 1e9).toFixed(1) + 'B'
  if (abs >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (abs >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return Math.round(v).toString()
}

// 서브 패널용 Y축 — 단계 적게, 포매터 커스터마이즈 가능, 라벨 추가 여백(extraGap) 지원
function SubYAxis({ minV, maxV, svgH, formatter, steps = 3, extraGap = 0 }) {
  const labels = Array.from({ length: steps }, (_, i) => {
    const frac = i / (steps - 1)
    const v = minV + (maxV - minV) * frac
    return { v, y: toY(v, minV, maxV, svgH) }
  })
  const fmt = formatter ?? ((v) => Math.round(v).toLocaleString())
  return (
    <>
      {labels.map(({ v, y }, i) => (
        <g key={i}>
          <line x1={PAD.left} x2={SVG_W - PAD.right} y1={y} y2={y}
            stroke="rgba(34,211,238,0.15)" strokeDasharray="2 4" />
          <text x={PAD.left - 4 - extraGap} y={y} textAnchor="end" dominantBaseline="middle"
            fill="#a5f3fc" fontSize={11} fontFamily={AXIS_FONT}>
            {fmt(v)}
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
            textAnchor="middle" fill="#a5f3fc" fontSize={8} fontFamily={AXIS_FONT}>
            {label}
          </text>
        )
      })}
    </>
  )
}

function LegendLine({ color, dashed, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <svg width={16} height={8} viewBox="0 0 16 8">
        <line x1={0} x2={16} y1={4} y2={4} stroke={color} strokeWidth={2}
          strokeDasharray={dashed ? "3 2" : undefined} />
      </svg>
      <span className="text-xs text-cyan-300/80 font-mono tracking-wider">{label}</span>
    </div>
  )
}

// 패널 프레임 — 각 차트 섹션을 감싸는 네온 보더 + 좌상단 라벨 칩
const TONE = {
  violet: {
    border: 'border-violet-500/40',
    shadow: 'shadow-[inset_0_0_25px_rgba(139,92,246,0.08)]',
    label: 'text-violet-100 border-violet-400/70 bg-violet-500/15',
    glow: 'drop-shadow-[0_0_6px_rgba(139,92,246,0.7)]',
  },
  emerald: {
    border: 'border-emerald-500/40',
    shadow: 'shadow-[inset_0_0_25px_rgba(52,211,153,0.08)]',
    label: 'text-emerald-100 border-emerald-400/70 bg-emerald-500/15',
    glow: 'drop-shadow-[0_0_6px_rgba(52,211,153,0.7)]',
  },
  cyan: {
    border: 'border-cyan-500/40',
    shadow: 'shadow-[inset_0_0_25px_rgba(34,211,238,0.08)]',
    label: 'text-cyan-100 border-cyan-400/70 bg-cyan-500/15',
    glow: 'drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]',
  },
}

function PanelFrame({ label, tone = 'cyan', locked, children }) {
  const t = TONE[tone] ?? TONE.cyan
  return (
    <div className={`relative rounded-lg border ${t.border} ${t.shadow} bg-slate-950/60 px-3 pt-5 pb-3`}>
      <div className={`absolute -top-2.5 left-3 px-2.5 py-0.5 rounded border ${t.label} text-xs font-mono font-bold tracking-wider ${t.glow}`}>
        {label}{locked && ' 🔒'}
      </div>
      {children}
    </div>
  )
}

// 잠금 상태 표시 — 미구매 지표 패널에서
function LockedHint() {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-1 text-cyan-300/40">
      <span className="text-2xl">🔒</span>
      <span className="text-xs font-mono tracking-wider">기술상에서 구매 후 사용 가능</span>
    </div>
  )
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────
// props: stockId(realTicker), maPurchased, bollingerPurchased, macdPurchased, obvPurchased
const CANDLE_H = 220
const SUB_H    = 80

export default function StockChart({ stockId, maPurchased, bollingerPurchased, macdPurchased, obvPurchased }) {
  const turn = useGameStore((s) => s.turn)

  const stockEntry = stockData.stocks.find((s) => s.realTicker === stockId)

  // 캔들·지표·Y축 스케일 — 종목/턴/구매 상태가 변할 때만 재계산
  // (종목 전환·매수·매도마다 차트 전체가 재렌더되므로 메모이즈 효과 큼)
  const chartData = useMemo(() => {
    if (!stockEntry) return null

    // KODEX 200 ETF — KospiChart와 동일한 kospi_closes 데이터를 ETF 시작가 기준으로 스케일링
    let pregame, gamePrices
    if (stockEntry.id === 'stock_etf') {
      const pregameKospi = stockData.pregame_kospi_closes ?? []
      const gameKospi    = (stockData.kospi_closes ?? []).slice(0, turn)
      const baseKospi    = pregameKospi[0] || 1
      const baseEtf      = stockEntry.pregame_prices[0]?.close || 36000
      const scale        = baseEtf / baseKospi
      const etfPre       = stockEntry.pregame_prices ?? []
      const etfGame      = stockEntry.prices ?? []

      const toCandle = (k, prevK, vol, date) => {
        const c = Math.round(k * scale)
        const o = Math.round((prevK ?? k) * scale)
        return { open: o, high: Math.round(Math.max(o, c) * 1.003), low: Math.round(Math.min(o, c) * 0.997), close: c, volume: vol ?? 0, date: date ?? '' }
      }

      pregame    = pregameKospi.map((k, i) =>
        toCandle(k, pregameKospi[i - 1], etfPre[i]?.volume, stockData.meta.pregame_dates?.[i])
      )
      gamePrices = gameKospi.map((k, i) =>
        toCandle(k, i === 0 ? pregameKospi[pregameKospi.length - 1] : gameKospi[i - 1], etfGame[i]?.volume, stockData.meta.dates?.[i])
      )
    } else {
      pregame    = stockEntry.pregame_prices ?? []
      gamePrices = (stockEntry.prices ?? []).slice(0, turn)
    }

    const allCandles = [...pregame, ...gamePrices]
    const total = allCandles.length

    const dates   = allCandles.map((c) => c.date  ?? "")
    const closes  = allCandles.map((c) => c.close)
    const highs   = allCandles.map((c) => c.high  ?? c.close)
    const lows    = allCandles.map((c) => c.low   ?? c.close)
    const volumes = allCandles.map((c) => c.volume ?? 0)

    const cw   = candleWidth(total)
    const maxVol = Math.max(...volumes, 1)

    // 지표 계산 (구매 시에만)
    const ma5  = maPurchased        ? calcMA(closes, 5)        : []
    const ma20 = maPurchased        ? calcMA(closes, 20)       : []
    // calcBollinger는 [{upper, middle, lower}, ...] 객체 배열 반환 — polyline용으로 분리
    const bollArr   = bollingerPurchased ? calcBollinger(closes) : []
    const bollUpper = bollArr.map((b) => (b ? b.upper : null))
    const bollLower = bollArr.map((b) => (b ? b.lower : null))

    // Y축 스케일 — 캔들 + 볼린저 모두 포함해서 라인이 잘리지 않게
    const bollUpperVals = bollUpper.filter((v) => v !== null && v !== undefined)
    const bollLowerVals = bollLower.filter((v) => v !== null && v !== undefined)
    const minV = Math.min(...lows, ...bollLowerVals) * 0.995
    const maxV = Math.max(...highs, ...bollUpperVals) * 1.005

    // calcMACD는 [{macd, signal, histogram}, ...] 객체 배열 반환 — 분리
    const macdArr    = macdPurchased ? calcMACD(closes) : []
    const macdLine   = macdArr.map((m) => (m ? m.macd : null))
    const signalLine = macdArr.map((m) => (m ? m.signal : null))
    const histLine   = macdArr.map((m) => (m ? m.histogram : null))
    // calcOBV는 ohlcv 객체 배열(close, volume 포함)을 받음
    const obv = obvPurchased ? calcOBV(allCandles) : []

    return {
      pregame, allCandles, total, dates, volumes,
      cw, maxVol, minV, maxV,
      ma5, ma20, bollUpper, bollLower,
      macdLine, signalLine, histLine, obv,
    }
  }, [stockEntry, turn, maPurchased, bollingerPurchased, macdPurchased, obvPurchased])

  if (!stockEntry || !chartData) {
    return (
      <div className="flex items-center justify-center h-40 text-cyan-300/40 text-sm font-mono tracking-wider">
        차트 데이터 없음
      </div>
    )
  }

  const {
    pregame, allCandles, total, dates, volumes,
    cw, maxVol, minV, maxV,
    ma5, ma20, bollUpper, bollLower,
    macdLine, signalLine, histLine, obv,
  } = chartData

  return (
    <div className="space-y-5 w-full text-white">
      {/* === 메인 차트 패널 — 캔들 + 거래량 === */}
      <PanelFrame label="메인 차트" tone="violet">
        {/* 범례 (MA / 볼린저) */}
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
        {/* 캔들 SVG — 네온 글로우 + 고가/저가/현재가 마커 */}
        <div className="w-full" style={{ aspectRatio: `${SVG_W} / ${CANDLE_H}` }}>
          <svg
            viewBox={`0 0 ${SVG_W} ${CANDLE_H}`}
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            style={{ display: "block" }}
          >
            <NeonGlowDefs id="candleGlow" stdDeviation={1.5} />
            <YAxis minV={minV} maxV={maxV} svgH={CANDLE_H} />
            <XAxisLabels dates={dates} total={total} svgH={CANDLE_H} />
            {pregame.length > 0 && (
              <line
                x1={toX(pregame.length - 1, total)} x2={toX(pregame.length - 1, total)}
                y1={PAD.top} y2={CANDLE_H - PAD.bottom}
                stroke="rgba(234,179,8,0.4)" strokeDasharray="4 3" strokeWidth={1.5}
              />
            )}
            {/* 캔들 + MA + 볼린저 — 글로우 그룹 */}
            <g filter="url(#candleGlow)">
              {allCandles.map((c, i) => {
                const isUp  = c.close >= (c.open ?? c.close)
                const color = isUp ? CANDLE_UP : CANDLE_DOWN
                const x      = toX(i, total)
                const openY  = toY(c.open  ?? c.close, minV, maxV, CANDLE_H)
                const closeY = toY(c.close,             minV, maxV, CANDLE_H)
                const highY  = toY(c.high  ?? c.close,  minV, maxV, CANDLE_H)
                const lowY   = toY(c.low   ?? c.close,  minV, maxV, CANDLE_H)
                return (
                  <g key={i}>
                    <line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} strokeWidth={1.3} />
                    <rect
                      x={x - cw / 2} y={Math.min(openY, closeY)}
                      width={cw} height={Math.max(Math.abs(closeY - openY), 1)}
                      fill={color}
                    />
                  </g>
                )
              })}
              {maPurchased && ma5.length > 0 && (
                <polyline points={buildPolylinePoints(ma5, total, minV, maxV, CANDLE_H)}
                  fill="none" stroke="#f59e0b" strokeWidth={1.2} strokeOpacity={0.9} />
              )}
              {maPurchased && ma20.length > 0 && (
                <polyline points={buildPolylinePoints(ma20, total, minV, maxV, CANDLE_H)}
                  fill="none" stroke="#60a5fa" strokeWidth={1.2} strokeOpacity={0.9} />
              )}
              {bollingerPurchased && bollUpper.length > 0 && (
                <>
                  <polyline points={buildPolylinePoints(bollUpper, total, minV, maxV, CANDLE_H)}
                    fill="none" stroke="#a78bfa" strokeWidth={1} strokeDasharray="3 2" strokeOpacity={0.85} />
                  <polyline points={buildPolylinePoints(bollLower, total, minV, maxV, CANDLE_H)}
                    fill="none" stroke="#a78bfa" strokeWidth={1} strokeDasharray="3 2" strokeOpacity={0.85} />
                </>
              )}
            </g>
          </svg>
        </div>
        {/* 거래량 라벨 + 막대 (캔들 색상 동기) */}
        <p className="text-sm text-violet-300/80 font-mono tracking-wider mt-2 ml-1 font-bold">거래량</p>
        <div className="w-full" style={{ aspectRatio: `${SVG_W} / ${SUB_H}` }}>
          <svg
            viewBox={`0 0 ${SVG_W} ${SUB_H}`}
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            style={{ display: "block" }}
          >
            <NeonGlowDefs id="volGlow" stdDeviation={1.2} />
            {/* Y축 — 0부터 최대 거래량까지, 단축 표기 */}
            <SubYAxis minV={0} maxV={maxVol} svgH={SUB_H} steps={3}
              formatter={formatCompactNumber} />
            {/* X축 — 날짜 라벨 */}
            <XAxisLabels dates={dates} total={total} svgH={SUB_H} />
            <g filter="url(#volGlow)">
              {volumes.map((v, i) => {
                const barH  = (v / maxVol) * (SUB_H - PAD.top - PAD.bottom)
                const isUp  = allCandles[i]?.close >= (allCandles[i]?.open ?? allCandles[i]?.close)
                return (
                  <rect key={i}
                    x={toX(i, total) - cw / 2}
                    y={SUB_H - PAD.bottom - barH}
                    width={cw} height={Math.max(barH, 0)}
                    fill={isUp ? CANDLE_UP : CANDLE_DOWN}
                    fillOpacity={0.7}
                  />
                )
              })}
            </g>
          </svg>
        </div>
      </PanelFrame>

      {/* === 머니 플로우 (OBV) — 강한 시안 글로우 === */}
      <PanelFrame label="머니 플로우 (OBV)" tone="emerald" locked={!obvPurchased}>
        {obvPurchased && obv.length > 0 ? (() => {
          // 데이터 범위 — 0 강제 포함하지 않음 (값이 한 방향이어도 패널을 잘 활용)
          const minO = Math.min(...obv)
          const maxO = Math.max(...obv)
          const range = maxO - minO
          // 평평한 데이터(전부 동일) 방어
          const safeMin = range === 0 ? minO - 1 : minO
          const safeMax = range === 0 ? maxO + 1 : maxO
          return (
            <div className="w-full" style={{ aspectRatio: `${SVG_W} / ${SUB_H}` }}>
              <svg
                viewBox={`0 0 ${SVG_W} ${SUB_H}`}
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                style={{ display: "block" }}
              >
                <NeonGlowDefs id="obvGlow" stdDeviation={1.4} />
                {/* Y축 — 큰 숫자 단축 표기 (1.2B / 600M / 0) */}
                <SubYAxis minV={safeMin} maxV={safeMax} svgH={SUB_H} steps={3}
                  formatter={formatCompactNumber} />
                {/* X축 — 날짜 라벨 */}
                <XAxisLabels dates={dates} total={total} svgH={SUB_H} />
                <g filter="url(#obvGlow)">
                  <polyline points={buildPolylinePoints(obv, total, safeMin, safeMax, SUB_H)}
                    fill="none" stroke="#22d3ee" strokeWidth={2.8}
                    strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </svg>
            </div>
          )
        })() : <LockedHint />}
      </PanelFrame>

      {/* === 모멘텀 펄스 (MACD) — 유효 히스토그램만 X축 전 폭으로 펼침 === */}
      <PanelFrame label="모멘텀 펄스 (MACD)" tone="violet" locked={!macdPurchased}>
        {macdPurchased ? (() => {
          // MACD 워밍업(35주) 이전엔 null이라 그대로 두면 우측에 쏠림 — 유효 인덱스만 추출해 X축 재구성
          const validHist = histLine
            .map((h, i) => ({ h, originalIdx: i }))
            .filter(({ h }) => h !== null && h !== undefined)
          if (validHist.length === 0) {
            return (
              <div className="flex items-center justify-center py-6 text-cyan-300/40 text-xs font-mono tracking-wider">
                MACD 데이터 준비 중... (35주 이상 필요)
              </div>
            )
          }
          const histVals = validHist.map(({ h }) => h)
          const absMax = Math.max(...histVals.map(Math.abs), 0.001)
          const minM = -absMax
          const maxM = absMax
          const zeroY = toY(0, minM, maxM, SUB_H)
          const macdTotal = validHist.length
          const macdDates = validHist.map(({ originalIdx }) => dates[originalIdx])
          // 라인 포인트 — 유효 히스토그램 값을 단일 폴리라인으로 연결
          const linePoints = validHist
            .map(({ h }, newIdx) => `${toX(newIdx, macdTotal)},${toY(h, minM, maxM, SUB_H)}`)
            .join(' ')
          // 0선 기준으로 위(상승 빨강)·아래(하락 파랑) 영역을 분리해 두 색을 한 라인에 표현
          const aboveClipId = 'macdAboveClip'
          const belowClipId = 'macdBelowClip'
          return (
            <div className="w-full" style={{ aspectRatio: `${SVG_W} / ${SUB_H}` }}>
              <svg
                viewBox={`0 0 ${SVG_W} ${SUB_H}`}
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                style={{ display: "block" }}
              >
                <NeonGlowDefs id="macdGlow" stdDeviation={1} />
                <defs>
                  {/* 0선 위 영역만 노출 → 빨강 라인용 */}
                  <clipPath id={aboveClipId}>
                    <rect x={0} y={0} width={SVG_W} height={zeroY} />
                  </clipPath>
                  {/* 0선 아래 영역만 노출 → 파랑 라인용 */}
                  <clipPath id={belowClipId}>
                    <rect x={0} y={zeroY} width={SVG_W} height={SUB_H - zeroY} />
                  </clipPath>
                </defs>
                <SubYAxis minV={minM} maxV={maxM} svgH={SUB_H} steps={3}
                  formatter={(v) => v.toFixed(2)} extraGap={4} />
                <XAxisLabels dates={macdDates} total={macdTotal} svgH={SUB_H} />
                {/* 0 기준선 */}
                <line x1={PAD.left} x2={SVG_W - PAD.right} y1={zeroY} y2={zeroY}
                  stroke="rgba(34,211,238,0.4)" strokeDasharray="3 3" strokeWidth={1} />
                {/* 히스토그램 라인 — 한국 증시 컨벤션: 0선 위(양수) 빨강, 아래(음수) 파랑 */}
                <g filter="url(#macdGlow)">
                  <polyline points={linePoints} fill="none" stroke="#ef4444"
                    strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
                    clipPath={`url(#${aboveClipId})`} />
                  <polyline points={linePoints} fill="none" stroke="#3b82f6"
                    strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
                    clipPath={`url(#${belowClipId})`} />
                </g>
              </svg>
            </div>
          )
        })() : <LockedHint />}
      </PanelFrame>
    </div>
  )
}
