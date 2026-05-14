import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useLeaderboardStore = create((set, get) => ({
  rankings: [],
  myRank: null,   // 전체 DB 기준 내 순위 (1-based)
  loading: false,
  error: null,
  submitted: false,

  // 랭킹 등록 → 성공 시 목록 갱신 + 내 순위 계산
  submitScore: async (nickname, finalAsset, grade) => {
    // supabase 미설정 시에도 게임 흐름은 유지
    if (!supabase) {
      set({ submitted: true })
      return
    }
    set({ loading: true, error: null })
    const { error } = await supabase
      .from('rankings')
      .insert({ nickname, final_asset: finalAsset, grade })
    if (error) {
      set({ error: error.message, loading: false })
      return
    }
    set({ submitted: true })
    await get().fetchRankings(finalAsset)
  },

  // 상위 20위 조회 + 내 자산 기준 전체 순위 계산
  fetchRankings: async (myFinalAsset = null) => {
    if (!supabase) return
    set({ loading: true, error: null })

    // 목록 조회 + 내 순위 카운트를 병렬 실행
    const [listResult, countResult] = await Promise.all([
      supabase
        .from('rankings')
        .select('id, nickname, final_asset, grade, created_at')
        .order('final_asset', { ascending: false })
        .limit(20),
      myFinalAsset != null
        ? supabase
            .from('rankings')
            .select('*', { count: 'exact', head: true })
            .gt('final_asset', myFinalAsset)
        : Promise.resolve({ count: null, error: null }),
    ])

    if (listResult.error) {
      set({ error: listResult.error.message, loading: false })
      return
    }

    set({
      rankings: listResult.data ?? [],
      // 나보다 높은 사람 수 + 1 = 내 순위
      myRank: countResult.count != null ? countResult.count + 1 : null,
      loading: false,
    })
  },

  clearError: () => set({ error: null }),

  // 다시 하기 시 gameStore.resetGame에서 호출 — submitted 상태 초기화
  resetSubmitted: () => set({ submitted: false, myRank: null, rankings: [] }),
}))
