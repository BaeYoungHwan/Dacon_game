// 모달 확인(Enter 키) 공용 훅 — useEscapeKey와 동일한 스택 패턴
// 가장 최근 마운트된 모달의 핸들러만 호출되어 중첩 시에도 충돌 없음
//
// 포커스된 요소가 button / input / textarea / select 인 경우엔 스킵 —
//   사용자가 Tab으로 '취소' 버튼을 잡고 Enter를 누른 경우 그 버튼이 실행돼야 함 (이중 트리거 방지)
import { useEffect, useRef } from 'react'

const handlerStack = []
let listenerAttached = false

function isInteractive(el) {
  if (!el) return false
  const tag = el.tagName
  return tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

function ensureListener() {
  if (listenerAttached || typeof window === 'undefined') return
  listenerAttached = true
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return
    if (isInteractive(e.target)) return
    const top = handlerStack[handlerStack.length - 1]
    if (!top) return
    e.preventDefault()
    top()
  })
}

export function useEnterKey(onEnter, enabled = true) {
  const cbRef = useRef(onEnter)
  useEffect(() => {
    cbRef.current = onEnter
  }, [onEnter])

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
