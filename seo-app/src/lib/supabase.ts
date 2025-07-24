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

// OAuth provider types
export type OAuthProvider = 'google' | 'github' | 'discord' | 'facebook' | 'twitter'

// Database types
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  subscription_tier: 'free' | 'pro' | 'enterprise'
  total_scans: number
  created_at: string
  updated_at: string
}

export interface ScanReport {
  id: string
  user_id: string
  url: string
  title?: string
  description?: string
  seo_score?: number
  performance_score?: number
  accessibility_score?: number
  best_practices_score?: number
  report_data: any
  created_at: string
}

export interface UsageLog {
  id: string
  user_id: string
  action: 'scan' | 'export_pdf' | 'ai_chat' | 'login' | 'signup'
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  category: string
  key: string
  value: any
  created_at: string
  updated_at: string
}

// Helper functions for database operations
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    
    return data as Profile
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating profile:', error)
      return null
    }
    
    return data as Profile
  },

  async incrementScanCount(userId: string): Promise<boolean> {
    const supabase = getSupabaseClient()
    const today = new Date().toISOString().split('T')[0]
    
    // Get current profile first
    const profile = await this.getProfile(userId)
    if (!profile) return false
    
    const { error } = await supabase
      .from('profiles')
      .update({
        total_scans: (profile.total_scans || 0) + 1
      })
      .eq('id', userId)
    
    if (error) {
      console.error('Error incrementing scan count:', error)
      return false
    }
    
    return true
  }
}

export const scanReportService = {
  async createScanReport(report: Omit<ScanReport, 'id' | 'created_at'>): Promise<ScanReport | null> {
    const supabase = getSupabaseClient()
    
    console.log('Inserting scan report:', report)
    
    const { data, error } = await supabase
      .from('scan_reports')
      .insert(report)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating scan report:', error)
      console.error('Error details:', error.message, error.details, error.hint)
      return null
    }
    
    console.log('Scan report created successfully:', data)
    return data as ScanReport
  },

  async getScanReports(userId: string, limit: number = 10): Promise<ScanReport[]> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('scan_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching scan reports:', error)
      return []
    }
    
    return (data || []) as ScanReport[]
  },

  async deleteScanReport(reportId: string, userId: string): Promise<boolean> {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('scan_reports')
      .delete()
      .eq('id', reportId)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error deleting scan report:', error)
      return false
    }
    
    return true
  }
}

export const usageLogService = {
  async logAction(action: UsageLog['action'], userId: string, details?: Record<string, any>): Promise<void> {
    const supabase = getSupabaseClient()
    await supabase
      .from('usage_logs')
      .insert({
        user_id: userId,
        action,
        details: details || {},
        created_at: new Date().toISOString()
      })
  },

  async getUsageLogs(userId: string, limit: number = 50): Promise<UsageLog[]> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('usage_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching usage logs:', error)
      return []
    }
    
    return (data || []) as UsageLog[]
  }
}

export const userSettingsService = {
  async getSetting(userId: string, category: string, key: string): Promise<any> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('user_settings')
      .select('value')
      .eq('user_id', userId)
      .eq('category', category)
      .eq('key', key)
      .single()
    
    if (error) {
      return null
    }
    
    return data?.value
  },

  async setSetting(userId: string, category: string, key: string, value: any): Promise<boolean> {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        category,
        key,
        value
      })
    
    if (error) {
      console.error('Error setting user setting:', error)
      return false
    }
    
    return true
  },

  async getSettings(userId: string): Promise<UserSettings[]> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error fetching user settings:', error)
      return []
    }
    
    return (data || []) as UserSettings[]
  }
}
