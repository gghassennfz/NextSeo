'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { 
  User, 
  Settings, 
  History, 
  Crown, 
  Mail, 
  Calendar,
  BarChart3,
  Download,
  Trash2,
  Edit2,
  Save,
  X,
  Shield,
  Bell,
  Globe,
  Zap
} from 'lucide-react'
import { scanReportService, usageLogService, userSettingsService, ScanReport, UsageLog } from '@/lib/supabase'

interface ProfilePageProps {
  onClose?: () => void
}

export function ProfilePage({ onClose }: ProfilePageProps) {
  const { user, profile, updateProfile, signOut } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || ''
  })
  const [scanReports, setScanReports] = useState<ScanReport[]>([])
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([])
  const [settings, setSettings] = useState({
    emailNotifications: true,
    scanReminders: false,
    weeklyReports: true,
    publicProfile: false
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Load scan reports
      const reports = await scanReportService.getScanReports(user.id, 20)
      setScanReports(reports)

      // Load usage logs
      const logs = await usageLogService.getUsageLogs(user.id, 50)
      setUsageLogs(logs)

      // Load user settings
      const userSettings = await userSettingsService.getSettings(user.id)
      console.log('Loaded user settings:', userSettings)
      
      // Since we have a single settings record, just use the first one
      if (userSettings.length > 0) {
        const userSetting = userSettings[0]
        setSettings({
          email_notifications: userSetting.email_notifications,
          weekly_reports: userSetting.weekly_reports,
          dark_mode: userSetting.dark_mode,
          language: userSetting.language,
          timezone: userSetting.timezone
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSave = async () => {
    if (!user) return

    setLoading(true)
    try {
      const result = await updateProfile(editForm)
      if (result.success) {
        setIsEditing(false)
      } else {
        alert('Failed to update profile: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = async (key: string, value: any) => {
    if (!user) return

    setSettings(prev => ({ ...prev, [key]: value }))
    await userSettingsService.setSetting(user.id, 'preferences', key, value)
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!user) return

    const confirmed = window.confirm('Are you sure you want to delete this report?')
    if (!confirmed) return

    const success = await scanReportService.deleteScanReport(reportId, user.id)
    if (success) {
      setScanReports(prev => prev.filter(report => report.id !== reportId))
    } else {
      alert('Failed to delete report')
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getSubscriptionBadge = () => {
    const tier = profile?.subscription_tier || 'free'
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      pro: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    }
    
    return (
      <Badge className={`${colors[tier]} font-medium`}>
        {tier === 'free' && <Shield className="w-3 h-3 mr-1" />}
        {tier === 'pro' && <Crown className="w-3 h-3 mr-1" />}
        {tier === 'enterprise' && <Zap className="w-3 h-3 mr-1" />}
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    )
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Profile Header Card */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.full_name || 'No name set'}
                </h2>
                {getSubscriptionBadge()}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(profile.created_at)}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {profile.daily_scans_used}
                  </div>
                  <div className="text-xs text-gray-500">Daily Scans</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {profile.monthly_scans_used}
                  </div>
                  <div className="text-xs text-gray-500">Monthly Scans</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {scanReports.length}
                  </div>
                  <div className="text-xs text-gray-500">Total Reports</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>History</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your profile information</CardDescription>
                </div>
                <Button 
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => isEditing ? handleEditSave() : setIsEditing(true)}
                  disabled={loading}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={isEditing ? editForm.full_name : profile.full_name || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled={true}
                    className="bg-gray-50"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Account Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Account ID:</span>
                    <div className="font-mono text-xs mt-1">{user.id}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Login:</span>
                    <div className="mt-1">
                      {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scan History</CardTitle>
              <CardDescription>Your recent SEO analysis reports</CardDescription>
            </CardHeader>
            <CardContent>
              {scanReports.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No scan reports yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start by analyzing your first website!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scanReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-blue-500" />
                          <h3 className="font-medium">{report.title || report.url}</h3>
                          <Badge variant={report.overall_score >= 80 ? "default" : report.overall_score >= 60 ? "secondary" : "destructive"}>
                            {report.overall_score}%
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {report.url} • {formatDate(report.created_at)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent account activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usageLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <span className="font-medium capitalize">{log.action.replace('_', ' ')}</span>
                        <div className="text-sm text-gray-500">{formatDate(log.created_at)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive updates about your scans</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="scanReminders">Scan Reminders</Label>
                  <p className="text-sm text-gray-500">Get reminded to scan your websites</p>
                </div>
                <Switch
                  id="scanReminders"
                  checked={settings.scanReminders}
                  onCheckedChange={(checked) => handleSettingChange('scanReminders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weeklyReports">Weekly Reports</Label>
                  <p className="text-sm text-gray-500">Receive weekly SEO insights</p>
                </div>
                <Switch
                  id="weeklyReports"
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="publicProfile">Public Profile</Label>
                  <p className="text-sm text-gray-500">Make your profile visible to others</p>
                </div>
                <Switch
                  id="publicProfile"
                  checked={settings.publicProfile}
                  onCheckedChange={(checked) => handleSettingChange('publicProfile', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-red-800">Sign Out</h3>
                    <p className="text-sm text-red-600">Sign out of your account</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={signOut}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
