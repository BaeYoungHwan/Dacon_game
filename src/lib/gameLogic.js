import newsEvents from '../data/news-events.json'

// 주봉 기준 변동 상한 (일봉 ±20% → 주봉 ±15%)
const MAX_WEEKLY_CHANGE = 0.15

// 환율 상승(원화 약세) 시 수혜 섹터
const EXPORT_SECTORS = ['반도체', '자동차', '소재', '화학']

/**
 * 주봉 턴 진행 — 뉴스 이벤트, 코스피, 환율을 반영한 가격 변동 계산
 *
 * @param {Object} currentPrices   - 현재 주가 { stockId: number }
 * @param {Array}  activeStocks    - 활성 종목 배열 [{ id, sector, type, ... }]
 * @param {number} currentKospi    - 현재 코스피 지수
 * @param {number} currentRate     - 현재 USD/KRW 환율
 * @returns {{ newPrices, news, newKospi, newExchangeRate }}
 */
export function progressTurn(currentPrices, activeStocks, currentKospi, currentRate) {
  // 1. 주간 뉴스 이벤트 1개 선택
  const news = newsEvents[Math.floor(Math.random() * newsEvents.length)]

  // 2. 이번 주 시장 전체 등락 (-3% ~ +3%)
  const marketReturn = (Math.random() - 0.5) * 0.06

  // 3. 환율 변화 (-1% ~ +1%)
  const rateChangePct = (Math.random() - 0.5) * 0.02
  const newKospi = Math.round(currentKospi * (1 + marketReturn))
  const newExchangeRate = Math.round(currentRate * (1 + rateChangePct))

  // 4. 환율 상승 시 수출주 추가 수혜
  const exportBoost = rateChangePct > 0 ? rateChangePct * 1.5 : rateChangePct * 0.3

  const newPrices = {}

  activeStocks.forEach((stock) => {
    const base = currentPrices[stock.id]
    const isEtf = stock.type === 'etf'

    // 뉴스 이벤트 영향
    const affected =
      news.sector === '전체' || news.sector === stock.sector || news.stockId === stock.id
    const eventEffect = affected ? news.effect : 0

    // 종목별 랜덤 변동 (ETF는 개별 변동성 낮음)
    const randomRange = isEtf ? 0.04 : 0.10
    const randomEffect = (Math.random() - 0.5) * randomRange

    // 시장 상관관계 (ETF는 시장 추종성 높음)
    const marketCorrelation = isEtf ? 0.9 : 0.3
    const marketEffect = marketReturn * marketCorrelation

    // 환율 효과 (수출 섹터만)
    const rateEffect = EXPORT_SECTORS.includes(stock.sector) ? exportBoost : 0

    // 합산 후 주봉 상한 ±15% 적용
    const total = Math.max(
      -MAX_WEEKLY_CHANGE,
      Math.min(MAX_WEEKLY_CHANGE, eventEffect + randomEffect + marketEffect + rateEffect),
    )

    newPrices[stock.id] = Math.max(100, Math.round((base * (1 + total)) / 100) * 100)
  })

  return { newPrices, news, newKospi, newExchangeRate }
}
