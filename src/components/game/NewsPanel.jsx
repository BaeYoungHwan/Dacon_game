// TODO(신입): 뉴스 이벤트 UI 구현
// Props:
//   news - 현재 뉴스 이벤트 { id, headline, detail, sector, effect } | null

export default function NewsPanel({ news }) {
  if (!news) return null

  const isPositive = news.effect >= 0

  return (
    <div className={`mt-4 p-4 rounded-lg border-l-4 ${isPositive ? 'border-rise bg-red-950/30' : 'border-fall bg-blue-950/30'}`}>
      {/* TODO(신입): 뉴스 애니메이션 추가 (fade-in) */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-700">{news.sector}</span>
        <span className={`text-xs font-bold ${isPositive ? 'text-rise' : 'text-fall'}`}>
          {isPositive ? `+${(news.effect * 100).toFixed(0)}%` : `${(news.effect * 100).toFixed(0)}%`}
        </span>
      </div>
      <p className="font-bold text-sm">📰 {news.headline}</p>
      <p className="text-xs text-gray-400 mt-1">{news.detail}</p>
    </div>
  )
}
