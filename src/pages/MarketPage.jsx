// 월스트리트 거래소 - 종목분석/주식구매/주식판매 팝업
// 참고: docs/design-docs/props-spec.md

import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import StockBoard from '../components/game/StockBoard'
import StockChart from '../components/game/StockChart'

function StockCardGrid({ stocks, prices, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {stocks.map((stock) => {
        const currentPrice = prices[stock.id] ?? stock.price
        const change = ((currentPrice - stock.price) / stock.price) * 100
        const isRise = change >= 0
        return (
          <button
            key={stock.id}
            onClick={() => onSelect(stock.id)}
            className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 text-left transition-all duration-150"
          >
            <p className="font-semibold text-sm">{stock.name}</p>
            <p className="text-xs text-gray-400 mb-2">{stock.sector}</p>
            <p className="font-bold">{currentPrice.toLocaleString()}원</p>
            <p className={isRise ? 'text-rise' : 'text-fall'}>
              {isRise ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
            </p>
          </button>
        )
      })}
    </div>
  )
}

export default function MarketPage() {
  const [activePopup, setActivePopup] = useState(null)
  const [selectedStockId, setSelectedStockId] = useState(null)
  const { activeStocks, prices, portfolio, buyStock, sellStock, navigateTo, turn, indicatorsPurchased } = useGameStore()

  const closePopup = () => {
    setActivePopup(null)
    setSelectedStockId(null)
  }

  const selectedStock = activeStocks.find(s => s.id === selectedStockId)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigateTo('main')}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-all duration-150"
        >
          ← 메인으로
        </button>
        <h1 className="text-xl font-bold">월스트리트 거래소</h1>
      </div>

      {/* TODO(신입): 이미지 버튼 3개 - 실제 이미지로 교체 */}
      <div className="flex gap-4 justify-center mt-8">
        <button
          onClick={() => setActivePopup('analysis')}
          className="w-36 h-36 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center font-bold transition-all duration-150"
        >
          종목분석
        </button>
        <button
          onClick={() => setActivePopup('buy')}
          className="w-36 h-36 bg-blue-700 hover:bg-blue-600 rounded-xl flex items-center justify-center font-bold transition-all duration-150"
        >
          주식구매
        </button>
        <button
          onClick={() => setActivePopup('sell')}
          className="w-36 h-36 bg-red-700 hover:bg-red-600 rounded-xl flex items-center justify-center font-bold transition-all duration-150"
        >
          주식판매
        </button>
      </div>

      {/* 팝업 오버레이 */}
      {activePopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className={"bg-gray-800 rounded-xl p-6 w-full " + (activePopup === "analysis" ? "max-w-3xl" : "max-w-2xl") + " max-h-[90vh] overflow-y-auto"}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                {activePopup === 'analysis' && selectedStockId && (
                  <button
                    onClick={() => setSelectedStockId(null)}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-all duration-150"
                  >
                    ← 목록
                  </button>
                )}
                <h2 className="text-lg font-bold">
                  {activePopup === 'analysis' && !selectedStockId && '종목 분석'}
                  {activePopup === 'analysis' && selectedStock && selectedStock.name + ' 차트'}
                  {activePopup === 'buy' && '주식 구매'}
                  {activePopup === 'sell' && '주식 판매'}
                </h2>
              </div>
              <button
                onClick={closePopup}
                className="text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {activePopup === 'analysis' && !selectedStockId && (
              <StockCardGrid stocks={activeStocks} prices={prices} onSelect={setSelectedStockId} />
            )}

            {activePopup === 'analysis' && selectedStockId && (
              <StockChart
                stockId={selectedStockId}
                stockName={selectedStock?.name ?? ''}
                turn={turn}
                indicatorsPurchased={indicatorsPurchased}
              />
            )}

            {(activePopup === 'buy' || activePopup === 'sell') && (
              <StockBoard
                stocks={activeStocks}
                prices={prices}
                portfolio={portfolio}
                onBuy={activePopup === 'buy' ? buyStock : undefined}
                onSell={activePopup === 'sell' ? sellStock : undefined}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
