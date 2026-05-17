import { describe, it, expect } from "vitest"
import { buildEtfCandle } from "../../components/game/StockChart"

const SCALE = 14.2136
const ETF_GAME_0  = { open: 36843, high: 38508, low: 38180, close: 38344, volume: 10528477 }
const ETF_GAME_41 = { open: 79381, high: 78413, low: 70618, close: 77994, volume: 18756632 }

function assertValidCandle(c) {
  expect(c.high).toBeGreaterThanOrEqual(c.open)
  expect(c.high).toBeGreaterThanOrEqual(c.close)
  expect(c.low).toBeLessThanOrEqual(c.open)
  expect(c.low).toBeLessThanOrEqual(c.close)
}

describe("buildEtfCandle", () => {
  it("close 불변 — round(k * scale)", () => {
    const k = 2697.67
    const c = buildEtfCandle(k, 2592.09, ETF_GAME_0, SCALE)
    expect(c.close).toBe(Math.round(k * SCALE))
  })

  it("KOSPI 상승 장 — low > open 무효 캔들 수정 (idx=0 재현)", () => {
    const c = buildEtfCandle(2697.67, 2592.09, ETF_GAME_0, SCALE)
    assertValidCandle(c)
  })

  it("KOSPI 하락 턴 — high < open 무효 캔들 수정 (idx=41 재현)", () => {
    const c = buildEtfCandle(5487.24, 5584.87, ETF_GAME_41, SCALE)
    assertValidCandle(c)
  })

  it("prevK 없음(pregame 첫 캔들) — open = close, 유효", () => {
    const c = buildEtfCandle(2532.78, undefined,
      { open: 36000, high: 36213, low: 35787, close: 36000, volume: 7380077 }, SCALE)
    assertValidCandle(c)
    expect(c.open).toBe(c.close)
  })
})
