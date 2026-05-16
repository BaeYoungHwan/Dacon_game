import { create } from 'zustand'
import { useLeaderboardStore } from './leaderboardStore'
import { persist } from 'zustand/middleware'
import allStocks from '../data/stocks.json'
import stockData from '../data/stockData.json'
import { progressTurn } from '../lib/gameLogic'

const INITIAL_CASH = 10_000_000
const TOTAL_TURNS = 50
const ACTIVE_STOCK_COUNT = 10
const INITIAL_KOSPI = 2600
const INITIAL_EXCHANGE_RATE = 1350

const stockDataByTicker = Object.fromEntries(
  stockData.stocks.map(s => [s.realTicker, s])
)

// 항상 activeStocks 최상위에 고정할 종목 (KODEX 200 + 인버스)
const PINNED_IDS = ['069500', '252670']

function splitStocks(stocks) {
  const pinned = PINNED_IDS.map(id => stocks.find(s => s.id === id)).filter(Boolean)
  const pool = stocks.filter(s => !PINNED_IDS.includes(s.id))

  // pool에서 나머지 자리 수만큼 랜덤 선택
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const randomCount = ACTIVE_STOCK_COUNT - pinned.length
  const randomActive = pool.slice(0, randomCount).sort((a, b) =>
    a.name.localeCompare(b.name, 'ko')
  )
  return {
    active: [...pinned, ...randomActive],
    hidden: pool.slice(randomCount),
  }
}

function generatePackage(hiddenStocks, prices) {
  if (!hiddenStocks.length) return { packageStocks: [], packagePrice: 0 }

  // 패키지 가격: 100만~200만원 (10만원 단위)
  const packagePrice = (Math.floor(Math.random() * 11) + 10) * 100_000

  const minTotal = packagePrice * 0.9
  const maxTotal = packagePrice * 1.1

  const pool = hiddenStocks.map(s => ({ ...s, _p: prices[s.id] ?? s.price }))
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  const selected = []
  let total = 0
  for (const stock of pool) {
    if (total + stock._p <= maxTotal) {
      selected.push(stock)
      total += stock._p
      if (total >= minTotal) break
    }
  }

  // 종목 합이 목표가보다 너무 낮으면 전체 포함 후 가격 맞춤
  if (total < minTotal) {
    const allTotal = pool.reduce((s, x) => s + x._p, 0)
    const fallbackPrice = Math.max(Math.round(allTotal / 10_000) * 10_000, 100_000)
    return {
      packageStocks: pool.sort((a, b) => a._p - b._p).map(({ _p, ...s }) => s),
      packagePrice: fallbackPrice,
    }
  }

  return {
    packageStocks: selected.sort((a, b) => a._p - b._p).map(({ _p, ...s }) => s),
    packagePrice,
  }
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      page: 'start',
      isFirstPlay: false,
      nickname: '',
      turn: 0,
      totalTurns: TOTAL_TURNS,
      cash: INITIAL_CASH,
      portfolio: {},
      // 종목별 최초 매수 라운드 — 매도 모달에서 "이번 주 매수한 종목" 표시용
      // 보유 0 → >0 전환 시 현재 turn 기록, 전량 매도 시 삭제
      purchaseRounds: {},
      activeStocks: [],
      hiddenStocks: [],
      unlockedStockIds: [],
      packageStocks: [],
      packagePrice: 0,
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

      finishIntro: () => set({ page: 'main' }),
      clearFirstPlay: () => set({ isFirstPlay: false }),

      startGame: () => {
        const { active, hidden } = splitStocks(allStocks)
        const allPrices = Object.fromEntries(
          [...active, ...hidden].map((s) => [
            s.id,
            stockDataByTicker[s.id]?.prices[0]?.close ?? s.price,
          ])
        )
        const { packageStocks, packagePrice } = generatePackage(hidden, allPrices)
        const initialTurn = progressTurn(1, [...active, ...hidden])
        set({
          page: 'intro',
          isFirstPlay: true,
          turn: 1,
          cash: INITIAL_CASH,
          portfolio: {},
          purchaseRounds: {},
          activeStocks: active,
          hiddenStocks: hidden,
          unlockedStockIds: [],
          packageStocks,
          packagePrice,
          maPurchased: false,
          bollingerPurchased: false,
          macdPurchased: false,
          obvPurchased: false,
          prices: allPrices,
          currentNews: initialTurn.news,
          currentGlobalNews: initialTurn.globalNews,
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
        const { cash, portfolio, prices, purchaseRounds, turn } = get()
        const cost = prices[stockId] * quantity
        if (cost > cash) return false
        const wasZero = (portfolio[stockId] || 0) === 0
        set({
          cash: cash - cost,
          portfolio: { ...portfolio, [stockId]: (portfolio[stockId] || 0) + quantity },
          // 보유 0 → >0 첫 진입 시에만 매수 라운드 기록 (추가 매수 시엔 유지)
          purchaseRounds: wasZero
            ? { ...purchaseRounds, [stockId]: turn }
            : purchaseRounds,
        })
        return true
      },

      sellStock: (stockId, quantity) => {
        const { cash, portfolio, prices, purchaseRounds } = get()
        const held = portfolio[stockId] || 0
        if (quantity > held) return false
        const next = { ...portfolio, [stockId]: held - quantity }
        const nextRounds = { ...purchaseRounds }
        if (next[stockId] === 0) {
          delete next[stockId]
          delete nextRounds[stockId]
        }
        set({ cash: cash + prices[stockId] * quantity, portfolio: next, purchaseRounds: nextRounds })
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

      unlockPackage: () => {
        const { cash, packageStocks, packagePrice, hiddenStocks, activeStocks, unlockedStockIds } = get()
        if (!packageStocks.length || packagePrice > cash) return false
        const ids = packageStocks.map(s => s.id)
        set({
          cash: cash - packagePrice,
          unlockedStockIds: [...unlockedStockIds, ...ids],
          hiddenStocks: hiddenStocks.filter(s => !ids.includes(s.id)),
          activeStocks: [...activeStocks, ...packageStocks],
          packageStocks: [],
          packagePrice: 0,
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
          purchaseRounds: {},
          activeStocks: [],
          hiddenStocks: [],
          unlockedStockIds: [],
          packageStocks: [],
          packagePrice: 0,
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
        purchaseRounds: state.purchaseRounds,
        activeStocks: state.activeStocks,
        hiddenStocks: state.hiddenStocks,
        unlockedStockIds: state.unlockedStockIds,
        packageStocks: state.packageStocks,
        packagePrice: state.packagePrice,
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

export { INITIAL_CASH, INITIAL_KOSPI }
