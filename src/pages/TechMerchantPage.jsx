// 기술상 — 배경 이미지 위에 ObjectGlow(차트지표 / 깜짝종목) + 네비 핫스팟
//
// UI 톤: 기술상.webp 배경에 맞춘 사이버 톤(블루 글로우)
// 디자인: docs/ref_user/화면구성안/기술상.webp (public/images/tech-merchant-bg.webp)
//
// 클릭 영역(핫스팟) — 모두 2560×1440 (16:9) 기준 % 좌표
//   · 좌측 차트 화면: 차트 지표 구매 팝업 (ObjectGlow)
//   · 우측 로봇: 깜짝 종목 판매상 팝업 (ObjectGlow)
//   · 우상단: 도움말 / 메인 버튼
//   · 우하단: 거래소 / 정보상 버튼
//
// ⚠️ 잠금 규칙: turn < TECH_MERCHANT_UNLOCK_TURN 이면 두 기능 클릭 시
//   "10턴 이후 사용 가능" 안내 팝업만 표시 (실제 구매 UI 비활성)

import { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

const TECH_MERCHANT_UNLOCK_TURN = 10

// 새 게임 시작당 1회 자동 도움말 노출용 sessionStorage 키
const TECH_HELP_SEEN_KEY = 'tech-merchant-help-seen'

// HMR 시 모듈이 재평가되면 이전 구독이 좀비로 남으므로 dispose에서 정리
if (typeof window !== 'undefined') {
  const unsubscribeTechHelp = useGameStore.subscribe((state, prevState) => {
    if (prevState && prevState.page === 'start' && state.page !== 'start') {
      sessionStorage.removeItem(TECH_HELP_SEEN_KEY)
    }
  })
  if (import.meta.hot) {
    import.meta.hot.dispose(() => unsubscribeTechHelp())
  }
}

// 지표별 구매 비용
const INDICATOR_COSTS = {
  ma: 600_000,
  bollinger: 900_000,
  macd: 1_200_000,
  obv: 600_000,
}
const INDICATOR_LABELS = {
  ma: 'MA5 + MA20',
  bollinger: '볼린저 밴드',
  macd: 'MACD',
  obv: 'OBV',
}
// 지표별 구매 가능 최소 턴
const INDICATOR_UNLOCK_TURN = { ma: 10, bollinger: 20, macd: 30, obv: 15 }
const UNLOCK_COST = 900_000

export default function TechMerchantPage() {
  const {
    navigateTo, cash, turn,
    hiddenStocks, unlockedStockIds,
    unlockStock, buyIndicator,
    maPurchased, bollingerPurchased, macdPurchased, obvPurchased,
  } = useGameStore()

  const [activePopup, setActivePopup] = useState(null) // 'indicators' | 'hiddenStocks' | 'locked'
  const [openHelp, setOpenHelp] = useState(false)

  const purchasedMap = { ma: maPurchased, bollinger: bollingerPurchased, macd: macdPurchased, obv: obvPurchased }
  const isLocked = turn < TECH_MERCHANT_UNLOCK_TURN

  // 기술상 첫 진입 시 도움말 자동 오픈
  useEffect(() => {
    if (typeof sessionStorage === 'undefined') return
    if (sessionStorage.getItem(TECH_HELP_SEEN_KEY)) return
    setOpenHelp(true)
    sessionStorage.setItem(TECH_HELP_SEEN_KEY, '1')
  }, [])

  // 잠금 상태면 안내 팝업, 아니면 실제 기능 팝업
  const handleFeatureClick = (popupKey) => {
    if (isLocked) setActivePopup('locked')
    else setActivePopup(popupKey)
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* 16:9 배경 컨테이너 */}
      <div
        className="relative aspect-[16/9]"
        style={{
          width: 'min(100vw, calc(100vh * 16 / 9))',
          height: 'min(100vh, calc(100vw * 9 / 16))',
          backgroundImage: "url('/images/tech-merchant-bg.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* 좌측 차트 화면 — 차트 지표 구매 (ObjectGlow) */}
        <ObjectGlow
          label="차트 지표 구매"
          style={{
            top: '15%',
            left: '2%',
            width: '32%',
            height: '60%',
          }}
          glowColor="cyan"
          onClick={() => handleFeatureClick('indicators')}
        />

        {/* 우측 로봇 — 깜짝 종목 판매상 (ObjectGlow) */}
        <ObjectGlow
          label="깜짝 종목 판매상"
          style={{
            top: '18%',
            left: '70%',
            width: '26%',
            height: '60%',
          }}
          glowColor="blue"
          onClick={() => handleFeatureClick('hiddenStocks')}
        />

        {/* 우상단: 도움말 / 메인 (둘 다 아래로 +4px / 945 기준) */}
        <Hotspot
          label="도움말"
          className="absolute rounded-[8.5px]"
          style={{
            top: 'calc(3% + 0.741%)',          /* +7px */
            right: 'calc(14.2% - 1.071%)',     /* 우측 +2px + 우측확장 16px / 1680 기준 */
            width: 'calc(9.6% + 0.952%)',      /* 가로 +16px (우측 확장) */
            height: 'calc(6.2% + 0.741%)',     /* 세로 +7px (아래 확장 / 945 기준) */
          }}
          onClick={() => setOpenHelp(true)}
        />
        <Hotspot
          label="메인으로"
          className="absolute rounded-[8.5px]"
          style={{
            top: 'calc(3% + 0.741%)',          /* +7px */
            right: 'calc(2.2% + 0.238%)',      /* 우측 +12px - 우측축소 16px / 1680 기준 */
            width: 'calc(10.4% - 0.952%)',     /* 가로 -16px (우측 축소) */
            height: 'calc(6.2% + 0.741%)',     /* 세로 +7px (아래 확장 / 945 기준) */
          }}
          onClick={() => navigateTo('main')}
        />

        {/* 우하단: 거래소 / 정보상 (거래소: 누적 좌 +82px, 정보상: 누적 좌 +40px / 1680 기준) */}
        <Hotspot
          label="거래소"
          className="absolute rounded-[8.5px]"
          style={{
            bottom: 'calc(5% - 0.423%)',          /* 아래로 +4px (3 + 1 / 945 기준) */
            right: 'calc(14.2% + 2.500%)',        /* 누적 좌 +42px (62 - 20, 우측 이동) */
            width: 'calc(10.2% + 2.381%)',        /* 가로 +40px (30 + 10 / 1680 기준) */
            height: 'calc(6.4% + 1.058%)',        /* 세로 +10px (위 6 + 아래 4 / 945 기준) */
          }}
          onClick={() => navigateTo('market')}
        />
        <Hotspot
          label="정보상"
          className="absolute rounded-[8.5px]"
          style={{
            bottom: 'calc(5% - 0.423%)',          /* 아래로 +4px (2 + 2 / 945 기준) */
            right: 'calc(2.2% + 1.190%)',         /* 누적 좌 +20px (50 - 30, 우측 확장 반영) */
            width: 'calc(10.4% + 1.786%)',        /* 가로 +30px (오른쪽 확장 / 1680 기준) */
            height: 'calc(6.4% + 1.058%)',        /* 세로 +10px (위 6 + 아래 4 / 945 기준) */
          }}
          onClick={() => navigateTo('infoMerchant')}
        />

        {/* 도움말 오버레이 */}
        {openHelp && <HelpOverlay onClose={() => setOpenHelp(false)} />}
      </div>

      {/* 팝업 */}
      {activePopup && (
        <PopupOverlay
          activePopup={activePopup}
          turn={turn}
          cash={cash}
          purchasedMap={purchasedMap}
          hiddenStocks={hiddenStocks}
          unlockedStockIds={unlockedStockIds}
          buyIndicator={buyIndicator}
          unlockStock={unlockStock}
          onClose={() => setActivePopup(null)}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// 핫스팟 — 배경 이미지 위 투명 클릭 영역 + hover 글로우 테두리
// ─────────────────────────────────────────────────────────
function Hotspot({ className, style, label, onClick, glowColor = 'cyan' }) {
  const glow = {
    cyan: 'group-hover:shadow-[inset_0_0_25px_rgba(34,211,238,0.35),0_0_25px_rgba(34,211,238,0.35)] group-hover:border-cyan-300',
    blue: 'group-hover:shadow-[inset_0_0_25px_rgba(59,130,246,0.35),0_0_25px_rgba(59,130,246,0.35)] group-hover:border-blue-300',
    emerald: 'group-hover:shadow-[inset_0_0_25px_rgba(52,211,153,0.35),0_0_25px_rgba(52,211,153,0.35)] group-hover:border-emerald-300',
    amber: 'group-hover:shadow-[inset_0_0_25px_rgba(251,191,36,0.35),0_0_25px_rgba(251,191,36,0.35)] group-hover:border-amber-300',
  }[glowColor]

  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{ outline: 'none', ...style }}
      className={`${className} group focus:outline-none transition-all duration-150 cursor-pointer`}
    >
      <span
        className={`absolute inset-0 rounded-[inherit] border-2 border-transparent transition-all duration-150 pointer-events-none ${glow}`}
      />
    </button>
  )
}

// ─────────────────────────────────────────────────────────
// ObjectGlow — 사각 테두리 없이 호버 시 radial 그라디언트 글로우만 떠오름
// ─────────────────────────────────────────────────────────
function ObjectGlow({ style, label, onClick, glowColor = 'cyan' }) {
  const rgb = {
    cyan: '34,211,238',
    blue: '59,130,246',
    emerald: '52,211,153',
    amber: '251,191,36',
  }[glowColor]

  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{ outline: 'none', ...style }}
      className="group absolute focus:outline-none cursor-pointer"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, rgba(${rgb},0.55) 0%, rgba(${rgb},0.25) 35%, rgba(${rgb},0.08) 60%, transparent 80%)`,
          filter: 'blur(6px)',
        }}
      />
    </button>
  )
}

// ─────────────────────────────────────────────────────────
// 팝업 컨테이너 — 차트지표 / 깜짝종목 / 잠금 안내 공통 모달
// ─────────────────────────────────────────────────────────
function PopupOverlay({
  activePopup, turn, cash, purchasedMap,
  hiddenStocks, unlockedStockIds, buyIndicator, unlockStock,
  onClose,
}) {
  const title = {
    indicators: '차트 지표 구매',
    hiddenStocks: '깜짝 종목 판매상',
    locked: '아직 사용할 수 없는 기능',
  }[activePopup]

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/60 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(34,211,238,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-cyan-300 font-mono tracking-wider">{title}</h2>
          <button
            onClick={onClose}
            style={{ outline: 'none' }}
            className="text-cyan-300 hover:text-cyan-100 text-xl w-8 h-8 flex items-center justify-center transition-all duration-150 focus:outline-none"
          >
            ✕
          </button>
        </div>

        {activePopup !== 'locked' && (
          <div className="flex items-center justify-between bg-slate-800/70 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm mb-4">
            <span className="text-cyan-300/70 font-mono text-xs tracking-wider">보유 현금</span>
            <span className="font-bold text-cyan-100 tabular-nums">{cash.toLocaleString()}원</span>
          </div>
        )}

        {activePopup === 'locked' && <LockedView turn={turn} />}
        {activePopup === 'indicators' && (
          <IndicatorsView turn={turn} cash={cash} purchasedMap={purchasedMap} buyIndicator={buyIndicator} />
        )}
        {activePopup === 'hiddenStocks' && (
          <HiddenStocksView
            cash={cash}
            hiddenStocks={hiddenStocks}
            unlockedStockIds={unlockedStockIds}
            unlockStock={unlockStock}
          />
        )}
      </div>
    </div>
  )
}

// 잠금 안내 — 10턴 이전 클릭 시
function LockedView({ turn }) {
  const remaining = TECH_MERCHANT_UNLOCK_TURN - turn
  return (
    <div className="bg-slate-800/70 border border-cyan-500/30 rounded-lg p-6 text-center">
      <p className="text-5xl mb-3">🔒</p>
      <p className="font-bold text-cyan-100 mb-2">10턴 이후에 사용 가능합니다</p>
      <p className="text-xs text-cyan-300/70 leading-relaxed">
        차트 지표 구매와 깜짝 종목 판매상은
        <br />
        게임 <span className="text-cyan-200 font-bold">10턴</span> 이후부터 열립니다.
      </p>
      <p className="text-xs text-cyan-300/50 mt-3 font-mono">
        현재 {turn}턴 · {remaining > 0 ? `${remaining}턴 남음` : '곧 해금'}
      </p>
    </div>
  )
}

// 차트 지표 구매 뷰
function IndicatorsView({ turn, cash, purchasedMap, buyIndicator }) {
  return (
    <div className="space-y-2">
      <p className="text-cyan-300/70 text-xs font-mono mb-3 tracking-wider">
        📊 구매한 지표는 거래소 차트에 영구 표시됩니다.
      </p>
      {Object.entries(INDICATOR_COSTS).map(([key, cost]) => {
        const minTurn = INDICATOR_UNLOCK_TURN[key]
        const locked = turn < minTurn
        return (
          <div key={key} className="flex items-center justify-between bg-slate-800/70 border border-cyan-500/30 rounded-lg p-3">
            <div>
              <p className="font-bold text-sm text-cyan-100">{INDICATOR_LABELS[key]}</p>
              <p className="text-xs text-cyan-300/70 mt-0.5">
                {locked
                  ? `${minTurn}턴 이후 구매 가능 (현재 ${turn}턴)`
                  : `${cost.toLocaleString()}원`}
              </p>
            </div>
            {purchasedMap[key] ? (
              <span className="text-emerald-400 text-sm font-bold font-mono">구매완료</span>
            ) : locked ? (
              <span className="text-slate-500 text-sm font-mono">잠김</span>
            ) : (
              <button
                onClick={() => buyIndicator(key, cost)}
                disabled={cash < cost}
                style={{ outline: 'none' }}
                className="px-3 py-1.5 bg-cyan-600/80 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 rounded text-sm font-bold transition-all duration-150 focus:outline-none border border-cyan-400/50"
              >
                {cash < cost ? '잔액부족' : '구매'}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

// 깜짝 종목 판매상 뷰
function HiddenStocksView({ cash, hiddenStocks, unlockedStockIds, unlockStock }) {
  return (
    <div className="space-y-2">
      <p className="text-cyan-300/70 text-xs font-mono mb-3 tracking-wider">
        🎲 예측 불가능한 비공개 종목 — 유료 공개 후 거래 가능
      </p>
      {hiddenStocks.length === 0 ? (
        <p className="text-cyan-300/60 text-sm text-center py-6 font-mono">비공개 종목이 없습니다.</p>
      ) : (
        hiddenStocks.map((stock) => {
          const isUnlocked = unlockedStockIds.includes(stock.id)
          return (
            <div
              key={stock.id}
              className="flex justify-between items-center bg-slate-800/70 border border-cyan-500/30 rounded-lg p-3"
            >
              <span className="font-bold text-cyan-100">
                {isUnlocked ? stock.name : '???'}
              </span>
              {isUnlocked ? (
                <span className="text-emerald-400 text-sm font-bold font-mono">공개됨</span>
              ) : (
                <button
                  onClick={() => unlockStock(stock.id, UNLOCK_COST)}
                  disabled={cash < UNLOCK_COST}
                  style={{ outline: 'none' }}
                  className="px-3 py-1.5 bg-cyan-600/80 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 rounded text-sm font-bold transition-all duration-150 focus:outline-none border border-cyan-400/50"
                >
                  {UNLOCK_COST.toLocaleString()}원
                </button>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// 도움말 오버레이 — 각 핫스팟에 풍선으로 설명
// ─────────────────────────────────────────────────────────
function HelpOverlay({ onClose }) {
  return (
    <div className="absolute inset-0 z-20" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/95 text-cyan-200 text-sm px-4 py-2 rounded-lg border-2 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.4)] pointer-events-none">
        💡 화면 아무 곳이나 클릭하면 닫힙니다
      </div>

      {/* 차트 지표 (위로 -100px / 945 기준) */}
      <HelpBubble style={{ top: 'calc(46% - 10.582%)', left: '17%', transform: 'translateX(-50%)' }} arrow="down">
        <strong className="text-cyan-300 text-base block">📊 차트 지표 구매</strong>
        <p className="text-xs mt-1 text-cyan-100">
          MA · 볼린저밴드 · MACD · OBV
          <br />
          거래소 차트에 영구 적용
        </p>
      </HelpBubble>

      {/* 깜짝 종목 (위로 -100px / 좌 -40px / 1680·945 기준) */}
      <HelpBubble style={{ top: 'calc(50% - 10.582%)', left: 'calc(83% - 2.381%)', transform: 'translateX(-50%)' }} arrow="down">
        <strong className="text-blue-300 text-base block">🎲 깜짝 종목 판매상</strong>
        <p className="text-xs mt-1 text-cyan-100">
          비공개 종목을 유료 공개
          <br />
          하이리스크·하이리턴 기회
        </p>
      </HelpBubble>
    </div>
  )
}

function HelpBubble({ style, arrow, children }) {
  return (
    <div
      style={style}
      className="absolute bg-slate-900/95 text-cyan-100 border-2 border-cyan-400 rounded-lg px-4 py-3 shadow-[0_0_25px_rgba(34,211,238,0.5)] max-w-[14rem] pointer-events-none"
    >
      {children}
      {arrow === 'down' && (
        <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-cyan-400" />
      )}
    </div>
  )
}
