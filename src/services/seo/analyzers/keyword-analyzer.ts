import { KeywordIntent } from '@prisma/client'
import type { KeywordData } from '@/lib/db/keywords'
import { KeywordSource, ContentStatus } from '@/app/dashboard/projects/[id]/keywords/types'
import { calculatePriorityScore, calculateKeywordDensity, type KeywordScoreInput } from '../utils/keyword-scoring'

export interface KeywordAnalysisResult {
  keywords: KeywordData[]
  suggestedKeywords: KeywordData[]
  competitorKeywords: KeywordData[]
  analysis: {
    totalKeywords: number
    byIntent: {
      [key in KeywordIntent]: number
    }
    avgDifficulty: number
    avgSearchVolume: number
    topOpportunities: KeywordData[]
    gapAnalysis: {
      missingHighValue: KeywordData[]
      competitorStrengths: KeywordData[]
      quickWins: KeywordData[]
    }
  }
}

export class KeywordAnalyzer {
  private content: string
  private url: string
  private competitors: string[]

  constructor(content: string, url: string, competitors: string[] = []) {
    this.content = content
    this.url = url
    this.competitors = competitors
  }

  async analyzeKeywords(currentKeywords: KeywordData[]): Promise<KeywordAnalysisResult> {
    try {
      // Extract keywords from content
      const extractedKeywords = await this.extractKeywordsFromContent()
      
      // Get competitor keywords
      const competitorKeywords = await this.getCompetitorKeywords()
      
      // Generate keyword suggestions
      const suggestedKeywords = await this.generateKeywordSuggestions(currentKeywords)
      
      // Calculate metrics for all keywords
      const allKeywords = [
        ...currentKeywords,
        ...extractedKeywords,
        ...competitorKeywords,
        ...suggestedKeywords
      ]

      // Calculate priority scores and keyword density
      const enrichedKeywords = allKeywords.map(keyword => ({
        ...keyword,
        priority: calculatePriorityScore(this.toKeywordScoreInput(keyword)),
        density: calculateKeywordDensity(this.content, keyword.keyword)
      }))

      // Deduplicate keywords
      const uniqueKeywords = this.deduplicateKeywords(enrichedKeywords)

      // Perform gap analysis
      const gapAnalysis = this.performGapAnalysis(uniqueKeywords, currentKeywords)

      // Calculate statistics
      const stats = this.calculateStatistics(currentKeywords)

      // Find best opportunities
      const topOpportunities = this.findTopOpportunities(uniqueKeywords, currentKeywords)

      return {
        keywords: currentKeywords,
        suggestedKeywords: this.filterNewKeywords(suggestedKeywords, currentKeywords),
        competitorKeywords: this.filterNewKeywords(competitorKeywords, currentKeywords),
        analysis: {
          totalKeywords: currentKeywords.length,
          byIntent: stats.byIntent,
          avgDifficulty: stats.avgDifficulty,
          avgSearchVolume: stats.avgSearchVolume,
          topOpportunities,
          gapAnalysis
        }
      }
    } catch (error) {
      console.error('Error in keyword analysis:', error)
      throw error
    }
  }

  private toKeywordScoreInput(keyword: KeywordData): KeywordScoreInput {
    return {
      searchVolume: keyword.searchVolume ?? null,
      difficulty: keyword.difficulty ?? null,
      currentRank: keyword.currentRank ?? null,
      intent: keyword.intent ?? null
    }
  }

  private async extractKeywordsFromContent(): Promise<KeywordData[]> {
    try {
      // Extract potential keywords from content using NLP
      const keywords = this.extractKeywordPhrases(this.content)

      // Get search metrics for found keywords
      const keywordsWithMetrics = await this.enrichKeywordData(keywords)

      return keywordsWithMetrics
    } catch (error) {
      console.error('Error extracting keywords:', error)
      return []
    }
  }

