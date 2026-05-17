// 고정 canvas(canvasWidth × canvasHeight)를 컨테이너에 맞춰 transform: scale로 비례 조정하는 래퍼.
//
// 동작:
//   - 컨테이너 ≥ 캔버스 → scale > 1 (큰 화면에서 콘텐츠 자연 확대 — maxScale로 상한)
//   - 컨테이너 < 캔버스 → letterbox-fit으로 비례 축소 (가로/세로 중 더 작은 비율)
//
// 캔버스 사이즈는 "이 사이즈를 기준으로 디자인했다"고 보면 됨.
// 작게 잡을수록 큰 화면에서 더 크게 확대됨. maxScale로 과도한 확대 방지.
//
// 사용 예:
//   <div className="absolute" style={{ top: '12%', left: '3%', right: '23%', bottom: '7%' }}>
//     <ScaledPanel canvasWidth={1100} canvasHeight={680} maxScale={1.5}>
//       <BulkBuyPanel ... />
//     </ScaledPanel>
//   </div>

import { useRef, useState, useLayoutEffect } from 'react'

export default function ScaledPanel({ canvasWidth, canvasHeight, children, maxScale = 1 }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (w > 0 && h > 0) {
        // letterbox-fit 후 maxScale로 cap — 너무 큰 화면에서 콘텐츠가 무한 확대되지 않도록
        const fit = Math.min(w / canvasWidth, h / canvasHeight)
        setScale(Math.min(fit, maxScale))
      }
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [canvasWidth, canvasHeight, maxScale])

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <div
        className="absolute top-0 left-0"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  )
}
