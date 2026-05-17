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
import { TopRightNav, BottomRightNav } from '../components/game/PageNav'
import StockChart from '../components/game/StockChart'

// 새 게임 시작당 1회 자동 도움말 노출용 sessionStorage 키
const INFO_HELP_SEEN_KEY = 'info-merchant-help-seen'

// ─────────────────────────────────────────────────────────
// 핫스팟 좌표 상수 — 화면별 % 좌표 + 픽셀 미세조정값을 한곳에 모아 유지보수 용이
// (MarketPage HOTSPOT 패턴 준수)
//   infoMerchant: 정보상 배경(1680×945)의 NPC·오브젝트 + 네비 버튼 영역
//   globalPopup / companyPopup: 16:9 뉴스 팝업의 그려진 X 버튼 + HUD 프레임 내부 콘텐츠 영역
//   recommendPopup: 4:3 추천종목 팝업의 그려진 X + 3-zone(상단 정보 / 중단 수수료 / 하단 그린 버튼)
// ─────────────────────────────────────────────────────────
const HOTSPOT = {
  // 정보상 메인 — 책상 위 3개 오브젝트만 (도움말/메인/거래소/기술상은 PageNav로 분리)
  infoMerchant: {
    globe:     { top: 'calc(41.7% - 2.646%)', left: 'calc(8.7% + 2.976%)',  width: '13.6%', height: '29.6%' }, // 좌측 지구본
    briefcase: { top: 'calc(72% - 7.407%)',   left: 'calc(32% - 11.905%)',  width: '32%',   height: '23%'   }, // 중앙 서류가방
    tablet:    { top: 'calc(76% - 2.646%)',   left: 'calc(69% - 11.905%)',  width: '20%',   height: '17%'   }, // 우측 태블릿
  },
  // 국제뉴스 팝업 (16:9)
  globalPopup: {
    close:   { top: 'calc(2.5% + 7px)', right: 'calc(1.2% + 11px)', width: 'calc(4.2% - 5px)', height: 'calc(8.5% - 20px)' }, // 좌 +11px, 아래 +7px / 가로 -5px, 세로 -20px (누적)
    content: { top: '14%',              left: '5%',                right: '5%',   bottom: '8%' },
  },
  // 기업뉴스 팝업 (16:9, 배경 구성이 globalPopup과 동일하나 독립 관리)
  companyPopup: {
    close:   { top: 'calc(2.5% + 6px)', right: 'calc(1.2% + 18px)', width: 'calc(4.2% - 7px)', height: 'calc(8.5% - 20px)' }, // 좌 +18px, 아래 +6px / 가로 -7px, 세로 -20px (누적)
    content: { top: '14%',              left: '5%',                right: '5%',   bottom: '11%' }, // bottom +3%(배경 하단 침범 방지)
  },
  // 추천종목 팝업 (4:3, 3-zone 레이아웃)
  recommendPopup: {
    close:    { top: 'calc(6.5% + 7px)', right: 'calc(3.5% + 23px)', width: 'calc(6.5% - 15px)', height: 'calc(7.5% - 10px)' }, // 좌 +23px, 아래 +7px / 가로 -15px, 세로 -10px (누적)
    topFrame: { top: '14%',  left: '6%',    right: '6%',   height: '48%'  }, // 상단 큰 프레임 (잠금/공개)
    midFrame: { top: '63%',  left: '6%',    right: '6%',   height: '10.5%' }, // 중단 작은 프레임 (수수료/에러)
    button:   { top: '74%',  left: '6%',    right: '6%',   height: '15%'  }, // 하단 그린 버튼 클릭 타겟
  },
}

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
        {/* 책상 위 오브젝트 핫스팟 — 좌표는 상단 HOTSPOT.infoMerchant 상수에서 관리 */}
        <ObjectGlow label="국제 뉴스" style={HOTSPOT.infoMerchant.globe}     glowColor="cyan"    onClick={() => setActivePopup('globalNews')} />
        <ObjectGlow label="기업 뉴스" style={HOTSPOT.infoMerchant.briefcase} glowColor="amber"   onClick={() => setActivePopup('companyNews')} />
        <ObjectGlow label="추천 종목" style={HOTSPOT.infoMerchant.tablet}    glowColor="emerald" onClick={() => setActivePopup('recommendation')} />

        {/* 우상단: 도움말 / 설정 / 메인 — PageNav 통일 스타일 */}
        <TopRightNav onHelp={() => setOpenHelp(true)} navigateTo={navigateTo} />

        {/* 우하단: 다른 페이지 이동 (거래소 / 기술상) */}
        <BottomRightNav current="infoMerchant" navigateTo={navigateTo} />

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
// 배경은 webp 이미지(타이틀·X 버튼·HUD 프레임이 이미 그려져 있음)
// 내부 콘텐츠는 그려진 프레임 안쪽에 absolute 배치
// ─────────────────────────────────────────────────────────
// 팝업별 배경 이미지·비율·HOTSPOT 그룹 매핑 (좌표 자체는 상단 HOTSPOT 상수)
const POPUP_CONFIG = {
  globalNews:     { bg: '/images/info-global-news-bg.webp',     aspect: '16/9', hotspot: HOTSPOT.globalPopup },
  companyNews:    { bg: '/images/info-company-news-bg.webp',    aspect: '16/9', hotspot: HOTSPOT.companyPopup },
  recommendation: { bg: '/images/info-recommendation-bg.webp',  aspect: '4/3',  hotspot: HOTSPOT.recommendPopup },
}

