// 기술상 — 이미지 버튼 2개 (차트지표 구매/깜짝 종목 판매상)
// 클릭 시 해당 기능 팝업 표출
// 참고: docs/design-docs/props-spec.md

import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

// 지표별 구매 비용 — 추후 gameLogic에서 계산해서 주입 가능
const INDICATOR_COSTS = {
  ma: 200_000,
  bollinger: 300_000,
  macd: 400_000,
  obv: 200_000,
}
const INDICATOR_LABELS = {
  ma: 'MA5 + MA20',
  bollinger: '볼린저 밴드',
  macd: 'MACD',
  obv: 'OBV',
}
// 구매 가능 최소 턴 (0이면 제한 없음)
const INDICATOR_UNLOCK_TURN = { ma: 0, bollinger: 20, macd: 30, obv: 0 }
const UNLOCK_COST = 300_000

export default function TechMerchantPage() {
  const [activePopup, setActivePopup] = useState(null)
  const {
    navigateTo, cash, turn,
    hiddenStocks, unlockedStockIds,
    unlockStock, buyIndicator,
    maPurchased, bollingerPurchased, macdPurchased, obvPurchased,
  } = useGameStore()

  const purchasedMap = { ma: maPurchased, bollinger: bollingerPurchased, macd: macdPurchased, obv: obvPurchased }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigateTo('main')}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-all duration-150"
        >
          ← 메인으로
        </button>
        <h1 className="text-xl font-bold">기술상</h1>
      </div>

      {/* TODO(신입): 이미지 버튼 2개 — 실제 이미지로 교체 */}
      <div className="flex gap-6 justify-center mt-8">
        <button
          onClick={() => setActivePopup('indicators')}
          className="w-40 h-40 bg-green-800 hover:bg-green-700 rounded-xl flex items-center justify-center font-bold text-center transition-all duration-150"
        >
          차트지표<br />구매
        </button>
        <button
          onClick={() => setActivePopup('hiddenStocks')}
          className="w-40 h-40 bg-yellow-800 hover:bg-yellow-700 rounded-xl flex items-center justify-center font-bold text-center transition-all duration-150"
        >
          깜짝 종목<br />판매상
        </button>
      </div>

      {/* 팝업 오버레이 */}
      {activePopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                {activePopup === 'indicators' && '차트 지표 구매'}
                {activePopup === 'hiddenStocks' && '깜짝 종목 판매상'}
              </h2>
              <button
                onClick={() => setActivePopup(null)}
                className="text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* TODO(신입): 팝업별 전용 UI로 교체 */}
            {activePopup === 'indicators' && (
              <div className="space-y-3">
                <p className="text-gray-400 text-xs mb-4">지표를 구매하면 거래소 차트에 영구 표시됩니다.</p>
                {Object.entries(INDICATOR_COSTS).map(([key, cost]) => {
                  const minTurn = INDICATOR_UNLOCK_TURN[key]
                  const locked = turn < minTurn
                  return (
                    <div key={key} className="flex items-center justify-between bg-gray-700 rounded p-3">
                      <div>
                        <p className="font-bold text-sm">{INDICATOR_LABELS[key]}</p>
                        <p className="text-xs text-gray-400">
                          {locked
                            ? minTurn + "턴 이후 구매 가능 (현재 " + turn + "턴)"
                            : cost.toLocaleString() + "원"}
                        </p>
                      </div>
                      {purchasedMap[key] ? (
                        <span className="text-green-400 text-sm font-bold">구매완료</span>
                      ) : locked ? (
                        <span className="text-gray-500 text-sm">잠김</span>
                      ) : (
                        <button
                          onClick={() => buyIndicator(key, cost)}
                          disabled={cash < cost}
                          className="px-3 py-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded text-sm font-bold transition-all duration-150"
                        >
                          {cash < cost ? "잔액부족" : "구매"}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {activePopup === 'hiddenStocks' && (
              <div className="space-y-2">
                <p className="text-gray-300 text-sm mb-3">비공개 종목을 유료로 공개하고 거래할 수 있습니다.</p>
                {/* TODO(신입): 비공개 종목 목록 UI */}
                {hiddenStocks.map((stock) => {
                  const isUnlocked = unlockedStockIds.includes(stock.id)
                  return (
                    <div key={stock.id} className="flex justify-between items-center bg-gray-700 rounded p-3">
                      <span>{isUnlocked ? stock.name : '???'}</span>
                      {isUnlocked ? (
                        <span className="text-green-400 text-sm">공개됨</span>
                      ) : (
                        <button
                          onClick={() => unlockStock(stock.id, UNLOCK_COST)}
                          disabled={cash < UNLOCK_COST}
                          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 rounded text-sm transition-all duration-150"
                        >
                          {UNLOCK_COST.toLocaleString()}원
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
