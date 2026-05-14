// 게임 허브 화면 — 잔고/보유종목 확인 + 장소 이동 + 라운드 진행
// 배치: 아이콘(우상단) | TurnControl(상단) | 장소이동버튼(중앙) | Portfolio(하단) | TipBox
// 참고: docs/design-docs/props-spec.md

import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { progressTurn } from '../lib/gameLogic'
import stocks from '../data/stocks.json'
import TurnControl from '../components/game/TurnControl'
import Portfolio from '../components/game/Portfolio'
import TipBox from '../components/game/TipBox'
import HelpModal from '../components/game/HelpModal'
import SettingsModal from '../components/game/SettingsModal'

// 기술상 접근 가능 최소 턴
const TECH_MERCHANT_UNLOCK_TURN = 10

export default function GamePage() {
  const [showHelp, setShowHelp] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const {
    turn, totalTurns, cash, portfolio, prices,
    activeStocks, hiddenStocks, nextTurn, navigateTo,
  } = useGameStore()

  const handleNextTurn = () => {
    const result = progressTurn(turn, [...activeStocks, ...hiddenStocks])
    nextTurn(result)
  }

  const techLocked = turn < TECH_MERCHANT_UNLOCK_TURN

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* 헤더 — 도움말/설정 아이콘 */}
      <div className="flex justify-end gap-2 mb-2">
        <button
          onClick={() => setShowHelp(true)}
          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center font-bold transition-all duration-150"
          title="게임 방법"
        >
          ?
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-all duration-150"
          title="설정"
        >
          ⚙
        </button>
      </div>

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
          onClick={() => !techLocked && navigateTo('techMerchant')}
          disabled={techLocked}
          className={`flex-1 py-3 rounded-lg font-bold transition-all duration-150 ${
            techLocked
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-500'
          }`}
        >
          {techLocked ? `기술상 (${TECH_MERCHANT_UNLOCK_TURN}턴~)` : '기술상'}
        </button>
      </div>

      <Portfolio
        stocks={stocks}
        prices={prices}
        portfolio={portfolio}
        cash={cash}
      />

      <TipBox />

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}
