// TODO(신입): 뉴스 이벤트 UI 구현
// Props:
//   companyNews - 기업 뉴스 배열 [{ id, date, sector, headline, detail }] | null
//   globalNews  - 국제 뉴스 단일 항목 { id, date, sector, headline, detail } | null

export default function NewsPanel({ companyNews, globalNews }) {
  const hasNews = (companyNews && companyNews.length > 0) || globalNews
  if (!hasNews) return null

  return (
    <div className="mt-4 space-y-2">
      {/* TODO(신입): 뉴스 애니메이션 추가 (fade-in) */}
      {globalNews && (
        <div className="p-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-950/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-700">🌐 국제</span>
          </div>
          <p className="font-bold text-sm">📰 {globalNews.headline}</p>
          <p className="text-xs text-gray-400 mt-1">{globalNews.detail}</p>
        </div>
      )}
      {companyNews && companyNews.map((news) => (
        <div key={news.id} className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-950/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-700">{news.sector}</span>
          </div>
          <p className="font-bold text-sm">📰 {news.headline}</p>
          <p className="text-xs text-gray-400 mt-1">{news.detail}</p>
        </div>
      ))}
    </div>
  )
}
