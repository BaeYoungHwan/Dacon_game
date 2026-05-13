// TODO(신입): 닉네임 입력 폼 + 게임 시작 버튼 UI 구현
// Props: 없음 (store에서 직접 사용)
// 참고: docs/design-docs/props-spec.md

import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export default function StartPage() {
  const [input, setInput] = useState('')
  const setNickname = useGameStore((s) => s.setNickname)
  const startGame = useGameStore((s) => s.startGame)

  const handleStart = () => {
    if (!input.trim()) return
    setNickname(input.trim())
    startGame()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-2">K-Stock Merchant 📈</h1>
      <p className="text-gray-400 mb-8">50라운드, 자산을 불려라!</p>

      {/* TODO: 디자인 개선 */}
      <input
        type="text"
        placeholder="닉네임 입력"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
        className="w-64 px-4 py-2 rounded bg-gray-800 border border-gray-600 text-white mb-4 focus:outline-none focus:border-blue-400"
        maxLength={12}
      />
      <button
        onClick={handleStart}
        disabled={!input.trim()}
        className="w-64 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded font-bold transition-all duration-150"
      >
        게임 시작
      </button>
    </div>
  )
}
