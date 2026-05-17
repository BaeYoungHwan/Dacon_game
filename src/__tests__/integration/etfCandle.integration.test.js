import { describe, it, expect } from "vitest"
import stockData from "../../data/stockData.json"
import { buildEtfCandle } from "../../components/game/StockChart"

const kodex        = stockData.stocks.find(s => s.id === "stock_etf")
const pregameKospi = stockData.pregame_kospi_closes
const gameKospi    = stockData.kospi_closes
const scale        = kodex.pregame_prices[0].close / pregameKospi[0]

const valid = c =>
  c.high >= Math.max(c.open, c.close) &&
  c.low  <= Math.min(c.open, c.close)

describe("KODEX 200 buildEtfCandle 전 턴 유효성 회귀", () => {
  it("pregame 13개 캔들 모두 유효", () => {
    pregameKospi.forEach((k, i) => {
      const c = buildEtfCandle(k, i > 0 ? pregameKospi[i - 1] : undefined, kodex.pregame_prices[i], scale)
      expect(valid(c), `pregame idx=${i} open=${c.open} high=${c.high} low=${c.low} close=${c.close}`).toBe(true)
    })
  })

  it("game 50개 캔들 모두 유효", () => {
    gameKospi.forEach((k, i) => {
      const prevK = i === 0 ? pregameKospi[pregameKospi.length - 1] : gameKospi[i - 1]
      const c = buildEtfCandle(k, prevK, kodex.prices[i], scale)
      expect(valid(c), `game idx=${i} open=${c.open} high=${c.high} low=${c.low} close=${c.close}`).toBe(true)
    })
  })

  it("game close 불변 — stockData.prices[].close와 완전 일치", () => {
    gameKospi.forEach((k, i) => {
      const prevK = i === 0 ? pregameKospi[pregameKospi.length - 1] : gameKospi[i - 1]
      const c = buildEtfCandle(k, prevK, kodex.prices[i], scale)
      expect(c.close, `game idx=${i}`).toBe(kodex.prices[i].close)
    })
  })
})
