// 첫 진입 시네마틱 인트로 — 텍스트 카드 3장 순차 표시 + SKIP 버튼
// 흐름: startGame() → page='intro' → IntroScene → finishIntro() → page='main'

import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'

const CARDS = [
  { getText: ()     => '2025년 봄, KOSPI가 요동치고 있다.',                      color: '#fde68a' }, // amber-200
  { getText: (name) => `신흥 투자자 '${name}', 한국 증시에 입성했다.`,            color: '#fcd34d' }, // amber-300
  { getText: ()     => '50주 안에 코스피 지수 수익률을 이겨라.',                   color: '#67e8f9' }, // cyan-300
]

const FADE_IN_MS  = 400
const HOLD_MS     = 1000
const LAST_HOLD_MS = 1200 // 마지막 카드는 조금 더 길게
const FADE_OUT_MS = 300

export default function IntroScene() {
  const nickname    = useGameStore((s) => s.nickname)
  const finishIntro = useGameStore((s) => s.finishIntro)

  const [cardIdx, setCardIdx] = useState(0)
  const [show,    setShow]    = useState(false)

  useEffect(() => {
    // 카드 교체 시 opacity-0 → 브라우저가 상태 인식 후 → opacity-1 (double RAF)
    setShow(false)
    const rafId = requestAnimationFrame(() =>
      requestAnimationFrame(() => setShow(true))
    )

    const holdMs = cardIdx === CARDS.length - 1 ? LAST_HOLD_MS : HOLD_MS
    let innerTimer = null
    const fadeOutTimer = setTimeout(() => {
      setShow(false)
      innerTimer = setTimeout(() => {
        const next = cardIdx + 1
        if (next >= CARDS.length) {
          finishIntro()
        } else {
          setCardIdx(next)
        }
      }, FADE_OUT_MS)
    }, FADE_IN_MS + holdMs)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(fadeOutTimer)
      clearTimeout(innerTimer)
    }
  }, [cardIdx, finishIntro])

  const card = CARDS[cardIdx]
  const text = card.getText(nickname)

  return (
    <div className="fixed inset-0 bg-stone-950 flex items-center justify-center z-50">
      {/* 텍스트 카드 — 색상·투명도 전환 */}
      <div
        style={{
          opacity:    show ? 1 : 0,
          transition: show
            ? `opacity ${FADE_IN_MS}ms ease-in`
            : `opacity ${FADE_OUT_MS}ms ease-out`,
          color: card.color,
        }}
        className="text-center px-8 max-w-2xl"
      >
        <p className="text-2xl md:text-3xl font-bold leading-relaxed tracking-wide">
          {text}
        </p>
      </div>

      {/* SKIP — 우하단 고정, 항상 표시 */}
      <button
        onClick={finishIntro}
        className="absolute bottom-8 right-8 text-stone-500 hover:text-stone-300 text-sm transition-colors duration-150"
      >
        SKIP ▶
      </button>
    </div>
  )
}
