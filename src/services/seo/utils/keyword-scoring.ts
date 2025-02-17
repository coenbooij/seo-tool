import { KeywordIntent } from '@prisma/client'

interface ScoringWeights {
  searchVolume: number
  difficulty: number
  intentMultiplier: {
    [KeywordIntent.TRANSACTIONAL]: number
    [KeywordIntent.INFORMATIONAL]: number
    [KeywordIntent.NAVIGATIONAL]: number
    [KeywordIntent.COMMERCIAL]: number
  }
  currentRankBonus: {
    topThree: number
    topTen: number
    firstPage: number
  }
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  searchVolume: 0.6,
  difficulty: 0.4,
  intentMultiplier: {
    [KeywordIntent.TRANSACTIONAL]: 1.5,
    [KeywordIntent.INFORMATIONAL]: 1.0,
    [KeywordIntent.NAVIGATIONAL]: 0.8,
    [KeywordIntent.COMMERCIAL]: 1.3
  },
  currentRankBonus: {
    topThree: 1.3,
    topTen: 1.2,
    firstPage: 1.1
  }
}

export interface KeywordScoreInput {
  searchVolume?: number | null
  difficulty?: number | null
  currentRank?: number | null
  intent?: KeywordIntent | null
}

/**
 * Calculate a priority score for a keyword based on various metrics.
 * Score ranges from 0-100, with higher scores indicating higher priority.
 */
export function calculatePriorityScore(
  keyword: KeywordScoreInput,
  weights: Partial<ScoringWeights> = {}
): number {
  const finalWeights = { ...DEFAULT_WEIGHTS, ...weights }
  let score = 0

  // Base score calculation
  const searchVolume = keyword.searchVolume ?? 0
  const difficulty = keyword.difficulty ?? 100 // Default to max difficulty if unknown

  // Normalize search volume on a 0-100 scale
  // Using log scale since search volumes can vary greatly
  const normalizedVolume = searchVolume > 0 
    ? Math.min(100, Math.log10(searchVolume) * 20)
    : 0

  // Invert difficulty so higher scores are better
  const normalizedDifficulty = 100 - difficulty

  // Calculate weighted base score
  score = (
    normalizedVolume * finalWeights.searchVolume +
    normalizedDifficulty * finalWeights.difficulty
  )

  // Apply intent multiplier
  if (keyword.intent) {
    score *= finalWeights.intentMultiplier[keyword.intent]
  }

  // Apply ranking bonus
  if (keyword.currentRank) {
    if (keyword.currentRank <= 3) {
      score *= finalWeights.currentRankBonus.topThree
    } else if (keyword.currentRank <= 10) {
      score *= finalWeights.currentRankBonus.topTen
    } else if (keyword.currentRank <= 20) {
      score *= finalWeights.currentRankBonus.firstPage
    }
  }

  // Ensure final score is between 0-100
  return Math.min(100, Math.max(0, Math.round(score)))
}

/**
 * Get English description of priority score
 */
export function getPriorityDescription(score: number): string {
  if (score >= 80) return 'Very High Priority'
  if (score >= 60) return 'High Priority'
  if (score >= 40) return 'Medium Priority'
  if (score >= 20) return 'Low Priority'
  return 'Very Low Priority'
}

/**
 * Calculate keyword density in content
 */
export function calculateKeywordDensity(content: string, keyword: string): number {
  const words = content.toLowerCase().split(/\s+/).length
  const keywordRegex = new RegExp(keyword.toLowerCase(), 'g')
  const keywordCount = (content.toLowerCase().match(keywordRegex) || []).length

  // Return percentage with 2 decimal places
  return Number(((keywordCount / words) * 100).toFixed(2))
}

/**
 * Calculate visibility score based on keyword positions
 * Score ranges from 0-100
 */
export function calculateVisibilityScore(rankings: number[]): number {
  if (!rankings.length) return 0

  // Define score mapping function
  function getPositionScore(rank: number): number {
    if (rank <= 3) return 100
    if (rank <= 10) return 80
    if (rank <= 20) return 60
    if (rank <= 30) return 40
    if (rank <= 50) return 20
    if (rank <= 100) return 10
    return 0
  }

  // Calculate average score
  const totalScore = rankings.reduce(
    (sum: number, rank: number) => sum + getPositionScore(rank),
    0
  )

  return Math.round(totalScore / rankings.length)
}