// TODO(신입): 게임 메인 화면 레이아웃 구성
// 배치: TurnControl(상단) | StockBoard(좌) + Portfolio(우) | NewsPanel(하단)
// 참고: docs/design-docs/props-spec.md

import { useGameStore } from '../store/gameStore'
import { progressTurn } from '../lib/gameLogic'
import stocks from '../data/stocks.json'
import StockBoard from '../components/game/StockBoard'
import NewsPanel from '../components/game/NewsPanel'
import TurnControl from '../components/game/TurnControl'
import Portfolio from '../components/game/Portfolio'

export default function GamePage() {
  const { turn, totalTurns, cash, portfolio, prices, currentNews, activeStocks, hiddenStocks, nextTurn, buyStock, sellStock } =
    useGameStore()

  const handleNextTurn = () => {
    const result = progressTurn(turn, [...activeStocks, ...hiddenStocks])
    nextTurn(result)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* TODO(신입): 레이아웃 개선 — 모바일/PC 반응형 */}

      <TurnControl
        turn={turn}
        totalTurns={totalTurns}
        onNextTurn={handleNextTurn}
      />

      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <StockBoard
          stocks={stocks}
          prices={prices}
          portfolio={portfolio}
          onBuy={buyStock}
          onSell={sellStock}
        />
        <Portfolio
          stocks={stocks}
          prices={prices}
          portfolio={portfolio}
          cash={cash}
        />
      </div>

      <NewsPanel news={currentNews} />
    </div>
  )
}
