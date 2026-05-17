// 전광판(Marquee) — 한 팁씩 우측→좌측으로 흐름, 사라지면 다음 팁 등장
// Props:
//   items     : string[] — 팁 리스트 (순서대로 순환)
//   leftLabel : 좌측 고정 라벨 (예: '📢 TIPS')
//
// 동작:
//   - setInterval(12s)마다 idx 증가 → key 변경 → 새 React 요소 마운트 → animation 재시작
//   - CSS @keyframes marquee-single (index.css): 12s linear forwards
//   - hover 시 일시정지

import { useState, useEffect } from 'react'

const CYCLE_MS = 12000 // index.css의 animation duration과 일치 (12s)

export default function Marquee({ items, leftLabel = '📢 TIPS' }) {
  const [idx, setIdx] = useState(0)

  // items가 바뀌면 (예: 새 라운드 뉴스 도착) idx를 0으로 reset해서 첫 항목부터 다시 표시
  useEffect(() => {
    setIdx(0)
    if (!items || items.length <= 1) return
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % items.length)
    }, CYCLE_MS)
    return () => clearInterval(timer)
  }, [items])

  if (!items || items.length === 0) return null

  return (
    <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 backdrop-blur border-2 border-cyan-500/60 rounded-xl shadow-[0_0_40px_rgba(34,211,238,0.2)] overflow-hidden flex items-center h-7 animate-marquee-pause">
      {/* 좌측 고정 라벨 — cyan-500/80 + border로 살짝 톤다운, 식별성은 유지 */}
      <span className="flex-shrink-0 px-2 py-0.5 bg-cyan-500/80 text-slate-950 text-[10px] font-bold tracking-wider font-mono border-r border-cyan-300/40 shadow-[2px_0_8px_rgba(34,211,238,0.4)] z-10">
        {leftLabel}
      </span>

      {/* 스크롤 영역 — 절대 위치 자식이 우측→좌측으로 한 번 가로지름 */}
      <div className="relative flex-1 overflow-hidden h-full">
        <div
          key={idx}
          className="animate-marquee-single whitespace-nowrap text-xs text-cyan-100 font-mono tracking-wider"
        >
          {items[idx]}
        </div>
      </div>
    </div>
  )
}
