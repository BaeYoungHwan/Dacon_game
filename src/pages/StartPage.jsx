// 떡상러쉬 시작 화면 — 닉네임 입력 + 게임 시작
// 명세 v2 §2: StartPage는 props 없음, store에서 setNickname/startGame 직접 호출
//
// 디자인: docs/ref_user/화면구성안/초기화면.png (v3 - 깨끗한 배경, 1678x937 ≈ 16:9)
//   - 한국거래소 배경 + 캐릭터 3명 + 타이틀("떡상러쉬"·부제) 모두 이미지에 포함
//   - 인풋·버튼은 이미지에 없음 → 캐릭터 발 아래 바닥 영역에 자유 배치 (겹침 없음)

import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import SettingsModal from '../components/game/SettingsModal'
import { SettingsIcon } from '../components/game/PageNav'

export default function StartPage() {
  const [nicknameInput, setNicknameInput] = useState('')
  const [openSettings, setOpenSettings] = useState(false)
  const setNickname = useGameStore((s) => s.setNickname)
  const startGame   = useGameStore((s) => s.startGame)

  // 닉네임 확정 + 게임 시작 — 명세 v2 §7 store 액션 호출
  const handleStart = () => {
    const trimmed = nicknameInput.trim()
    if (!trimmed) return
    setNickname(trimmed)
    startGame()
  }

  return (
    <div className="min-h-screen w-full bg-amber-50 flex items-center justify-center overflow-hidden">
      {/* 이미지 비율(1678:937 ≈ 16:9) 유지 컨테이너 */}
      <div
        className="relative w-full max-w-[1600px] aspect-[1678/937]"
        style={{
          backgroundImage: "url('/images/start-bg.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* 설정 버튼 — 우상단, StartPage 앰버/스톤 톤에 맞춤 (SettingsModal은 슬레이트/시안 그대로 재사용) */}
        <button
          onClick={() => setOpenSettings(true)}
          aria-label="설정"
          className="group absolute top-[3%] right-[3%] z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-stone-800 to-stone-900 hover:from-stone-700 hover:to-stone-800 text-amber-100 hover:text-amber-50 border-2 border-amber-700 hover:border-amber-500 shadow-2xl transition-all duration-150"
          style={{ boxShadow: '0 0 18px rgba(180,130,60,0.35), inset 0 0 10px rgba(180,130,60,0.15)' }}
        >
          <SettingsIcon />
          <span className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-amber-700 bg-stone-900/95 px-2 py-0.5 text-[11px] font-mono tracking-wider text-amber-100 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            설정
          </span>
        </button>

        {/* 인풋 — 캐릭터 발 아래 바닥 영역 (컨테이너 하단에서 10% 위) */}
        <input
          type="text"
          value={nicknameInput}
          onChange={(e) => setNicknameInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          maxLength={12}
          placeholder="투자자명을 입력하고 입성하십시오"
          className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[36%] px-4 py-1.5 bg-gradient-to-b from-stone-800 to-stone-900 text-amber-100 placeholder-amber-200/80 border-2 border-amber-700 rounded text-center text-xs sm:text-sm md:text-base shadow-2xl focus:outline-none focus:border-amber-400 transition-all duration-150"
        />

        {/* 버튼 — 인풋 바로 아래 (컨테이너 하단에서 2% 위) */}
        <button
          onClick={handleStart}
          disabled={!nicknameInput.trim()}
          className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[26%] py-1.5 bg-gradient-to-b from-stone-800 to-stone-900 hover:from-stone-700 hover:to-stone-800 disabled:opacity-50 disabled:cursor-not-allowed text-amber-100 border-2 border-amber-700 rounded shadow-2xl transition-all duration-150"
        >
          <p className="text-sm sm:text-base md:text-lg font-bold tracking-widest leading-tight">GAME START</p>
          <p className="text-[9px] sm:text-[10px] md:text-xs text-amber-200/80 leading-tight">게임 시작</p>
        </button>
      </div>

      {openSettings && <SettingsModal onClose={() => setOpenSettings(false)} />}
    </div>
  )
}
