import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const createSupabaseClient = () => createClientComponentClient()

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
