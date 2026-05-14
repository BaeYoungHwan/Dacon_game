<<<<<<< HEAD
// 떡상러쉬 게임 메인 화면 — NPC 3명 클릭으로 거래소·정보상·기술상 페이지 이동
// 화면 구조: 상단 이미지 영역(메인 비주얼 + NPC 클릭) | 하단 NewsPanel
//
// UI 톤: NYSE 거래소 배경에 맞춘 슬레이트(slate) + 시안(cyan) 디지털 보드 톤
//   - 좌측(수직 중앙): ROUND + 자산 정보(현금·주식 평가액·총 자산) + HOLDINGS 보유 종목 리스트
//   - 우상단: 도움말 / 설정 / 종료 SVG 아이콘 3개 (hover 시 라벨 풍선)
//   - 우하단: ▶ 다음 주 버튼
//   - 중앙 NPC 3: hover 시 머리 위 라벨 풍선 + 시안 광채
//
// 디자인: docs/ref_user/화면구성안/메인화면.png (1695x928 ≈ 1.827:1)
//
// ⚠️ 배영환 영역 의존:
//   - store.prices, store.navigateTo(target), store.resetGame() 액션
//   - progressTurn 시그니처 잠정
=======
// 게임 허브 화면 — 잔고/보유종목 확인 + 장소 이동 + 라운드 진행
// 배치: 아이콘(우상단) | TurnControl(상단) | 장소이동버튼(중앙) | Portfolio(하단) | TipBox
// 참고: docs/design-docs/props-spec.md
>>>>>>> a30fc0e9d89ac8ddbda9f2051f2d4bee47ae975f

import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { progressTurn } from '../lib/gameLogic'
import stocks from '../data/stocks.json'
<<<<<<< HEAD
import NewsPanel from '../components/game/NewsPanel'
=======
import TurnControl from '../components/game/TurnControl'
import Portfolio from '../components/game/Portfolio'
import TipBox from '../components/game/TipBox'
import HelpModal from '../components/game/HelpModal'
import SettingsModal from '../components/game/SettingsModal'

// 기술상 접근 가능 최소 턴
const TECH_MERCHANT_UNLOCK_TURN = 10
>>>>>>> a30fc0e9d89ac8ddbda9f2051f2d4bee47ae975f

