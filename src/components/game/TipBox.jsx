import { useState } from 'react'

const TIPS = [
  '뉴스를 확인하면 다음 턴 주가 변동을 예측할 수 있어요.',
  '기술 지표는 매수·매도 타이밍을 잡는 데 도움이 됩니다.',
  '한 종목에 올인하지 마세요 — 분산 투자가 안전해요.',
  '히든 종목은 변동성이 크지만 수익도 클 수 있어요.',
  '정보상에서 섹터 뉴스를 확인하면 주가 힌트를 얻을 수 있어요.',
  '자금의 30% 이상을 한 번에 투자하면 위험할 수 있어요.',
  '볼린저 밴드 하단은 저점 매수 기회일 수 있어요.',
  'MACD 골든크로스 구간에서 매수를 검토해 보세요.',
  '시장 전반이 하락할 때는 현금을 보유하는 것도 전략이에요.',
  '매도 타이밍을 놓치지 않는 것이 수익을 지키는 핵심이에요.',
]

export default function TipBox() {
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)])
  return (
    <div className="mt-4 bg-yellow-900/40 border border-yellow-700/50 rounded-lg p-3">
      <p className="text-xs text-yellow-400 font-bold mb-1">💡 오늘의 팁</p>
      <p className="text-sm text-yellow-200">{tip}</p>
    </div>
  )
}
