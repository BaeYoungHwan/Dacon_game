import { createClient } from '@supabase/supabase-js'

// 환경변수는 Vercel 대시보드 또는 .env 파일에 설정
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase 클라이언트 (랭킹 보드 단일 목적)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
