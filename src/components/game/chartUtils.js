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

// ─── 지표 신호 감지 ────────────────────────────────────────────────────────

export function getMaSignal(ma5, ma20) {
  const last = ma5.length - 1
  const prev = last - 1
  if (last < 1 || ma5[last] === null || ma20[last] === null) return null
  const trend = ma5[last] > ma20[last] ? 'bull' : 'bear'
  let crossSignal = null
  if (ma5[prev] !== null && ma20[prev] !== null) {
    if (ma5[prev] <= ma20[prev] && ma5[last] > ma20[last]) crossSignal = '골든크로스 — 단기 강세 전환'
    else if (ma5[prev] >= ma20[prev] && ma5[last] < ma20[last]) crossSignal = '데드크로스 — 단기 약세 전환'
  }
  return { ma5: ma5[last], ma20: ma20[last], trend, crossSignal }
}

export function getBollingerSignal(bollinger, closes) {
  const last = bollinger.length - 1
  const bl = bollinger[last]
  if (!bl || bl.upper === null) return null
  const price = closes[last]
  const pctB = (price - bl.lower) / (bl.upper - bl.lower)
  let bandSignal = null
  if (pctB > 0.9) bandSignal = '상단밴드 근접 — 과매수 주의'
  else if (pctB < 0.1) bandSignal = '하단밴드 근접 — 과매도 구간'
  return { upper: bl.upper, middle: bl.middle, lower: bl.lower, pctB, bandSignal }
}

export function getMacdSignal(macdData) {
  const last = macdData.length - 1
  const prev = last - 1
  const md = macdData[last]
  const mpd = macdData[prev] ?? {}
  if (!md || md.macd === null || md.signal === null) return null
  const trend = md.macd > md.signal ? 'bull' : 'bear'
  let crossSignal = null
  if (mpd.macd !== null && mpd.signal !== null) {
    if (mpd.macd <= mpd.signal && md.macd > md.signal) crossSignal = 'MACD 골든크로스 — 상승 모멘텀'
    else if (mpd.macd >= mpd.signal && md.macd < md.signal) crossSignal = 'MACD 데드크로스 — 하락 모멘텀'
  }
  return { macd: md.macd, signal: md.signal, histogram: md.histogram, trend, crossSignal }
}

export function getObvSignal(obvData) {
  const n = obvData.length
  if (n < 3) return null
  const recent = obvData.slice(-5)
  const rising = recent[recent.length - 1] > recent[0]
  return {
    trend: rising ? 'bull' : 'bear',
    trendLabel: rising ? 'OBV 상승 — 매집 신호' : 'OBV 하락 — 분산 신호',
  }
}
