'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Menu, X, User, LogOut, Settings, FileText, Crown, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { AuthModal } from '@/components/auth/auth-modal'

interface NavigationProps {
  currentPage: 'home' | 'dashboard' | 'pricing' | 'ai-analysis' | 'profile'
  onPageChange: (page: 'home' | 'dashboard' | 'pricing' | 'ai-analysis' | 'profile') => void
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowUserMenu(false)
      onPageChange('home')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const navigation = [
    { name: 'Home', key: 'home' as const },
    { name: 'Dashboard', key: 'dashboard' as const, requireAuth: true },
    { name: 'AI Analysis', key: 'ai-analysis' as const },
    { name: 'Pricing', key: 'pricing' as const },
  ]

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getSubscriptionIcon = (tier?: string) => {
    switch (tier) {
      case 'pro':
        return <Crown className="w-3 h-3" />
      case 'enterprise':
        return <Crown className="w-3 h-3" />
      default:
        return <Shield className="w-3 h-3" />
    }
  }

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const filteredNavigation = navigation.filter(item => !item.requireAuth || user)

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <motion.div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => onPageChange('home')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">SEO Analyzer Pro</h1>
              </motion.div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {filteredNavigation.map((item) => (
                <Button
                  key={item.key}
                  variant={currentPage === item.key ? 'default' : 'ghost'}
                  onClick={() => onPageChange(item.key)}
                  className="text-base font-medium"
                >
                  {item.name}
                </Button>
              ))}
            </nav>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-3 px-3 py-2"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {getInitials(profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{profile?.full_name || 'User'}</span>
                      <div className="flex items-center space-x-1">
                        {getSubscriptionIcon(profile?.subscription_tier)}
                        <span className="text-xs text-gray-500 capitalize">
                          {profile?.subscription_tier || 'free'}
                        </span>
                      </div>
                    </div>
                  </Button>
                  
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                      >
                        <div className="py-2">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                  {getInitials(profile?.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{profile?.full_name || 'User'}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                <Badge variant="outline" className="mt-1">
                                  {getSubscriptionIcon(profile?.subscription_tier)}
                                  <span className="ml-1 capitalize">{profile?.subscription_tier || 'free'}</span>
                                </Badge>
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-4 text-center">
                              <div>
                                <div className="text-lg font-semibold text-blue-600">
                                  {profile?.daily_scans_used || 0}
                                </div>
                                <div className="text-xs text-gray-500">Daily Scans</div>
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-green-600">
                                  {profile?.monthly_scans_used || 0}
                                </div>
                                <div className="text-xs text-gray-500">Monthly Scans</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="py-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setShowUserMenu(false)
                                onPageChange('profile')
                              }}
                              className="w-full justify-start px-4 py-2"
                            >
                              <User className="h-4 w-4 mr-2" />
                              Profile
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setShowUserMenu(false)
                                onPageChange('dashboard')
                              }}
                              className="w-full justify-start px-4 py-2"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Reports
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleSignOut}
                              className="w-full justify-start px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Sign Out
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => openAuthModal('signin')}
                    className="font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => openAuthModal('signup')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="px-4 py-4 space-y-4">
                {filteredNavigation.map((item) => (
                  <Button
                    key={item.key}
                    variant={currentPage === item.key ? 'default' : 'ghost'}
                    onClick={() => {
                      onPageChange(item.key)
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full justify-start"
                  >
                    {item.name}
                  </Button>
                ))}
                
                <div className="border-t border-gray-200 pt-4">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {getInitials(profile?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{profile?.full_name || 'User'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <Badge variant="outline" className="mt-1">
                            {getSubscriptionIcon(profile?.subscription_tier)}
                            <span className="ml-1 capitalize">{profile?.subscription_tier || 'free'}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 py-2">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">
                            {profile?.daily_scans_used || 0}
                          </div>
                          <div className="text-xs text-gray-500">Daily</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {profile?.monthly_scans_used || 0}
                          </div>
                          <div className="text-xs text-gray-500">Monthly</div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            onPageChange('profile')
                            setIsMobileMenuOpen(false)
                          }}
                          className="w-full justify-start"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            onPageChange('dashboard')
                            setIsMobileMenuOpen(false)
                          }}
                          className="w-full justify-start"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Reports
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={handleSignOut}
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          openAuthModal('signin')
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full justify-start"
                      >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => {
                          openAuthModal('signup')
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full justify-start"
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  )
}
