import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScore(score: number): number {
  return Math.round(score * 10) / 10
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  return "text-red-600"
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-100"
  if (score >= 60) return "bg-yellow-100"
  return "bg-red-100"
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + "..."
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.href
  } catch {
    // Try adding https:// prefix
    try {
      const withProtocol = new URL(`https://${url}`)
      return withProtocol.href
    } catch {
      return url
    }
  }
}
