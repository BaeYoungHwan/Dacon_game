// 게임 허브 화면 — 잔고/보유종목 확인 + 장소 이동 + 라운드 진행
// 배치: TurnControl(상단) | 장소이동버튼(중앙) | Portfolio(하단) | NewsPanel
// 참고: docs/design-docs/props-spec.md

import { useGameStore } from '../store/gameStore'
import { progressTurn } from '../lib/gameLogic'
import stocks from '../data/stocks.json'
import TurnControl from '../components/game/TurnControl'
import NewsPanel from '../components/game/NewsPanel'
import Portfolio from '../components/game/Portfolio'

export default function GamePage() {
  const {
    turn, totalTurns, cash, portfolio, prices,
    currentNews, currentGlobalNews,
    activeStocks, hiddenStocks, nextTurn, navigateTo,
  } = useGameStore()

  const handleNextTurn = () => {
    const result = progressTurn(turn, [...activeStocks, ...hiddenStocks])
    nextTurn(result)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <TurnControl
        turn={turn}
        totalTurns={totalTurns}
        onNextTurn={handleNextTurn}
      />

      {/* TODO(신입): 장소 이동 버튼 3개 — 이미지 카드 형태로 교체 */}
      <div className="flex gap-3 my-6">
        <button
          onClick={() => navigateTo('market')}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-all duration-150"
        >
          거래소
        </button>
        <button
          onClick={() => navigateTo('infoMerchant')}
          className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-bold transition-all duration-150"
        >
          정보상
        </button>
        <button
          onClick={() => navigateTo('techMerchant')}
          className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-all duration-150"
        >
          기술상
        </button>
      </div>

      <Portfolio
        stocks={stocks}
        prices={prices}
        portfolio={portfolio}
        cash={cash}
      />

      <NewsPanel companyNews={currentNews} globalNews={currentGlobalNews} />
    </div>
  )
}
