import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import allStocks from '../data/stocks.json'

const INITIAL_CASH = 10_000_000   // 초기 자본금 1천만원
const TOTAL_TURNS = 50            // 주봉 1년 (50주)
const ACTIVE_STOCK_COUNT = 10     // 게임마다 랜덤 10종목 선택
const INITIAL_KOSPI = 2600        // 코스피 기준값
const INITIAL_EXCHANGE_RATE = 1350 // USD/KRW 기준값

// Fisher-Yates 셔플로 20개 중 10개 랜덤 선택
function pickActiveStocks(stocks) {
  const shuffled = [...stocks]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, ACTIVE_STOCK_COUNT)
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      // 화면 전환 상태
      page: 'start',  // 'start' | 'game' | 'result'

      // 플레이어
      nickname: '',

      // 게임 상태
      turn: 0,
      totalTurns: TOTAL_TURNS,
      cash: INITIAL_CASH,
      portfolio: {},         // { stockId: quantity }
      activeStocks: [],      // 이번 게임에서 활성화된 10종목
      prices: {},            // { stockId: currentPrice }
      currentNews: null,

      // 시장 지표 (시뮬레이션)
      kospi: INITIAL_KOSPI,
      exchangeRate: INITIAL_EXCHANGE_RATE,

      // --- 액션 ---

      setNickname: (name) => set({ nickname: name }),

      startGame: () => {
        const active = pickActiveStocks(allStocks)
        set({
          page: 'game',
          turn: 1,
          cash: INITIAL_CASH,
          portfolio: {},
          activeStocks: active,
          prices: Object.fromEntries(active.map((s) => [s.id, s.price])),
          currentNews: null,
          kospi: INITIAL_KOSPI,
          exchangeRate: INITIAL_EXCHANGE_RATE,
        })
      },

      // gameLogic.progressTurn()이 계산한 결과를 받아 상태에 반영
      nextTurn: ({ newPrices, news, newKospi, newExchangeRate }) => {
        const { turn, totalTurns } = get()
        const next = turn + 1
        set({
          turn: next,
          prices: newPrices,
          currentNews: news,
          kospi: newKospi,
          exchangeRate: newExchangeRate,
          page: next > totalTurns ? 'result' : 'game',
        })
      },

      // 매수: 잔액 부족 시 false 반환
      buyStock: (stockId, quantity) => {
        const { cash, portfolio, prices } = get()
        const cost = prices[stockId] * quantity
        if (cost > cash) return false
        set({
          cash: cash - cost,
          portfolio: { ...portfolio, [stockId]: (portfolio[stockId] || 0) + quantity },
        })
        return true
      },

      // 매도: 보유 부족 시 false 반환
      sellStock: (stockId, quantity) => {
        const { cash, portfolio, prices } = get()
        const held = portfolio[stockId] || 0
        if (quantity > held) return false
        const next = { ...portfolio, [stockId]: held - quantity }
        if (next[stockId] === 0) delete next[stockId]
        set({ cash: cash + prices[stockId] * quantity, portfolio: next })
        return true
      },

      // 최종 자산 = 현금 + 보유 주식 평가액
      getFinalAssets: () => {
        const { cash, portfolio, prices } = get()
        const stockValue = Object.entries(portfolio).reduce(
          (sum, [id, qty]) => sum + (prices[id] || 0) * qty,
          0,
        )
        return cash + stockValue
      },

      // 수익률 배수 (최종자산 / 초기자본)
      getReturnMultiple: () => {
        return get().getFinalAssets() / INITIAL_CASH
      },

      resetGame: () =>
        set({
          page: 'start',
          turn: 0,
          cash: INITIAL_CASH,
          portfolio: {},
          activeStocks: [],
          prices: {},
          currentNews: null,
          kospi: INITIAL_KOSPI,
          exchangeRate: INITIAL_EXCHANGE_RATE,
        }),
    }),
    { name: 'k-stock-merchant' },
  ),
)

export { INITIAL_CASH }
