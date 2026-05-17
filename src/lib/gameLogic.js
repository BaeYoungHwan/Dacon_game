import newsEvents from '../data/news-events.json'
import stockData from '../data/stockData.json'

const KOSPI_BASE = 2600

// realTicker → stockData 항목 맵 (module-level, 한 번만 계산)
const dataByTicker = Object.fromEntries(
  stockData.stocks.map(s => [s.realTicker, s])
)

// 날짜 → 인덱스 맵 (O(1) 조회, indexOf 반복 호출 방지)
const dateIndexMap = new Map(
  stockData.meta.dates.map((d, i) => [d, i])
)

// 턴 번호를 시드로 받아 결정적(deterministic) 난수 생성기 반환 (mulberry32)
function makeSeededRandom(seed) {
  let s = (seed * 2654435761) >>> 0
  return function () {
    s = (s + 0x6D2B79F5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

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

  // 뉴스 — 날짜 기준 매칭 + 부족 시 보충 (기업뉴스 3~5개 보장)
  const currentDate = stockData.meta.dates[idx]

  const rand = makeSeededRandom(turn)
  const shuffleSeeded = (arr) => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const matched      = newsEvents.filter(n => n.date === currentDate)
  const exactCompany = matched.filter(n => n.sector !== '전체')
  const globalMatched = matched.filter(n => n.sector === '전체')

  // 기업뉴스 3~5개 보장: 날짜 매칭 우선, 부족 시 ±4턴 윈도우 → 전체 pool 순으로 보충
  const MIN_COMPANY = 3
  const MAX_COMPANY = 5
  const targetCount = MIN_COMPANY + Math.floor(rand() * (MAX_COMPANY - MIN_COMPANY + 1))
  const usedIds = new Set(exactCompany.map(n => n.id))
  const companyPool = newsEvents.filter(n => n.sector !== '전체')

  const sectorsPresent = new Set(exactCompany.map(n => n.sector))
  const nearbyIds = new Set()
  const nearby = companyPool.filter(n => {
    if (usedIds.has(n.id)) return false
    const dIdx = dateIndexMap.get(n.date) ?? -1
    if (dIdx < 0 || Math.abs(dIdx - idx) > 4) return false
    nearbyIds.add(n.id)
    return true
  })
  const nearbyRanked = [
    ...nearby.filter(n => sectorsPresent.has(n.sector)),
    ...nearby.filter(n => !sectorsPresent.has(n.sector)),
  ]
  // nearbyRanked 항목은 제외하여 filler 내 중복 방지
  const rest = companyPool.filter(n => !usedIds.has(n.id) && !nearbyIds.has(n.id))
  const filler = [...shuffleSeeded(nearbyRanked), ...shuffleSeeded(rest)]

  const supplemented = [...exactCompany]
  for (const n of filler) {
    if (supplemented.length >= targetCount) break
    if (usedIds.has(n.id)) continue
    supplemented.push(n)
    usedIds.add(n.id)
  }
  const news = supplemented.length > 0 ? supplemented.slice(0, MAX_COMPANY) : null

  // 글로벌뉴스: 날짜 매칭 우선, 없으면 ±4턴 윈도우에서 1개 보충
  let globalNews = null
  if (globalMatched.length > 0) {
    globalNews = globalMatched[Math.floor(rand() * globalMatched.length)]
  } else {
    const globalPool = newsEvents.filter(n => n.sector === '전체')
    const nearbyGlobal = globalPool.filter(n => {
      const dIdx = dateIndexMap.get(n.date) ?? -1
      return dIdx >= 0 && Math.abs(dIdx - idx) <= 4
    })
    if (nearbyGlobal.length > 0) globalNews = shuffleSeeded(nearbyGlobal)[0]
  }

  // 환율 — 실제 데이터 없으므로 null 반환 (gameStore에서 현재값 유지)
  return { newPrices, news, globalNews, newKospi, newExchangeRate: null }
}
