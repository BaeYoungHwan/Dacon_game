// 숫자 변경 시 카운트업/카운트다운 애니메이션 (200ms ease-out)
// Props:
//   value    : 목표 숫자
//   decimals : 소수점 자릿수 (기본 0 = 정수 + 천 단위 콤마, ≥1 = toFixed)
//   className: 텍스트 span에 적용할 추가 클래스
//   cacheKey : 페이지 전환 후에도 직전 값 유지하기 위한 sessionStorage 키
//              (예: 'game-cash') — 페이지 이동으로 컴포넌트가 unmount/remount되어도
//              마지막 표시 값에서 새 value로 부드럽게 애니메이션
//
// 사용:
//   <AnimatedNumber value={cash} cacheKey="game-cash" />원
//   <AnimatedNumber value={changePct} decimals={2} />%

import { useState, useEffect, useRef } from 'react'

const DURATION_MS = 200

function readCache(storageKey) {
  if (!storageKey || typeof sessionStorage === 'undefined') return null
  const v = sessionStorage.getItem(storageKey)
  return v === null ? null : Number(v)
}

function writeCache(storageKey, value) {
  if (!storageKey || typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(storageKey, String(value))
}

export default function AnimatedNumber({ value, decimals = 0, className = '', cacheKey }) {
  const storageKey = cacheKey ? `anim-num:${cacheKey}` : null

  // 첫 mount 시 — 캐시된 직전 값이 있으면 거기서 시작, 없으면 value
  const initial = (() => {
    const cached = readCache(storageKey)
    return cached !== null ? cached : value
  })()

  const [display, setDisplay] = useState(initial)
  const displayRef = useRef(initial)
  const frameRef = useRef(null)

  useEffect(() => {
    const start = displayRef.current

    // 변동 없으면 애니메이션 스킵 — 캐시만 갱신 (현재 value 기록)
    if (start === value) {
      writeCache(storageKey, value)
      return
    }

    const startTime = performance.now()
    const animate = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / DURATION_MS, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      const current = start + (value - start) * eased
      displayRef.current = current
      setDisplay(current)
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        displayRef.current = value
        setDisplay(value)
        writeCache(storageKey, value) // 애니메이션 끝나면 캐시 갱신
      }
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [value, storageKey])

  const formatted = decimals === 0
    ? Math.round(display).toLocaleString()
    : display.toFixed(decimals)

  return <span className={className}>{formatted}</span>
}
