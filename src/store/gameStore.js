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

  // 풀 셔플
  const pool = hiddenStocks.map(s => ({ ...s, currentPrice: prices[s.id] ?? s.price }))
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  // 1~3개 무작위 선택
  const count = Math.min(pool.length, Math.floor(Math.random() * 3) + 1)
  const selected = pool.slice(0, count)

  // 각 종목 개별 가격: 100만~200만원 × ±10%
  const packageStocks = selected.map(({ currentPrice, ...s }) => {
    const base = (Math.floor(Math.random() * 11) + 10) * 100_000
    const factor = 0.9 + Math.random() * 0.2
    const stockPackagePrice = Math.round(base * factor / 10_000) * 10_000
    return { ...s, packagePrice: stockPackagePrice }
  })

  // 금액 오름차순 정렬
  packageStocks.sort((a, b) => a.packagePrice - b.packagePrice)
  const packagePrice = packageStocks.reduce((sum, s) => sum + s.packagePrice, 0)
  return { packageStocks, packagePrice }
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
      insiderTip: null,

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
          insiderTip: null,
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

      unlockPackageStock: (stockId) => {
        const { cash, packageStocks, hiddenStocks, activeStocks, unlockedStockIds } = get()
        const target = packageStocks.find(s => s.id === stockId)
        if (!target || target.packagePrice > cash) return false
        const { packagePrice: _, ...stockWithoutPrice } = target
        const remaining = packageStocks.filter(s => s.id !== stockId)
        set({
          cash: cash - target.packagePrice,
          unlockedStockIds: [...unlockedStockIds, stockId],
          hiddenStocks: hiddenStocks.filter(s => s.id !== stockId),
          activeStocks: [...activeStocks, stockWithoutPrice],
          packageStocks: remaining,
          packagePrice: remaining.reduce((sum, s) => sum + s.packagePrice, 0),
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

      // 총 자산의 10% 수수료로 다음 주 최고 상승 종목 1개 공개
      purchaseInsiderInfo: () => {
        const { cash, portfolio, prices, activeStocks, turn, totalTurns, insiderTip } = get()

        if (turn >= totalTurns) return { ok: false, reason: 'last_turn' }
        if (insiderTip?.purchasedAtTurn === turn) return { ok: false, reason: 'already_purchased' }

        const stockValue = activeStocks.reduce((sum, s) => {
          return sum + (prices[s.id] ?? s.price ?? 0) * (portfolio[s.id] || 0)
        }, 0)
        const fee = Math.floor((cash + stockValue) * 0.05)

        if (fee > cash) return { ok: false, reason: 'insufficient_cash', fee, cash }

        // turn은 1-based → 현재 idx = turn-1, 다음 주 idx = turn
        let bestStock = null
        let bestRatio = -Infinity

        activeStocks.forEach((stock) => {
          const entry = stockDataByTicker[stock.id]
          if (!entry) return
          const currentClose = entry.prices[turn - 1]?.close
          const nextClose    = entry.prices[turn]?.close
          if (currentClose == null || nextClose == null) return
          const ratio = (nextClose - currentClose) / currentClose * 100
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestStock = { stock, currentClose, nextClose, ratio }
          }
        })

        if (!bestStock) return { ok: false, reason: 'no_data' }

        set({
          cash: cash - fee,
          insiderTip: {
            id:              bestStock.stock.id,
            name:            bestStock.stock.name,
            currentClose:    bestStock.currentClose,
            nextClose:       bestStock.nextClose,
            nextRatio:       bestStock.ratio,
            purchasedAtTurn: turn,
            feePaid:         fee,
          },
        })
        return { ok: true }
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
          insiderTip: null,
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
        insiderTip: state.insiderTip,
      }),
    },
  ),
)

export { INITIAL_CASH, INITIAL_KOSPI }
