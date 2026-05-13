// TODO(신입): 보유 주식 + 현금 잔액 UI 구현
// Props:
//   stocks     - 종목 배열 [{ id, name }]
//   prices     - 현재 주가 { stockId: number }
//   portfolio  - 보유 주식 { stockId: quantity }
//   cash       - 현금 잔액 (number)

export default function Portfolio({ stocks, prices, portfolio, cash }) {
  const stockMap = Object.fromEntries(stocks.map((s) => [s.id, s]))

  const holdings = Object.entries(portfolio).map(([id, qty]) => ({
    ...stockMap[id],
    quantity: qty,
    value: prices[id] * qty,
  }))

  const stockTotal = holdings.reduce((sum, h) => sum + h.value, 0)
  const totalAssets = cash + stockTotal

  return (
    <div className="w-full md:w-72 bg-gray-800 rounded-lg p-4">
      {/* TODO(신입): 디자인 개선 */}
      <h2 className="text-lg font-bold mb-3">내 포트폴리오</h2>

      <div className="mb-3 p-3 bg-gray-700 rounded">
        <p className="text-xs text-gray-400">총 자산</p>
        <p className="text-xl font-bold text-yellow-400">{totalAssets.toLocaleString()}원</p>
        <p className="text-xs text-gray-400 mt-1">현금 {cash.toLocaleString()}원</p>
      </div>

      {holdings.length === 0 ? (
        <p className="text-sm text-gray-500">보유 종목 없음</p>
      ) : (
        holdings.map((h) => (
          <div key={h.id} className="flex justify-between py-1 border-b border-gray-700 text-sm">
            <span>{h.name} <span className="text-gray-400">{h.quantity}주</span></span>
            <span>{h.value.toLocaleString()}원</span>
          </div>
        ))
      )}
    </div>
  )
}
