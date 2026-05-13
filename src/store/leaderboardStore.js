import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useLeaderboardStore = create((set) => ({
  rankings: [],
  loading: false,
  error: null,
  submitted: false,

  // 랭킹 등록
  submitScore: async (nickname, finalAssets) => {
    set({ loading: true, error: null })
    const { error } = await supabase
      .from('rankings')
      .insert({ nickname, final_assets: finalAssets })
    if (error) set({ error: error.message, loading: false })
    else set({ loading: false, submitted: true })
  },

  // 상위 20위 조회
  fetchRankings: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .order('final_assets', { ascending: false })
      .limit(20)
    if (error) set({ error: error.message, loading: false })
    else set({ rankings: data ?? [], loading: false })
  },
}))
