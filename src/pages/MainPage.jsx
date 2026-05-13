// 메인 허브 화면 — 잔고/라운드/등급 확인 후 거래소·정보상·기술상으로 이동하거나 다음 라운드 진행
// Props: 없음 (store에서 직접 사용)
//
// ⚠️ 배영환 협의 필요 사항 (docs/design-docs/props-spec.md 참고):
//   1. gameStore에 page 전환 함수(setPage) 추가 필요 — 현재 startGame()이 page='game'만 세팅
//   2. App.jsx의 page 상태에 'main' | 'market' | 'info' | 'tech' 추가 필요
//   3. 등급 계산은 임시로 이 파일에 있음 — 추후 src/lib/gameLogic.js로 이동 권장

import { useGameStore } from '../store/gameStore'
import { progressTurn } from '../lib/gameLogic'
import { INITIAL_CASH } from '../store/gameStore'
import Portfolio from '../components/game/Portfolio'
import NewsPanel from '../components/game/NewsPanel'
import TurnControl from '../components/game/TurnControl'
import allStocks from '../data/stocks.json'

// 코스피 초기값 (gameStore와 동기화 필요 — 임시 하드코딩)
const INITIAL_KOSPI = 2600

// 등급 임계값 (proposal-v1.md 기준, 단위: 초과수익률 %p)
const GRADES = [
  { label: '전설의 동학개미', threshold: 200, color: 'text-yellow-300', emoji: '👑' },
  { label: '작전세력',        threshold: 50,  color: 'text-purple-400', emoji: '🎩' },
  { label: '큰손',            threshold: 0,   color: 'text-rise',       emoji: '💰' },
  { label: '슈퍼개미',        threshold: -10, color: 'text-blue-300',   emoji: '🐜' },
  { label: '개미',            threshold: -Infinity, color: 'text-fall', emoji: '😢' },
]

// 코스피 대비 초과수익률(%p)로 등급 판정
function getGrade(excessReturnPp) {
  return GRADES.find((g) => excessReturnPp >= g.threshold)
}

export default function MainPage() {
  const {
    turn, totalTurns, cash, portfolio, prices,
    activeStocks, currentNews, kospi, exchangeRate,
    nextTurn, getFinalAssets,
  } = useGameStore()

  // 내 수익률·코스피 수익률·초과수익률 계산
  const totalAssets = getFinalAssets()
  const myReturn = (totalAssets - INITIAL_CASH) / INITIAL_CASH
  const kospiReturn = (kospi - INITIAL_KOSPI) / INITIAL_KOSPI
  const excessPp = (myReturn - kospiReturn) * 100
  const grade = getGrade(excessPp)

  // 다음 라운드 진행 — gameLogic이 계산한 결과를 store에 반영
  const handleNextTurn = () => {
    const result = progressTurn(prices, activeStocks, kospi, exchangeRate)
    nextTurn(result)
  }

  // ⚠️ 임시 라우팅 — 배영환의 setPage가 추가되기 전까지 alert로 placeholder
  // TODO(배영환): store에 setPage 추가 후 navigateTo(page) 형태로 연결
  const navigateTo = (target) => {
    alert(`"${target}" 화면은 작업 중입니다 — 배영환의 page 라우팅 확장 후 연결됩니다`)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* 상단: 라운드 진행도 + 다음 날 버튼 */}
      <TurnControl turn={turn} totalTurns={totalTurns} onNextTurn={handleNextTurn} />

      {/* 본문: 등급 카드 + 포트폴리오 */}
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        {/* 등급 카드 */}
        <div className="flex-1 bg-gray-800 rounded-lg p-5">
          <p className="text-xs text-gray-400 mb-1">현재 등급 (코스피 대비)</p>
          <p className={`text-3xl font-bold mb-2 ${grade.color}`}>
            {grade.emoji} {grade.label}
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs mt-4">
            <div className="bg-gray-700 rounded p-2">
              <p className="text-gray-400">내 수익률</p>
              <p className={`font-bold ${myReturn >= 0 ? 'text-rise' : 'text-fall'}`}>
                {(myReturn * 100).toFixed(2)}%
              </p>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <p className="text-gray-400">코스피</p>
              <p className={`font-bold ${kospiReturn >= 0 ? 'text-rise' : 'text-fall'}`}>
                {(kospiReturn * 100).toFixed(2)}%
              </p>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <p className="text-gray-400">초과수익</p>
              <p className={`font-bold ${excessPp >= 0 ? 'text-rise' : 'text-fall'}`}>
                {excessPp >= 0 ? '+' : ''}{excessPp.toFixed(1)}%p
              </p>
            </div>
          </div>
        </div>

        {/* 포트폴리오 (기존 컴포넌트 재활용) */}
        <Portfolio
          stocks={activeStocks}
          prices={prices}
          portfolio={portfolio}
          cash={cash}
        />
      </div>

      {/* 직전 라운드 뉴스 */}
      <NewsPanel news={currentNews} />

      {/* 장소 이동 버튼 (3개) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <button
          onClick={() => navigateTo('market')}
          className="py-5 bg-gradient-to-br from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 rounded-lg font-bold text-lg transition-all duration-150"
        >
          🏛️ 거래소
          <p className="text-xs font-normal text-blue-200 mt-1">공개 종목 매수/매도</p>
        </button>
        <button
          onClick={() => navigateTo('info')}
          className="py-5 bg-gradient-to-br from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 rounded-lg font-bold text-lg transition-all duration-150"
        >
          📰 정보상
          <p className="text-xs font-normal text-amber-200 mt-1">뉴스·추천종목 구매</p>
        </button>
        <button
          onClick={() => navigateTo('tech')}
          className="py-5 bg-gradient-to-br from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 rounded-lg font-bold text-lg transition-all duration-150"
        >
          🔧 기술상
          <p className="text-xs font-normal text-purple-200 mt-1">비공개 종목 유료 공개</p>
        </button>
      </div>
    </div>
  )
}
