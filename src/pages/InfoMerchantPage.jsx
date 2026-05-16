// 정보상 — 책상 위 3개 오브젝트(지구본/서류가방/태블릿)를 클릭하면 정보 팝업 표출
//
// UI 톤: 정보상.webp 배경에 맞춘 VIP 톤(시안 글로우)
// 디자인: docs/ref_user/화면구성안/정보상.webp (public/images/info-merchant-bg.webp)
//
// 클릭 영역(핫스팟) — 모두 1920×1080 기준 % 좌표
//   · 좌측 지구본: 국제 뉴스 팝업
//   · 중앙 서류가방: 기업 뉴스 팝업 (섹터별 뉴스 목록)
//   · 우측 태블릿: 내부 정보 팝업 (총 자산 5% 수수료 → 다음 주 최고 상승 종목 공개)
//   · 우상단: 도움말 / 메인 버튼
//   · 우하단: 거래소 / 기술상 버튼 (기술상은 10턴 해금)
//
// ⚠️ 배영환 영역 의존:
//   · store.currentNews, store.currentGlobalNews, store.activeStocks, store.prices, store.turn
//   · store.navigateTo

import { useState, useEffect, useMemo } from 'react'
import { useGameStore } from '../store/gameStore'

// 새 게임 시작당 1회 자동 도움말 노출용 sessionStorage 키
const INFO_HELP_SEEN_KEY = 'info-merchant-help-seen'

// HMR 시 모듈이 재평가되면 이전 구독이 좀비로 남으므로 dispose에서 정리
if (typeof window !== 'undefined') {
  const unsubscribeInfoHelp = useGameStore.subscribe((state, prevState) => {
    if (prevState && prevState.page === 'start' && state.page !== 'start') {
      sessionStorage.removeItem(INFO_HELP_SEEN_KEY)
    }
  })
  if (import.meta.hot) {
    import.meta.hot.dispose(() => unsubscribeInfoHelp())
  }
}

