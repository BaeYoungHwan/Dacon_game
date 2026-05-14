import { create } from 'zustand'
import { useLeaderboardStore } from './leaderboardStore'
import { persist } from 'zustand/middleware'
import allStocks from '../data/stocks.json'
import stockData from '../data/stockData.json'

const INITIAL_CASH = 10_000_000
const TOTAL_TURNS = 50
const ACTIVE_STOCK_COUNT = 10
const INITIAL_KOSPI = 2600
const INITIAL_EXCHANGE_RATE = 1350

const stockDataByTicker = Object.fromEntries(
  stockData.stocks.map(s => [s.realTicker, s])
)

function splitStocks(stocks) {
  const shuffled = [...stocks]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return {
    active: shuffled.slice(0, ACTIVE_STOCK_COUNT),
    hidden: shuffled.slice(ACTIVE_STOCK_COUNT),
  }
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      page: 'start',
      nickname: '',
      turn: 0,
      totalTurns: TOTAL_TURNS,
      cash: INITIAL_CASH,
      portfolio: {},
      activeStocks: [],
      hiddenStocks: [],
      unlockedStockIds: [],
      maPurchased: false,
      bollingerPurchased: false,
      macdPurchased: false,
      obvPurchased: false,
      prices: {},
      kospi: INITIAL_KOSPI,
      exchangeRate: INITIAL_EXCHANGE_RATE,
      currentNews: null,
      currentGlobalNews: null,

      setNickname: (name) => set({ nickname: name }),
      navigateTo: (page) => set({ page }),

      startGame: () => {
        const { active, hidden } = splitStocks(allStocks)
        const allPrices = Object.fromEntries(
          [...active, ...hidden].map((s) => [
            s.id,
            stockDataByTicker[s.id]?.prices[0]?.close ?? s.price,
          ])
        )
        set({
          page: 'main',
          turn: 1,
          cash: INITIAL_CASH,
          portfolio: {},
          activeStocks: active,
          hiddenStocks: hidden,
          unlockedStockIds: [],
          maPurchased: false,
          bollingerPurchased: false,
          macdPurchased: false,
          obvPurchased: false,
          prices: allPrices,
          currentNews: null,
          currentGlobalNews: null,
          kospi: INITIAL_KOSPI,
          exchangeRate: INITIAL_EXCHANGE_RATE,
        })
      },

      nextTurn: ({ newPrices, news, globalNews, newKospi, newExchangeRate }) => {
        const { turn, totalTurns, exchangeRate } = get()
        const next = turn + 1
        set({
          turn: next,
          prices: newPrices,
          currentNews: news,
          currentGlobalNews: globalNews,
          kospi: newKospi,
          exchangeRate: newExchangeRate ?? exchangeRate,
          page: next > totalTurns ? 'result' : 'main',
        })
      },

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

      sellStock: (stockId, quantity) => {
        const { cash, portfolio, prices } = get()
        const held = portfolio[stockId] || 0
        if (quantity > held) return false
        const next = { ...portfolio, [stockId]: held - quantity }
        if (next[stockId] === 0) delete next[stockId]
        set({ cash: cash + prices[stockId] * quantity, portfolio: next })
        return true
      },

      unlockStock: (stockId, cost) => {
        const { cash, unlockedStockIds, hiddenStocks, activeStocks } = get()
        if (cost > cash) return false
        const target = hiddenStocks.find((s) => s.id === stockId)
        set({
          cash: cash - cost,
          unlockedStockIds: [...unlockedStockIds, stockId],
          hiddenStocks: hiddenStocks.filter((s) => s.id !== stockId),
          activeStocks: target ? [...activeStocks, target] : activeStocks,
        })
        return true
      },

      // key: "ma" | "bollinger" | "macd" | "obv"
      buyIndicator: (key, cost) => {
        const { cash } = get()
        if (cost > cash) return false
        const field = key + "Purchased"
        set({ cash: cash - cost, [field]: true })
        return true
      },

      getFinalAssets: () => {
        const { cash, portfolio, prices } = get()
        const stockValue = Object.entries(portfolio).reduce(
          (sum, [id, qty]) => sum + (prices[id] || 0) * qty,
          0,
        )
        return cash + stockValue
      },

      getReturnMultiple: () => {
        return get().getFinalAssets() / INITIAL_CASH
      },

      resetGame: () => {
        useLeaderboardStore.getState().resetSubmitted()
        set({
          page: 'start',
          turn: 0,
          cash: INITIAL_CASH,
          portfolio: {},
          activeStocks: [],
          hiddenStocks: [],
          unlockedStockIds: [],
          maPurchased: false,
          bollingerPurchased: false,
          macdPurchased: false,
          obvPurchased: false,
          prices: {},
          currentNews: null,
          currentGlobalNews: null,
          kospi: INITIAL_KOSPI,
          exchangeRate: INITIAL_EXCHANGE_RATE,
        })
      },
    }),
    {
      name: 'k-stock-merchant',
      partialize: (state) => ({
        page: state.page,
        nickname: state.nickname,
        turn: state.turn,
        totalTurns: state.totalTurns,
        cash: state.cash,
        portfolio: state.portfolio,
        activeStocks: state.activeStocks,
        hiddenStocks: state.hiddenStocks,
        unlockedStockIds: state.unlockedStockIds,
        maPurchased: state.maPurchased,
        bollingerPurchased: state.bollingerPurchased,
        macdPurchased: state.macdPurchased,
        obvPurchased: state.obvPurchased,
        prices: state.prices,
        kospi: state.kospi,
        exchangeRate: state.exchangeRate,
        currentNews: state.currentNews,
        currentGlobalNews: state.currentGlobalNews,
      }),
    },
  ),
)

export { INITIAL_CASH }
