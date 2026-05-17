// 설정 모달 — 게임 메인/거래소/정보상/기술상 공용
// 디자인: GamePage·PageNav의 슬레이트(slate) + 시안(cyan) 네온 HTS 톤
//   · 백드롭: 슬레이트 다크 + blur
//   · 패널:  slate-900 그라데이션 + cyan-300 border + 외광 halo + 4모서리 L자 deco
//   · 슬라이더 accent: cyan-400
// 항목: 배경음·효과음 (각각 라벨/스피커 토글 + 볼륨 슬라이더 2행 구성)
//   · 스피커 아이콘 클릭 = 완전 음소거 토글 (이전 볼륨은 ref에 기억해 복원)

import { useRef } from 'react'
import { useAudioStore } from '../../store/audioStore'

// 4모서리 L자 코너 deco — PageNav의 "다음 주" 버튼과 동일한 톤
function CornerDeco() {
  const corner = 'absolute w-4 h-4 border-cyan-300/80 pointer-events-none'
  return (
    <>
      <span className={`${corner} top-0 left-0 border-t-2 border-l-2 rounded-tl-md`} />
      <span className={`${corner} top-0 right-0 border-t-2 border-r-2 rounded-tr-md`} />
      <span className={`${corner} bottom-0 left-0 border-b-2 border-l-2 rounded-bl-md`} />
      <span className={`${corner} bottom-0 right-0 border-b-2 border-r-2 rounded-br-md`} />
    </>
  )
}

export default function SettingsModal({ onClose }) {
  const { muted, volume, toggleMuted, setVolume, sfxVolume, setSfxVolume } = useAudioStore()

  // 음소거 직전 볼륨 기억 — 스피커 토글로 음소거 해제 시 복원
  const prevBgmVolRef = useRef(volume > 0 ? volume : 0.15)
  const prevSfxVolRef = useRef(sfxVolume > 0 ? sfxVolume : 0.5)

  // 무음 여부 — 슬라이더 0 또는 muted 플래그
  const bgmSilent = muted || volume === 0
  const sfxSilent = sfxVolume === 0

  // 스피커 아이콘 — 무음 / 저 / 고 볼륨 3단
  const bgmIcon = bgmSilent ? '🔇' : volume > 0.5 ? '🔊' : '🔉'
  const sfxIcon = sfxSilent ? '🔇' : sfxVolume > 0.5 ? '🔊' : '🔉'

  // BGM 스피커 토글: 무음 ↔ 가청 (volume도 0이면 기본값 복원)
  const toggleBgm = () => {
    if (bgmSilent) {
      if (muted) toggleMuted()
      if (volume === 0) setVolume(prevBgmVolRef.current || 0.15)
    } else {
      prevBgmVolRef.current = volume
      if (!muted) toggleMuted()
    }
  }

  // SFX 스피커 토글: sfxVolume 0 ↔ 이전 볼륨
  const toggleSfx = () => {
    if (sfxSilent) {
      setSfxVolume(prevSfxVolRef.current || 0.5)
    } else {
      prevSfxVolRef.current = sfxVolume
      setSfxVolume(0)
    }
  }

  const handleBgmVolChange = (v) => {
    setVolume(v)
    if (v > 0) prevBgmVolRef.current = v
  }
  const handleSfxVolChange = (v) => {
    setSfxVolume(v)
    if (v > 0) prevSfxVolRef.current = v
  }

  // 스피커 토글 버튼 공용 클래스 — 무음 시 슬레이트, 가청 시 시안 네온
  const speakerBtnClass = (silent) =>
    `flex h-9 w-9 items-center justify-center rounded-full border-2 text-base transition-all duration-150 ${
      silent
        ? 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
        : 'border-cyan-300 bg-cyan-400/15 text-cyan-100 hover:bg-cyan-400/25'
    }`
  const speakerBtnStyle = (silent) => ({
    boxShadow: silent
      ? 'none'
      : '0 0 12px rgba(34,211,238,0.4), inset 0 0 8px rgba(34,211,238,0.15)',
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-lg border-2 border-cyan-300/80 bg-gradient-to-b from-slate-900 to-slate-950 p-6"
        style={{
          boxShadow:
            '0 0 32px rgba(34,211,238,0.45), inset 0 0 24px rgba(34,211,238,0.10)',
        }}
      >
        <CornerDeco />

        {/* 헤더 */}
        <div className="mb-5 flex items-center justify-between">
          <h2
            className="font-mono text-lg font-bold tracking-widest text-cyan-100"
            style={{ textShadow: '0 0 10px rgba(34,211,238,0.7)' }}
          >
            SETTINGS
          </h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/60 text-cyan-200 transition-all duration-150 hover:border-cyan-200 hover:bg-cyan-400/15 hover:text-white"
            style={{ boxShadow: '0 0 10px rgba(34,211,238,0.25)' }}
          >
            ✕
          </button>
        </div>

        {/* 배경음 — 라벨/스피커 토글 + 볼륨 슬라이더 */}
        <section className="mb-5 space-y-3 rounded-md border border-cyan-400/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm tracking-wider text-cyan-100">
              배경음
            </span>
            <button
              onClick={toggleBgm}
              aria-label={bgmSilent ? '배경음 켜기' : '배경음 끄기'}
              className={speakerBtnClass(bgmSilent)}
              style={speakerBtnStyle(bgmSilent)}
            >
              {bgmIcon}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleBgmVolChange(Number(e.target.value))}
              className="flex-1 accent-cyan-400"
            />
            <span className="w-10 text-right font-mono text-xs text-cyan-200/90">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </section>

        {/* 효과음 — 배경음과 동일한 2행 레이아웃 */}
        <section className="space-y-3 rounded-md border border-cyan-400/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm tracking-wider text-cyan-100">
              효과음
            </span>
            <button
              onClick={toggleSfx}
              aria-label={sfxSilent ? '효과음 켜기' : '효과음 끄기'}
              className={speakerBtnClass(sfxSilent)}
              style={speakerBtnStyle(sfxSilent)}
            >
              {sfxIcon}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVolume}
              onChange={(e) => handleSfxVolChange(Number(e.target.value))}
              className="flex-1 accent-cyan-400"
            />
            <span className="w-10 text-right font-mono text-xs text-cyan-200/90">
              {Math.round(sfxVolume * 100)}%
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}
