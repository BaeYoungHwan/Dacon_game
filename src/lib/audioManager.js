// 페이지별 배경음악 재생·페이드 관리 모듈
const TRACKS = {
  intro:  '/music/kornevmusic-upbeat-happy-corporate-487426.mp3',
  main:   '/music/the_mountain-upbeat-background-483308.mp3',
  market: '/music/paulyudin-tension-tension-music-491416.mp3',
  win:    '/music/nastelbom-success-success-music-436867.mp3',
  lose:   '/music/leberch-dark-cinematic-509801.mp3',
}

const FADE_STEPS = 20
const FADE_MS    = 1000

let currentAudio = null
let currentTrack = null
let targetVolume = 0.5
let isMuted      = false
let fadeTimer    = null

function clearFade() {
  if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null }
}

function fadeIn(audio, vol) {
  clearFade()
  audio.volume = 0
  audio.play().catch(() => {
    // 브라우저 자동재생 차단 시 첫 클릭에 재시도
    document.addEventListener('click', () => audio.play().catch(() => {}), { once: true })
  })
  const stepVol = vol / FADE_STEPS
  const stepMs  = FADE_MS / FADE_STEPS
  let step = 0
  fadeTimer = setInterval(() => {
    step++
    audio.volume = Math.min(vol, stepVol * step)
    if (step >= FADE_STEPS) clearFade()
  }, stepMs)
}

function fadeOut(audio, onDone) {
  clearFade()
  const startVol = audio.volume
  const stepVol  = startVol / FADE_STEPS
  const stepMs   = FADE_MS / FADE_STEPS
  let step = 0
  fadeTimer = setInterval(() => {
    step++
    audio.volume = Math.max(0, startVol - stepVol * step)
    if (step >= FADE_STEPS) {
      audio.pause()
      clearFade()
      onDone?.()
    }
  }, stepMs)
}

export function play(trackName) {
  if (currentTrack === trackName) return
  const src = TRACKS[trackName]
  if (!src) return

  const startNew = () => {
    currentTrack = trackName
    currentAudio = new Audio(src)
    currentAudio.loop = true
    fadeIn(currentAudio, isMuted ? 0 : targetVolume)
  }

  if (currentAudio) {
    const prev = currentAudio
    currentTrack = null
    fadeOut(prev, startNew)
  } else {
    startNew()
  }
}

export function stop() {
  if (!currentAudio) return
  const audio = currentAudio
  currentAudio = null
  currentTrack = null
  fadeOut(audio)
}

export function setVolume(vol) {
  targetVolume = vol
  if (currentAudio && !isMuted) currentAudio.volume = vol
}

export function setMuted(muted) {
  isMuted = muted
  if (currentAudio) currentAudio.volume = muted ? 0 : targetVolume
}

// ─── 버튼 클릭 효과음 (Web Audio API 합성음 — 파일 없이 동작) ──────────────
let sfxContext = null

function getSfxCtx() {
  if (!sfxContext) {
    try { sfxContext = new (window.AudioContext || window.webkitAudioContext)() }
    catch (_) { return null }
  }
  if (sfxContext.state === 'suspended') sfxContext.resume().catch(() => {})
  return sfxContext
}

// 볼륨 설정에 비례한 기준 게인 (targetVolume 0.5 기준 = 0.1)
function sfxGain() { return 0.2 * targetVolume }

export function playSfx(type) {
  if (isMuted) return
  const ctx = getSfxCtx()
  if (!ctx) return
  try {
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    const now = ctx.currentTime
    if (type === 'click') {
      osc.type = 'square'
      osc.frequency.setValueAtTime(700, now)
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.1)
      gain.gain.setValueAtTime(sfxGain(), now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
      osc.start(now); osc.stop(now + 0.12)
    }
  } catch (_) {}
}