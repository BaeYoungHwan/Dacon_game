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
import StockChart from '../components/game/StockChart'
import { getRecentCloses } from '../components/game/chartUtils'
import { TopRightNav, BottomRightNav } from '../components/game/PageNav'

// 도움말 자동 표시 여부 기억용 sessionStorage 키 — 한 게임당 1회 자동 노출
const MARKET_HELP_SEEN_KEY = 'market-help-seen'

// ─────────────────────────────────────────────────────────
// 핫스팟 좌표 상수 — 화면별 픽셀 단위 미세조정값을 한곳에 모아 유지보수 용이
// MARKET: MarketPage 배경 이미지(1920×1080 기준) 위에 떠 있는 영역들
// MODAL: 16:9 16:9 이미지 모달(분석/매수/매도) 우상단 그려진 도움말·닫기 버튼 위치
// ─────────────────────────────────────────────────────────
const HOTSPOT = {
  // 거래소 메인 — 배경 이미지의 키오스크·NPC·홀로그램 영역 핫스팟
  // (도움말/메인/정보상/기술상은 PageNav 컴포넌트로 분리)
  market: {
    analysis: { top: 'calc(8% + 1.481%)', left: 'calc(28% - 0.060%)', width: 'calc(42% + 1.845%)', height: 'calc(58% + 6.138%)' },
    buy:      { top: '55%', left: 'calc(15% - 7.738%)', width: '16%', height: '35%' },
    sell:     { top: '55%', right: 'calc(15% - 5.952%)', width: '16%', height: '35%' },
  },
  // 분석 모달 — 그려진 우상단 버튼 위 hotspot
  analysis: {
    help:  { top: 'calc(2% + 11px)', right: 'calc(14% + 22px)', width: 'calc(10% - 20px)', height: 'calc(7% - 10px)' },
    close: { top: 'calc(2% + 11px)', right: 'calc(3% + 27px)', width: 'calc(10% - 24px)', height: 'calc(7% - 10px)' },
  },
  // 매수 모달
  buy: {
    help:  { top: 'calc(2% + 11px)', right: 'calc(14% + 22px)', width: 'calc(10% - 20px)', height: 'calc(7% - 10px)' },
    close: { top: 'calc(2% + 12px)', right: 'calc(3% + 34px)', width: 'calc(10% - 26px)', height: 'calc(7% - 10px)' },
  },
  // 매도 모달 (매수와 동일 좌표)
  sell: {
    help:  { top: 'calc(2% + 11px)', right: 'calc(14% + 22px)', width: 'calc(10% - 20px)', height: 'calc(7% - 10px)' },
    close: { top: 'calc(2% + 12px)', right: 'calc(3% + 34px)', width: 'calc(10% - 26px)', height: 'calc(7% - 10px)' },
  },
}

// 모달 콘텐츠 영역 좌표 — 캐릭터·말풍선 영역 제외
const ANALYSIS_CONTENT_BOUNDS = { top: '12%', left: '3%', right: '23%', bottom: '8%' }  // 분석 모달 전용
const TRADE_CONTENT_BOUNDS    = { top: '12%', left: '3%', right: '23%', bottom: '7%' }  // 매수·매도 모달 공용

// 모듈 로드 시점에 1회 구독 — 새 게임 시작(page: 'start' → 다른 페이지) 신호 감지 시 플래그 초기화
// → 게임을 새로 시작할 때마다 거래소 첫 진입에서 도움말이 다시 자동 노출됨
// HMR 시 모듈이 재평가되면 이전 구독이 좀비로 남으므로 dispose에서 정리
if (typeof window !== 'undefined') {
  const unsubscribeMarketHelp = useGameStore.subscribe((state, prevState) => {
    if (prevState && prevState.page === 'start' && state.page !== 'start') {
      sessionStorage.removeItem(MARKET_HELP_SEEN_KEY)
    }
  })
  if (import.meta.hot) {
    import.meta.hot.dispose(() => unsubscribeMarketHelp())
  }
}

export default function MarketPage() {
  const navigateTo = useGameStore((s) => s.navigateTo)

  const [activePopup, setActivePopup] = useState(null) // 'analysis' | 'buy' | 'sell' | null
  const [selectedStockId, setSelectedStockId] = useState(null)
  const [openHelp, setOpenHelp] = useState(false)

  // 거래소 첫 진입 시 도움말 자동 오픈 — 이후 진입엔 노출 안 함
  useEffect(() => {
    if (typeof sessionStorage === 'undefined') return
    if (sessionStorage.getItem(MARKET_HELP_SEEN_KEY)) return
    setOpenHelp(true)
    sessionStorage.setItem(MARKET_HELP_SEEN_KEY, '1')
  }, [])

  // 정보상 추천 종목 → '주식 구매' 버튼으로 진입 시 자동으로 종목 선택 + 매수 팝업 오픈
  // (InfoMerchantPage가 sessionStorage에 신호를 남기고 navigateTo('market') 호출)
  // 1회용이므로 처리 후 즉시 키 제거 → 새로고침/재방문 시 재발동 방지
  useEffect(() => {
    if (typeof sessionStorage === 'undefined') return
    const autoStock = sessionStorage.getItem('market-auto-select-stock')
    if (autoStock) {
      setSelectedStockId(autoStock)
      sessionStorage.removeItem('market-auto-select-stock')
    }
    const autoOpen = sessionStorage.getItem('market-auto-open')
    if (autoOpen === 'buy' || autoOpen === 'sell' || autoOpen === 'analysis') {
      setActivePopup(autoOpen)
      sessionStorage.removeItem('market-auto-open')
    }
  }, [])

  const closePopup = () => {
    setActivePopup(null)
    setSelectedStockId(null)
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950 overflow-hidden animate-page-enter">
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
          {/* 핫스팟 좌표는 상단 HOTSPOT.market 상수에서 관리 (1920×1080 비례 % + 픽셀 미세조정) */}
          <Hotspot label="종목분석 열기" className="absolute rounded-[15px]"
            style={HOTSPOT.market.analysis} onClick={() => setActivePopup('analysis')} />

          <Hotspot label="주식 구매" className="absolute rounded-xl"
            style={HOTSPOT.market.buy} glowColor="emerald" onClick={() => setActivePopup('buy')} />

          <Hotspot label="주식 판매" className="absolute rounded-xl"
            style={HOTSPOT.market.sell} glowColor="red" onClick={() => setActivePopup('sell')} />

          {/* 우상단: 도움말 / 설정 / 메인 — PageNav 통일 스타일 */}
          <TopRightNav onHelp={() => setOpenHelp(true)} navigateTo={navigateTo} />

          {/* 우하단: 다른 페이지 이동 (정보상 / 기술상) */}
          <BottomRightNav current="market" navigateTo={navigateTo} />

          {/* 도움말 오버레이 (배경 클릭 시 닫힘) */}
          {openHelp && <HelpOverlay onClose={() => setOpenHelp(false)} />}
      </div>

      {/* 팝업 — 종목분석 / 주식구매 / 주식판매 (store 의존 props는 내부에서 직접 구독) */}
      {activePopup && (
        <PopupOverlay
          activePopup={activePopup}
          selectedStockId={selectedStockId}
          setSelectedStockId={setSelectedStockId}
          onClose={closePopup}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// 핫스팟 — 배경 이미지 위 투명 클릭 영역 + hover 글로우/라벨
// ─────────────────────────────────────────────────────────
function Hotspot({ className, style, label, onClick, glowColor = 'cyan' }) {
  // cyan: 박스 강조(inset+outer+border) — 분석/도움말/메인/정보상/기술상에 사용
  // emerald/red: 박스 형태 없음. 컨테이너보다 큰 radial-gradient halo가 떠올랐다 사라짐 (GamePage NPC 호버 패턴)
  const isSoftGlow = glowColor === 'emerald' || glowColor === 'red'

  const boxGlow = 'group-hover:shadow-[inset_0_0_25px_rgba(34,211,238,0.35),0_0_25px_rgba(34,211,238,0.35)] group-hover:border-cyan-300'
  const radialBg = glowColor === 'emerald'
    ? 'radial-gradient(ellipse at center, rgba(52,211,153,0.45) 0%, rgba(52,211,153,0.15) 35%, transparent 70%)'
    : 'radial-gradient(ellipse at center, rgba(248,113,113,0.45) 0%, rgba(248,113,113,0.15) 35%, transparent 70%)'

  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{ outline: 'none', ...style }}
      className={`${className} group focus:outline-none transition-all duration-150 cursor-pointer`}
    >
      {isSoftGlow ? (
        <span
          aria-hidden="true"
          style={{ background: radialBg }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[140%] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        />
      ) : (
        <span
          className={`absolute inset-0 rounded-[inherit] border-2 border-transparent transition-all duration-150 pointer-events-none ${boxGlow}`}
        />
      )}
    </button>
  )
}

// ─────────────────────────────────────────────────────────
// 종목분석 도움말 오버레이 — 차트 각 구성 요소 설명
// ─────────────────────────────────────────────────────────
// 도움말 오버레이 공통 래퍼 — backdrop·헤더·닫기 버튼·하단 안내 공유, tone(cyan/rose)으로 분기
const HELP_TONE = {
  cyan: {
    border: 'border-cyan-500/60',
    shadow: 'shadow-[0_0_40px_rgba(34,211,238,0.25)]',
    headerText: 'text-cyan-300',
    headerBorder: 'border-cyan-500/30',
    accentBar: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]',
    close: 'text-cyan-300 hover:text-cyan-100',
    scrollbar: 'scrollbar-cyan',
    footer: 'text-cyan-300/50',
  },
  rose: {
    border: 'border-rose-500/60',
    shadow: 'shadow-[0_0_40px_rgba(244,63,94,0.25)]',
    headerText: 'text-rose-300',
    headerBorder: 'border-rose-500/30',
    accentBar: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.7)]',
    close: 'text-rose-300 hover:text-rose-100',
    scrollbar: 'scrollbar-rose',
    footer: 'text-rose-300/50',
  },
}

