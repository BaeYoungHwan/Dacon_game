// 정보상 — 이미지 버튼 3개 (국제뉴스/기업뉴스/추천종목)
// 클릭 시 해당 정보 팝업 표출
// 참고: docs/design-docs/props-spec.md

import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export default function InfoMerchantPage() {
  const [activePopup, setActivePopup] = useState(null)
  const { navigateTo, currentNews, currentGlobalNews, activeStocks, prices } = useGameStore()

  // activeStocks에서 중복 없는 섹터 목록 추출
  const sectors = [...new Set((activeStocks || []).map(s => s.sector))]

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigateTo('main')}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-all duration-150"
        >
          ← 메인으로
        </button>
        <h1 className="text-xl font-bold">정보상</h1>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => navigateTo('market')}
            className="px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded text-sm transition-all duration-150"
          >
            거래소
          </button>
          <button
            onClick={() => navigateTo('techMerchant')}
            className="px-3 py-1 bg-purple-700 hover:bg-purple-600 rounded text-sm transition-all duration-150"
          >
            기술상
          </button>
        </div>
      </div>

      {/* TODO(신입): 이미지 버튼 3개 — 실제 이미지로 교체 */}
      <div className="flex gap-4 justify-center mt-8">
        <button
          onClick={() => setActivePopup('globalNews')}
          className="w-36 h-36 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center font-bold transition-all duration-150"
        >
          국제뉴스
        </button>
        <button
          onClick={() => setActivePopup('companyNews')}
          className="w-36 h-36 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center font-bold transition-all duration-150"
        >
          기업뉴스
        </button>
        <button
          onClick={() => setActivePopup('recommendation')}
          className="w-36 h-36 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center font-bold transition-all duration-150"
        >
          추천종목
        </button>
      </div>

      {/* 팝업 오버레이 */}
      {activePopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                {activePopup === 'globalNews' && '국제 뉴스'}
                {activePopup === 'companyNews' && '기업 뉴스'}
                {activePopup === 'recommendation' && '추천 종목'}
              </h2>
              <button
                onClick={() => setActivePopup(null)}
                className="text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* TODO(신입): 팝업별 전용 UI 구현 */}
            {activePopup === 'globalNews' && (
              <div className="text-gray-300">
                {currentGlobalNews
                  ? (
                    <div>
                      <p className="font-bold mb-1">📰 {currentGlobalNews.headline}</p>
                      <p className="text-xs text-gray-400">{currentGlobalNews.detail}</p>
                    </div>
                  )
                  : '이번 라운드 국제 뉴스가 없습니다.'}
              </div>
            )}

            {activePopup === 'companyNews' && (
              <div className="space-y-3 text-gray-300">
                {sectors.length === 0
                  ? <p className="text-gray-400">종목 정보가 없습니다.</p>
                  : sectors.map((sector) => {
                    const sectorNews = (currentNews || []).filter(n => n.sector === sector)
                    const hasNews = sectorNews.length > 0
                    return (
                      <div
                        key={sector}
                        className={`border-b border-gray-700 pb-2 ${!hasNews ? 'opacity-40' : ''}`}
                      >
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-700 mr-2">{sector}</span>
                        {hasNews
                          ? sectorNews.map((n) => (
                            <div key={n.id} className="mt-1">
                              <p className="font-bold text-sm">📰 {n.headline}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{n.detail}</p>
                            </div>
                          ))
                          : <p className="text-xs text-gray-500 mt-1">정보 없음</p>
                        }
                      </div>
                    )
                  })
                }
              </div>
            )}

            {activePopup === 'recommendation' && (
              <div className="text-gray-300">
                {/* TODO(신입): 추천 종목 로직 연결 */}
                추천 종목 정보를 표시합니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
