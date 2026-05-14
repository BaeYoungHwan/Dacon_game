// 월스트리트 거래소 — 이미지 버튼 3개 (종목분석/주식구매/주식판매)
// 클릭 시 해당 기능 팝업 표출
// 참고: docs/design-docs/props-spec.md

import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import StockBoard from '../components/game/StockBoard'

export default function MarketPage() {
  const [activePopup, setActivePopup] = useState(null)
  const { activeStocks, prices, portfolio, buyStock, sellStock, navigateTo } = useGameStore()

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

      {/* TODO(신입): 이미지 버튼 3개 — 실제 이미지로 교체 */}
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
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                {activePopup === 'analysis' && '종목 분석'}
                {activePopup === 'buy' && '주식 구매'}
                {activePopup === 'sell' && '주식 판매'}
              </h2>
              <button
                onClick={() => setActivePopup(null)}
                className="text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            {/* TODO(신입): 팝업별 전용 UI로 교체 */}
            <StockBoard
              stocks={activeStocks}
              prices={prices}
              portfolio={portfolio}
              onBuy={activePopup === 'buy' ? buyStock : undefined}
              onSell={activePopup === 'sell' ? sellStock : undefined}
            />
          </div>
        </div>
      )}
    </div>
  )
}
