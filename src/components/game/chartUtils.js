// 기술 지표 계산 유틸리티 — indicatorsPurchased 시 StockChart에서 사용

export function calcMA(closes, period) {
  return closes.map((_, i) => {
    if (i < period - 1) return null
    const slice = closes.slice(i - period + 1, i + 1)
    return slice.reduce((a, b) => a + b, 0) / period
  })
}

function calcEMA(closes, period) {
  const k = 2 / (period + 1)
  const result = new Array(closes.length).fill(null)
  if (closes.length < period) return result
  result[period - 1] = closes.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = period; i < closes.length; i++) {
    result[i] = closes[i] * k + result[i - 1] * (1 - k)
  }
  return result
}

export function calcBollinger(closes, period = 20) {
  const ma = calcMA(closes, period)
  return closes.map((_, i) => {
    if (ma[i] === null) return { upper: null, middle: null, lower: null }
    const slice = closes.slice(i - period + 1, i + 1)
    const variance = slice.reduce((sum, v) => sum + (v - ma[i]) ** 2, 0) / period
    const std = Math.sqrt(variance)
    return { upper: ma[i] + 2 * std, middle: ma[i], lower: ma[i] - 2 * std }
  })
}

export function calcMACD(closes) {
  const empty = { macd: null, signal: null, histogram: null }
  const result = closes.map(() => ({ ...empty }))
  const ema12 = calcEMA(closes, 12)
  const ema26 = calcEMA(closes, 26)
  const firstMacd = ema26.findIndex(v => v !== null)
  if (firstMacd === -1) return result
  for (let i = firstMacd; i < closes.length; i++) {
    result[i].macd = ema12[i] - ema26[i]
  }
  const macdSlice = result.slice(firstMacd).map(d => d.macd)
  const signalSlice = calcEMA(macdSlice, 9)
  signalSlice.forEach((sig, j) => {
    const gi = firstMacd + j
    result[gi].signal = sig
    if (result[gi].macd !== null && sig !== null) {
      result[gi].histogram = result[gi].macd - sig
    }
  })
  return result
}

export function calcOBV(ohlcv) {
  const result = []
  let obv = 0
  ohlcv.forEach((c, i) => {
    if (i > 0) {
      if (c.close > ohlcv[i - 1].close) obv += c.volume
      else if (c.close < ohlcv[i - 1].close) obv -= c.volume
    }
    result.push(obv)
  })
  return result
}
