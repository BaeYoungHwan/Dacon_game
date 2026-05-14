import newsEvents from '../data/news-events.json'
import stockData from '../data/stockData.json'

const KOSPI_BASE = 2600

// realTicker → stockData 항목 맵 (module-level, 한 번만 계산)
const dataByTicker = Object.fromEntries(
  stockData.stocks.map(s => [s.realTicker, s])
)

/**
 * 주봉 턴 진행 — stockData.json 실제 주봉 데이터 재생
 *
 * @param {number} turn       - 현재 턴 (1-based)
 * @param {Array}  allStocks  - 전체 종목 배열 (active + hidden, stocks.json 기준)
 * @returns {{ newPrices, news, newKospi, newExchangeRate }}
 */
export function progressTurn(turn, allStocks) {
  const idx = turn - 1

  const newPrices = {}
  allStocks.forEach(stock => {
    const entry = dataByTicker[stock.id]
    const close = entry?.prices[idx]?.close
    if (close != null) newPrices[stock.id] = close
  })

  // 코스피 — 누적 등락률(%) → 절대 지수 변환
  const kospiChangePct = stockData.kospi[idx] ?? 0
  const newKospi = Math.round(KOSPI_BASE * (1 + kospiChangePct / 100))

  // 뉴스 — 날짜 기준 매칭 후 기업뉴스(배열)/국제뉴스(단일)로 분리
  const currentDate = stockData.meta.dates[idx]
  const matched = newsEvents.filter(n => n.date === currentDate)
  const companyMatched = matched.filter(n => n.sector !== '전체')
  const globalMatched  = matched.filter(n => n.sector === '전체')
  const news       = companyMatched.length > 0 ? companyMatched : null
  const globalNews = globalMatched.length > 0
    ? globalMatched[Math.floor(Math.random() * globalMatched.length)]
    : null

  // 환율 — 실제 데이터 없으므로 null 반환 (gameStore에서 현재값 유지)
  return { newPrices, news, globalNews, newKospi, newExchangeRate: null }
}
