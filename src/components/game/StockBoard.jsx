// TODO(신입): 종목 목록 UI 구현
// Props:
//   stocks     - 종목 배열 [{ id, name, sector, price }]
//   prices     - 현재 주가 { stockId: number }
//   portfolio  - 보유 주식 { stockId: quantity }
//   onBuy(stockId, quantity)  - 매수 함수 (undefined이면 매수 버튼 미표시)
//   onSell(stockId, quantity) - 매도 함수 (undefined이면 매도 버튼 미표시)

import { useState } from 'react'

export default function StockBoard({ stocks, prices, portfolio, onBuy, onSell }) {
  const [quantities, setQuantities] = useState({})

  const getQty = (stockId) => quantities[stockId] ?? 1
  const setQty = (stockId, val) => {
    const n = Math.max(1, parseInt(val) || 1)
    setQuantities(prev => ({ ...prev, [stockId]: n }))
  }

  return (
    <div className="flex-1 bg-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-bold mb-3">종목 현황</h2>

      {stocks.map((stock) => {
        const currentPrice = prices[stock.id]
        const held = portfolio[stock.id] || 0
        const change = ((currentPrice - stock.price) / stock.price) * 100
        const isRise = change >= 0
        const qty = getQty(stock.id)

        return (
          <div key={stock.id} className="flex items-center justify-between py-2 border-b border-gray-700">
            {/* TODO(신입): 디자인 개선 */}
            <div>
              <span className="font-semibold">{stock.name}</span>
              <span className="text-xs text-gray-400 ml-2">{stock.sector}</span>
              {held > 0 && <span className="text-xs text-yellow-400 ml-2">{held}주 보유</span>}
            </div>

            <div className="text-right">
              <p className={`font-bold ${isRise ? 'text-rise' : 'text-fall'}`}>
                {currentPrice.toLocaleString()}원
              </p>
              <p className={`text-xs ${isRise ? 'text-rise' : 'text-fall'}`}>
                {isRise ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
              </p>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(stock.id, e.target.value)}
                className="w-14 px-1 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-center"
              />
              {onBuy && (
                <button
                  onClick={() => onBuy(stock.id, qty)}
                  className="px-3 py-1 bg-rise hover:opacity-80 rounded text-sm font-bold transition-all duration-150"
                >
                  매수
                </button>
              )}
              {onSell && (
                <button
                  onClick={() => onSell(stock.id, qty)}
                  disabled={held === 0}
                  className="px-3 py-1 bg-fall hover:opacity-80 disabled:opacity-30 rounded text-sm font-bold transition-all duration-150"
                >
                  매도
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
