import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// Single Supabase client instance to avoid multiple GoTrueClient warnings
let supabaseInstance: ReturnType<typeof createClientComponentClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient()
  }
  return supabaseInstance
}

// Legacy export for backward compatibility
export const supabase = getSupabaseClient()
export const createSupabaseClient = getSupabaseClient

// Database types
export interface Profile {
  id: string
  email: string
  full_name?: string
  subscription_tier: 'free' | 'pro'
  daily_scans_used: number
  last_scan_date: string
  created_at: string
  updated_at: string
}

export interface ScanReport {
  id: string
  user_id: string
  url: string
  analysis_data: any
  overall_score: number
  created_at: string
}

export interface UsageLog {
  id: string
  user_id: string
  action: 'scan' | 'export_pdf'
  details?: any
  created_at: string
}