  private extractKeywordPhrases(content: string): string[] {
    // Basic keyword extraction (in production, use NLP library)
    const words = content.toLowerCase().split(/\W+/)
    const phrases: string[] = []
    
    // Extract 1-3 word phrases
    for (let i = 0; i < words.length; i++) {
      phrases.push(words[i]) // Single word
      if (i < words.length - 1) {
        phrases.push(`${words[i]} ${words[i + 1]}`) // Two words
      }
      if (i < words.length - 2) {
        phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`) // Three words
      }
    }

    return [...new Set(phrases)] // Remove duplicates
  }

  private async enrichKeywordData(keywords: string[]): Promise<KeywordData[]> {
    // In production, integrate with keyword research API
    return keywords.map(keyword => ({
      id: '', // Generated ID
      keyword,
      searchVolume: Math.floor(Math.random() * 10000), // Mock data
      difficulty: Math.floor(Math.random() * 100),
      intent: this.determineKeywordIntent(keyword),
      priority: 0, // Will be calculated later
      currentRank: null, // Should be null instead of undefined
      competition: 0,
      cpc: 0,
      density: 0,
      notes: null,
      lastChecked: new Date(),
      projectId: '',
      groups: [],
      source: KeywordSource.BRAINSTORM, // Add source
      serpFeatures: [], // Add serpFeatures
      contentStatus: ContentStatus.NOT_STARTED, // Add contentStatus
      contentPriority: 0 // Add contentPriority
    }))
  }

  private determineKeywordIntent(keyword: string): KeywordIntent {
    const informationalWords = ['what', 'how', 'why', 'guide', 'tutorial']
    const transactionalWords = ['buy', 'price', 'cost', 'shop', 'purchase']

    keyword = keyword.toLowerCase()

    if (informationalWords.some(word => keyword.includes(word))) {
      return KeywordIntent.INFORMATIONAL
    }
    if (transactionalWords.some(word => keyword.includes(word))) {
      return KeywordIntent.TRANSACTIONAL
    }
    
    return KeywordIntent.NAVIGATIONAL
  }

  private async getCompetitorKeywords(): Promise<KeywordData[]> {
    try {
      const competitorKeywords: KeywordData[] = []

      for (const competitorUrl of this.competitors) {
        // In production, use a web scraper or SEO API to get competitor keywords
        const mockKeywords = [
          `${competitorUrl} keyword 1`,
          `${competitorUrl} keyword 2`,
          `${competitorUrl} keyword 3`
        ]
        
        const keywordsWithMetrics = await this.enrichKeywordData(mockKeywords)
        competitorKeywords.push(...keywordsWithMetrics)
      }

      return competitorKeywords
    } catch (error) {
      console.error('Error getting competitor keywords:', error)
      return []
    }
  }

  private async generateKeywordSuggestions(currentKeywords: KeywordData[]): Promise<KeywordData[]> {
    try {
      const suggestions: string[] = []

      // Generate variations of current keywords
      for (const { keyword } of currentKeywords) {
        suggestions.push(
          `best ${keyword}`,
          `${keyword} guide`,
          `how to ${keyword}`,
          `${keyword} tutorial`,
          `${keyword} tips`
        )
      }

      // In production, use keyword suggestion API
      return this.enrichKeywordData([...new Set(suggestions)])
    } catch (error) {
      console.error('Error generating keyword suggestions:', error)
      return []
    }
  }

  private deduplicateKeywords(keywords: KeywordData[]): KeywordData[] {
    const seen = new Set<string>()
    return keywords.filter(kw => {
      if (seen.has(kw.keyword.toLowerCase())) {
        return false
      }
      seen.add(kw.keyword.toLowerCase())
      return true
    })
  }

  private filterNewKeywords(newKeywords: KeywordData[], currentKeywords: KeywordData[]): KeywordData[] {
    const currentSet = new Set(currentKeywords.map(kw => kw.keyword.toLowerCase()))
    return newKeywords.filter(kw => !currentSet.has(kw.keyword.toLowerCase()))
  }

  private performGapAnalysis(allKeywords: KeywordData[], currentKeywords: KeywordData[]) {
    const currentSet = new Set(currentKeywords.map(kw => kw.keyword.toLowerCase()))
    const missingKeywords = allKeywords.filter(kw => !currentSet.has(kw.keyword.toLowerCase()))

    return {
      missingHighValue: missingKeywords
        .filter(kw => (kw.searchVolume || 0) > 1000 && (kw.difficulty || 0) < 50)
        .slice(0, 10),
      competitorStrengths: missingKeywords
        .filter(kw => kw.searchVolume && kw.searchVolume > 5000)
        .slice(0, 10),
      quickWins: missingKeywords
        .filter(kw => (kw.difficulty || 0) < 30 && (kw.searchVolume || 0) > 100)
        .slice(0, 10)
    }
  }

  private calculateStatistics(keywords: KeywordData[]) {
    const stats = {
      byIntent: Object.values(KeywordIntent).reduce((acc, intent) => {
        acc[intent] = 0
        return acc
      }, {} as { [key in KeywordIntent]: number }),
      avgDifficulty: 0,
      avgSearchVolume: 0
    }

    if (keywords.length === 0) return stats

    let totalDifficulty = 0
    let totalSearchVolume = 0
    let difficultyCount = 0
    let searchVolumeCount = 0

    for (const kw of keywords) {
      if (kw.intent) {
        stats.byIntent[kw.intent]++
      }
      if (typeof kw.difficulty === 'number') {
        totalDifficulty += kw.difficulty
        difficultyCount++
      }
      if (typeof kw.searchVolume === 'number') {
        totalSearchVolume += kw.searchVolume
        searchVolumeCount++
      }
    }

    stats.avgDifficulty = difficultyCount > 0 ? totalDifficulty / difficultyCount : 0
    stats.avgSearchVolume = searchVolumeCount > 0 ? totalSearchVolume / searchVolumeCount : 0

    return stats
  }

  private findTopOpportunities(allKeywords: KeywordData[], currentKeywords: KeywordData[]): KeywordData[] {
    const currentSet = new Set(currentKeywords.map(kw => kw.keyword.toLowerCase()))
    return allKeywords
      .filter(kw => !currentSet.has(kw.keyword.toLowerCase()))
      .sort((a, b) => {
        const scoreA = calculatePriorityScore(this.toKeywordScoreInput(a))
        const scoreB = calculatePriorityScore(this.toKeywordScoreInput(b))
        return scoreB - scoreA
      })
      .slice(0, 10)
  }
}