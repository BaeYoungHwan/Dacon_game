// 모달/오버레이 ESC 닫기 공용 훅
// 중첩 모달 대응: 최근 마운트된 핸들러 1개만 호출되도록 스택 기반으로 관리
// (예: 매수 모달 안에 도움말 오버레이가 열린 경우 → ESC 1번은 도움말만 닫힘)
import { useEffect, useRef } from 'react'

const handlerStack = []
let listenerAttached = false

function ensureListener() {
  if (listenerAttached || typeof window === 'undefined') return
  listenerAttached = true
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return
    const top = handlerStack[handlerStack.length - 1]
    if (!top) return
    e.preventDefault()
    top()
  })
}

// onEscape: ESC 입력 시 호출될 콜백 (보통 onClose)
// enabled: false 면 등록하지 않음 — 조건부 모달(예: 인라인 팝오버)에 사용
export function useEscapeKey(onEscape, enabled = true) {
  const cbRef = useRef(onEscape)
  useEffect(() => {
    cbRef.current = onEscape
  }, [onEscape])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return
    ensureListener()
    const handler = () => cbRef.current?.()
    handlerStack.push(handler)
    return () => {
      const idx = handlerStack.lastIndexOf(handler)
      if (idx !== -1) handlerStack.splice(idx, 1)
    }
  }, [enabled])
}