export default function InfoMerchantPage() {
  const {
    navigateTo,
    currentNews,
    currentGlobalNews,
    activeStocks,
    prices,
    cash,
    portfolio,
    turn,
    totalTurns,
    insiderTip,
    purchaseInsiderInfo,
  } = useGameStore()

  const [activePopup, setActivePopup] = useState(null) // 'globalNews' | 'companyNews' | 'recommendation'
  const [openHelp, setOpenHelp] = useState(false)

  // 정보상 첫 진입 시 도움말 자동 오픈
  useEffect(() => {
    if (typeof sessionStorage === 'undefined') return
    if (sessionStorage.getItem(INFO_HELP_SEEN_KEY)) return
    setOpenHelp(true)
    sessionStorage.setItem(INFO_HELP_SEEN_KEY, '1')
  }, [])

  // activeStocks에서 중복 없는 섹터 목록
  const sectors = useMemo(
    () => [...new Set((activeStocks || []).map((s) => s.sector))],
    [activeStocks],
  )

  // 총 자산의 5% 수수료 계산
  const insiderFee = useMemo(() => {
    const stockValue = (activeStocks || []).reduce((sum, s) => {
      return sum + (prices[s.id] ?? s.price ?? 0) * (portfolio[s.id] || 0)
    }, 0)
    return Math.floor((cash + stockValue) * 0.05)
  }, [activeStocks, prices, cash, portfolio])

  const isLastTurn    = turn >= totalTurns
  const alreadyBought = insiderTip?.purchasedAtTurn === turn
  const canAfford     = insiderFee <= cash

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950 overflow-hidden animate-page-enter">
      {/* 16:9 배경 컨테이너 */}
      <div
        className="relative aspect-[16/9]"
        style={{
          width: 'min(100vw, calc(100vh * 16 / 9))',
          height: 'min(100vh, calc(100vw * 9 / 16))',
          backgroundImage: "url('/images/info-merchant-bg.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* 좌측 지구본 영역 — 호버 시 radial 글로우 (우 +50px, 위 -25px) */}
        <ObjectGlow
          label="국제 뉴스"
          style={{
            top: 'calc(41.7% - 2.646%)',  /* -25px (945 기준) */
            left: 'calc(8.7% + 2.976%)',  /* +50px (1680 기준) */
            width: '13.6%',
            height: '29.6%',
          }}
          glowColor="cyan"
          onClick={() => setActivePopup('globalNews')}
        />

        {/* 중앙 서류가방 영역 — 호버 시 radial 글로우 (좌 -50px, 위 -20px) */}
        <ObjectGlow
          label="기업 뉴스"
          style={{
            top: 'calc(72% - 7.407%)',  /* -70px (945 기준) */
            left: 'calc(32% - 11.905%)', /* -200px (1680 기준) */
            width: '32%',
            height: '23%',
          }}
          glowColor="amber"
          onClick={() => setActivePopup('companyNews')}
        />

        {/* 우측 태블릿 영역 — 호버 시 radial 글로우 (좌 -200px) */}
        <ObjectGlow
          label="추천 종목"
          style={{
            top: 'calc(76% - 2.646%)',   /* -25px (945 기준) */
            left: 'calc(69% - 11.905%)', /* -200px (1680 기준) */
            width: '20%',
            height: '17%',
          }}
          glowColor="emerald"
          onClick={() => setActivePopup('recommendation')}
        />

        {/* 우상단: 도움말 / 메인 */}
        <Hotspot
          label="도움말"
          className="absolute top-[3%] rounded-[8.5px]"
          style={{
            right: 'calc(14.5% - 2.202%)',
            width: 'calc(10% - 0.357%)',
            height: 'calc(8% - 2.116%)',
          }}
          onClick={() => setOpenHelp(true)}
        />
        <Hotspot
          label="메인으로"
          className="absolute top-[3%] rounded-[8.5px]"
          style={{
            right: 'calc(2% - 0.179%)',
            width: 'calc(11% - 1.190%)',
            height: 'calc(8% - 2.116%)',
          }}
          onClick={() => navigateTo('main')}
        />

        {/* 우하단: 거래소 / 기술상 (거래소: 좌 +30 / 위 +30 / 우 +60 / 좌 +20 / 아래 +2 / 좌변 -15 / 윗변 +15) */}
        <Hotspot
          label="거래소"
          className="absolute rounded-lg"
          style={{
            right: 'calc(15% - 2.381%)',  /* 누적 +40px 우측 */
            bottom: 'calc(2% + 2.434%)',  /* 누적 +23px 위 */
            width: 'calc(11% - 0.595%)',  /* 누적 -10px (좌변 -15 + 가로 +5) */
            height: 'calc(7% - 0.212%)',  /* 누적 -2px (기본 -12 + 윗변 +15 + 세로 -5) */
          }}
          onClick={() => navigateTo('market')}
        />
        <Hotspot
          label="기술상"
          className="absolute rounded-[10px]"
          style={{
            right: 'calc(2% - 0.178%)',  /* 우변 7px 좌측 이동 (기본 -10 + 우 +5 + 우 +2) */
            bottom: 'calc(2% + 2.434%)', /* 위로 30px 이동 (기본 -7 + 위 +30) */
            width: 'calc(12% - 1.488%)', /* -7px (우측에서 5+2px 축소) */
            height: 'calc(7% - 0.106%)', /* 누적 -1px (기본 -10 + 윗변 +10 - 1) */
          }}
          onClick={() => navigateTo('techMerchant')}
        />

        {/* 도움말 오버레이 */}
        {openHelp && <HelpOverlay onClose={() => setOpenHelp(false)} />}
      </div>

      {/* 팝업 */}
      {activePopup && (
        <PopupOverlay
          activePopup={activePopup}
          currentGlobalNews={currentGlobalNews}
          currentNews={currentNews}
          sectors={sectors}
          onClose={() => setActivePopup(null)}
          insiderTip={insiderTip}
          insiderFee={insiderFee}
          isLastTurn={isLastTurn}
          alreadyBought={alreadyBought}
          canAfford={canAfford}
          onPurchaseInsiderInfo={purchaseInsiderInfo}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// 핫스팟 — 배경 이미지 위 투명 클릭 영역 + hover 글로우
// ─────────────────────────────────────────────────────────
function Hotspot({ className, style, label, onClick, glowColor = 'cyan' }) {
  const glow = {
    cyan: 'group-hover:shadow-[inset_0_0_25px_rgba(34,211,238,0.35),0_0_25px_rgba(34,211,238,0.35)] group-hover:border-cyan-300',
    emerald: 'group-hover:shadow-[inset_0_0_25px_rgba(52,211,153,0.35),0_0_25px_rgba(52,211,153,0.35)] group-hover:border-emerald-300',
    amber: 'group-hover:shadow-[inset_0_0_25px_rgba(251,191,36,0.35),0_0_25px_rgba(251,191,36,0.35)] group-hover:border-amber-300',
    red: 'group-hover:shadow-[inset_0_0_25px_rgba(248,113,113,0.35),0_0_25px_rgba(248,113,113,0.35)] group-hover:border-red-300',
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
// ObjectGlow — 보이는 마커 없이 오브젝트 영역에 호버하면 radial 글로우만 떠오름
// 영역 자체가 클릭 타겟. 사각 테두리 없이 원형/타원 그라디언트로 부드럽게 표현.
// ─────────────────────────────────────────────────────────
function ObjectGlow({ style, label, onClick, glowColor = 'cyan' }) {
  // RGB 채널만 분리해 두고 radial-gradient에서 alpha만 조절
  const rgb = {
    cyan:    '34,211,238',
    emerald: '52,211,153',
    amber:   '251,191,36',
  }[glowColor]

  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{ outline: 'none', ...style }}
      className="group absolute focus:outline-none cursor-pointer"
    >
      {/* radial glow — 평소엔 투명, 호버 시 부드럽게 등장. 가장자리는 transparent로 페이드 → 박스 윤곽 안 보임 */}
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
// 팝업 컨테이너 — 국제뉴스/기업뉴스/추천종목 공통 모달
// ─────────────────────────────────────────────────────────
function PopupOverlay({
  activePopup, currentGlobalNews, currentNews, sectors, onClose,
  insiderTip, insiderFee, isLastTurn, alreadyBought, canAfford, onPurchaseInsiderInfo,
}) {
  const title = {
    globalNews: '국제 뉴스',
    companyNews: '기업 뉴스',
    recommendation: '추천 종목',
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

        {activePopup === 'globalNews' && <GlobalNewsView news={currentGlobalNews} />}
        {activePopup === 'companyNews' && <CompanyNewsView sectors={sectors} currentNews={currentNews} />}
        {activePopup === 'recommendation' && (
          <RecommendationView
            insiderTip={insiderTip}
            insiderFee={insiderFee}
            isLastTurn={isLastTurn}
            alreadyBought={alreadyBought}
            canAfford={canAfford}
            onPurchase={onPurchaseInsiderInfo}
          />
        )}
      </div>
    </div>
  )
}

// 국제 뉴스 — 단일 헤드라인 + 디테일
function GlobalNewsView({ news }) {
  if (!news) {
    return (
      <p className="text-cyan-300/60 text-sm font-mono tracking-wider">이번 라운드 국제 뉴스가 없습니다.</p>
    )
  }
  return (
    <div className="bg-slate-800/70 border border-cyan-500/30 rounded-lg p-4">
      <p className="font-bold text-cyan-100 mb-2">📰 {news.headline}</p>
      <p className="text-xs text-cyan-300/70 leading-relaxed">{news.detail}</p>
    </div>
  )
}

// 기업 뉴스 — 섹터별 뉴스 리스트
function CompanyNewsView({ sectors, currentNews }) {
  if (sectors.length === 0) {
    return <p className="text-cyan-300/60 text-sm font-mono">종목 정보가 없습니다.</p>
  }
  return (
    <div className="space-y-2">
      {sectors.map((sector) => {
        const sectorNews = (currentNews || []).filter((n) => n.sector === sector)
        const hasNews = sectorNews.length > 0
        return (
          <div
            key={sector}
            className={`bg-slate-800/70 border border-cyan-500/30 rounded-lg p-3 ${
              hasNews ? '' : 'opacity-50'
            }`}
          >
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-900/70 border border-cyan-500/40 text-cyan-200 mr-2">
              {sector}
            </span>
            {hasNews ? (
              sectorNews.map((n) => (
                <div key={n.id} className="mt-2">
                  <p className="font-bold text-sm text-cyan-100">📰 {n.headline}</p>
                  <p className="text-xs text-cyan-300/70 mt-1 leading-relaxed">{n.detail}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 mt-1">정보 없음</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

// 내부 정보 구매 — 총 자산 5% 수수료로 다음 주 최고 상승 종목 공개
function RecommendationView({ insiderTip, insiderFee, isLastTurn, alreadyBought, canAfford, onPurchase }) {
  const [error, setError] = useState(null)

  const handlePurchase = () => {
    setError(null)
    const result = onPurchase()
    if (!result.ok) {
      if (result.reason === 'insufficient_cash')
        setError(`현금 부족 (필요: ${result.fee.toLocaleString()}원 / 보유 현금: ${result.cash.toLocaleString()}원) — 주식을 일부 매도하세요`)
      else if (result.reason === 'last_turn')
        setError('마지막 라운드에는 구매할 수 없습니다.')
      else if (result.reason === 'already_purchased')
        setError('이번 라운드에 이미 구매하셨습니다.')
      else
        setError('데이터를 불러올 수 없습니다.')
    }
  }

  // 구매 완료 — 결과 표시
  if (alreadyBought && insiderTip) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-emerald-400/80 font-mono mb-1">
          🔒 내부 정보 — {insiderTip.feePaid.toLocaleString()}원 지불 완료
        </p>
        <div className="bg-slate-800/70 border border-emerald-500/50 rounded-lg p-4 shadow-[0_0_20px_rgba(52,211,153,0.15)]">
          <p className="text-xs text-emerald-300/60 mb-2 font-mono">다음 주 최고 상승 예상 종목</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-emerald-200">{insiderTip.name}</p>
              <p className="text-xs text-cyan-300/60 mt-0.5">
                현재가 {insiderTip.currentClose.toLocaleString()}원
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums text-emerald-300 tracking-widest">???</p>
              <p className="text-xs mt-1 text-cyan-300/50">등락률 비공개</p>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-cyan-300/40 font-mono text-center">
          다음 라운드가 되면 새 정보를 구매할 수 있습니다.
        </p>
      </div>
    )
  }

  // 구매 전 — 잠금 UI
  return (
    <div className="space-y-3">
      <div className="bg-slate-800/70 border border-cyan-500/30 rounded-lg p-5 text-center">
        <p className="text-3xl mb-2">🔒</p>
        <p className="font-bold text-cyan-100 mb-1">내부 정보 구매</p>
        <p className="text-sm text-cyan-300/70 leading-relaxed">
          다음 주에{' '}
          <span className="text-emerald-300 font-bold">가장 큰 폭으로 오를 종목 1개</span>를
          <br />단독으로 알려드립니다.
        </p>
      </div>

      <div className="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-3 flex items-center justify-between">
        <span className="text-xs text-cyan-300/70 font-mono">수수료 (총 자산의 5%)</span>
        <span className="text-base font-bold text-yellow-300 tabular-nums">
          {insiderFee.toLocaleString()}원
        </span>
      </div>

      {isLastTurn && (
        <p className="text-xs text-red-400/80 font-mono text-center">마지막 라운드에는 구매할 수 없습니다.</p>
      )}
      {!isLastTurn && !canAfford && (
        <p className="text-xs text-red-400/80 font-mono text-center">현금 부족 — 주식을 일부 매도하세요</p>
      )}
      {error && <p className="text-xs text-red-400/80 font-mono text-center">{error}</p>}

      <button
        onClick={handlePurchase}
        disabled={isLastTurn || !canAfford}
        className={`w-full py-3 rounded-lg font-bold text-sm transition-all duration-150
          ${isLastTurn || !canAfford
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:shadow-[0_0_25px_rgba(52,211,153,0.5)]'
          }`}
      >
        {insiderFee.toLocaleString()}원 지불하고 정보 구매
      </button>

      <p className="text-[10px] text-cyan-300/40 font-mono text-center">
        구매 후 취소 불가 · 이번 라운드 1회 한정
      </p>
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

      {/* 지구본 */}
      <HelpBubble style={{ top: '30%', left: '15.5%', transform: 'translateX(-50%)' }} arrow="down">
        <strong className="text-cyan-300 text-base block">🌐 국제 뉴스</strong>
        <p className="text-xs mt-1 text-cyan-100">이번 주 글로벌 시장 동향<br />환율·금리·정세 영향</p>
      </HelpBubble>

      {/* 서류가방 (좌 누적 -180px, 위 -30px) */}
      <HelpBubble style={{ top: 'calc(55% - 3.175%)', left: 'calc(48% - 10.714%)', transform: 'translateX(-50%)' }} arrow="down">
        <strong className="text-amber-300 text-base block">💼 기업 뉴스</strong>
        <p className="text-xs mt-1 text-cyan-100">활성 종목 섹터별<br />호재/악재 헤드라인</p>
      </HelpBubble>

      {/* 태블릿 (좌 누적 -210px) */}
      <HelpBubble style={{ top: '58%', left: 'calc(79% - 12.500%)', transform: 'translateX(-50%)' }} arrow="down">
        <strong className="text-emerald-300 text-base block">📈 내부 정보</strong>
        <p className="text-xs mt-1 text-cyan-100">총 자산의 5% 수수료로<br />다음 주 최고 상승 종목을<br />단독 공개 (라운드당 1회)</p>
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
