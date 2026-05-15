// 한국거래소 — 좌5/우5 종목표 + 중앙 종목분석 홀로그램 + 좌하 주식구매·우하 주식판매 키오스크
//
// UI 톤: 한국거래소 KRX 디지털 보드 배경에 맞춘 시안 글로우
// 디자인: docs/ref_user/화면구성안/거래소.webp (public/images/market-bg.webp)
//
// 클릭 영역(핫스팟) — 모두 절대좌표 오버레이
//   · 좌측 종목 패널: 활성 10종목 중 1~5번 (행 클릭 → 종목분석 팝업 + 해당 종목 선택)
//   · 우측 종목 패널: 활성 10종목 중 6~10번 (동일)
//   · 중앙 종목분석 홀로그램: 분석 팝업(종목 카드 그리드)
//   · 좌하 주식구매 키오스크: 매수 팝업
//   · 우하 주식판매 키오스크: 매도 팝업
//   · 우상 도움말/메인 버튼: 도움말 모달 / 메인 화면 복귀
//   · 우하 정보상/기술상 버튼: 페이지 이동 (기술상은 10턴~ 해금)
//
// ⚠️ 배영환 영역 의존:
//   · store.activeStocks, store.prices, store.portfolio
//   · store.buyStock / sellStock / navigateTo

import { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import StockBoard from '../components/game/StockBoard'
import StockChart from '../components/game/StockChart'

// 도움말 자동 표시 여부 기억용 sessionStorage 키 — 한 게임당 1회 자동 노출
const MARKET_HELP_SEEN_KEY = 'market-help-seen'

// 모듈 로드 시점에 1회 구독 — 새 게임 시작(page: 'start' → 다른 페이지) 신호 감지 시 플래그 초기화
// → 게임을 새로 시작할 때마다 거래소 첫 진입에서 도움말이 다시 자동 노출됨
if (typeof window !== 'undefined') {
  useGameStore.subscribe((state, prevState) => {
    if (prevState && prevState.page === 'start' && state.page !== 'start') {
      sessionStorage.removeItem(MARKET_HELP_SEEN_KEY)
    }
  })
}

export default function MarketPage() {
  const {
    activeStocks, prices, portfolio, buyStock, sellStock, navigateTo,
    maPurchased, bollingerPurchased, macdPurchased, obvPurchased,
    cash,
  } = useGameStore()

  const [activePopup, setActivePopup] = useState(null) // 'analysis' | 'buy' | 'sell' | null
  const [selectedStockId, setSelectedStockId] = useState(null)
  const [openHelp, setOpenHelp] = useState(false)

  // 거래소 첫 진입 시 도움말 자동 오픈 — 이후 진입엔 노출 안 함
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (typeof sessionStorage === 'undefined') return
    if (sessionStorage.getItem(MARKET_HELP_SEEN_KEY)) return
    setOpenHelp(true)
    sessionStorage.setItem(MARKET_HELP_SEEN_KEY, '1')
  }, [])

  const closePopup = () => {
    setActivePopup(null)
    setSelectedStockId(null)
  }

  const selectedStock = activeStocks.find((s) => s.id === selectedStockId)

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* 배경 이미지 영역 — viewport 안에 들어가도록 width·height 모두 16:9로 클램프 */}
      <div
        className="relative aspect-[16/9]"
        style={{
          width: 'min(100vw, calc(100vh * 16 / 9))',
          height: 'min(100vh, calc(100vw * 9 / 16))',
          backgroundImage: "url('/images/market-bg.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
          {/* 중앙 종목분석 홀로그램 핫스팟 — 1920×1080 기준 px를 %로 환산하여 모든 창 크기에서 비례 유지 */}
          {/* 환산 기준: 가로 1px ≈ 0.0595% (컨테이너 1680px) / 세로 1px ≈ 0.1058% (컨테이너 945px) */}
          <Hotspot
            label="종목분석 열기"
            className="absolute rounded-[15px]"
            style={{
              top: 'calc(8% + 1.481%)',     /* +14px */
              left: 'calc(28% - 0.060%)',   /* -1px */
              width: 'calc(42% + 1.845%)',  /* +31px */
              height: 'calc(58% + 6.138%)', /* +58px */
            }}
            onClick={() => setActivePopup('analysis')}
          />

          {/* 좌하 주식구매 키오스크 핫스팟 — 좌측 130px 이동 */}
          <Hotspot
            label="주식 구매"
            className="absolute top-[55%] w-[16%] h-[35%] rounded-xl"
            style={{ left: 'calc(15% - 7.738%)' /* -130px */ }}
            glowColor="emerald"
            onClick={() => setActivePopup('buy')}
          />

          {/* 우하 주식판매 키오스크 핫스팟 — 우측 100px 이동 */}
          <Hotspot
            label="주식 판매"
            className="absolute top-[55%] w-[16%] h-[35%] rounded-xl"
            style={{ right: 'calc(15% - 5.952%)' /* -100px */ }}
            glowColor="red"
            onClick={() => setActivePopup('sell')}
          />

          {/* 우상단: 도움말 / 메인 핫스팟 */}
          <Hotspot
            label="도움말"
            className="absolute top-[3%] rounded-[8.5px]"
            style={{
              right: 'calc(14.5% - 2.202%)', /* -37px */
              width: 'calc(10% - 0.357%)',   /* -6px */
              height: 'calc(8% - 2.116%)',   /* -20px */
            }}
            onClick={() => setOpenHelp(true)}
          />
          <Hotspot
            label="메인으로"
            className="absolute top-[3%] rounded-[8.5px]"
            style={{
              right: 'calc(2% - 0.179%)',   /* -3px */
              width: 'calc(11% - 1.190%)',  /* -20px */
              height: 'calc(8% - 2.116%)',  /* -20px */
            }}
            onClick={() => navigateTo('main')}
          />

          {/* 우하단: 정보상 / 기술상 핫스팟 */}
          <Hotspot
            label="정보상"
            className="absolute w-[11%] rounded-lg"
            style={{
              right: 'calc(15% - 1.786%)', /* -30px */
              bottom: 'calc(2% - 0.529%)', /* -5px */
              height: 'calc(7% - 1.270%)', /* -12px */
            }}
            onClick={() => navigateTo('infoMerchant')}
          />
          <Hotspot
            label="기술상"
            className="absolute rounded-[10px]"
            style={{
              right: 'calc(2% - 0.595%)',  /* -10px */
              bottom: 'calc(2% - 0.741%)', /* -7px */
              width: 'calc(12% - 1.071%)', /* -18px */
              height: 'calc(7% - 1.058%)', /* -10px */
            }}
            onClick={() => navigateTo('techMerchant')}
          />

          {/* 도움말 오버레이 (배경 클릭 시 닫힘) */}
          {openHelp && <HelpOverlay onClose={() => setOpenHelp(false)} />}
      </div>

      {/* 팝업 — 종목분석 / 주식구매 / 주식판매 */}
      {activePopup && (
        <PopupOverlay
          activePopup={activePopup}
          selectedStock={selectedStock}
          selectedStockId={selectedStockId}
          setSelectedStockId={setSelectedStockId}
          activeStocks={activeStocks}
          prices={prices}
          portfolio={portfolio}
          cash={cash}
          buyStock={buyStock}
          sellStock={sellStock}
          maPurchased={maPurchased}
          bollingerPurchased={bollingerPurchased}
          macdPurchased={macdPurchased}
          obvPurchased={obvPurchased}
          onClose={closePopup}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// 핫스팟 — 배경 이미지 위 투명 클릭 영역 + hover 글로우/라벨
// ─────────────────────────────────────────────────────────
function Hotspot({ className, style, label, onClick, disabled, glowColor = 'cyan' }) {
  const glow = {
    cyan: 'group-hover:shadow-[inset_0_0_25px_rgba(34,211,238,0.35),0_0_25px_rgba(34,211,238,0.35)] group-hover:border-cyan-300',
    emerald: 'group-hover:shadow-[inset_0_0_25px_rgba(52,211,153,0.35),0_0_25px_rgba(52,211,153,0.35)] group-hover:border-emerald-300',
    red: 'group-hover:shadow-[inset_0_0_25px_rgba(248,113,113,0.35),0_0_25px_rgba(248,113,113,0.35)] group-hover:border-red-300',
  }[glowColor]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{ outline: 'none', ...style }}
      className={`${className} group focus:outline-none transition-all duration-150 ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <span
        className={`absolute inset-0 rounded-[inherit] border-2 border-transparent transition-all duration-150 pointer-events-none ${
          disabled ? '' : glow
        }`}
      />
    </button>
  )
}

// ─────────────────────────────────────────────────────────
// 팝업 컨테이너 — 분석/매수/매도 공통 모달
// ─────────────────────────────────────────────────────────
function PopupOverlay(props) {
  const {
    activePopup, selectedStock, selectedStockId, setSelectedStockId,
    activeStocks, prices, portfolio, cash, buyStock, sellStock,
    maPurchased, bollingerPurchased, macdPurchased, obvPurchased,
    onClose,
  } = props

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={
          'relative bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/60 rounded-xl p-6 w-full max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(34,211,238,0.2)] ' +
          (activePopup === 'analysis' ? 'max-w-3xl' : 'max-w-2xl')
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {activePopup === 'analysis' && selectedStockId && (
              <button
                onClick={() => setSelectedStockId(null)}
                style={{ outline: 'none' }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-cyan-500/40 rounded text-sm text-cyan-200 transition-all duration-150 focus:outline-none"
              >
                ← 목록
              </button>
            )}
            <h2 className="text-lg font-bold text-cyan-300 font-mono tracking-wider">
              {activePopup === 'analysis' && !selectedStockId && '종목 분석'}
              {activePopup === 'analysis' && selectedStock && `${selectedStock.name} 차트`}
              {activePopup === 'buy' && '주식 구매'}
              {activePopup === 'sell' && '주식 판매'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ outline: 'none' }}
            className="text-cyan-300 hover:text-cyan-100 text-xl w-8 h-8 flex items-center justify-center transition-all duration-150 focus:outline-none"
          >
            ✕
          </button>
        </div>

        {activePopup === 'analysis' && !selectedStockId && (
          <StockCardGrid stocks={activeStocks} prices={prices} onSelect={setSelectedStockId} />
        )}

        {activePopup === 'analysis' && selectedStockId && (
          <StockChart
            stockId={selectedStockId}
            stockName={selectedStock?.name ?? ''}
            maPurchased={maPurchased}
            bollingerPurchased={bollingerPurchased}
            macdPurchased={macdPurchased}
            obvPurchased={obvPurchased}
          />
        )}

        {(activePopup === 'buy' || activePopup === 'sell') && (
          <>
            <div className="flex items-center justify-between bg-slate-800/70 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm mb-4">
              <span className="text-cyan-300/80 font-mono tracking-wider">보유 현금</span>
              <span className="font-bold text-cyan-100 tabular-nums">{cash.toLocaleString()}원</span>
            </div>
            <StockBoard
              stocks={activeStocks}
              prices={prices}
              portfolio={portfolio}
              cash={cash}
              onBuy={activePopup === 'buy' ? buyStock : undefined}
              onSell={activePopup === 'sell' ? sellStock : undefined}
            />
          </>
        )}
      </div>
    </div>
  )
}

// 종목 카드 그리드 — 분석 팝업의 종목 선택 화면
function StockCardGrid({ stocks, prices, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {stocks.map((stock) => {
        const currentPrice = prices[stock.id] ?? stock.price
        const change = ((currentPrice - stock.price) / stock.price) * 100
        const isRise = change >= 0
        return (
          <button
            key={stock.id}
            onClick={() => onSelect(stock.id)}
            style={{ outline: 'none' }}
            className="bg-slate-800/70 hover:bg-slate-700/70 border border-cyan-500/30 hover:border-cyan-400 rounded-lg p-3 text-left transition-all duration-150 focus:outline-none"
          >
            <p className="font-semibold text-sm text-slate-100">{stock.name}</p>
            <p className="text-xs text-cyan-300/60 mb-2">{stock.sector}</p>
            <p className="font-bold text-cyan-100 tabular-nums">{currentPrice.toLocaleString()}원</p>
            <p className={`text-xs tabular-nums ${isRise ? 'text-rise' : 'text-fall'}`}>
              {isRise ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
            </p>
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// 도움말 오버레이 — 각 핫스팟에 풍선으로 설명 표시
// ─────────────────────────────────────────────────────────
function HelpOverlay({ onClose }) {
  return (
    <div className="absolute inset-0 z-20" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/95 text-cyan-200 text-sm px-4 py-2 rounded-lg border-2 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.4)] pointer-events-none">
        💡 화면 아무 곳이나 클릭하면 닫힙니다
      </div>

      <HelpBubble style={{ top: '38%', left: '50%', transform: 'translateX(-50%)' }} arrow="up">
        <strong className="text-cyan-300 text-base block">📊 종목분석</strong>
        <p className="text-xs mt-1 text-cyan-100">전체 종목 캔들스틱<br />지표(MA·볼린저·MACD·OBV) 표시</p>
      </HelpBubble>

      <HelpBubble style={{ top: '70%', left: 'calc(23% - 4.762%)', transform: 'translateX(-50%)' }} arrow="up">
        <strong className="text-emerald-300 text-base block">💰 주식 구매</strong>
        <p className="text-xs mt-1 text-cyan-100">활성 종목 매수</p>
      </HelpBubble>

      <HelpBubble style={{ top: '70%', right: 'calc(23% - 2.679%)', transform: 'translateX(50%)' }} arrow="up">
        <strong className="text-red-300 text-base block">💸 주식 판매</strong>
        <p className="text-xs mt-1 text-cyan-100">보유 종목 매도</p>
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
      {arrow === 'up' && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-l-transparent border-r-transparent border-b-cyan-400" />
      )}
    </div>
  )
}
