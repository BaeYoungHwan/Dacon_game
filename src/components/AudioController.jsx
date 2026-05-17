import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { useAudioStore } from '../store/audioStore'
import * as audioManager from '../lib/audioManager'
import { KOSPI_CHART_RETURN } from '../lib/grade'

// page → 트랙 매핑 (result는 수익률로 결정)
const PAGE_TRACK = {
  start:        'intro',
  main:         'main',
  infoMerchant: 'main',
  techMerchant: 'main',
  market:       'market',
}

export default function AudioController() {
  const page             = useGameStore((s) => s.page)
  const getReturnMultiple = useGameStore((s) => s.getReturnMultiple)
  const { muted, volume, sfxVolume } = useAudioStore()

  // 페이지 변경 → 트랙 전환
  useEffect(() => {
    // KOSPI 수익률을 이겼을 때(스마트개미 이상)만 win, 개미·흑우·벼락거지는 lose
    const track = page === 'result'
      ? (getReturnMultiple() - 1 >= KOSPI_CHART_RETURN ? 'win' : 'lose')
      : PAGE_TRACK[page]
    if (track) audioManager.play(track)
  }, [page])

  // 볼륨 변경
  useEffect(() => { audioManager.setVolume(volume) }, [volume])

  // 음소거 변경
  useEffect(() => { audioManager.setMuted(muted) }, [muted])

  // 효과음 볼륨 변경
  useEffect(() => { audioManager.setSfxVolume(sfxVolume) }, [sfxVolume])

  return null
}
