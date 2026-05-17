// Props:
//   companyNews - 湲곗뾽 ?댁뒪 諛곗뿴 [{ id, date, sector, headline, detail }] | null
//   globalNews  - 援?젣 ?댁뒪 ?⑥씪 ??ぉ { id, date, sector, headline, detail } | null

export default function NewsPanel({ companyNews, globalNews }) {
  const hasNews = (companyNews && companyNews.length > 0) || globalNews
  if (!hasNews) return null

  return (
    <div className="mt-4 space-y-2">
      {globalNews && (
        <div className="p-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-950/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-700">?뙋 援?젣</span>
          </div>
          <p className="font-bold text-sm">?벐 {globalNews.headline}</p>
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line border-t border-yellow-500/30 pt-2 mt-2">{globalNews.detail}</p>
        </div>
      )}
      {companyNews && companyNews.map((news) => (
        <div key={news.id} className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-950/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-700">{news.sector}</span>
          </div>
          <p className="font-bold text-sm">?벐 {news.headline}</p>
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line border-t border-blue-500/30 pt-2 mt-2">{news.detail}</p>
        </div>
      ))}
    </div>
  )
}
