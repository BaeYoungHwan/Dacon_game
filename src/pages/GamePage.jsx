// 떡상러쉬 게임 메인 화면 — NPC 3명 클릭으로 거래소·정보상·기술상 페이지 이동
// 화면 구조: 상단 이미지 영역(메인 비주얼 + NPC 클릭) | 하단 NewsPanel
//
// UI 톤: 한국거래소·HTS 배경에 맞춘 슬레이트(slate) + 시안(cyan) 디지털 보드 톤
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

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { progressTurn } from '../lib/gameLogic'
import stocks from '../data/stocks.json'
import stockData from '../data/stockData.json'
import KospiChart from '../components/game/KospiChart'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import Marquee from '../components/ui/Marquee'
import SettingsModal from '../components/game/SettingsModal'

// 전광판에 흘러갈 게임플레이 팁 — 정적 (라운드 무관)
// Marquee가 한 팁씩 우→좌로 흐르고 끝나면 다음 팁으로 자동 순환
const GAMEPLAY_TIPS = [
  '💡 정보상에서 뉴스를 미리 사면 다음 라운드 시장 변동을 엿볼 수 있다',
  '🔧 기술상은 비공개된 10종목을 유료로 공개해 거래 기회를 늘려준다',
  '📊 좌측 카드에서 현금·평가액·총자산을 실시간 확인하라',
  '📈 빨강은 상승 · 파랑은 하락 — 한국 주식 표준 색상',
  '🎯 50주 동안 자산을 늘려 코스피 지수 수익률을 이겨라',
  '🔍 KOSPI 차트를 클릭하면 큰 화면으로 자세히 볼 수 있다',
  '⏰ 다음 주 버튼은 되돌릴 수 없다 — 신중히 결정하라',
  '💰 매도 시 평균 매수가 대비 손익이 확정된다 — 타이밍이 중요',
  '🎲 비공개 종목은 정보상 추천을 보고 공개 여부를 결정하라',
]

// stocks.json의 id(realTicker)로 stockData에서 라운드별 가격 배열 찾기 위한 인덱스
const stockDataByTicker = Object.fromEntries(
  (stockData.stocks ?? []).map((s) => [s.realTicker, s])
)

// ─────────────────────────────────────────────────────────
// 핫스팟 좌표 상수 — 배경 이미지(1695×928)의 NPC 위치에 맞춘 클릭 영역
// (MarketPage / InfoMerchantPage HOTSPOT 패턴 준수 — 좌표 미세조정은 이 상수만 수정)
//   npc.market:       좌측 여성 (시장 분석가) → 거래소
//   npc.infoMerchant: 중앙 남성 (정보 브로커) → 정보상
//   npc.techMerchant: 우측 여성 (퀀트 테크니션) → 기술상
// ─────────────────────────────────────────────────────────
const HOTSPOT = {
  npc: {
    market:       { left: 'calc(42.5% - 190px)', width: '8%', top: '28%', height: '64%' } , // 좌 -190px (누적)
    infoMerchant: { left: 'calc(48% - 50px)',    width: '8%', top: '28%', height: '64%' }, // 좌 -50px
    techMerchant: { left: '57%',                 width: '8%', top: '28%', height: '64%' },
  },
}

