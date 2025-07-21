'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScoreCircle } from '@/components/ui/score-circle'
import { cn, getScoreColor, getScoreBgColor } from '@/lib/utils'

interface SectionCardProps {
  title: string
  score: number
  icon: React.ReactNode
  children: React.ReactNode
  defaultExpanded?: boolean
  className?: string
}

export function SectionCard({ 
  title, 
  score, 
  icon, 
  children, 
  defaultExpanded = false,
  className 
}: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <Card className={cn("overflow-hidden transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-lg",
              getScoreBgColor(score)
            )}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <ScoreCircle score={score} size="sm" />
                <Badge 
                  variant={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'}
                  className="text-xs"
                >
                  {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}
                </Badge>
              </div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-500"
          >
            <ChevronDown size={20} />
          </motion.div>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <CardContent className="pt-0">
              <div className="border-t pt-4">
                {children}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
