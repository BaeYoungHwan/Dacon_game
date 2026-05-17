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

import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { TopRightNav, BottomRightNav } from '../components/game/PageNav'

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
  ma: 200_000,
  bollinger: 600_000,
  macd: 800_000,
  obv: 400_000,
}
const INDICATOR_LABELS = {
  ma: 'MA5 + MA20',
  bollinger: '볼린저 밴드',
  macd: 'MACD',
  obv: 'OBV',
}
// 지표별 구매 가능 최소 턴
const INDICATOR_UNLOCK_TURN = { ma: 10, bollinger: 20, macd: 30, obv: 15 }

// ─────────────────────────────────────────────────────────
// 핫스팟 좌표 상수 — 팝업 내부 3-zone (추천종목.webp 프레임 공용)
//   close: 그려진 X 버튼 위 클릭 영역
//   topFrame: 상단 큰 프레임 (지표/종목/잠금 본문)
//   midFrame: 중단 작은 프레임 (보유 현금/턴 상태)
//   button: 하단 그린 버튼 (닫기)
// ─────────────────────────────────────────────────────────
const HOTSPOT = {
  popup: {
    // close right +8px: 좌측으로 8px 미세조정 (배경 X 버튼과 정렬)
    close:    { top: '6.5%', right: 'calc(3.5% + 8px)', width: '6.5%', height: '7.5%' },
    topFrame: { top: '14%',  left: '6%',    right: '6%',   height: '48%'  },
    midFrame: { top: '63%',  left: '6%',    right: '6%',   height: '10.5%' },
    button:   { top: '74%',  left: '6%',    right: '6%',   height: '15%'  },
  },
}
export default function TechMerchantPage() {
  const {
    navigateTo, cash, turn,
    packageStocks, unlockPackageStock,
    buyIndicator,
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

  // 반응형 스케일 — 1920×1080 고정 캔버스를 컨테이너 너비에 맞춰 transform: scale
  // 화면 축소 시 PageNav 버튼·ObjectGlow가 배경과 함께 비례 축소되어 비율 깨짐 방지
  // (GamePage 동일 패턴 — useLayoutEffect로 첫 paint부터 정확한 scale 적용)
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const w = el.clientWidth
      if (w > 0) setScale(w / 1920)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950 overflow-hidden animate-page-enter">
      {/* 16:9 배경 컨테이너 */}
      <div
        ref={containerRef}
        className="relative aspect-[16/9] overflow-hidden"
        style={{
          width: 'min(100vw, calc(100vh * 16 / 9))',
          height: 'min(100vh, calc(100vw * 9 / 16))',
          backgroundImage: "url('/images/tech-merchant-bg.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* 스케일 래퍼 — 1920×1080 고정 좌표로 모든 absolute 요소 그리고, 컨테이너 너비에 맞춰 비례 축소 */}
        <div
          className="absolute top-0 left-0"
          style={{
            width: '1920px',
            height: '1080px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
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

          {/* 우상단: 도움말 / 설정 / 메인 — PageNav 통일 스타일 */}
          <TopRightNav onHelp={() => setOpenHelp(true)} navigateTo={navigateTo} />

          {/* 우하단: 다른 페이지 이동 (거래소 / 정보상) */}
          <BottomRightNav current="techMerchant" navigateTo={navigateTo} />

          {/* 도움말 오버레이 */}
          {openHelp && <HelpOverlay onClose={() => setOpenHelp(false)} />}
        </div>
      </div>

      {/* 팝업 */}
      {activePopup && (
        <PopupOverlay
          activePopup={activePopup}
          turn={turn}
          cash={cash}
          purchasedMap={purchasedMap}
          packageStocks={packageStocks}
          unlockPackageStock={unlockPackageStock}
          buyIndicator={buyIndicator}
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
// 팝업 컨테이너 — 차트지표 / 깜짝종목 / 잠금 공통 모달
// 배경: 추천종목.webp (4:3 HUD 프레임 — InfoMerchantPage와 공유)
// 3-zone 레이아웃: 상단 본문 / 중단 상태 / 하단 그린 닫기 버튼
// ─────────────────────────────────────────────────────────
function PopupOverlay({
  activePopup, turn, cash, purchasedMap,
  packageStocks, unlockPackageStock, buyIndicator,
  onClose,
}) {
  const isLocked = activePopup === 'locked'
  const remaining = TECH_MERCHANT_UNLOCK_TURN - turn

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-page-enter"
      onClick={onClose}
    >
      <div
        className="relative"
        style={{
          width: 'min(72vw, calc(78vh * 4 / 3))',
          maxWidth: '46rem', /* 기존 max-w-2xl(42rem)에 살짝 여유 */
          aspectRatio: '4/3',
          backgroundImage: "url('/images/info-recommendation-bg.webp')",
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* X 버튼 — 좌표는 HOTSPOT.popup.close
            ObjectGlow의 soft halo 패턴 (MarketPage 매수/매도 닫기와 동일 톤): cyan 박스 윤곽 대신 부드러운 광채
            깜짝종목판매상은 blue 톤, 그 외(차트지표·잠금)는 cyan 톤 */}
        <ObjectGlow
          label="닫기"
          style={HOTSPOT.popup.close}
          glowColor={activePopup === 'hiddenStocks' ? 'blue' : 'cyan'}
          onClick={onClose}
        />

        {/* 상단 큰 프레임 — 본문 */}
        <div
          style={{ position: 'absolute', ...HOTSPOT.popup.topFrame }}
          className="p-3 overflow-hidden"
        >
          {isLocked && <LockedView turn={turn} />}
          {activePopup === 'indicators' && (
            <IndicatorsView turn={turn} cash={cash} purchasedMap={purchasedMap} buyIndicator={buyIndicator} />
          )}
          {activePopup === 'hiddenStocks' && (
            <HiddenStocksView cash={cash} packageStocks={packageStocks} unlockPackageStock={unlockPackageStock} />
          )}
        </div>

        {/* 중단 작은 프레임 — 보유 현금 / 잠금 카운트다운 (HUD LED 톤) */}
        <div
          style={{ position: 'absolute', ...HOTSPOT.popup.midFrame }}
          className="px-5 flex items-center justify-between"
        >
          {isLocked ? (
            <span className="w-full text-center text-sm md:text-base font-mono tracking-wider text-cyan-300/80">
              현재 <span className="text-cyan-50 font-bold tabular-nums drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{turn}</span>턴
              <span className="mx-2 text-cyan-500/40">·</span>
              {remaining > 0 ? (
                <><span className="text-emerald-300 font-bold tabular-nums">{remaining}</span>턴 남음</>
              ) : (
                <span className="text-emerald-300 font-bold">곧 해금</span>
              )}
            </span>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                <span className="text-sm md:text-base text-cyan-300/80 font-mono tracking-wider">보유 현금</span>
              </div>
              <span className="text-lg md:text-xl font-bold text-cyan-50 tabular-nums font-mono drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                {cash.toLocaleString()}원
              </span>
            </>
          )}
        </div>

        {/* 하단 그린 버튼 — 닫기 (배경 이미지 그린 버튼 위 클릭 타겟) */}
        <button
          onClick={onClose}
          style={{ outline: 'none', position: 'absolute', ...HOTSPOT.popup.button }}
          className="rounded-lg focus:outline-none transition-all duration-150 group cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
        >
          <span className="absolute inset-0 rounded-lg flex items-center justify-center group-hover:shadow-[inset_0_0_25px_rgba(52,211,153,0.45),0_0_30px_rgba(52,211,153,0.45)] transition-all duration-150">
            <span className="text-lg md:text-2xl font-bold font-mono tracking-widest text-emerald-50 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]">
              닫기 ✕
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}

// 잠금 안내 — 자물쇠 + 안내 문구 (원본 한글 유지, 폰트만 키움)
function LockedView({ turn }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl md:text-7xl mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">🔒</p>
      <p className="font-bold text-cyan-50 text-xl md:text-2xl mb-3 font-mono tracking-wider drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
        10턴 이후에 사용 가능합니다
      </p>
      <p className="text-sm md:text-base text-cyan-100/85 leading-relaxed">
        차트 지표 구매와 깜짝 종목 판매상은
        <br />
        게임 <span className="text-emerald-300 font-bold">10턴</span> 이후부터 열립니다
      </p>
    </div>
  )
}

// 상태 LED 도트 — 색상별 (cyan: 사용가능 / emerald: 보유중 / slate: 잠금)
function StatusDot({ tone, pulse }) {
  const cls = {
    cyan:    'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]',
    emerald: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]',
    slate:   'bg-slate-500 shadow-[0_0_4px_rgba(100,116,139,0.6)]',
  }[tone]
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cls} ${pulse ? 'animate-pulse' : ''}`} />
}

// 차트 지표 구매 — HUD 톤 리스트 (한글 문구 유지)
function IndicatorsView({ turn, cash, purchasedMap, buyIndicator }) {
  const items = Object.entries(INDICATOR_COSTS).sort(
    ([a], [b]) => INDICATOR_UNLOCK_TURN[a] - INDICATOR_UNLOCK_TURN[b],
  )
  return (
    <div className="h-full flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-cyan">
      {items.map(([key, cost]) => {
        const minTurn  = INDICATOR_UNLOCK_TURN[key]
        const locked   = turn < minTurn
        const purchased = purchasedMap[key]
        const tone = purchased ? 'emerald' : locked ? 'slate' : 'cyan'
        return (
          <div
            key={key}
            className={`flex items-center justify-between bg-slate-900/55 border rounded-lg px-4 py-3 shadow-[inset_0_0_15px_rgba(34,211,238,0.06)] ${
              purchased ? 'border-emerald-500/50' : locked ? 'border-slate-600/40' : 'border-cyan-500/40'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <StatusDot tone={tone} pulse={!locked && !purchased} />
              <div className="min-w-0">
                <p className="font-bold text-base text-cyan-50 truncate font-mono tracking-wider">{INDICATOR_LABELS[key]}</p>
                <p className="text-xs text-cyan-300/80 mt-0.5 font-mono tabular-nums">
                  {locked
                    ? <>{minTurn}턴 이후 구매 가능 · 현재 <span className="text-cyan-100 font-bold">{turn}</span>턴</>
                    : <span className="text-yellow-200/90">{cost.toLocaleString()}원</span>}
                </p>
              </div>
            </div>
            {purchased ? (
              <span className="text-emerald-200 text-xs font-bold font-mono px-3 py-1.5 bg-emerald-900/40 border border-emerald-400/60 rounded shadow-[0_0_10px_rgba(52,211,153,0.3)] tracking-wider">구매완료</span>
            ) : locked ? (
              <span className="text-slate-400 text-xs font-mono px-3 py-1.5 bg-slate-800/50 border border-slate-600/40 rounded tracking-wider">잠김</span>
            ) : (
              <button
                onClick={() => buyIndicator(key, cost)}
                disabled={cash < cost}
                style={{ outline: 'none' }}
                className="px-4 py-1.5 bg-gradient-to-b from-cyan-500 to-cyan-700 hover:from-cyan-400 hover:to-cyan-600 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 rounded text-sm font-bold transition-all duration-150 focus:outline-none border border-cyan-300/60 font-mono tracking-wider text-cyan-50 shadow-[0_0_10px_rgba(34,211,238,0.25)] disabled:shadow-none disabled:border-slate-600/40"
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

// 깜짝 종목 판매상 — HUD 톤 리스트 (한글 문구 유지)
function HiddenStocksView({ cash, packageStocks, unlockPackageStock }) {
  if (packageStocks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <p className="text-5xl mb-3 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">🎲</p>
        <p className="text-cyan-300/70 text-base font-mono tracking-wider">비공개 종목이 없습니다</p>
      </div>
    )
  }
  return (
    <div className="h-full flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-cyan">
      {packageStocks.map((stock, i) => {
        const canBuy = cash >= stock.packagePrice
        return (
          <div
            key={stock.id}
            className={`flex items-center justify-between bg-slate-900/55 border rounded-lg px-4 py-3 shadow-[inset_0_0_15px_rgba(34,211,238,0.06)] ${
              canBuy ? 'border-cyan-500/40' : 'border-slate-600/40'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <StatusDot tone={canBuy ? 'cyan' : 'slate'} pulse={canBuy} />
              <div className="min-w-0">
                <p className="font-bold text-base text-cyan-50 truncate font-mono tracking-wider">??? ({i + 1}번 종목)</p>
                <p className="text-xs text-cyan-300/80 mt-0.5 font-mono tabular-nums">
                  <span className="text-yellow-200/90">{stock.packagePrice.toLocaleString()}원</span> · {stock.quantity ?? 1}주 포함
                </p>
              </div>
            </div>
            <button
              onClick={() => unlockPackageStock(stock.id)}
              disabled={!canBuy}
              style={{ outline: 'none' }}
              className="px-4 py-1.5 bg-gradient-to-b from-cyan-500 to-cyan-700 hover:from-cyan-400 hover:to-cyan-600 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 rounded text-sm font-bold transition-all duration-150 focus:outline-none border border-cyan-300/60 font-mono tracking-wider text-cyan-50 shadow-[0_0_10px_rgba(34,211,238,0.25)] disabled:shadow-none disabled:border-slate-600/40"
            >
              {canBuy ? '구매' : '잔액부족'}
            </button>
          </div>
        )
      })}
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
