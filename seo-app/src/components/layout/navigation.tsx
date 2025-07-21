'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Menu, X, User, LogOut, Settings, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { SignInDialog } from '@/components/auth/sign-in-dialog'
import { SignUpDialog } from '@/components/auth/sign-up-dialog'

interface NavigationProps {
  currentPage: 'home' | 'dashboard' | 'pricing'
  onPageChange: (page: 'home' | 'dashboard' | 'pricing') => void
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
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
    { name: 'Pricing', key: 'pricing' as const },
  ]

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
                    className="flex items-center space-x-2"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <User className="h-4 w-4" />
                    <span>{profile?.full_name || user.email}</span>
                  </Button>
                  
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                      >
                        <div className="py-1">
                          <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                            <div className="font-medium">{profile?.full_name}</div>
                            <div className="text-gray-500">{user.email}</div>
                            <div className="text-xs text-blue-600 capitalize">
                              {profile?.subscription_tier || 'free'} plan
                            </div>
                          </div>
                          
                          <button
                            onClick={() => {
                              onPageChange('dashboard')
                              setShowUserMenu(false)
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Dashboard
                          </button>
                          
                          <button
                            onClick={() => {
                              onPageChange('pricing')
                              setShowUserMenu(false)
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Upgrade Plan
                          </button>
                          
                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => setShowSignIn(true)}>
                    Sign In
                  </Button>
                  <Button onClick={() => setShowSignUp(true)}>
                    Sign Up
                  </Button>
                </>
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
                    <div className="space-y-2">
                      <div className="text-sm text-gray-700">
                        <div className="font-medium">{profile?.full_name}</div>
                        <div className="text-gray-500">{user.email}</div>
                        <div className="text-xs text-blue-600 capitalize">
                          {profile?.subscription_tier || 'free'} plan
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full justify-start"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowSignIn(true)
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full justify-start"
                      >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => {
                          setShowSignUp(true)
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

      {/* Auth Dialogs */}
      <SignInDialog 
        open={showSignIn} 
        onOpenChange={setShowSignIn}
        onSignUpClick={() => {
          setShowSignIn(false)
          setShowSignUp(true)
        }}
      />
      
      <SignUpDialog 
        open={showSignUp} 
        onOpenChange={setShowSignUp}
        onSignInClick={() => {
          setShowSignUp(false)
          setShowSignIn(true)
        }}
      />
    </>
  )
}
