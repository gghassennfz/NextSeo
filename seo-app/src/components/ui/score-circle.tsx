import React from 'react'
import { cn, getScoreColor } from '@/lib/utils'

interface ScoreCircleProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ScoreCircle({ score, size = 'md', className }: ScoreCircleProps) {
  const radius = size === 'sm' ? 30 : size === 'md' ? 45 : 60
  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 6 : 8
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className={cn("relative", className)}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-gray-200"
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={cn(
            "transition-all duration-1000 ease-out",
            getScoreColor(score)
          )}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(
          "font-bold",
          size === 'sm' ? 'text-sm' : size === 'md' ? 'text-xl' : 'text-3xl',
          getScoreColor(score)
        )}>
          {Math.round(score)}
        </span>
      </div>
    </div>
  )
}
