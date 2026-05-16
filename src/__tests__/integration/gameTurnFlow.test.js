import { describe, it, expect, beforeEach } from "vitest"
import { useGameStore } from "../../store/gameStore.js"
import { progressTurn } from "../../lib/gameLogic.js"
import allStocks from "../../data/stocks.json"

const BASE_STATE = {
  turn: 1, totalTurns: 50,
  cash: 10_000_000,
  portfolio: {}, purchaseRounds: {},
  activeStocks: [
    { id: "005930", name: "삼성전자", price: 56000 },
    { id: "069500", name: "KODEX200",  price: 36000 },
  ],
  hiddenStocks: [], unlockedStockIds: [],
  packageStocks: [], packagePrice: 0,
  prices: { "005930": 56000, "069500": 36000 },
  insiderTip: null,
  maPurchased: false, bollingerPurchased: false,
  macdPurchased: false, obvPurchased: false,
}

beforeEach(() => {
  localStorage.clear()
  useGameStore.setState(BASE_STATE)
})

describe("통합: buyStock → nextTurn → prices 갱신", () => {
  it("매수 후 nextTurn 진행 시 prices 갱신, getFinalAssets() > 0", () => {
    useGameStore.getState().buyStock("005930", 2)
    const allActive = useGameStore.getState().activeStocks
    const result = progressTurn(2, allActive)
    useGameStore.getState().nextTurn(result)
    expect(useGameStore.getState().turn).toBe(2)
    expect(useGameStore.getState().prices["005930"]).toBeGreaterThan(0)
    expect(useGameStore.getState().getFinalAssets()).toBeGreaterThan(0)
  })
})

describe("통합: turn=50 → nextTurn → page=result", () => {
  it("50턴에서 nextTurn 호출 시 page가 result로 변경됨", () => {
    useGameStore.setState({ turn: 50 })
    const allActive = useGameStore.getState().activeStocks
    const result = progressTurn(51, allActive)
    useGameStore.getState().nextTurn(result)
    expect(useGameStore.getState().page).toBe("result")
  })
})

describe("통합: buyStock → sellStock 전량 → purchaseRounds 삭제", () => {
  it("전량 매도 후 purchaseRounds 키가 삭제됨", () => {
    useGameStore.getState().buyStock("005930", 5)
    expect(useGameStore.getState().purchaseRounds["005930"]).toBe(1)
    useGameStore.getState().sellStock("005930", 5)
    expect("005930" in useGameStore.getState().purchaseRounds).toBe(false)
  })
})

describe("통합: purchaseInsiderInfo 성공 → insiderTip not null", () => {
  it("내부자정보 구매 성공 시 insiderTip이 설정됨", () => {
    useGameStore.setState({ turn: 1, cash: 9_000_000 })
    const res = useGameStore.getState().purchaseInsiderInfo()
    if (res.ok) {
      expect(useGameStore.getState().insiderTip).not.toBeNull()
      expect(useGameStore.getState().insiderTip.purchasedAtTurn).toBe(1)
    } else {
      expect(["no_data", "insufficient_cash"]).toContain(res.reason)
    }
  })
})
