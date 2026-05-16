// 기술 지표 계산 유틸리티 — indicatorsPurchased 시 StockChart에서 사용

import stockData from '../../data/stockData.json'

// 종목의 최근 N주 종가 추출 — pregame + 현재 턴까지의 게임 데이터를 합쳐 마지막 N개
// 스파크라인·전주대비 계산용 (사이드바 / BulkBuyPanel / BulkSellPanel 공통 사용)
export function getRecentCloses(stockId, turn, n = 8) {
  const stockEntry = stockData.stocks.find((s) => s.realTicker === stockId)
  if (!stockEntry) return []
  const pregame = stockEntry.pregame_prices ?? []
  const gamePrices = (stockEntry.prices ?? []).slice(0, turn)
  return [...pregame, ...gamePrices].slice(-n).map((c) => c.close)
}

// 이동 평균 — 표준은 period-1 인덱스까지 null이지만, pregame 데이터가 짧은 우리 게임에선
// 차트 좌측이 비어 보임. 워밍업 동안엔 사용 가능한 만큼만 평균내는 "확장 평균(expanding MA)"
// 방식으로 변경 → 인덱스 0부터 값이 채워져 라인이 전 폭에 그려짐
export function calcMA(closes, period) {
  return closes.map((_, i) => {
    const start = Math.max(0, i - period + 1)
    const slice = closes.slice(start, i + 1)
    if (slice.length === 0) return null
    return slice.reduce((a, b) => a + b, 0) / slice.length
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

// 볼린저밴드 — calcMA의 확장 방식과 동기. 표본이 1개일 땐 std=0이라 band 폭이 0
// (좌측 끝에서 시작해 데이터가 쌓이며 자연스럽게 벌어짐 — funnel 형태)
export function calcBollinger(closes, period = 20) {
  const ma = calcMA(closes, period)
  return closes.map((_, i) => {
    if (ma[i] === null) return { upper: null, middle: null, lower: null }
    const start = Math.max(0, i - period + 1)
    const slice = closes.slice(start, i + 1)
    if (slice.length < 2) return { upper: ma[i], middle: ma[i], lower: ma[i] }
    const variance = slice.reduce((sum, v) => sum + (v - ma[i]) ** 2, 0) / slice.length
    const std = Math.sqrt(variance)
    return { upper: ma[i] + 2 * std, middle: ma[i], lower: ma[i] - 2 * std }
  })
}

// MACD = EMA12 − EMA26, Signal = MACD의 EMA9, Histogram = MACD − Signal
// firstMacd: ema26가 처음 값을 갖는 인덱스(=25). 이전은 모두 null
// macdSlice: result[firstMacd..]의 MACD 값만 추출한 부분 배열 (signal EMA9 입력용)
// signalSlice → 결과 매핑: signalSlice[j]는 macdSlice[j], 즉 원본 인덱스 firstMacd + j 에 대응
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
    const gi = firstMacd + j  // 부분 배열 인덱스 j → 원본 인덱스 firstMacd + j
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