export default function GamePage() {
  const {
    turn, totalTurns, cash, portfolio, prices,
    activeStocks, hiddenStocks,
    currentNews, currentGlobalNews,
    nextTurn, navigateTo, resetGame,
    isFirstPlay, clearFirstPlay,
  } = useGameStore()

  const [openHelp,     setOpenHelp]     = useState(false)
  const [openSettings, setOpenSettings] = useState(false)
  const [openChart,    setOpenChart]    = useState(false)
  const [openExit,     setOpenExit]     = useState(false)
  const [isTurnTransition, setIsTurnTransition] = useState(false)
  const [openNextTurn,     setOpenNextTurn]     = useState(false)
  // 이펙트 중 표시할 WEEK 숫자 (turn이 갱신되기 전이라 turn+1을 미리 저장)
  const [transitioningWeek, setTransitioningWeek] = useState(1)
  const chartButtonRef = useRef(null)
  const [chartStartRect, setChartStartRect] = useState(null)

  // 첫 진입 시 도움말 자동 오픈 (인트로 완료 후 조작법 안내)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isFirstPlay) {
      setOpenHelp(true)
      clearFirstPlay()
    }
  }, [])

  // 반응형 스케일 — 1695×928 기준 wrapper를 컨테이너 너비에 맞춰 transform: scale
  // viewport가 작아지면 모든 absolute 요소가 비례 축소되어 레이아웃이 깨지지 않음
  // clientWidth=0(마운트 직후·display:none) 가드 — scale=0이 되면 화면 사라지는 버그 방지
  // useLayoutEffect: paint 전에 동기적으로 첫 measure 수행 → 첫 paint부터 정확한 scale로 표시
  //  (useEffect로 처리하면 scale=1로 한 번 paint 후 줄어드는 깜빡임 발생)
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const w = el.clientWidth
      if (w > 0) setScale(w / 1695)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // 차트 클릭 — 작은 차트의 화면 좌표/사이즈 측정 후 모달 열기 (확대 애니메이션 시작점)
  const handleChartOpen = () => {
    const r = chartButtonRef.current?.getBoundingClientRect()
    setChartStartRect(r ? { top: r.top, left: r.left, width: r.width, height: r.height } : null)
    setOpenChart(true)
  }

  // 다음 주 버튼 클릭 — 즉시 진행 X, 먼저 확인 popover 표시
  const handleNextTurn = () => {
    if (isTurnTransition) return
    setOpenNextTurn((prev) => !prev) // 토글
  }

  // 확인 popover의 "진행 ▶" 클릭 — 실제 라운드 진행 로직
  const confirmNextTurn = () => {
    setOpenNextTurn(false)
    if (isTurnTransition) return
    const nextWeek = turn + 1
    // 라운드 진행 직전 — 현재 stockValue/totalAssets를 prev로 캐싱 (trend·delta 비교 baseline)
    setPrevStockValue(stockValue)
    setPrevTotalAssets(totalAssets)
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(STOCK_VALUE_CACHE_KEY, String(stockValue))
      sessionStorage.setItem(TOTAL_ASSETS_CACHE_KEY, String(totalAssets))
    }
    // 가격/뉴스 계산은 미리 (이펙트 끝난 후 store에 반영)
    const result = progressTurn(nextWeek, [...activeStocks, ...hiddenStocks])
    // 이펙트 시작 + WEEK 표시 — 화면 어두워지면서 시간 흐름 시각화
    setTransitioningWeek(nextWeek)
    setIsTurnTransition(true)
    // 이펙트 끝나는 시점에 store 갱신 → 화면 밝아진 직후 숫자 카운트 애니메이션 시작
    setTimeout(() => {
      nextTurn(result)
      setIsTurnTransition(false)
    }, 1000)
  }

  const handleExit = () => setOpenExit(true)

  const confirmExit = () => {
    setOpenExit(false)
    resetGame()
  }


  // 보유 종목 리스트 + 평가액 + 총자산 계산
  const holdings = stocks.filter((s) => (portfolio[s.id] || 0) > 0)

  // 종목별 전 라운드 종가 조회 헬퍼
  // - turn >= 2: stockData.prices[turn-2].close (직전 라운드)
  // - turn == 1: stockData.pregame_prices.last.close (게임 시작 직전 = pregame 마지막)
  const getPrevClose = (stockId) => {
    const entry = stockDataByTicker[stockId]
    if (!entry) return null
    if (turn >= 2) return entry.prices?.[turn - 2]?.close ?? null
    const pregame = entry.pregame_prices
    return pregame?.[pregame.length - 1]?.close ?? null
  }

  const stockValue = holdings.reduce((sum, s) => {
    const qty = portfolio[s.id]
    const price = (prices && prices[s.id]) || s.price || 0
    return sum + qty * price
  }, 0)
  const totalAssets = cash + stockValue

  // 평가액·총자산 trend·delta 계산 — "다음 주" 클릭 직전의 값을 prev로 캐싱해 다음 라운드와 비교
  // sessionStorage로 페이지 이동(거래소/정보상/기술상) 후 remount되어도 prev 유지.
  // 단, turn=1 마운트 시점(새 게임 시작 또는 재시작 직후)엔 sessionStorage prev 캐시를 클리어해
  // 이전 게임의 trend/delta가 첫 라운드에 잘못 표시되지 않도록 함.
  const STOCK_VALUE_CACHE_KEY = 'anim-num:game-stock-value-prev'
  const TOTAL_ASSETS_CACHE_KEY = 'anim-num:game-total-assets-prev'
  const readCachedNumber = (key) => {
    if (typeof sessionStorage === 'undefined') return null
    const cached = sessionStorage.getItem(key)
    return cached === null ? null : Number(cached)
  }
  const [prevStockValue, setPrevStockValue] = useState(() => {
    if (turn === 1) {
      // 새 게임 시작 — 이전 게임의 캐시 제거 (두 키 모두)
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(STOCK_VALUE_CACHE_KEY)
        sessionStorage.removeItem(TOTAL_ASSETS_CACHE_KEY)
      }
      return null
    }
    return readCachedNumber(STOCK_VALUE_CACHE_KEY)
  })
  const [prevTotalAssets, setPrevTotalAssets] = useState(() => {
    if (turn === 1) return null // 위 setter에서 이미 캐시 클리어됨
    return readCachedNumber(TOTAL_ASSETS_CACHE_KEY)
  })

  const stockValueTrend = (() => {
    if (prevStockValue === null || stockValue === prevStockValue) return null
    return stockValue > prevStockValue ? 'up' : 'down'
  })()

  // 총자산 — trend + 증감률(%) + 증감액(원)
  const totalAssetsDelta = prevTotalAssets === null
    ? null
    : totalAssets - prevTotalAssets
  const totalAssetsDeltaPct = (prevTotalAssets === null || prevTotalAssets === 0)
    ? null
    : ((totalAssets - prevTotalAssets) / prevTotalAssets) * 100
  const totalAssetsTrend = (totalAssetsDelta === null || totalAssetsDelta === 0)
    ? null
    : totalAssetsDelta > 0 ? 'up' : 'down'

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-stone-900 overflow-hidden animate-page-enter">
      {/* viewport에 맞춰 1695:928 비율 컨테이너 (다른 페이지와 동일 패턴) */}
      <div
        ref={containerRef}
        className="relative aspect-[1695/928] overflow-hidden"
        style={{
          width: 'min(100vw, calc(100vh * 1695 / 928))',
          height: 'min(100vh, calc(100vw * 928 / 1695))',
          backgroundImage: "url('/images/game-bg.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* 스케일 래퍼 — 1695×928 고정 좌표로 모든 absolute 요소를 그리고, 컨테이너 너비에 맞춰 비례 축소 */}
        <div
          className="absolute top-0 left-0"
          style={{
            width: '1695px',
            height: '928px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {/* 좌측(수직 중앙): ROUND + 자산 + HOLDINGS — PopupOverlay와 통일된 그라데이션 톤 */}
          <div className="absolute top-1/2 left-4 -translate-y-1/2 bg-gradient-to-b from-slate-900 to-slate-950 backdrop-blur rounded-xl px-6 py-6 text-slate-100 z-10 border-2 border-cyan-500/60 shadow-[0_0_40px_rgba(34,211,238,0.2)] w-80">
            {/* ROUND — LED 인디케이터 헤더 (다른 페이지 PopupOverlay 패턴) */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
              <span className="text-cyan-300 text-sm font-mono tracking-[0.25em]">ROUND</span>
            </div>
            <p className="text-4xl font-bold leading-tight mb-4 text-cyan-100 font-mono tabular-nums">{turn} / {totalTurns}</p>

            {/* 자산 정보 — 현금 / 주식 평가액(전라운드 대비 ▲▼) / 총 자산 */}
            <div className="bg-slate-800/70 border border-cyan-500/30 rounded-lg p-3 space-y-2">
              <AssetRow label="현금"        value={cash}        cacheKey="game-cash" />
              <AssetRow label="주식 평가액" value={stockValue}  trend={stockValueTrend} cacheKey="game-stock-value" />
              <div className="border-t border-cyan-500/20 pt-2">
                <AssetRow
                  label="총 자산"
                  value={totalAssets}
                  highlight
                  trend={totalAssetsTrend}
                  deltaPct={totalAssetsDeltaPct}
                  deltaAmount={totalAssetsDelta}
                  cacheKey="game-total-assets"
                />
              </div>
            </div>

            {/* HOLDINGS — 보유 종목 리스트 (LED 인디케이터 헤더) */}
            <div className="flex items-center gap-2 mt-4 mb-2">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
              <span className="text-cyan-300 text-[10px] font-mono tracking-[0.25em]">HOLDINGS</span>
            </div>
            <div className="bg-slate-800/70 border border-cyan-500/30 rounded-lg p-2">
              {holdings.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-1 font-mono">보유 종목 없음</p>
              ) : (
                <div className="divide-y divide-cyan-500/15">
                  {holdings.map((s) => {
                    const currentPrice = (prices && prices[s.id]) || s.price || 0
                    const prevClose = getPrevClose(s.id)
                    const changePct = prevClose && prevClose !== 0
                      ? ((currentPrice - prevClose) / prevClose) * 100
                      : 0
                    const hasPrev = prevClose !== null && prevClose !== 0
                    // 소수점 2자리 반올림 기준 — ±0.005 미만이면 "변동 없음"
                    const isZero = hasPrev && Math.abs(changePct) < 0.005
                    const isUp = changePct > 0
                    return (
                      <div key={s.id} className="py-1 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-baseline">
                          <span className="truncate text-slate-100 text-sm font-semibold">
                            {s.mimeName || s.name || s.id}
                          </span>
                          <span className="text-cyan-200 ml-2 flex-shrink-0 text-xs font-mono tabular-nums">
                            {portfolio[s.id]}주
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline mt-0.5">
                          <span className="text-cyan-100 font-mono tabular-nums text-xs">
                            <AnimatedNumber value={currentPrice} cacheKey={`holding-price-${s.id}`} />원
                          </span>
                          <span
                            className={`font-mono tabular-nums text-xs ${
                              !hasPrev
                                ? 'text-slate-500'
                                : isZero
                                ? 'text-slate-100'
                                : isUp
                                ? 'text-red-400'
                                : 'text-blue-400'
                            }`}
                          >
                            {!hasPrev ? (
                              '—'
                            ) : isZero ? (
                              '0.00%'
                            ) : (
                              <>
                                {isUp ? '▲' : '▼'} {isUp ? '+' : ''}
                                <AnimatedNumber value={changePct} decimals={2} />%
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 차트 바로 위 전광판 — 게임 팁 우측→좌측 흐름 (X축 중앙 정렬) */}
          <div
            style={{ top: 'calc(0.75rem + 115px)', left: '50%' }}
            className="absolute -translate-x-1/2 w-[26rem] max-w-[35vw] z-10"
          >
            <Marquee items={GAMEPLAY_TIPS} leftLabel="📢 TIPS" />
          </div>

          {/* 상단 중앙: KOSPI 지수 차트 — 클릭 시 확대 모달 (작은 차트 위치에서 출발하는 애니메이션, X축 중앙 정렬) */}
          <button
            ref={chartButtonRef}
            type="button"
            onClick={handleChartOpen}
            style={{ top: 'calc(0.75rem + 150px)', left: '50%', outline: 'none' }}
            className="absolute -translate-x-1/2 w-[26rem] max-w-[35vw] z-10 group cursor-pointer focus:outline-none transition-transform duration-150 hover:scale-[1.02]"
            aria-label="KOSPI 차트 확대"
          >
            {/* 메인 화면 미니 차트 — 클릭 시 ChartExpandModal에서 풀 차트 표시 */}
            <KospiChart compact />
            {/* hover 시 확대 아이콘 — 차트 우상단 inside */}
            <span className="absolute top-3 right-3 text-[10px] text-cyan-200 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none bg-slate-900/90 px-2 py-0.5 rounded border border-cyan-500/60 font-mono tracking-wider">
              🔍 EXPAND
            </span>
          </button>

          {/* 우상단: 도움말 / 설정 / 종료 (hover 시 라벨) */}
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <IconButton icon={<HelpIcon />}     label="도움말" onClick={() => setOpenHelp(true)} />
            <IconButton icon={<SettingsIcon />} label="설정"   onClick={() => setOpenSettings(true)} />
            <IconButton icon={<ExitIcon />}     label="종료"   onClick={handleExit} />
          </div>

          {/* 우하단: 다음 주 버튼 — HTS 디지털 보드 톤 (슬레이트 + 시안 글로우 + 모서리 deco) */}
          <button
            onClick={handleNextTurn}
            disabled={isTurnTransition}
            style={{
              outline: 'none',
              boxShadow: '0 0 30px rgba(34,211,238,0.4), inset 0 0 15px rgba(34,211,238,0.08)',
            }}
            className="absolute bottom-4 right-4 px-10 py-5 bg-gradient-to-b from-slate-800 to-slate-950 hover:from-slate-700 hover:to-slate-900 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-cyan-100 border-2 border-cyan-400 rounded-lg transition-all duration-150 z-10 focus:outline-none"
          >
            {/* 모서리 L자 deco — 디지털 보드 느낌 */}
            <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-300 rounded-tl-md pointer-events-none" />
            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-300 rounded-tr-md pointer-events-none" />
            <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-300 rounded-bl-md pointer-events-none" />
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-300 rounded-br-md pointer-events-none" />

            <p
              className="text-2xl font-bold tracking-widest font-mono"
              style={{ textShadow: '0 0 12px rgba(34,211,238,0.7)' }}
            >
              다음 주 ▶
            </p>
          </button>

          {/* 다음 주 확인 popover — HTS 디지털 보드 톤 (모서리 deco + LIVE 인디케이터 + 시안 글로우) */}
          {openNextTurn && !isTurnTransition && (
            <div className="absolute bottom-[8.5rem] right-4 z-20">
              <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 backdrop-blur border-2 border-cyan-400 rounded-xl p-6 shadow-[0_0_40px_rgba(34,211,238,0.4)] w-96">
                {/* 모서리 L자 deco */}
                <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-300 rounded-tl-xl pointer-events-none" />
                <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-300 rounded-tr-xl pointer-events-none" />
                <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-300 rounded-bl-xl pointer-events-none" />
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-300 rounded-br-xl pointer-events-none" />

                {/* LED 인디케이터 라벨 — KospiChart의 LIVE 헤더와 통일 */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                  <span className="text-cyan-300 text-[10px] font-mono tracking-[0.25em]">NEXT TURN</span>
                </div>

                <p
                  className="text-cyan-100 font-bold text-lg mb-2 font-mono"
                  style={{ textShadow: '0 0 8px rgba(34,211,238,0.4)' }}
                >
                  다음 주로 이동하시겠습니까?
                </p>
                <p className="text-cyan-300/70 text-sm mb-5 font-mono">⚠️ 진행 후엔 되돌릴 수 없습니다.</p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setOpenNextTurn(false)}
                    style={{ outline: 'none' }}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-500/60 rounded-lg text-base font-bold text-slate-100 transition-all duration-150 focus:outline-none font-mono tracking-wider"
                  >
                    취소
                  </button>
                  <button
                    onClick={confirmNextTurn}
                    style={{
                      outline: 'none',
                      boxShadow: '0 0 20px rgba(34,211,238,0.5), inset 0 0 10px rgba(34,211,238,0.15)',
                    }}
                    className="flex-1 py-3 bg-gradient-to-b from-cyan-600 to-cyan-800 hover:from-cyan-500 hover:to-cyan-700 border-2 border-cyan-300 rounded-lg text-base font-bold text-slate-900 transition-all duration-150 focus:outline-none font-mono tracking-wider"
                  >
                    진행 ▶
                  </button>
                </div>
              </div>
              {/* 아래쪽 화살표 노치 — 다음 주 버튼을 가리킴 */}
              <span className="absolute -bottom-3 right-20 w-0 h-0 border-l-[14px] border-r-[14px] border-t-[16px] border-l-transparent border-r-transparent border-t-cyan-400" />
            </div>
          )}

          {/* NPC 클릭 영역 — 좌표는 상단 HOTSPOT.npc 상수에서 관리 (배경 캐릭터 위치 미세조정) */}
          <NPCHotspot {...HOTSPOT.npc.market}       label="거래소" subLabel="시장 분석가"   onClick={() => navigateTo('market')} />
          <NPCHotspot {...HOTSPOT.npc.infoMerchant} label="정보상" subLabel="정보 브로커"   onClick={() => navigateTo('infoMerchant')} />
          <NPCHotspot {...HOTSPOT.npc.techMerchant} label="기술상" subLabel="퀀트 테크니션" onClick={() => navigateTo('techMerchant')} />

          {/* 도움말 오버레이 — 각 UI 옆에 설명 풍선, 배경 클릭 시 닫힘 */}
          {openHelp && <HelpOverlay onClose={() => setOpenHelp(false)} />}
        </div>
        {/* /scale wrapper */}
      </div>
      {/* /viewport-aware 컨테이너 */}

      {/* 하단 NewsPanel은 차트 위 전광판(Marquee)으로 통합됨 — 라운드별 뉴스가 tips로 흐름 */}

      {/* 설정 모달 (도움말은 이미지 컨테이너 안 HelpOverlay로 표시) */}
      {openSettings && <SettingsModal onClose={() => setOpenSettings(false)} />}

      {/* KOSPI 차트 확대 모달 — 클릭한 차트 좌표에서 시작해서 화면 중앙으로 확장 */}
      {openChart && <ChartExpandModal onClose={() => setOpenChart(false)} startRect={chartStartRect} />}

      {/* 게임 종료 확인 모달 */}
      {openExit && <ExitConfirmModal onConfirm={confirmExit} onCancel={() => setOpenExit(false)} />}

      {/* 라운드 전환 — 시간이 흐른 느낌 (1000ms): 어두운 오버레이 + 시계 회전 + WEEK 텍스트 */}
      {/* 마지막 라운드 도달(50주 초과) 시엔 WEEK 51 대신 GAME OVER 표시 */}
      {isTurnTransition && (() => {
        const isGameEnd = transitioningWeek > totalTurns
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 animate-turn-transition">
            <div className="flex flex-col items-center gap-3">
              <div className="text-6xl animate-clock-spin">{isGameEnd ? '🏁' : '🕰️'}</div>
              <div className="animate-week-text text-cyan-300 text-6xl font-bold font-mono drop-shadow-[0_0_30px_rgba(34,211,238,0.8)] whitespace-nowrap">
                {isGameEnd ? 'GAME OVER' : `WEEK ${transitioningWeek}`}
              </div>
              <div className="animate-week-text text-cyan-200/70 text-sm font-mono tracking-widest" style={{ animationDelay: '50ms' }}>
                {isGameEnd ? `· ${totalTurns}주 게임이 끝났습니다 ·` : '· 시간이 흘러갑니다 ·'}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// 게임 종료 확인 모달 — PopupOverlay 패턴 (font-mono 헤더 + ✕ + slate-800/70 카드)
function ExitConfirmModal({ onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/60 rounded-xl p-6 max-w-sm w-full shadow-[0_0_40px_rgba(34,211,238,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-cyan-300 font-mono tracking-wider">게임 종료</h2>
          <button
            onClick={onCancel}
            style={{ outline: 'none' }}
            className="text-cyan-300 hover:text-cyan-100 text-xl w-8 h-8 flex items-center justify-center transition-all duration-150 focus:outline-none"
          >
            ✕
          </button>
        </div>

        <div className="bg-slate-800/70 border border-cyan-500/30 rounded-lg p-4 mb-4">
          <p className="text-sm text-cyan-100 mb-2">게임을 종료하고 초기 화면으로 돌아가시겠습니까?</p>
          <p className="text-xs text-cyan-300/60 font-mono">⚠️ 현재 진행 상황은 모두 사라집니다.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            style={{ outline: 'none' }}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-500/60 text-slate-100 rounded-lg font-bold font-mono tracking-wider transition-all duration-150 focus:outline-none"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            style={{ outline: 'none' }}
            className="flex-1 py-2 bg-red-700 hover:bg-red-600 border-2 border-red-400/60 text-white rounded-lg font-bold font-mono tracking-wider transition-all duration-150 focus:outline-none shadow-[0_0_15px_rgba(248,113,113,0.3)]"
          >
            종료
          </button>
        </div>
      </div>
    </div>
  )
}

// KOSPI 차트 확대 모달 — startRect(작은 차트 화면 좌표)에서 시작해서 화면 중앙으로 확장
// mount 직후 200ms ease-out transition: 위치+사이즈+불투명도 동시 보간
function ChartExpandModal({ onClose, startRect }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // 컨테이너 스타일 — mounted 전엔 작은 차트 위치, 후엔 화면 중앙 + 큰 사이즈
  const containerStyle = !mounted && startRect
    ? {
        position: 'fixed',
        top: `${startRect.top}px`,
        left: `${startRect.left}px`,
        width: `${startRect.width}px`,
        transform: 'none',
        opacity: 0.9,
        transition: 'all 200ms ease-out',
      }
    : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: 'min(90vw, 64rem)',
        transform: 'translate(-50%, -50%)',
        opacity: 1,
        transition: 'all 200ms ease-out',
      }

  return (
    <div
      className={`fixed inset-0 backdrop-blur-sm z-50 transition-all duration-200 ease-out ${
        mounted ? 'bg-black/75' : 'bg-black/0'
      }`}
      onClick={onClose}
    >
      <div
        style={containerStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <KospiChart />
        {/* CLOSE 버튼 + 안내 — 확장 완료 후에만 페이드인 */}
        <div className={`transition-opacity duration-200 ease-out ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <div className="mt-3 flex justify-center">
            <button
              onClick={onClose}
              style={{ outline: 'none' }}
              className="px-6 py-2 bg-slate-900/90 hover:bg-slate-800 text-cyan-200 border-2 border-cyan-500/60 rounded font-bold tracking-wider transition-all duration-150 focus:outline-none shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            >
              CLOSE ✕
            </button>
          </div>
          <p className="text-[10px] text-cyan-300/50 text-center mt-2 font-mono">
            화면 아무 곳이나 클릭해도 닫힙니다
          </p>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// 내부 헬퍼 컴포넌트 — props만 받음 (명세 v2 §8 컴포넌트 원칙)
// ─────────────────────────────────────────────────────────

// 좌측 카드 자산 한 줄 — 라벨 + (▲/▼ 아이콘) + 카운트 애니메이션 금액
// highlight=true   → 총 자산 강조
// trend='up|down'  → 전라운드 대비 변동 아이콘
// deltaPct·deltaAmount → 있으면 두 번째 줄에 ▲ +X.XX% (+27,000원) 표시
// cacheKey         → 페이지 전환 후에도 직전 값 보존 (sessionStorage)
function AssetRow({ label, value, highlight, trend, deltaPct, deltaAmount, cacheKey }) {
  // 소수점 2자리 반올림 기준 — ±0.005% 미만이면 "변동 없음"으로 두 번째 줄 숨김
  const hasDelta = deltaPct !== undefined && deltaPct !== null && Math.abs(deltaPct) >= 0.005
  const isUp = (deltaPct ?? 0) > 0

  return (
    <div>
      <div className="flex justify-between items-baseline">
        <span className={`text-sm ${highlight ? 'text-cyan-300 font-bold' : 'text-cyan-300/70'}`}>{label}</span>
        <span className={`font-bold flex items-baseline gap-1 tabular-nums ${highlight ? 'text-xl text-cyan-100' : 'text-base text-slate-100'}`}>
          {trend === 'up'   && <span className="text-red-400 text-xs">▲</span>}
          {trend === 'down' && <span className="text-blue-400 text-xs">▼</span>}
          <AnimatedNumber value={value} cacheKey={cacheKey} />원
        </span>
      </div>
      {hasDelta && (
        <div className="flex justify-end items-baseline mt-0.5 gap-1.5 font-mono tabular-nums text-xs">
          <span className={isUp ? 'text-red-400' : 'text-blue-400'}>
            {isUp ? '▲' : '▼'} <AnimatedNumber value={Math.abs(deltaPct)} decimals={2} />%
          </span>
          {deltaAmount !== undefined && deltaAmount !== null && (
            <span className={isUp ? 'text-red-300/70' : 'text-blue-300/70'}>
              ({isUp ? '+' : '-'}<AnimatedNumber value={Math.abs(deltaAmount)} />원)
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// 우상단 아이콘 버튼 — SVG 아이콘 + hover 시 inset+outer 글로우 (다른 페이지 Hotspot cyan 패턴)
// group class는 라벨 풍선의 group-hover:opacity-100용. shadow는 자기 hover에 직접 적용.
function IconButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ outline: 'none' }}
      className="relative group flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 backdrop-blur rounded-lg w-16 h-16 border-2 border-cyan-500/60 hover:border-cyan-300 text-cyan-300 hover:text-cyan-100 transition-all duration-150 focus:outline-none focus:ring-0 hover:shadow-[inset_0_0_25px_rgba(34,211,238,0.35),0_0_25px_rgba(34,211,238,0.35)]"
      aria-label={label}
    >
      {icon}
      {/* 라벨 풍선 — HelpBubble과 동일한 톤 */}
      <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 text-cyan-100 text-sm px-3 py-1 rounded-lg border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none font-mono tracking-wider">
        {label}
      </span>
    </button>
  )
}

// NPC 클릭 영역 — 시안 광채 + 머리 위 라벨 풍선
// 좌표(left/top/width/height)는 호출부에서 HOTSPOT.npc.* 스프레드로 주입
function NPCHotspot({ left, top, width, height, label, subLabel, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ left, top, width, height, outline: 'none' }}
      className="absolute group rounded transition-all duration-150 focus:outline-none focus:ring-0"
    >
      {/* hover 시 시안 광채 (button 영역보다 약간 크게) */}
      <span
        aria-hidden="true"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.3) 0%, transparent 65%)',
        }}
        className="absolute w-[130%] h-[110%] opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none rounded-full"
      />

      <span
        style={{
          left: '50%',
          transform: 'translate(-50%, -100%)',
        }}
        className="absolute top-0 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none"
      >
        {/* HelpBubble과 동일한 톤: slate-900/95 + cyan-400 border + 글로우 + font-mono */}
        <span className="block whitespace-nowrap bg-slate-900/95 text-cyan-100 font-bold text-xs px-3 py-1.5 rounded-lg border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] font-mono tracking-wider">
          {label}
          <span className="text-cyan-300/70 font-normal ml-1">· {subLabel}</span>
        </span>
        <span className="block w-0 h-0 mx-auto border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-cyan-400"></span>
      </span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────
// SVG 아이콘 (Heroicons outline 스타일)
// ─────────────────────────────────────────────────────────

function HelpIcon() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 17.25h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.108 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function ExitIcon() {
  // 문 바깥으로 화살표 (logout 아이콘)
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
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

// 도움말 오버레이 — 각 UI 옆에 도움말 풍선 표시 (모달 대신 onboarding 스타일)
// 배경 클릭 시 onClose 호출되어 닫힘
function HelpOverlay({ onClose }) {
  return (
    <div className="absolute inset-0 z-20" onClick={onClose}>
      {/* 반투명 어두운 배경 — 풍선들이 도드라지게 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* 상단 안내 */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/95 text-cyan-200 text-sm px-4 py-2 rounded-lg border-2 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.4)] pointer-events-none">
        💡 화면 아무 곳이나 클릭하면 닫힙니다
      </div>

      {/* 차트 위 TIPS 설명 — 화면 상단 중앙 */}
      <HelpBubble style={{ top: '4rem', left: '50%', transform: 'translateX(-50%)' }} arrow="down">
        <strong className="text-cyan-300 text-base block">📢 TIPS</strong>
        <p className="text-xs mt-1 text-cyan-100">
          떡상 꿀팁이 흐릅니다 ✨
        </p>
      </HelpBubble>

      {/* KOSPI 차트 설명 — 차트 위쪽에서 아래로 +60px 이동, arrow="down"으로 아래 차트를 가리킴 */}
      <HelpBubble style={{ top: 'calc(0.75rem + 85px)', left: 'calc(50% + 200px)', transform: 'translateX(-50%)' }} arrow="down">
        <strong className="text-cyan-300 text-base block">📈 KOSPI 지수</strong>
        <p className="text-xs mt-1 text-cyan-100">
          한국 주식 시장 전체 평균값
          <br />올라가면 시장 분위기가 좋아요
          <br />클릭하면 큰 차트로 볼 수 있어요
        </p>
      </HelpBubble>

      {/* 좌측 카드 옆 (카드: left-4 w-80) */}
      <HelpBubble style={{ top: '50%', left: 'calc(1rem + 20rem + 0.75rem)', transform: 'translateY(-50%)' }}>
        <strong className="text-cyan-300 text-base block">💼 내 자산 현황</strong>
        <p className="text-xs mt-1 text-cyan-100">
          내 돈이 얼마인지 한눈에 확인
          <br />현금 + 주식 가치 = 총 자산
          <br />가진 종목과 손익도 표시
        </p>
      </HelpBubble>

      {/* 우상단 아이콘 3개 아래 */}
      <HelpBubble style={{ top: '6rem', right: '0.75rem' }}>
        <strong className="text-cyan-300 text-base block">⚙️ 메뉴</strong>
        <p className="text-xs mt-1 text-cyan-100">
          도움말 다시 보기
          <br />음악·효과음 크기 조절
          <br />게임 종료
        </p>
      </HelpBubble>

      {/* 우하단 다음 주 버튼 위 */}
      <HelpBubble style={{ bottom: '6rem', right: '1rem' }}>
        <strong className="text-cyan-300 text-base block">▶ 다음 주로</strong>
        <p className="text-xs mt-1 text-cyan-100">
          한 주를 보내고 주가 갱신
          <br />⚠️ 누르면 되돌릴 수 없어요
        </p>
      </HelpBubble>

      {/* 거래소 NPC (왼쪽, left 35%+7%=42%) — 머리 위 */}
      <HelpBubble style={{ top: '38%', left: '42%', transform: 'translate(-50%, -100%)' }} arrow="down">
        <strong className="text-cyan-300 text-base block">🏛️ 거래소</strong>
        <p className="text-xs mt-1 text-cyan-100">
          주식을 사고파는 곳
          <br />10개 종목 중 골라 거래해요
        </p>
      </HelpBubble>

      {/* 정보상 NPC (가운데, left 48%+7%=55%) — 도움말 풍선 50px 우측 이동 */}
      <HelpBubble style={{ top: '38%', left: 'calc(55% + 50px)', transform: 'translate(-50%, -100%)' }} arrow="down">
        <strong className="text-cyan-300 text-base block">📰 정보상</strong>
        <p className="text-xs mt-1 text-cyan-100">
          뉴스에 따라 주가가 움직여요
          <br />미리 보면 어떤 종목이 오를지
          <br />힌트를 얻을 수 있어요
        </p>
      </HelpBubble>

      {/* 기술상 NPC (오른쪽, left 62%+7%=69%) — 도움말 풍선 100px 우측 이동 */}
      <HelpBubble style={{ top: '38%', left: 'calc(69% + 100px)', transform: 'translate(-50%, -100%)' }} arrow="down">
        <strong className="text-cyan-300 text-base block">🔧 기술상</strong>
        <p className="text-xs mt-1 text-cyan-100">
          숨겨진 종목 공개 (고위험·고수익)
          <br />차트 분석 도구 구매
          <br />10주차부터 이용 가능
        </p>
      </HelpBubble>
    </div>
  )
}

// 도움말 풍선 한 개 — style로 위치 지정, arrow="down|up" 시 위/아래쪽 화살표 노치
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

