import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 환경변수 미설정 시 null — 랭킹 기능만 비활성화, 게임은 정상 동작
export let supabase = null
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
} catch (e) {
  console.warn('Supabase 초기화 실패 (env 미설정):', e.message)
}
