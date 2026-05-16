import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 음악 설정 전역 상태 — localStorage 'audio-settings' 키에 저장
export const useAudioStore = create(
  persist(
    (set) => ({
      muted: false,
      volume: 0.15,
      sfxVolume: 0.5,
      setMuted: (muted) => set({ muted }),
      setVolume: (volume) => set({ volume }),
      setSfxVolume: (sfxVolume) => set({ sfxVolume }),
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
    }),
    { name: 'audio-settings' }
  )
)