function PopupOverlay({
  activePopup, currentGlobalNews, currentNews, sectors, onClose,
  insiderTip, insiderFee, isLastTurn, alreadyBought, canAfford, onPurchaseInsiderInfo,
}) {
  const { bg, aspect, hotspot } = POPUP_CONFIG[activePopup]
  const isLandscape = aspect === '16/9'

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-page-enter"
      onClick={onClose}
    >
      <div
        className="relative"
        style={{
          width: isLandscape
            ? 'min(92vw, calc(90vh * 16 / 9))'
            : 'min(78vw, calc(88vh * 4 / 3))',
          aspectRatio: aspect,
          backgroundImage: `url('${bg}')`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* X 버튼 — 좌표는 HOTSPOT[*Popup].close 상수에서 관리 */}
        <button
          onClick={onClose}
          aria-label="닫기"
          style={{ outline: 'none', position: 'absolute', ...hotspot.close }}
          className="group focus:outline-none cursor-pointer rounded-md"
        >
          <span className="absolute inset-0 rounded-md border-2 border-transparent group-hover:border-cyan-300 group-hover:shadow-[inset_0_0_15px_rgba(34,211,238,0.4),0_0_15px_rgba(34,211,238,0.4)] transition-all duration-150 pointer-events-none" />
        </button>

        {/* 콘텐츠 — 좌표는 HOTSPOT[*Popup].content (뉴스) / topFrame·midFrame·button (추천종목) */}
        {activePopup === 'globalNews' && (
          <div style={{ position: 'absolute', ...hotspot.content }} className="overflow-y-auto p-2 sm:p-3 md:p-5">
            <GlobalNewsView news={currentGlobalNews} />
          </div>
        )}
        {activePopup === 'companyNews' && (
          <div style={{ position: 'absolute', ...hotspot.content }} className="overflow-y-auto p-2 sm:p-3 md:p-5">
            <CompanyNewsView sectors={sectors} currentNews={currentNews} />
          </div>
        )}
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

// 국제 뉴스 — HUD 배경에 어울리는 BREAKING 뉴스 카드 한 장
// detail이 100~150자로 길어졌으므로 컨테이너가 콘텐츠보다 커지면 위가 잘리지 않도록 items-start 사용
function GlobalNewsView({ news }) {
  if (!news) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-cyan-300/50 gap-2">
        <span className="text-4xl">🌐</span>
        <p className="text-sm font-mono tracking-wider">이번 라운드 국제 뉴스가 없습니다</p>
      </div>
    )
  }
  return (
    <div className="h-full flex items-center justify-center">
      <div className="relative w-full h-full bg-slate-900/55 border border-cyan-400/50 rounded-xl p-3 sm:p-4 md:p-5 lg:p-7 backdrop-blur-sm shadow-[inset_0_0_40px_rgba(34,211,238,0.08),0_0_30px_rgba(34,211,238,0.18)] flex flex-col overflow-y-auto">
        {/* 모서리 L자 deco — HUD 프레임 톤 */}
        <span className="absolute -top-px -left-px w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-300 rounded-tl-xl pointer-events-none" />
        <span className="absolute -top-px -right-px w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-300 rounded-tr-xl pointer-events-none" />
        <span className="absolute -bottom-px -left-px w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-300 rounded-bl-xl pointer-events-none" />
        <span className="absolute -bottom-px -right-px w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-300 rounded-br-xl pointer-events-none" />

        {/* 콘텐츠 래퍼 — my-auto: 짧으면 카드 안에서 세로 가운데, 길면 위에서부터 흐르며 카드 자체가 스크롤 */}
        <div className="my-auto">
          {/* 배지 라인 — BREAKING + 카테고리 */}
          <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2 md:mb-3 flex-wrap">
            <span className="flex items-center gap-1.5 px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-red-600/25 border border-red-400/70 rounded font-mono text-[10px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.25em] text-red-200 shadow-[0_0_10px_rgba(248,113,113,0.3)]">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
              BREAKING
            </span>
            <span className="text-cyan-300/70 text-[10px] sm:text-xs font-mono tracking-[0.2em] sm:tracking-[0.25em]">GLOBAL · MARKET ALERT</span>
          </div>

          {/* 헤드라인 — detail이 길이와 무관하게 다 보이도록 비중 축소 */}
          <p className="font-bold text-cyan-50 text-sm sm:text-base md:text-lg lg:text-xl mb-1.5 sm:mb-2 md:mb-3 leading-snug drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
            {news.headline}
          </p>

          {/* 구분선 */}
          <div className="h-px bg-gradient-to-r from-cyan-500/0 via-cyan-400/60 to-cyan-500/0 mb-1.5 sm:mb-2 md:mb-3" />

          {/* 디테일 — news-events.json detail 원문을 길이 가정 없이 그대로 표시.
              카드에 overflow-y-auto 안전망이 있어 데이터가 더 길어져도 잘리지 않음 */}
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-cyan-100/90 leading-relaxed whitespace-pre-line break-keep">
            {news.detail}
          </p>
        </div>
      </div>
    </div>
  )
}

