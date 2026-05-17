import { describe, it, expect, beforeEach } from "vitest"
import { useGameStore } from "../../store/gameStore.js"

const BASE = {
  turn: 1, totalTurns: 50, cash: 10000000,
  portfolio: {}, purchaseRounds: {},
  activeStocks: [
    { id: "005930", name: "samsung", price: 56000 },
    { id: "069500", name: "kodex200", price: 36000 },
  ],
  hiddenStocks: [{ id: "X001", name: "hidden", price: 100000 }],
  unlockedStockIds: [], packageStocks: [], packagePrice: 0,
  prices: { "005930": 56000, "069500": 36000, "X001": 100000 },
  insiderTip: null,
  maPurchased: false, bollingerPurchased: false,
  macdPurchased: false, obvPurchased: false,
}

beforeEach(() => { localStorage.clear(); useGameStore.setState(BASE) })

describe("buyStock", () => {
  it("success -- cash and portfolio updated", () => {
    expect(useGameStore.getState().buyStock("005930", 10)).toBe(true)
    expect(useGameStore.getState().cash).toBe(10000000 - 56000 * 10)
    expect(useGameStore.getState().portfolio["005930"]).toBe(10)
  })
  it("insufficient cash -- false, state unchanged", () => {
    useGameStore.setState({ cash: 100 })
    expect(useGameStore.getState().buyStock("005930", 1)).toBe(false)
    expect(useGameStore.getState().cash).toBe(100)
  })
  it("exact cash==cost -- success, cash becomes 0", () => {
    useGameStore.setState({ cash: 56000 })
    expect(useGameStore.getState().buyStock("005930", 1)).toBe(true)
    expect(useGameStore.getState().cash).toBe(0)
  })
  it("first buy -- purchaseRounds records current turn", () => {
    useGameStore.getState().buyStock("005930", 1)
    expect(useGameStore.getState().purchaseRounds["005930"]).toBe(1)
  })
  it("additional buy at turn=3 -- purchaseRounds keeps original turn", () => {
    useGameStore.setState({ portfolio: { "005930": 5 }, purchaseRounds: { "005930": 1 }, turn: 3 })
    useGameStore.getState().buyStock("005930", 2)
    expect(useGameStore.getState().purchaseRounds["005930"]).toBe(1)
  })
})