function HelpOverlayShell({ title = '도움말', tone = 'cyan', onClose, children }) {
  const t = HELP_TONE[tone] ?? HELP_TONE.cyan
  return (
    <div
      className="absolute inset-0 z-30 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 animate-page-enter"
      onClick={onClose}
    >
      <div
        className={`relative max-w-2xl w-full max-h-full overflow-y-auto ${t.scrollbar} bg-gradient-to-b from-slate-900 to-slate-950 border-2 ${t.border} rounded-xl p-6 ${t.shadow}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex justify-between items-baseline mb-4 pb-3 border-b ${t.headerBorder}`}>
          <h2 className={`flex items-center gap-2 text-xl font-bold ${t.headerText} font-mono tracking-wider`}>
            <span className={`inline-block w-1 h-6 rounded-sm ${t.accentBar}`} />
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{ outline: 'none' }}
            className={`${t.close} text-2xl w-8 h-8 flex items-center justify-center transition-all duration-150 focus:outline-none`}
          >
            ✕
          </button>
        </div>
        <div className="space-y-5">{children}</div>
        <p className={`mt-5 text-center text-xs ${t.footer} font-mono tracking-wider`}>
          화면 바깥쪽을 클릭하면 닫혀요
        </p>
      </div>
    </div>
  )
}

function HelpSection({ icon, title, badge, tone = 'cyan', children }) {
  const titleClass = tone === 'rose' ? 'text-rose-100' : 'text-cyan-100'
  return (
    <div>
      <h3 className={`flex items-center gap-2 text-base font-bold ${titleClass} font-mono tracking-wider mb-1.5`}>
        <span className="text-lg">{icon}</span>
        <span>{title}</span>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-yellow-500/50 text-yellow-300 font-mono tracking-wider">
            {badge}
          </span>
        )}
      </h3>
      <div className="text-sm text-slate-200 ml-7 leading-relaxed space-y-1">{children}</div>
    </div>
  )
}