// 기업 뉴스 — 뉴스 항목을 위→아래로 세로 나열 (gameLogic이 3~5개 보장)
// 각 카드: [섹터 배지] 📰 헤드라인 한 줄, 아래 detail 1~2줄
function CompanyNewsView({ sectors, currentNews }) {
  // sectors 순서를 그대로 따라 뉴스 정렬 (섹터가 같은 뉴스끼리 인접)
  const sectorOrder = new Map(sectors.map((s, i) => [s, i]))
  const orderedNews = [...(currentNews || [])].sort((a, b) => {
    const ai = sectorOrder.get(a.sector) ?? 999
    const bi = sectorOrder.get(b.sector) ?? 999
    return ai - bi
  })

  if (orderedNews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-cyan-300/50 gap-2">
        <span className="text-4xl">💼</span>
        <p className="text-sm font-mono tracking-wider">이번 라운드 기업 뉴스가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col gap-1.5 sm:gap-2 md:gap-2.5">
      {orderedNews.map((n) => (
        <div
          key={n.id}
          className="relative flex-1 min-h-0 bg-slate-900/55 border border-cyan-400/50 rounded-lg px-2.5 py-1.5 sm:px-4 sm:py-2.5 md:px-5 md:py-3 backdrop-blur-sm shadow-[inset_0_0_20px_rgba(34,211,238,0.06),0_0_15px_rgba(34,211,238,0.12)] flex flex-col justify-center"
        >
          {/* 모서리 L자 deco — 국제뉴스와 톤 통일 */}
          <span className="absolute -top-px -left-px w-2 h-2 sm:w-2.5 sm:h-2.5 border-t-2 border-l-2 border-cyan-300 rounded-tl-lg pointer-events-none" />
          <span className="absolute -top-px -right-px w-2 h-2 sm:w-2.5 sm:h-2.5 border-t-2 border-r-2 border-cyan-300 rounded-tr-lg pointer-events-none" />
          <span className="absolute -bottom-px -left-px w-2 h-2 sm:w-2.5 sm:h-2.5 border-b-2 border-l-2 border-cyan-300 rounded-bl-lg pointer-events-none" />
          <span className="absolute -bottom-px -right-px w-2 h-2 sm:w-2.5 sm:h-2.5 border-b-2 border-r-2 border-cyan-300 rounded-br-lg pointer-events-none" />

          {/* 한 줄: 섹터 배지 + 📰 헤드라인 */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 mb-1 sm:mb-1.5">
            <span className="shrink-0 text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-2.5 md:py-1 rounded bg-cyan-900/70 border border-cyan-500/50 text-cyan-200 font-mono tracking-[0.15em] sm:tracking-[0.2em]">
              {n.sector}
            </span>
            {/* flex-1 min-w-0: flex 자식 기본 min-width(min-content) 때문에 긴 헤드라인이 truncate되지 않고
                컨테이너를 늘리던 문제 방지 — 명시적으로 0까지 줄어들 수 있게 해야 truncate 동작 */}
            <p className="flex-1 min-w-0 font-bold text-xs sm:text-sm md:text-base lg:text-lg text-cyan-50 leading-snug drop-shadow-[0_0_6px_rgba(34,211,238,0.3)] truncate">
              📰 {n.headline}
            </p>
          </div>

          {/* 디테일 */}
          <p className="text-[11px] sm:text-xs md:text-sm lg:text-base text-cyan-100/85 leading-relaxed border-t border-cyan-500/25 pt-1 sm:pt-1.5 md:pt-2">
            {n.detail}
          </p>
        </div>
      ))}
    </div>
  )
}

// 내부 정보 구매 — 추천종목.webp 3-zone 레이아웃
//   상단 큰 프레임: 잠금/공개 정보 표시
//   중단 작은 프레임: 수수료 정보
//   하단 그린 버튼: 구매 액션 (배경 이미지의 그린 버튼 영역 위 클릭 타겟)
function RecommendationView({ insiderTip, insiderFee, isLastTurn, alreadyBought, canAfford, onPurchase }) {
  const [error, setError] = useState(null)

  // 차트·이동 버튼용: navigateTo + 지표 구매 상태 (MarketPage StockChart와 동일 props 전달)
  const navigateTo         = useGameStore((s) => s.navigateTo)
  const maPurchased        = useGameStore((s) => s.maPurchased)
  const bollingerPurchased = useGameStore((s) => s.bollingerPurchased)
  const macdPurchased      = useGameStore((s) => s.macdPurchased)
  const obvPurchased       = useGameStore((s) => s.obvPurchased)

  const handlePurchase = () => {
    setError(null)
    const result = onPurchase()
    if (!result.ok) {
      if (result.reason === 'insufficient_cash')
        setError(`현금 부족 (필요: ${result.fee.toLocaleString()}원 / 보유 현금: ${result.cash.toLocaleString()}원)`)
      else if (result.reason === 'last_turn')
        setError('마지막 라운드에는 구매할 수 없습니다.')
      else if (result.reason === 'already_purchased')
        setError('이번 라운드에 이미 구매하셨습니다.')
      else
        setError('데이터를 불러올 수 없습니다.')
    }
  }

  const disabled = isLastTurn || !canAfford || alreadyBought

  return (
    <>
      {/* 상단 큰 프레임 — 잠금 / 공개 결과 (좌표: HOTSPOT.recommendPopup.topFrame) */}
      <div style={{ position: 'absolute', ...HOTSPOT.recommendPopup.topFrame }} className="p-5 overflow-y-auto">
        {alreadyBought && insiderTip ? (
          // 공개 상태 — Ticker Tape 톤: [내부정보 단독입수] 헤더 / 와이어 4행 / 다음 라운드 공개 푸터
          <div className="h-full flex flex-col font-mono">
            {/* 헤더 — 양옆 그라디언트 라인 + 가운데 타이틀 (대칭 페이드) */}
            <div className="flex items-center gap-3 md:gap-4 px-1 mb-1.5 md:mb-2">
              <span className="flex-1 h-px bg-gradient-to-r from-emerald-500/0 via-emerald-400/40 to-emerald-400/70" />
              <span className="shrink-0 text-emerald-300 text-xs md:text-sm font-bold tracking-[0.2em] drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]">
                ◆ 내부정보 단독입수 ◆
              </span>
              <span className="flex-1 h-px bg-gradient-to-l from-emerald-500/0 via-emerald-400/40 to-emerald-400/70" />
            </div>

            {/* 본문 — 종이 테이프 카드 (상하 점선 텍스처 + 4행 와이어 라인) */}
            <div className="flex-1 min-h-0 bg-slate-950/55 border border-emerald-500/40 rounded-lg shadow-[inset_0_0_20px_rgba(52,211,153,0.08)] flex flex-col py-2 md:py-3 overflow-hidden">
              {/* 상단 점선 텍스처 — 테이프 perforation 느낌 */}
              <div className="px-3 md:px-5 text-emerald-500/35 tracking-[0.3em] text-[10px] md:text-xs leading-none whitespace-nowrap overflow-hidden select-none">
                ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
              </div>

              {/* 본문 2단 — 좌(와이어 3행) / 우(시각 패널: 봉인 도장 + 검열 차트) */}
              <div className="flex-1 min-h-0 flex items-stretch px-2 md:px-3 lg:px-4 gap-2 md:gap-3">
                {/* 좌 — 추천 종목 메인 차트 (MarketPage 종목분석과 동일한 StockChart) */}
                <div className="flex-1 min-w-0 overflow-y-auto scrollbar-cyan -mr-1 pr-1.5 pt-3">
                  <StockChart
                    stockId={insiderTip.id}
                    maPurchased={maPurchased}
                    bollingerPurchased={bollingerPurchased}
                    macdPurchased={macdPurchased}
                    obvPurchased={obvPurchased}
                  />
                </div>

                {/* 세로 점선 구분 — 좌/우 영역 분리 */}
                <span aria-hidden="true" className="shrink-0 w-px self-stretch bg-gradient-to-b from-emerald-500/0 via-emerald-500/40 to-emerald-500/0" />

                {/* 우 — 종목명/현재가 hero + 거래소 이동 버튼 */}
                <div className="shrink-0 w-36 md:w-44 lg:w-56 flex flex-col items-stretch justify-center py-1.5 px-2 gap-3 md:gap-4">
                  {/* 종목명 + 현재가 (이전 자물쇠 자리) */}
                  <div className="flex flex-col items-center text-center gap-2 md:gap-2.5">
                    {/* break-words: 긴 한글 종목명("삼성바이오로직스" 등)도 우측 컨테이너 폭 안에서 자동 줄바꿈
                        leading-tight: 줄바꿈 시 줄간격 보정 / min-w-0: flex 자식이 부모 폭 초과 방지
                        font-sans: 상위 카드의 font-mono 상속을 무효화 — 한글이 monospace로 렌더돼 자간이 어색해지는 문제 해결 */}
                    <p className="min-w-0 max-w-full text-lg md:text-xl lg:text-2xl font-sans font-bold text-emerald-50 drop-shadow-[0_0_12px_rgba(52,211,153,0.7)] leading-tight break-words">
                      {insiderTip.name}
                    </p>
                    <span aria-hidden="true" className="w-2/3 h-px bg-gradient-to-r from-emerald-500/0 via-emerald-400/65 to-emerald-500/0" />
                    <div className="flex items-center gap-1.5">
                      <span className="relative inline-flex">
                        <span aria-hidden="true" className="absolute inset-0 rounded-full bg-cyan-400 opacity-70 animate-pulse" />
                        <span className="relative block w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
                      </span>
                      <p className="text-sm md:text-base lg:text-lg font-bold tabular-nums font-mono text-cyan-100">
                        {insiderTip.currentClose.toLocaleString()}
                        <span className="ml-0.5 text-xs text-cyan-300/70">원</span>
                      </p>
                    </div>
                  </div>

                  {/* 거래소 이동 버튼 (이전 sparkline 자리) — 추천 종목을 선택한 상태로 매수 모달 자동 오픈 */}
                  <button
                    onClick={() => {
                      // MarketPage가 진입 시 읽고 자동으로 매수 팝업 + 종목 선택 처리
                      if (typeof sessionStorage !== 'undefined') {
                        sessionStorage.setItem('market-auto-select-stock', insiderTip.id)
                        sessionStorage.setItem('market-auto-open', 'buy')
                      }
                      navigateTo('market')
                    }}
                    aria-label="거래소로 이동하여 추천 종목 매수 모달 열기"
                    className="group relative overflow-hidden rounded-lg border border-emerald-500/50 bg-emerald-900/30 px-3 py-2 md:py-2.5 shadow-[inset_0_0_15px_rgba(52,211,153,0.15)] transition-all duration-150 hover:bg-emerald-800/40 hover:border-emerald-400 hover:shadow-[inset_0_0_25px_rgba(52,211,153,0.3),0_0_15px_rgba(52,211,153,0.4)] focus:outline-none cursor-pointer"
                  >
                    <span className="flex items-center justify-center gap-1.5 md:gap-2">
                      <span className="text-emerald-100 text-xs md:text-sm font-bold tracking-[0.2em] drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]">
                        주식 구매
                      </span>
                      <span aria-hidden="true" className="text-emerald-300 transition-transform duration-150 group-hover:translate-x-1">▶</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* 하단 점선 텍스처 */}
              <div className="px-3 md:px-5 text-emerald-500/35 tracking-[0.3em] text-[10px] md:text-xs leading-none whitespace-nowrap overflow-hidden select-none">
                ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
              </div>
            </div>

            {/* 푸터 — 펄스 점 + 다음 라운드 공개 */}
            <div className="mt-1.5 md:mt-2 flex items-center justify-center gap-2">
              <span className="relative inline-flex">
                <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
              </span>
              <span className="text-emerald-300 text-[11px] md:text-xs tracking-[0.2em]">
                다음 라운드 공개
              </span>
            </div>
          </div>
        ) : (
          // 잠금 상태 — UNLOCKED와 같은 HUD 구조 (상단 상태바 / 본문 / 하단 안내)
          <div className="h-full flex flex-col">
            {/* 상단 상태바 — LOCKED */}
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-cyan-500/30">
              <span className="relative inline-flex">
                <span className="absolute inset-0 bg-cyan-400 rounded-full animate-pulse opacity-75" />
                <span className="relative block w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)]" />
              </span>
              <span className="text-cyan-300 text-sm md:text-base font-mono tracking-[0.3em] font-bold drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]">
                LOCKED · 내부 정보 미구매
              </span>
            </div>

            {/* 본문 — 자물쇠 + 안내 (배경 카드 안에 배치) */}
            <div className="flex-1 grid grid-cols-1 min-h-0">
              <div className="bg-slate-950/55 border border-cyan-500/40 rounded-lg p-5 flex flex-col items-center justify-center text-center shadow-[inset_0_0_20px_rgba(34,211,238,0.08)]">
                <p className="text-6xl md:text-7xl mb-3 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">🔒</p>
                <p className="font-bold text-cyan-100 text-xl md:text-2xl mb-3 font-mono tracking-wider drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                  내부 정보 구매
                </p>
                <p className="text-sm md:text-base text-cyan-100/80 leading-relaxed">
                  다음 주에 <span className="text-emerald-300 font-bold">가장 큰 폭으로 오를 종목 1개</span>를
                  <br />단독으로 알려드립니다
                </p>
              </div>
            </div>

            {/* 하단 안내 라인 */}
            <div className="mt-3 pt-2 border-t border-cyan-500/30 flex items-center justify-center font-mono text-xs md:text-sm text-cyan-300/70">
              <span className="tracking-wider">· 라운드당 1회 한정 · 구매 후 취소 불가 ·</span>
            </div>
          </div>
        )}
      </div>

      {/* 중단 작은 프레임 — 수수료 / 에러 (좌표: HOTSPOT.recommendPopup.midFrame) */}
      <div style={{ position: 'absolute', ...HOTSPOT.recommendPopup.midFrame }} className="px-5 flex items-center justify-between">
        {error ? (
          <p className="text-xs md:text-sm text-red-400 font-mono w-full text-center">⚠ {error}</p>
        ) : isLastTurn ? (
          <p className="text-xs md:text-sm text-red-400/80 font-mono w-full text-center">마지막 라운드에는 구매할 수 없습니다</p>
        ) : !canAfford && !alreadyBought ? (
          <p className="text-xs md:text-sm text-red-400/80 font-mono w-full text-center">현금 부족 — 주식을 일부 매도하세요</p>
        ) : (
          <>
            <span className="text-xs md:text-sm text-cyan-300/80 font-mono tracking-wider">수수료 (총 자산의 5%)</span>
            <span className="text-lg md:text-xl font-bold text-yellow-300 tabular-nums font-mono drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]">
              {insiderFee.toLocaleString()}원
            </span>
          </>
        )}
      </div>

      {/* 하단 그린 버튼 — 배경 이미지의 그린 버튼 위에 클릭 타겟 (좌표: HOTSPOT.recommendPopup.button) */}
      <button
        onClick={handlePurchase}
        disabled={disabled}
        style={{ outline: 'none', position: 'absolute', ...HOTSPOT.recommendPopup.button }}
        className={`rounded-lg focus:outline-none transition-all duration-150 group ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
        }`}
      >
        <span
          className={`absolute inset-0 rounded-lg flex items-center justify-center transition-all duration-150 ${
            disabled
              ? 'bg-black/40'
              : 'group-hover:shadow-[inset_0_0_25px_rgba(52,211,153,0.45),0_0_30px_rgba(52,211,153,0.45)]'
          }`}
        >
          <span
            className={`text-lg md:text-2xl font-bold font-mono tracking-widest ${
              disabled
                ? 'text-slate-500'
                : 'text-emerald-50 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]'
            }`}
          >
            {alreadyBought
              ? '✓ 구매 완료'
              : disabled
              ? '구매 불가'
              : `${insiderFee.toLocaleString()}원 지불하고 정보 구매 ▶`}
          </span>
        </span>
      </button>
    </>
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