export default function GamePage() {
  const [showHelp, setShowHelp] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const {
    turn, totalTurns, cash, portfolio, prices,
<<<<<<< HEAD
    activeStocks, hiddenStocks,
    currentNews, currentGlobalNews,
    nextTurn, navigateTo, resetGame,
=======
    activeStocks, hiddenStocks, nextTurn, navigateTo,
>>>>>>> a30fc0e9d89ac8ddbda9f2051f2d4bee47ae975f
  } = useGameStore()

  const [openHelp,     setOpenHelp]     = useState(false)
  const [openSettings, setOpenSettings] = useState(false)

  const handleNextTurn = () => {
    const result = progressTurn(turn, [...activeStocks, ...hiddenStocks])
    nextTurn(result)
  }

<<<<<<< HEAD
  const handleExit = () => {
    if (window.confirm('게임을 종료하고 초기 화면으로 돌아가시겠습니까?')) {
      resetGame()
    }
  }
=======
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
>>>>>>> a30fc0e9d89ac8ddbda9f2051f2d4bee47ae975f

  // 보유 종목 리스트 + 평가액 + 총자산 계산
  const holdings = stocks.filter((s) => (portfolio[s.id] || 0) > 0)
  const stockValue = holdings.reduce((sum, s) => {
    const qty = portfolio[s.id]
    const price = (prices && prices[s.id]) || s.price || 0
    return sum + qty * price
  }, 0)
  const totalAssets = cash + stockValue

  return (
    <div className="min-h-screen w-full flex flex-col bg-stone-900">
      {/* 상단: 이미지 영역 + 오버레이 UI */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div
          className="relative w-full max-w-[1695px] aspect-[1695/928]"
          style={{
            backgroundImage: "url('/images/game-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
<<<<<<< HEAD
          {/* 좌측(수직 중앙): ROUND + 자산 + HOLDINGS */}
          <div className="absolute top-1/2 left-4 -translate-y-1/2 bg-slate-900/85 backdrop-blur rounded-xl px-10 py-8 text-slate-100 z-10 border-2 border-cyan-500/60 shadow-[0_0_25px_rgba(34,211,238,0.15)] w-80">
            <p className="text-sm text-cyan-300/80 tracking-wider">ROUND</p>
            <p className="text-5xl font-bold leading-tight mb-4 text-cyan-100">{turn} / {totalTurns}</p>

            {/* 자산 정보 — 현금 / 주식 평가액 / 총 자산 */}
            <div className="border-t border-cyan-700/40 pt-3 space-y-2">
              <AssetRow label="현금" value={cash} />
              <AssetRow label="주식 평가액" value={stockValue} />
              <div className="border-t border-cyan-700/40 pt-2 mt-1">
                <AssetRow label="총 자산" value={totalAssets} highlight />
              </div>
            </div>

            {/* HOLDINGS — 보유 종목 리스트 (스크롤) */}
            <p className="text-sm text-cyan-300/80 tracking-wider mt-4 mb-2">HOLDINGS</p>
            <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
              {holdings.length === 0 ? (
                <p className="text-xs text-slate-400 italic">보유 종목 없음</p>
              ) : (
                holdings.map((s) => (
                  <div key={s.id} className="flex justify-between items-baseline text-sm">
                    <span className="truncate text-slate-200">{s.mimeName || s.name || s.id}</span>
                    <span className="text-cyan-200 ml-2 flex-shrink-0 text-xs">{portfolio[s.id]}주</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 우상단: 도움말 / 설정 / 종료 (hover 시 라벨) */}
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <IconButton icon={<HelpIcon />}     label="도움말" onClick={() => setOpenHelp(true)} />
            <IconButton icon={<SettingsIcon />} label="설정"   onClick={() => setOpenSettings(true)} />
            <IconButton icon={<ExitIcon />}     label="종료"   onClick={handleExit} />
          </div>

          {/* 우하단: 다음 주 버튼 */}
          <button
            onClick={handleNextTurn}
            style={{ outline: 'none' }}
            className="absolute bottom-3 right-3 px-6 py-3 bg-gradient-to-b from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 text-slate-100 border-2 border-cyan-500/60 rounded shadow-[0_0_20px_rgba(34,211,238,0.25)] transition-all duration-150 z-10 focus:outline-none"
          >
            <p className="text-base font-bold tracking-widest">다음 주 ▶</p>
          </button>

          {/* NPC 클릭 영역 */}
          <NPCHotspot left="35%" label="거래소" subLabel="시장 분석가"   onClick={() => navigateTo('market')} />
          <NPCHotspot left="48%" label="정보상" subLabel="정보 브로커"   onClick={() => navigateTo('infoMerchant')} />
          <NPCHotspot left="62%" label="기술상" subLabel="퀀트 테크니션" onClick={() => navigateTo('techMerchant')} />
        </div>
=======
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
>>>>>>> a30fc0e9d89ac8ddbda9f2051f2d4bee47ae975f
      </div>

      {/* 하단: 뉴스 패널 (명세 v2 §3 companyNews + globalNews 분리) */}
      <div className="bg-slate-950 border-t border-cyan-900/50 p-2">
        <NewsPanel companyNews={currentNews} globalNews={currentGlobalNews} />
      </div>

<<<<<<< HEAD
      {/* 모달 */}
      {openHelp     && <HelpModal     onClose={() => setOpenHelp(false)} />}
      {openSettings && <SettingsModal onClose={() => setOpenSettings(false)} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// 내부 헬퍼 컴포넌트 — props만 받음 (명세 v2 §8 컴포넌트 원칙)
// ─────────────────────────────────────────────────────────

// 좌측 카드 자산 한 줄 — 라벨 + 금액 (highlight=true → 총 자산 강조)
function AssetRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className={`text-sm ${highlight ? 'text-cyan-300 font-bold' : 'text-cyan-300/70'}`}>{label}</span>
      <span className={`font-bold ${highlight ? 'text-xl text-cyan-100' : 'text-base text-slate-100'}`}>
        {value.toLocaleString()}원
      </span>
    </div>
  )
}

// 우상단 아이콘 버튼 — SVG 아이콘 + hover 시 라벨 풍선
function IconButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ outline: 'none' }}
      className="relative group flex items-center justify-center bg-slate-900/85 hover:bg-slate-800 backdrop-blur rounded-lg w-12 h-12 border border-cyan-500/60 text-cyan-300 hover:text-cyan-200 transition-all duration-150 focus:outline-none focus:ring-0"
      aria-label={label}
    >
      {icon}
      <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-cyan-200 text-xs px-2 py-1 rounded border border-cyan-500/60 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none shadow-lg">
        {label}
      </span>
    </button>
  )
}

// NPC 클릭 영역 — 시안 광채 + 머리 위 라벨 풍선
function NPCHotspot({ left, label, subLabel, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ left, width: '14%', top: '42%', height: '55%', outline: 'none' }}
      className="absolute group rounded transition-all duration-150 focus:outline-none focus:ring-0 hover:bg-[radial-gradient(ellipse_at_center,_rgba(34,211,238,0.3)_0%,_transparent_65%)]"
    >
      <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none">
        <span className="block whitespace-nowrap bg-cyan-500 text-slate-900 font-bold text-xs px-3 py-1 rounded shadow-lg border-2 border-cyan-700">
          {label}
          <span className="text-slate-700 font-normal ml-1">· {subLabel}</span>
        </span>
        <span className="block w-0 h-0 mx-auto border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-cyan-700"></span>
      </span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────
// SVG 아이콘 (Heroicons outline 스타일)
// ─────────────────────────────────────────────────────────

function HelpIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 17.25h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.108 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function ExitIcon() {
  // 문 바깥으로 화살표 (logout 아이콘)
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────
// 모달 컴포넌트들
// ─────────────────────────────────────────────────────────

function ModalContainer({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 border-2 border-cyan-500/60 rounded-lg p-8 shadow-[0_0_40px_rgba(34,211,238,0.2)] max-w-md w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-cyan-300">{title}</h2>
        {children}
        <button
          onClick={onClose}
          style={{ outline: 'none' }}
          className="mt-6 w-full py-2 bg-cyan-700 hover:bg-cyan-600 rounded font-bold transition-all duration-150 focus:outline-none"
        >
          닫기
        </button>
      </div>
    </div>
  )
}

function HelpModal({ onClose }) {
  return (
    <ModalContainer title="도움말" onClose={onClose}>
      <ul className="space-y-3 text-sm">
        <li><strong className="text-cyan-400">🏛️ 거래소</strong> — 공개된 10종목을 매수/매도 (시장 분석가)</li>
        <li><strong className="text-cyan-400">📰 정보상</strong> — 기업/국제 뉴스·추천 종목 구매 (정보 브로커)</li>
        <li><strong className="text-cyan-400">🔧 기술상</strong> — 비공개 10종목을 유료로 공개·거래 (퀀트)</li>
        <li><strong className="text-cyan-400">▶ 다음 주</strong> — 라운드를 진행하고 가격을 갱신</li>
        <li><strong className="text-cyan-400">🚪 종료</strong> — 게임 초기화 후 시작 화면으로 이동</li>
      </ul>
    </ModalContainer>
  )
}

function SettingsModal({ onClose }) {
  const [bgm, setBgm] = useState(true)
  const [sfx, setSfx] = useState(true)
  return (
    <ModalContainer title="설정" onClose={onClose}>
      <div className="space-y-4">
        <ToggleRow label="배경음" value={bgm} onChange={setBgm} />
        <ToggleRow label="효과음" value={sfx} onChange={setSfx} />
      </div>
      <p className="text-xs text-cyan-300/60 mt-4">⚠️ 음악 시스템은 추후 추가 예정 — 현재는 토글 UI만 동작</p>
    </ModalContainer>
  )
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{ outline: 'none' }}
        className={`relative w-12 h-6 rounded-full transition-all duration-150 focus:outline-none ${value ? 'bg-cyan-500' : 'bg-slate-600'}`}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-150 ${value ? 'left-6' : 'left-0.5'}`}
        />
      </button>
=======
      <TipBox />

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
>>>>>>> a30fc0e9d89ac8ddbda9f2051f2d4bee47ae975f
    </div>
  )
}