function AnalysisHelpOverlay({ onClose }) {
  return (
    <HelpOverlayShell tone="cyan" onClose={onClose}>
          <HelpSection icon="📊" title="종목 선택">
            <p>좌측 사이드바에서 종목 카드를 클릭하면 우측 차트가 그 종목으로 갱신돼요.</p>
            <p className="text-cyan-300/70 text-xs">선택된 종목 옆에는 ◎ 표시가 붙어요.</p>
          </HelpSection>

          <HelpSection icon="🕯️" title="메인 차트 (캔들)">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-4 bg-[#22c55e] rounded-sm shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
              <span><strong className="text-emerald-300">녹색 캔들</strong>: 그 주에 가격이 <strong>올라간</strong> 종목 (시가 &lt; 종가)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-4 bg-[#ef4444] rounded-sm shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
              <span><strong className="text-red-300">적색 캔들</strong>: 그 주에 가격이 <strong>내려간</strong> 종목 (시가 &gt; 종가)</span>
            </div>
            <p><span className="text-yellow-300">┊</span> 노란 점선: 게임 시작 시점 (왼쪽은 게임 시작 전 과거 데이터)</p>
            <p className="text-cyan-300/70 text-xs">위·아래로 뻗은 얇은 선은 그 주의 최고가·최저가 범위(꼬리).</p>
          </HelpSection>

          <HelpSection icon="📈" title="이동평균선 (MA)" badge="기술상 구매">
            <div className="flex items-center gap-2">
              <span className="inline-block w-6 h-0.5 bg-[#f59e0b]" />
              <span><strong className="text-amber-300">MA5</strong> (주황): 최근 5주 평균가 — 단기 추세</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-6 h-0.5 bg-[#60a5fa]" />
              <span><strong className="text-sky-300">MA20</strong> (하늘): 최근 20주 평균가 — 중기 추세</span>
            </div>
            <p>
              MA5가 MA20을 <strong className="text-rise">위로 뚫으면 골든크로스</strong>(상승 신호),
              <strong className="text-fall"> 아래로 뚫으면 데드크로스</strong>(하락 신호).
            </p>
          </HelpSection>

          <HelpSection icon="🎯" title="볼린저밴드" badge="기술상 구매">
            <p>
              <span className="text-violet-300">┄┄</span> 보라 점선: 가격의 변동 범위 (위·아래 밴드).
              밴드 폭이 좁아지면 큰 변동을 앞두고 있다는 신호일 수 있어요.
            </p>
            <p>
              캔들이 <strong className="text-rise">위쪽 밴드</strong>에 닿으면 <strong>과매수</strong>(과열) 주의,
              <strong className="text-fall"> 아래쪽 밴드</strong>에 닿으면 <strong>과매도</strong>(저점 가능성).
            </p>
          </HelpSection>

          <HelpSection icon="⚡" title="모멘텀 펄스 (MACD)" badge="기술상 구매">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-4 bg-[#ef4444] rounded-sm" />
              <span><strong className="text-rise">빨강 막대</strong> (양수): 상승 모멘텀 — 매수세 우위</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-4 bg-[#3b82f6] rounded-sm" />
              <span><strong className="text-fall">파랑 막대</strong> (음수): 하락 모멘텀 — 매도세 우위</span>
            </div>
            <p className="text-cyan-300/70 text-xs">막대가 0선을 가로지르며 색이 바뀌면 추세 전환 신호일 수 있어요.</p>
          </HelpSection>

          <HelpSection icon="💧" title="머니 플로우 (OBV)" badge="기술상 구매">
            <div className="flex items-center gap-2">
              <span className="inline-block w-6 h-0.5 bg-[#22d3ee] shadow-[0_0_4px_rgba(34,211,238,0.7)]" />
              <span><strong className="text-cyan-200">청록 라인</strong>: 누적 거래량 추이</span>
            </div>
            <p>
              라인이 우상향 → <strong className="text-rise">매집세</strong> (큰 손이 사 모음, 상승 전조).
            </p>
            <p>
              라인이 우하향 → <strong className="text-fall">분산세</strong> (큰 손이 팔아 치움, 하락 전조).
            </p>
          </HelpSection>

          {/* 팁 */}
          <div className="mt-4 px-4 py-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5 text-xs text-cyan-200 font-mono leading-relaxed">
            <strong className="text-cyan-100">💡 TIP</strong> · 캔들·거래량·MA·볼린저·MACD·OBV를 종합적으로 봐야 매수·매도 타이밍을 잘 잡을 수 있어요. <strong>기술상</strong>에서 지표를 구매할수록 더 많은 정보가 차트에 나타납니다.
          </div>
    </HelpOverlayShell>
  )
}

// ─────────────────────────────────────────────────────────
// 주식 구매 도움말 오버레이
// ─────────────────────────────────────────────────────────
function BuyHelpOverlay({ onClose }) {
  return (
    <HelpOverlayShell tone="cyan" onClose={onClose}>
          <HelpSection icon="💰" title="보유 현금">
            <p>현재 사용 가능한 현금이에요. 매수 합계가 이 금액을 넘으면 매수 버튼이 비활성화됩니다.</p>
          </HelpSection>

          <HelpSection icon="📊" title="매수 종목 선택">
            <p>각 종목 행의 <strong className="text-cyan-200">수량 컨트롤(− N +)</strong>로 살 주식 수를 정하세요.</p>
            <p>수량이 <strong>1주 이상</strong>인 종목만 자동으로 매수 대상에 포함돼요. 0주면 매수 안 함.</p>
            <p className="text-cyan-300/70 text-xs">매수 대상 종목은 좌측에 시안 액센트 바가 점등되고 종목명이 강조됩니다.</p>
          </HelpSection>

          <HelpSection icon="⚡" title="빠른 단축 액션">
            <p>
              <strong className="text-cyan-200">전체 1주</strong>: 모든 종목에 1주씩 자동 설정 (이미 수량 있는 종목은 유지).
            </p>
            <p>
              <strong className="text-cyan-200">전체 해제</strong>: 모든 종목 수량을 0으로 리셋.
            </p>
          </HelpSection>

          <HelpSection icon="🔺" title="등락률 보기">
            <div className="flex items-center gap-2">
              <span className="text-rise font-mono">▲ +2.34%</span>
              <span>: 저번 주 대비 상승률 (빨강)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-fall font-mono">▼ -1.85%</span>
              <span>: 저번 주 대비 하락률 (파랑)</span>
            </div>
            <p className="text-cyan-300/70 text-xs">
              그 아래 작은 숫자는 <strong>전주대비 절대 변동량</strong> (예: +1,500원). 단기 모멘텀 참고용.
            </p>
          </HelpSection>

          <HelpSection icon="📈" title="최근 8주 추세 (스파크라인)">
            <p>종목명 옆 작은 라인은 최근 8주 종가 추이예요.</p>
            <p className="text-cyan-300/70 text-xs">
              한눈에 우상향/우하향/박스권 흐름을 비교할 수 있어 매수 종목 후보 좁히기에 좋아요.
            </p>
          </HelpSection>

          <HelpSection icon="🌐" title="시장 분위기">
            <p>하단에 오늘 전체 10종목 중 상승·하락·보합 분포를 표시해요.</p>
            <div className="flex items-center gap-3 text-sm font-mono mt-1">
              <span className="text-rise">▲ 상승 (0.5% 이상 오른 종목)</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-mono">
              <span className="text-fall">▼ 하락 (0.5% 이상 내린 종목)</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-mono">
              <span className="text-slate-100">— 보합 (변동 거의 없음)</span>
            </div>
          </HelpSection>

          <HelpSection icon="🛒" title="일괄 매수">
            <p>
              버튼을 누르면 수량 &gt; 0인 모든 종목을 한 번에 매수해요.
              체결 후 수량은 자동으로 리셋됩니다.
            </p>
            <p>
              <strong>예상 금액</strong>이 보유 현금을 넘으면 버튼이 비활성화되고 <strong className="text-rise">부족 금액</strong>이 표시돼요.
            </p>
            <p>
              매수 후 잔액이 미리 표시되니 다음 라운드를 위한 현금 여유도 함께 보고 결정하세요.
            </p>
          </HelpSection>

          {/* 팁 */}
          <div className="mt-4 px-4 py-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5 text-xs text-cyan-200 font-mono leading-relaxed">
            <strong className="text-cyan-100">💡 TIP</strong> · <strong>종목분석</strong>에서 차트를 확인한 뒤 종목을 구매하는 흐름으로 진행하세요.
          </div>
    </HelpOverlayShell>
  )
}

// ─────────────────────────────────────────────────────────
// 주식 판매 도움말 오버레이 — 로즈 톤
// ─────────────────────────────────────────────────────────
function SellHelpOverlay({ onClose }) {
  return (
    <HelpOverlayShell tone="rose" onClose={onClose}>
          <HelpSection tone="rose" icon="💰" title="보유 현금">
            <p>매도 후 받게 될 현금이 합산되어 잔액으로 늘어나요.</p>
          </HelpSection>

          <HelpSection tone="rose" icon="📉" title="매도 종목 선택">
            <p>현재 <strong className="text-rose-200">보유 중인 종목만</strong> 리스트에 표시돼요.</p>
            <p>각 종목 행의 <strong className="text-rose-200">수량 컨트롤(− N +)</strong>로 팔 주식 수를 정하세요. 보유 수량을 초과해서 팔 수 없습니다.</p>
            <p className="text-rose-300/70 text-xs">매도 대상 종목은 좌측에 로즈 액센트 바가 점등되고 종목명이 강조됩니다.</p>
          </HelpSection>

          <HelpSection tone="rose" icon="⚡" title="빠른 단축 액션">
            <p>
              <strong className="text-rose-200">전체 매도</strong>: 보유 종목 전부를 보유 수량만큼 자동 설정.
            </p>
            <p>
              <strong className="text-rose-200">전체 해제</strong>: 모든 종목 수량을 0으로 리셋.
            </p>
          </HelpSection>

          <HelpSection tone="rose" icon="🔺" title="등락률 보기">
            <div className="flex items-center gap-2">
              <span className="text-rise font-mono">▲ +2.34%</span>
              <span>: 저번 주 대비 상승률 (빨강)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-fall font-mono">▼ -1.85%</span>
              <span>: 저번 주 대비 하락률 (파랑)</span>
            </div>
            <p className="text-rose-300/70 text-xs">
              그 아래 작은 숫자는 <strong>전주대비 절대 변동량</strong>. 단기 모멘텀 참고용이에요.
            </p>
          </HelpSection>

          <HelpSection tone="rose" icon="📈" title="최근 8주 추세 (스파크라인)">
            <p>종목명 옆 작은 라인은 최근 8주 종가 추이예요.</p>
            <p className="text-rose-300/70 text-xs">
              우상향이면 추세가 더 갈 수도, 우하향이면 손절·익절 타이밍을 고민해볼 수 있어요.
            </p>
          </HelpSection>

          <HelpSection tone="rose" icon="🌐" title="시장 분위기">
            <p>전체 10종목 중 상승·하락·보합 분포를 보여줘요.</p>
            <div className="flex items-center gap-3 text-sm font-mono mt-1">
              <span className="text-rise">▲ 상승</span>
              <span className="text-fall">▼ 하락</span>
              <span className="text-slate-100">— 보합</span>
            </div>
          </HelpSection>

          <HelpSection tone="rose" icon="💸" title="일괄 매도">
            <p>
              버튼을 누르면 수량 &gt; 0인 모든 종목을 한 번에 매도해요. 체결 후 수량은 자동으로 리셋됩니다.
            </p>
            <p>
              <strong>매도 수익</strong>이 현재 현금에 더해진 <strong>매도 후 예상 현금</strong>이 미리 표시돼요.
            </p>
          </HelpSection>

          {/* 팁 */}
          <div className="mt-4 px-4 py-3 rounded-lg border border-rose-500/30 bg-rose-500/5 text-xs text-rose-200 font-mono leading-relaxed">
            <strong className="text-rose-100">💡 TIP</strong> · <strong>종목분석</strong>에서 차트와 지표를 확인한 뒤 종목을 매도하는 흐름으로 진행하세요.
          </div>
    </HelpOverlayShell>
  )
}

// ─────────────────────────────────────────────────────────
// 팝업 컨테이너 — 분석/매수/매도 공통 모달
// ─────────────────────────────────────────────────────────
function PopupOverlay({ activePopup, selectedStockId, setSelectedStockId, onClose }) {
  // store 의존 데이터는 부모(MarketPage)에서 prop drilling 대신 직접 구독
  const activeStocks       = useGameStore((s) => s.activeStocks)
  const prices             = useGameStore((s) => s.prices)
  const portfolio          = useGameStore((s) => s.portfolio)
  const cash               = useGameStore((s) => s.cash)
  const buyStock           = useGameStore((s) => s.buyStock)
  const sellStock          = useGameStore((s) => s.sellStock)
  const maPurchased        = useGameStore((s) => s.maPurchased)
  const bollingerPurchased = useGameStore((s) => s.bollingerPurchased)
  const macdPurchased      = useGameStore((s) => s.macdPurchased)
  const obvPurchased       = useGameStore((s) => s.obvPurchased)

  const [showAnalysisHelp, setShowAnalysisHelp] = useState(false)
  const [showBuyHelp, setShowBuyHelp] = useState(false)
  const [showSellHelp, setShowSellHelp] = useState(false)

  // 종목 분석 — 커스텀 16:9 배경 이미지 사용 (타이틀·도움말·이전·닫기 버튼이 이미지에 그려져 있어 hotspot으로 처리)
  if (activePopup === 'analysis') {
    return (
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 animate-page-enter"
        onClick={onClose}
      >
        <div
          className="relative"
          style={{
            width: 'min(96vw, calc(94vh * 16 / 9))',
            height: 'min(94vh, calc(96vw * 9 / 16))',
            backgroundImage: "url('/images/stock-analysis-bg.webp')",
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 상단 우측 그려진 버튼 위 hotspot — 좌표는 HOTSPOT.analysis 상수 */}
          <Hotspot label="도움말" className="absolute rounded-lg"
            style={HOTSPOT.analysis.help} onClick={() => setShowAnalysisHelp(true)} />
          <Hotspot label="닫기" className="absolute rounded-lg"
            style={HOTSPOT.analysis.close} onClick={onClose} />

          {/* 도움말 오버레이 — 모달 안에 떠서 차트 위에 설명 표시 */}
          {showAnalysisHelp && (
            <AnalysisHelpOverlay onClose={() => setShowAnalysisHelp(false)} />
          )}

          {/* 콘텐츠 영역 — 좌측 그리드 패널 영역 (우측 캐릭터·말풍선 영역 제외) */}
          <div className="absolute" style={ANALYSIS_CONTENT_BOUNDS}>
            <StockAnalysisPanel
              stocks={activeStocks}
              prices={prices}
              portfolio={portfolio}
              selectedStockId={selectedStockId}
              setSelectedStockId={setSelectedStockId}
              maPurchased={maPurchased}
              bollingerPurchased={bollingerPurchased}
              macdPurchased={macdPurchased}
              obvPurchased={obvPurchased}
            />
          </div>
        </div>
      </div>
    )
  }

  // 주식 구매 — 커스텀 16:9 배경 이미지 사용 (타이틀·도움말·닫기 버튼이 이미지에 그려져 있어 hotspot으로 처리)
  if (activePopup === 'buy') {
    return (
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 animate-page-enter"
        onClick={onClose}
      >
        <div
          className="relative"
          style={{
            width: 'min(96vw, calc(94vh * 16 / 9))',
            height: 'min(94vh, calc(96vw * 9 / 16))',
            backgroundImage: "url('/images/stock-buy-bg.webp')",
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 상단 우측 그려진 버튼 위 hotspot — 좌표는 HOTSPOT.buy 상수 */}
          <Hotspot label="도움말" className="absolute rounded-lg"
            style={HOTSPOT.buy.help} onClick={() => setShowBuyHelp(true)} />
          <Hotspot label="닫기" className="absolute rounded-lg"
            style={HOTSPOT.buy.close} onClick={onClose} />

          {/* 도움말 오버레이 — 모달 안에 떠서 차트 위에 설명 표시 */}
          {showBuyHelp && (
            <BuyHelpOverlay onClose={() => setShowBuyHelp(false)} />
          )}

          {/* 콘텐츠 영역 — 좌측 패널 영역 (우측 캐릭터·말풍선 영역 제외) */}
          <div className="absolute" style={TRADE_CONTENT_BOUNDS}>
            <BulkBuyPanel
              stocks={activeStocks}
              prices={prices}
              portfolio={portfolio}
              cash={cash}
              onBuy={buyStock}
            />
          </div>
        </div>
      </div>
    )
  }

  // 주식 판매 — 커스텀 16:9 배경 이미지 사용 (로즈/레드 톤, 매수와 동일 패턴)
  if (activePopup === 'sell') {
    return (
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 animate-page-enter"
        onClick={onClose}
      >
        <div
          className="relative"
          style={{
            width: 'min(96vw, calc(94vh * 16 / 9))',
            height: 'min(94vh, calc(96vw * 9 / 16))',
            backgroundImage: "url('/images/stock-sell-bg.webp')",
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 상단 우측 그려진 버튼 위 hotspot — 좌표는 HOTSPOT.sell 상수 */}
          <Hotspot label="도움말" className="absolute rounded-lg" glowColor="red"
            style={HOTSPOT.sell.help} onClick={() => setShowSellHelp(true)} />
          <Hotspot label="닫기" className="absolute rounded-lg" glowColor="red"
            style={HOTSPOT.sell.close} onClick={onClose} />

          {/* 도움말 오버레이 — 모달 안에 떠서 차트 위에 설명 표시 */}
          {showSellHelp && (
            <SellHelpOverlay onClose={() => setShowSellHelp(false)} />
          )}

          {/* 콘텐츠 영역 — 좌측 패널 영역 (우측 캐릭터·말풍선 제외) */}
          <div className="absolute" style={TRADE_CONTENT_BOUNDS}>
            <BulkSellPanel
              stocks={activeStocks}
              prices={prices}
              portfolio={portfolio}
              cash={cash}
              onSell={sellStock}
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}

// 등락률(%)을 초보자용 자연어로 변환 — "▲ 2.34%" 같은 숫자는 처음 보는 사람에게 의미 없음
// abs < 0.5%: 거의 그대로 / < 2%: 조금 / < 5%: (기본) / >= 5%: 많이
// 아이콘은 emoji 대신 유니코드 삼각형 사용 — CSS color로 자유롭게 적용 가능 (emoji는 색상 고정)
function friendlyChange(percent) {
  const abs = Math.abs(percent)
  if (abs < 0.5) return { emoji: '—', label: '거의 그대로', tone: 'flat' }
  const tone = percent >= 0 ? 'up' : 'down'
  const emoji = percent >= 0 ? '▲' : '▼'
  const verb = percent >= 0 ? '올랐어요' : '내렸어요'
  let degree = ''
  if (abs < 2) degree = '조금 '
  else if (abs >= 5) degree = '많이 '
  return { emoji, label: `${degree}${verb}`, tone }
}

// 한국 증시 컨벤션: 상승=빨강, 하락=파랑. 보합은 흰색
const TONE_CLASS = {
  up: 'text-rise',
  down: 'text-fall',
  flat: 'text-slate-100',
}

// 종목분석 패널 — KRX 디지털 보드 톤의 멀티 패널 레이아웃
// 상단: 종목 헤더 + 가로 칩 선택기 / 본문: 메인 차트 + MACD + OBV 패널 세로 스택
function StockAnalysisPanel({
  stocks, prices, portfolio,
  selectedStockId, setSelectedStockId,
  maPurchased, bollingerPurchased, macdPurchased, obvPurchased,
}) {
  const turn = useGameStore((s) => s.turn)
  // 진입 시 첫 종목 자동 선택 — 빈 차트 화면 방지
  useEffect(() => {
    if (!selectedStockId && stocks.length > 0) {
      setSelectedStockId(stocks[0].id)
    }
  }, [stocks, selectedStockId, setSelectedStockId])

  const selectedStock = stocks.find((s) => s.id === selectedStockId)
  const currentPrice = selectedStock ? (prices[selectedStock.id] ?? selectedStock.price) : 0
  // 헤더의 변동 표시도 저번 주 종가 기준 — 사이드바·매수·매도 모달과 동일
  // (selectedCloses는 N 제한 없이 전체를 사용하지만 마지막 2개만 필요하므로 그냥 2개만 조회)
  const selectedRecent = selectedStock ? getRecentCloses(selectedStock.id, turn, 2) : []
  const headerPrevWeekClose = selectedRecent.length >= 2 ? selectedRecent[0] : currentPrice
  const priceDiff = selectedStock ? currentPrice - headerPrevWeekClose : 0
  const changePct = selectedStock && headerPrevWeekClose !== 0 ? (priceDiff / headerPrevWeekClose) * 100 : 0
  const headerMood = friendlyChange(changePct)
  const heldQty = selectedStock ? (portfolio[selectedStock.id] || 0) : 0

  return (
    <div className="flex gap-3 h-full min-h-0">
      {/* 좌: 종목 사이드바 — 세로 리스트 + 시안 글로우 스크롤바 */}
      <div className="w-56 shrink-0 flex flex-col border-r border-cyan-500/20 pr-2 min-h-0">
        <p className="text-xs text-cyan-300/60 font-mono tracking-wider mb-2 px-1 shrink-0">
          📊 종목 ({stocks.length})
        </p>
        <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 space-y-1 scrollbar-cyan">
          {stocks.map((stock) => {
            const stockPrice = prices[stock.id] ?? stock.price
            // 전주 종가 기준으로 등락률 % 계산 (매수·매도 모달과 동기)
            const recentCloses = getRecentCloses(stock.id, turn, 8)
            const prevWeekClose = recentCloses.length >= 2 ? recentCloses[recentCloses.length - 2] : stockPrice
            const stockChange = prevWeekClose !== 0 ? ((stockPrice - prevWeekClose) / prevWeekClose) * 100 : 0
            const mood = friendlyChange(stockChange)
            const isActive = stock.id === selectedStockId
            const stockHeld = portfolio[stock.id] || 0
            return (
              <button
                key={stock.id}
                onClick={() => setSelectedStockId(stock.id)}
                style={{ outline: 'none' }}
                className={
                  'w-full text-left px-2.5 py-1.5 rounded-md border transition-all duration-150 focus:outline-none ' +
                  (isActive
                    ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                    : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-cyan-500/40')
                }
              >
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-sm font-semibold text-slate-100 truncate">
                    {isActive && <span className="text-cyan-400 mr-0.5">◎</span>}
                    {stock.name}
                  </span>
                  <span className="text-sm font-bold text-cyan-100 font-mono tabular-nums shrink-0">
                    {stockPrice.toLocaleString()}<span className="text-cyan-300/60 text-[10px] ml-0.5">원</span>
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-1 mt-0.5">
                  <span className={`text-xs font-mono tabular-nums ${TONE_CLASS[mood.tone]}`}>
                    {mood.emoji} {stockChange >= 0 ? '+' : ''}{stockChange.toFixed(2)}%
                  </span>
                  {stockHeld > 0 && (
                    <span className="text-[11px] text-yellow-400 font-mono shrink-0">{stockHeld}주</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 우: 선택 종목 헤더 + 멀티 패널 차트 */}
      <div className="flex-1 min-w-0 flex flex-col gap-2 min-h-0">
        {selectedStock ? (
          <>
            {/* 선택 종목 헤더 */}
            <div className="shrink-0 flex items-baseline justify-between flex-wrap gap-2 pb-2 border-b border-cyan-500/25 relative">
              <span className="absolute -top-px left-0 h-px w-24 bg-gradient-to-r from-cyan-400 to-transparent" />
              <div className="flex items-baseline gap-3 flex-wrap">
                <h3 className="text-xl font-bold text-cyan-50 font-mono tracking-wider">
                  {selectedStock.name}
                </h3>
                <span className="text-xs text-cyan-300/60 font-mono">{selectedStock.sector}</span>
                {heldQty > 0 && (
                  <span className="text-xs text-yellow-400 font-mono">💰 {heldQty}주 보유</span>
                )}
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl font-bold text-cyan-100 font-mono tabular-nums tracking-tight drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                  {currentPrice.toLocaleString()}<span className="text-cyan-300/70 text-base ml-1">원</span>
                </span>
                <span className={`text-sm font-semibold ${TONE_CLASS[headerMood.tone]}`}>
                  {headerMood.emoji}{' '}
                  {headerMood.tone === 'flat'
                    ? '지난 주와 거의 같아요'
                    : `지난 주보다 ${Math.abs(priceDiff).toLocaleString()}원 ${headerMood.tone === 'up' ? '올랐어요' : '내렸어요'}`}
                </span>
              </div>
            </div>

            {/* 차트 패널 스택 — 스크롤 영역 (pt-3: 첫 패널의 -top 라벨이 잘리지 않도록 여유) */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-cyan -mr-1 pr-1.5 pt-3">
              <StockChart
                stockId={selectedStockId}
                maPurchased={maPurchased}
                bollingerPurchased={bollingerPurchased}
                macdPurchased={macdPurchased}
                obvPurchased={obvPurchased}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-cyan-300/40 text-sm">
            좌측에서 종목을 선택하세요
          </div>
        )}
      </div>
    </div>
  )
}

// 최근 N주 종가를 작은 스파크라인으로 표시 — 종목명/등락률 사이 빈 공간에 시각 정보 제공
function MiniSparkline({ closes, width = 64, height = 20, tone = 'flat' }) {
  if (!closes || closes.length < 2) return <span className="shrink-0" style={{ width, height }} />
  const min = Math.min(...closes)
  const max = Math.max(...closes)
  const range = max - min || 1
  const pts = closes
    .map((p, i) => {
      const x = (i / (closes.length - 1)) * (width - 2) + 1
      const y = (height - 2) - ((p - min) / range) * (height - 4) + 1
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const color = tone === 'up' ? '#ef4444' : tone === 'down' ? '#3b82f6' : '#cbd5e1'
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// 주식 구매 모달 본문 — 각 종목별 자체 수량 컨트롤(+/−) + 일괄 매수
// 수량 > 0인 종목만 자동으로 매수 대상에 포함됨 (별도 체크박스 없음)
function BulkBuyPanel({ stocks, prices, portfolio, cash, onBuy }) {
  const turn = useGameStore((s) => s.turn)
  const [quantities, setQuantities] = useState({}) // { stockId: number }
  const [focusedId, setFocusedId] = useState(null) // 포커스 중인 input의 stock.id — qty=0일 때 빈 칸으로 표시

  const getQty = (id) => quantities[id] || 0
  const setQty = (id, qty) => {
    const next = Math.max(0, Math.floor(qty) || 0)
    setQuantities((prev) => ({ ...prev, [id]: next }))
  }
  const incQty = (id) => setQty(id, getQty(id) + 1)
  const decQty = (id) => setQty(id, getQty(id) - 1)

  // 전체: 모든 종목 1주씩 (이미 수량 있으면 유지). 해제: 전체 0
  const selectAll = () => {
    const next = {}
    stocks.forEach((s) => { next[s.id] = getQty(s.id) > 0 ? getQty(s.id) : 1 })
    setQuantities(next)
  }
  const clearAll = () => setQuantities({})

  const activeStocks = stocks.filter((s) => getQty(s.id) > 0)
  const selectedCount = activeStocks.length
  const totalQty = activeStocks.reduce((sum, s) => sum + getQty(s.id), 0)
  const totalCost = activeStocks.reduce((sum, s) => sum + (prices[s.id] ?? 0) * getQty(s.id), 0)
  const canAfford = totalCost <= cash
  const remainingCash = cash - totalCost

  // 시장 분위기 — 시작가 대비 0.5% 이상 변동 기준으로 상승·하락·보합 카운트
  const moodCounts = stocks.reduce(
    (acc, s) => {
      const pct = (((prices[s.id] ?? s.price) - s.price) / s.price) * 100
      if (pct >= 0.5) acc.up += 1
      else if (pct <= -0.5) acc.down += 1
      else acc.flat += 1
      return acc
    },
    { up: 0, down: 0, flat: 0 }
  )

  const handleBulkBuy = () => {
    if (selectedCount === 0 || !canAfford) return
    activeStocks.forEach((s) => onBuy(s.id, getQty(s.id)))
    setQuantities({})
  }

  return (
    <div className="flex flex-col h-full gap-2 min-h-0 text-cyan-100">
      {/* 보유 현금 — 박스 없이 라인 강조 */}
      <div className="shrink-0 flex items-baseline justify-between pb-3 border-b border-cyan-500/20">
        <span className="text-base text-cyan-300/70 font-mono tracking-[0.2em]">💰 보유 현금</span>
        <span className="text-3xl font-bold text-cyan-50 font-mono tabular-nums drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
          {cash.toLocaleString()}
          <span className="text-cyan-300/60 text-base ml-1">원</span>
        </span>
      </div>

      {/* 종목 헤더 — 매수 종목 카운트 + 전체/해제 단축 */}
      <div className="shrink-0 flex items-center justify-between mt-1">
        <p className="text-base text-cyan-300/70 font-mono tracking-[0.15em]">
          📊 매수 종목{' '}
          <span className="text-cyan-200 font-bold">{selectedCount}</span>
          <span className="text-cyan-500/40"> / {stocks.length}</span>
        </p>
        <div className="flex items-center gap-3 text-sm font-mono tracking-wider">
          <button
            onClick={selectAll}
            style={{ outline: 'none' }}
            className="text-cyan-300/70 hover:text-cyan-100 transition-colors focus:outline-none"
          >
            전체 1주
          </button>
          <span className="text-cyan-500/30">|</span>
          <button
            onClick={clearAll}
            style={{ outline: 'none' }}
            className="text-cyan-300/70 hover:text-cyan-100 transition-colors focus:outline-none"
          >
            전체 해제
          </button>
        </div>
      </div>

      {/* 종목 리스트 — 각 행에 자체 수량 컨트롤 */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-cyan -mr-1 pr-1">
        {stocks.map((stock) => {
          const stockPrice = prices[stock.id] ?? stock.price
          const qty = getQty(stock.id)
          const isActive = qty > 0
          const stockHeld = portfolio[stock.id] || 0
          const subTotal = stockPrice * qty

          // 최근 8주 종가 — 스파크라인 + 전주대비 계산용
          const recentCloses = getRecentCloses(stock.id, turn, 8)

          // 전주대비 — 지난 주 종가 기준으로 % 및 절대 변동량 계산
          const prevWeekClose = recentCloses.length >= 2 ? recentCloses[recentCloses.length - 2] : stockPrice
          const weekDiff = stockPrice - prevWeekClose
          const weekDiffSign = weekDiff > 0 ? '+' : ''
          const stockChange = prevWeekClose !== 0 ? (weekDiff / prevWeekClose) * 100 : 0
          const changeSign = stockChange > 0 ? '+' : ''
          const mood = friendlyChange(stockChange)
          const weekTone = mood.tone

          return (
            <div
              key={stock.id}
              className={
                'w-full px-2 py-2.5 flex items-center gap-3 transition-all duration-150 border-l-2 border-b border-b-cyan-500/10 ' +
                (isActive
                  ? 'border-l-cyan-400 bg-cyan-400/10'
                  : 'border-l-transparent hover:bg-cyan-400/5')
              }
            >
              {/* 종목명 + 섹터 태그 + 보유 배지 (인라인) */}
              <div className="flex items-baseline gap-2 flex-1 min-w-0">
                <span
                  className={`text-lg font-semibold truncate ${
                    isActive ? 'text-cyan-50' : 'text-slate-100'
                  }`}
                >
                  {stock.name}
                </span>
                <span className="shrink-0 text-[11px] text-cyan-300/60 font-mono tracking-wider border border-cyan-500/20 rounded px-1.5 py-0.5">
                  {stock.sector}
                </span>
                {stockHeld > 0 && (
                  <span className="shrink-0 text-xs text-yellow-400/90 font-mono tabular-nums bg-yellow-500/10 border border-yellow-500/30 rounded px-1.5 py-0.5">
                    💰 {stockHeld}주
                  </span>
                )}
              </div>
              {/* 최근 8주 추세 미니 스파크라인 */}
              <div className="shrink-0 flex flex-col items-center gap-0.5">
                <span className="text-xs text-cyan-300/50 font-mono tracking-wider">최근 8주</span>
                <MiniSparkline closes={recentCloses} tone={mood.tone} />
              </div>
              {/* 등락률 % + 전주대비 절대값 (스택) */}
              <div className="shrink-0 w-28 text-right font-mono tabular-nums flex flex-col items-end leading-tight">
                <span className={`text-base font-semibold ${TONE_CLASS[mood.tone]}`}>
                  {mood.emoji} {changeSign}{stockChange.toFixed(2)}%
                </span>
                <span className={`text-xs ${TONE_CLASS[weekTone]}`}>
                  {weekDiffSign}{weekDiff.toLocaleString()}원
                </span>
              </div>
              {/* 가격 */}
              <span className="shrink-0 w-32 text-right text-lg font-bold text-cyan-100 font-mono tabular-nums">
                {stockPrice.toLocaleString()}
                <span className="text-cyan-300/60 text-sm ml-0.5">원</span>
              </span>
              {/* 수량 컨트롤 — 항상 노출 (qty=0이면 회색) */}
              <div className="shrink-0 flex items-center gap-1">
                <button
                  onClick={() => decQty(stock.id)}
                  disabled={qty === 0}
                  style={{ outline: 'none' }}
                  className="w-8 h-8 rounded border border-cyan-500/30 text-cyan-300 hover:text-cyan-100 hover:border-cyan-400 hover:shadow-[0_0_6px_rgba(34,211,238,0.3)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-cyan-500/30 disabled:hover:shadow-none transition-all focus:outline-none font-bold text-base"
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  value={focusedId === stock.id && qty === 0 ? '' : qty}
                  onChange={(e) => setQty(stock.id, parseInt(e.target.value) || 0)}
                  onFocus={(e) => { setFocusedId(stock.id); e.target.select() }}
                  onBlur={() => setFocusedId(null)}
                  className={
                    'w-14 px-1 py-1 rounded bg-transparent border text-center text-base font-mono tabular-nums focus:outline-none transition-all ' +
                    (isActive
                      ? 'border-cyan-400 text-cyan-50 focus:shadow-[0_0_6px_rgba(34,211,238,0.4)]'
                      : 'border-cyan-500/30 text-cyan-300/60 focus:border-cyan-400 focus:text-cyan-100')
                  }
                />
                <button
                  onClick={() => incQty(stock.id)}
                  style={{ outline: 'none' }}
                  className="w-8 h-8 rounded border border-cyan-500/30 text-cyan-300 hover:text-cyan-100 hover:border-cyan-400 hover:shadow-[0_0_6px_rgba(34,211,238,0.3)] transition-all focus:outline-none font-bold text-base"
                >
                  ＋
                </button>
                {/* MAX — 다른 종목 매수 금액을 제외한 잔액으로 살 수 있는 최대 수량 */}
                <button
                  onClick={() => {
                    const available = cash - totalCost + subTotal
                    const maxQty = stockPrice > 0 ? Math.max(0, Math.floor(available / stockPrice)) : 0
                    setQty(stock.id, maxQty)
                  }}
                  disabled={stockPrice <= 0 || (cash - totalCost + subTotal) < stockPrice}
                  style={{ outline: 'none' }}
                  className="px-2 h-8 rounded border border-cyan-500/30 text-cyan-300 hover:text-cyan-100 hover:border-cyan-400 hover:shadow-[0_0_6px_rgba(34,211,238,0.3)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-cyan-500/30 disabled:hover:shadow-none transition-all focus:outline-none font-bold text-xs font-mono tracking-wider"
                  title="가능한 최대 수량으로 설정"
                >
                  MAX
                </button>
              </div>
              {/* 매수 대상일 때만 소계 표시 */}
              <span className="shrink-0 w-28 text-right font-mono tabular-nums">
                {isActive && (
                  <span className="text-cyan-200 font-bold text-sm">
                    {subTotal.toLocaleString()}<span className="text-xs ml-0.5">원</span>
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>

      {/* 하단 영역 — 시장 분위기 + 합계 + 매수 후 잔액 + 일괄 매수 */}
      <div className="shrink-0 flex flex-col gap-2.5 pt-3 border-t border-cyan-500/30">
        {/* 시장 분위기 — 오늘 N종목 중 X상승 Y하락 Z보합 */}
        <div className="flex items-center justify-between gap-3 text-sm font-mono">
          <span className="text-cyan-300/60 tracking-[0.15em]">🌐 시장 분위기</span>
          <div className="flex items-center gap-3 tabular-nums">
            <span className="text-rise">▲ {moodCounts.up}</span>
            <span className="text-fall">▼ {moodCounts.down}</span>
            <span className="text-slate-100">— {moodCounts.flat}</span>
          </div>
        </div>

        {/* 요약 라인 — 종목/주수 + 합계 금액 */}
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-base text-cyan-300/70 font-mono tracking-[0.15em]">
            {selectedCount > 0
              ? <>📦 {selectedCount}종목 · 총 <span className="text-cyan-100 font-bold">{totalQty}</span>주</>
              : <span className="text-cyan-300/50">수량을 입력하면 매수 대상이 됩니다</span>}
          </span>
          <div className="text-right">
            <p className="text-sm text-cyan-300/80 font-mono tracking-[0.15em] [text-shadow:_0_0_4px_rgba(0,0,0,0.9)]">합계</p>
            <p className={`text-2xl font-bold font-mono tabular-nums [text-shadow:_0_0_5px_rgba(0,0,0,0.95),_0_0_12px_rgba(0,0,0,0.7)] ${canAfford ? 'text-cyan-50' : 'text-rise'}`}>
              {totalCost.toLocaleString()}
              <span className="text-cyan-300/80 text-base ml-0.5">원</span>
            </p>
          </div>
        </div>

        {/* 매수 후 예상 잔액 — 결정에 직접 도움되는 정보 */}
        {selectedCount > 0 && (
          <div className="flex items-baseline justify-between gap-3 text-sm font-mono pl-2 border-l-2 border-cyan-500/30">
            <span className="text-cyan-300/80 tracking-[0.1em] [text-shadow:_0_0_4px_rgba(0,0,0,0.9)]">매수 후 예상 잔액</span>
            <span className={`tabular-nums font-bold [text-shadow:_0_0_4px_rgba(0,0,0,0.95),_0_0_10px_rgba(0,0,0,0.7)] ${canAfford ? 'text-cyan-200' : 'text-rise'}`}>
              {remainingCash.toLocaleString()}<span className="text-cyan-300/80 text-xs ml-0.5">원</span>
            </span>
          </div>
        )}

        {/* 일괄 매수 버튼 */}
        <button
          onClick={handleBulkBuy}
          disabled={selectedCount === 0 || !canAfford}
          style={{ outline: 'none' }}
          className={
            'w-full px-3 py-3.5 rounded font-mono tracking-[0.2em] font-bold text-lg transition-all duration-150 focus:outline-none border ' +
            (selectedCount === 0 || !canAfford
              ? 'bg-slate-900/40 text-cyan-300/30 border-cyan-500/15 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500/20 via-cyan-400/25 to-cyan-500/20 text-cyan-50 border-cyan-400 hover:from-cyan-500/30 hover:via-cyan-400/40 hover:to-cyan-500/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]')
          }
        >
          {selectedCount === 0
            ? '수량을 입력하세요'
            : !canAfford
            ? `잔액 부족 — ${(totalCost - cash).toLocaleString()}원 부족`
            : `🛒 ${selectedCount}종목 · ${totalQty}주 일괄 매수`}
        </button>
      </div>
    </div>
  )
}

// 주식 판매 모달 본문 — 보유 종목만 노출 + 종목별 매도 수량 컨트롤 + 일괄 매도
// BulkBuyPanel과 동일한 구조지만 로즈/레드 톤으로 매도 컨텍스트 구분
function BulkSellPanel({ stocks, prices, portfolio, cash, onSell }) {
  const turn = useGameStore((s) => s.turn)
  const [quantities, setQuantities] = useState({}) // { stockId: number }
  const [focusedId, setFocusedId] = useState(null) // 포커스 중인 input의 stock.id — qty=0일 때 빈 칸으로 표시

  // 보유 종목만 노출
  const heldStocks = stocks.filter((s) => (portfolio[s.id] || 0) > 0)

  const getQty = (id) => quantities[id] || 0
  const setQty = (id, qty) => {
    const held = portfolio[id] || 0
    const next = Math.max(0, Math.min(held, Math.floor(qty) || 0))
    setQuantities((prev) => ({ ...prev, [id]: next }))
  }
  const incQty = (id) => setQty(id, getQty(id) + 1)
  const decQty = (id) => setQty(id, getQty(id) - 1)

  // 전체 매도: 보유 종목 전부를 보유 수량만큼 / 전체 해제: 0
  const sellAll = () => {
    const next = {}
    heldStocks.forEach((s) => { next[s.id] = portfolio[s.id] || 0 })
    setQuantities(next)
  }
  const clearAll = () => setQuantities({})

  const activeSells = heldStocks.filter((s) => getQty(s.id) > 0)
  const selectedCount = activeSells.length
  const totalQty = activeSells.reduce((sum, s) => sum + getQty(s.id), 0)
  const totalProceeds = activeSells.reduce((sum, s) => sum + (prices[s.id] ?? 0) * getQty(s.id), 0)
  const remainingCash = cash + totalProceeds

  // 시장 분위기 (전체 종목 기준, 매수 모달과 동일)
  const moodCounts = stocks.reduce(
    (acc, s) => {
      const pct = (((prices[s.id] ?? s.price) - s.price) / s.price) * 100
      if (pct >= 0.5) acc.up += 1
      else if (pct <= -0.5) acc.down += 1
      else acc.flat += 1
      return acc
    },
    { up: 0, down: 0, flat: 0 }
  )

  const handleBulkSell = () => {
    if (selectedCount === 0) return
    activeSells.forEach((s) => onSell(s.id, getQty(s.id)))
    setQuantities({})
  }

  return (
    <div className="flex flex-col h-full gap-2 min-h-0 text-rose-50">
      {/* 보유 현금 — 로즈 라인 강조 */}
      <div className="shrink-0 flex items-baseline justify-between pb-3 border-b border-rose-500/20">
        <span className="text-base text-rose-300/70 font-mono tracking-[0.2em]">💰 보유 현금</span>
        <span className="text-3xl font-bold text-rose-50 font-mono tabular-nums drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">
          {cash.toLocaleString()}
          <span className="text-rose-300/60 text-base ml-1">원</span>
        </span>
      </div>

      {/* 종목 헤더 — 매도 종목 카운트 + 전량/해제 단축 */}
      <div className="shrink-0 flex items-center justify-between mt-1">
        <p className="text-base text-rose-300/70 font-mono tracking-[0.15em]">
          📉 매도 종목{' '}
          <span className="text-rose-200 font-bold">{selectedCount}</span>
          <span className="text-rose-500/40"> / {heldStocks.length}</span>
        </p>
        <div className="flex items-center gap-3 text-sm font-mono tracking-wider">
          <button
            onClick={sellAll}
            disabled={heldStocks.length === 0}
            style={{ outline: 'none' }}
            className="text-rose-300/70 hover:text-rose-100 disabled:opacity-30 disabled:hover:text-rose-300/70 transition-colors focus:outline-none"
          >
            전체 매도
          </button>
          <span className="text-rose-500/30">|</span>
          <button
            onClick={clearAll}
            style={{ outline: 'none' }}
            className="text-rose-300/70 hover:text-rose-100 transition-colors focus:outline-none"
          >
            전체 해제
          </button>
        </div>
      </div>

      {/* 종목 리스트 — 보유 종목만, 매도 수량 컨트롤 */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-rose -mr-1 pr-1">
        {heldStocks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-rose-300/40 font-mono tracking-wider">
            보유 중인 종목이 없습니다
          </div>
        ) : (
          heldStocks.map((stock) => {
            const stockPrice = prices[stock.id] ?? stock.price
            const qty = getQty(stock.id)
            const isActive = qty > 0
            const stockHeld = portfolio[stock.id] || 0
            const subTotal = stockPrice * qty

            // 최근 8주 종가 + 전주대비
            const recentCloses = getRecentCloses(stock.id, turn, 8)

            // 전주대비 — 지난 주 종가 기준으로 % 및 절대 변동량 계산
            const prevWeekClose = recentCloses.length >= 2 ? recentCloses[recentCloses.length - 2] : stockPrice
            const weekDiff = stockPrice - prevWeekClose
            const weekDiffSign = weekDiff > 0 ? '+' : ''
            const stockChange = prevWeekClose !== 0 ? (weekDiff / prevWeekClose) * 100 : 0
            const changeSign = stockChange > 0 ? '+' : ''
            const mood = friendlyChange(stockChange)
            const weekTone = mood.tone

            return (
              <div
                key={stock.id}
                className={
                  'w-full px-2 py-2.5 flex items-center gap-3 transition-all duration-150 border-l-2 border-b border-b-rose-500/10 ' +
                  (isActive
                    ? 'border-l-rose-400 bg-rose-400/10'
                    : 'border-l-transparent hover:bg-rose-400/5')
                }
              >
                {/* 종목명 + 섹터 + 보유 배지 */}
                <div className="flex items-baseline gap-2 flex-1 min-w-0">
                  <span
                    className={`text-lg font-semibold truncate ${
                      isActive ? 'text-rose-50' : 'text-slate-100'
                    }`}
                  >
                    {stock.name}
                  </span>
                  <span className="shrink-0 text-[11px] text-rose-300/60 font-mono tracking-wider border border-rose-500/20 rounded px-1.5 py-0.5">
                    {stock.sector}
                  </span>
                  <span className="shrink-0 text-xs text-yellow-400/90 font-mono tabular-nums bg-yellow-500/10 border border-yellow-500/30 rounded px-1.5 py-0.5">
                    💰 {stockHeld}주
                  </span>
                </div>
                {/* 미니 스파크라인 */}
                <div className="shrink-0 flex flex-col items-center gap-0.5">
                  <span className="text-xs text-rose-300/50 font-mono tracking-wider">최근 8주</span>
                  <MiniSparkline closes={recentCloses} tone={mood.tone} />
                </div>
                {/* 등락률 % + 전주대비 절대값 (스택) */}
                <div className="shrink-0 w-28 text-right font-mono tabular-nums flex flex-col items-end leading-tight">
                  <span className={`text-base font-semibold ${TONE_CLASS[mood.tone]}`}>
                    {mood.emoji} {changeSign}{stockChange.toFixed(2)}%
                  </span>
                  <span className={`text-xs ${TONE_CLASS[weekTone]}`}>
                    {weekDiffSign}{weekDiff.toLocaleString()}원
                  </span>
                </div>
                {/* 가격 */}
                <span className="shrink-0 w-32 text-right text-lg font-bold text-rose-100 font-mono tabular-nums">
                  {stockPrice.toLocaleString()}
                  <span className="text-rose-300/60 text-sm ml-0.5">원</span>
                </span>
                {/* 매도 수량 컨트롤 — max는 보유 수량 */}
                <div className="shrink-0 flex items-center gap-1">
                  <button
                    onClick={() => decQty(stock.id)}
                    disabled={qty === 0}
                    style={{ outline: 'none' }}
                    className="w-8 h-8 rounded border border-rose-500/30 text-rose-300 hover:text-rose-100 hover:border-rose-400 hover:shadow-[0_0_6px_rgba(244,63,94,0.3)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-rose-500/30 disabled:hover:shadow-none transition-all focus:outline-none font-bold text-base"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    max={stockHeld}
                    value={focusedId === stock.id && qty === 0 ? '' : qty}
                    onChange={(e) => setQty(stock.id, parseInt(e.target.value) || 0)}
                    onFocus={(e) => { setFocusedId(stock.id); e.target.select() }}
                    onBlur={() => setFocusedId(null)}
                    className={
                      'w-14 px-1 py-1 rounded bg-transparent border text-center text-base font-mono tabular-nums focus:outline-none transition-all ' +
                      (isActive
                        ? 'border-rose-400 text-rose-50 focus:shadow-[0_0_6px_rgba(244,63,94,0.4)]'
                        : 'border-rose-500/30 text-rose-300/60 focus:border-rose-400 focus:text-rose-100')
                    }
                  />
                  <button
                    onClick={() => incQty(stock.id)}
                    disabled={qty >= stockHeld}
                    style={{ outline: 'none' }}
                    className="w-8 h-8 rounded border border-rose-500/30 text-rose-300 hover:text-rose-100 hover:border-rose-400 hover:shadow-[0_0_6px_rgba(244,63,94,0.3)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-rose-500/30 disabled:hover:shadow-none transition-all focus:outline-none font-bold text-base"
                  >
                    ＋
                  </button>
                  {/* MAX — 보유 수량 전체 매도 */}
                  <button
                    onClick={() => setQty(stock.id, stockHeld)}
                    disabled={qty >= stockHeld}
                    style={{ outline: 'none' }}
                    className="px-2 h-8 rounded border border-rose-500/30 text-rose-300 hover:text-rose-100 hover:border-rose-400 hover:shadow-[0_0_6px_rgba(244,63,94,0.3)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-rose-500/30 disabled:hover:shadow-none transition-all focus:outline-none font-bold text-xs font-mono tracking-wider"
                    title="보유 전부 매도"
                  >
                    MAX
                  </button>
                </div>
                {/* 매도 대상일 때만 매도 금액 표시 */}
                <span className="shrink-0 w-28 text-right font-mono tabular-nums">
                  {isActive && (
                    <span className="text-rose-200 font-bold text-sm">
                      {subTotal.toLocaleString()}<span className="text-xs ml-0.5">원</span>
                    </span>
                  )}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* 하단 영역 — 시장 분위기 + 합계 + 매도 후 잔액 + 일괄 매도 */}
      <div className="shrink-0 flex flex-col gap-2.5 pt-3 border-t border-rose-500/30">
        {/* 시장 분위기 */}
        <div className="flex items-center justify-between gap-3 text-sm font-mono">
          <span className="text-rose-300/60 tracking-[0.15em]">🌐 시장 분위기</span>
          <div className="flex items-center gap-3 tabular-nums">
            <span className="text-rise">▲ {moodCounts.up}</span>
            <span className="text-fall">▼ {moodCounts.down}</span>
            <span className="text-slate-100">— {moodCounts.flat}</span>
          </div>
        </div>

        {/* 요약 라인 */}
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-base text-rose-300/70 font-mono tracking-[0.15em]">
            {selectedCount > 0
              ? <>📦 {selectedCount}종목 · 총 <span className="text-rose-100 font-bold">{totalQty}</span>주</>
              : <span className="text-rose-300/50">매도할 수량을 입력하세요</span>}
          </span>
          <div className="text-right">
            <p className="text-sm text-rose-300/80 font-mono tracking-[0.15em] [text-shadow:_0_0_4px_rgba(0,0,0,0.9)]">매도 수익</p>
            <p className="text-2xl font-bold font-mono tabular-nums text-rose-50 [text-shadow:_0_0_5px_rgba(0,0,0,0.95),_0_0_12px_rgba(0,0,0,0.7)]">
              {totalProceeds.toLocaleString()}
              <span className="text-rose-300/80 text-base ml-0.5">원</span>
            </p>
          </div>
        </div>

        {/* 매도 후 예상 현금 */}
        {selectedCount > 0 && (
          <div className="flex items-baseline justify-between gap-3 text-sm font-mono pl-2 border-l-2 border-rose-500/30">
            <span className="text-rose-300/80 tracking-[0.1em] [text-shadow:_0_0_4px_rgba(0,0,0,0.9)]">매도 후 예상 현금</span>
            <span className="tabular-nums font-bold text-rose-200 [text-shadow:_0_0_4px_rgba(0,0,0,0.95),_0_0_10px_rgba(0,0,0,0.7)]">
              {remainingCash.toLocaleString()}<span className="text-rose-300/80 text-xs ml-0.5">원</span>
            </span>
          </div>
        )}

        {/* 일괄 매도 버튼 */}
        <button
          onClick={handleBulkSell}
          disabled={selectedCount === 0}
          style={{ outline: 'none' }}
          className={
            'w-full px-3 py-3.5 rounded font-mono tracking-[0.2em] font-bold text-lg transition-all duration-150 focus:outline-none border ' +
            (selectedCount === 0
              ? 'bg-slate-900/40 text-rose-300/30 border-rose-500/15 cursor-not-allowed'
              : 'bg-gradient-to-r from-rose-500/20 via-rose-400/25 to-rose-500/20 text-rose-50 border-rose-400 hover:from-rose-500/30 hover:via-rose-400/40 hover:to-rose-500/30 hover:shadow-[0_0_20px_rgba(244,63,94,0.5)]')
          }
        >
          {heldStocks.length === 0
            ? '보유 종목이 없습니다'
            : selectedCount === 0
            ? '매도할 수량을 입력하세요'
            : `💸 ${selectedCount}종목 · ${totalQty}주 일괄 매도`}
        </button>
      </div>
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
      {arrow === 'up' && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-l-transparent border-r-transparent border-b-cyan-400" />
      )}
    </div>
  )
}
