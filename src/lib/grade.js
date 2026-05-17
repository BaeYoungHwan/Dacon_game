// 초과수익률(%p) 기반 6단계 등급 — ResultPage 진실 공급원
// KOSPI 수익률은 차트 실제 종가(kospi_closes) 기반으로 계산 (버그 수정)
import stockData from '../data/stockData.json'

const KOSPI_CLOSES = stockData.kospi_closes
export const KOSPI_CHART_RETURN =
  (KOSPI_CLOSES[KOSPI_CLOSES.length - 1] - KOSPI_CLOSES[0]) / KOSPI_CLOSES[0]
// ≈ 1.779 (+177.9%)

export const GRADES = [
  {
    label: '전설의 동학개미',
    threshold: 100,
    color: 'text-yellow-300',
    emoji: '👑',
    titleColor: '#FBBF24',
    borderColor: '#FBBF24',
    glowColor: 'rgba(251,191,36,0.35)',
    comment: '전설이 되셨습니다. 다음 생에도 주식 하세요.',
  },
  {
    label: '슈퍼개미',
    threshold: 30,
    color: 'text-purple-400',
    emoji: '💰',
    titleColor: '#C084FC',
    borderColor: '#C084FC',
    glowColor: 'rgba(192,132,252,0.35)',
    comment: '뛰어난 안목으로 시장을 크게 앞질렀습니다.',
  },
  {
    label: '스마트개미',
    threshold: 0,
    color: 'text-red-400',
    emoji: '🧠',
    titleColor: '#F87171',
    borderColor: '#F87171',
    glowColor: 'rgba(248,113,113,0.3)',
    comment: '코스피를 이겼습니다! 상승장에서 살아남은 투자자입니다.',
  },
  {
    label: '개미',
    threshold: -60,
    color: 'text-blue-300',
    emoji: '🐜',
    titleColor: '#F87171',
    borderColor: '#93C5FD',
    glowColor: 'rgba(147,197,253,0.3)',
    comment: '절반 이상의 구간을 놓쳤습니다. 종목 선택이 아쉬웠어요.',
  },
  {
    label: '흑우',
    threshold: -120,
    color: 'text-orange-400',
    emoji: '🐂',
    titleColor: '#F87171',
    borderColor: '#FB923C',
    glowColor: 'rgba(251,146,60,0.3)',
    comment: '투자는 했지만 시장이 너무 빨랐어요. 좋은 경험이 됐길 바랍니다.',
  },
  {
    label: '벼락거지',
    threshold: -Infinity,
    color: 'text-gray-400',
    emoji: '💸',
    titleColor: '#F87171',
    borderColor: '#6B7280',
    glowColor: 'rgba(107,114,128,0.2)',
    comment: '원금은 지켰지만, 기록적인 상승장에서 소외되었습니다. 벼락거지가 되셨네요.',
  },
]

// GRADES는 threshold 내림차순 — find가 곧 첫 매칭
export function getGrade(excessPp) {
  return GRADES.find((g) => excessPp >= g.threshold)
}

export const calcExcessPp = (myReturn, kospiReturn) => (myReturn - kospiReturn) * 100
