import { JSDOM } from 'jsdom'
import natural from 'natural'

interface KeywordUsage {
  keyword: string
  count: number
  positions: {
    title: boolean
    description: boolean
    headings: boolean
    content: boolean
  }
  density: number
}

interface CompetitorData {
  url: string
  title: string
  description: string
  keywords: KeywordUsage[]
}

interface KeywordMetrics {
  keyword: string
  usage: KeywordUsage
  competition: {
    difficulty: number // 0-100
    competitorCount: number
    topCompetitors: CompetitorData[]
  }
  suggestions: Array<{
    keyword: string
    source: 'google' | 'content' | 'related'
  }>
  serp?: {
    position?: number
    lastChecked?: string
    changes?: number
  }
}

export class KeywordAnalyzer {
  private tokenizer: natural.WordTokenizer
  private language: typeof natural.PorterStemmer

  constructor() {
    this.tokenizer = new natural.WordTokenizer()
    this.language = natural.PorterStemmer
  }

  private cleanText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private extractKeywords(text: string): Map<string, number> {
    const words = this.tokenizer.tokenize(this.cleanText(text)) || []
    const frequencies = new Map<string, number>()
    
    // Group words into potential keyword phrases (1-4 words)
    for (let i = 0; i < words.length; i++) {
      for (let len = 1; len <= 4 && i + len <= words.length; len++) {
        const phrase = words.slice(i, i + len).join(' ')
        frequencies.set(phrase, (frequencies.get(phrase) || 0) + 1)
      }
    }

    return frequencies
  }

  private calculateDensity(count: number, totalWords: number): number {
    return (count / totalWords) * 100
  }

  private async fetchKeywordSuggestions(term: string): Promise<string[]> {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(term)}`
    try {
      const response = await fetch(url)
      const data = await response.json()
      return data[1] as string[] || []
    } catch (error) {
      console.error(`Error fetching suggestions for "${term}":`, error)
      return []
    }
  }

  private async getCompetitorData(term: string): Promise<CompetitorData[]> {
    // In a real implementation, you'd scrape Google search results
    // For now, return empty array to avoid rate limiting
    return []
  }

  private calculateDifficulty(competitors: CompetitorData[], term: string): number {
    if (competitors.length === 0) return 50 // Default medium difficulty

    // Factors that increase difficulty:
    // 1. Number of competitors optimizing for the keyword
    // 2. Keyword presence in titles/descriptions
    // 3. Content length and quality signals
    
    let score = 0
    const maxScore = 100

    // Basic scoring based on competitor count
    score += Math.min((competitors.length / 10) * 50, 50)

    // Optimization scoring
    const optimizationScore = competitors.reduce((acc, competitor) => {
      let subScore = 0
      const keywordData = competitor.keywords.find(k => 
        k.keyword.toLowerCase() === term.toLowerCase()
      )
      if (keywordData) {
        if (keywordData.positions.title) subScore += 10
        if (keywordData.positions.description) subScore += 5
        if (keywordData.positions.headings) subScore += 5
        subScore += Math.min(keywordData.density * 10, 10) // Max 10 points for density
      }
      return acc + (subScore / 30) * 50 // Convert to 0-50 scale
    }, 0) / competitors.length

    score += optimizationScore
    return Math.min(Math.round(score), maxScore)
  }

  async analyze(html: string): Promise<KeywordMetrics[]> {
    const dom = new JSDOM(html)
    const document = dom.window.document

    // Extract text content
    const title = document.title || ''
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    const h1s = Array.from(document.getElementsByTagName('h1')).map(el => el.textContent || '').join(' ')
    const h2s = Array.from(document.getElementsByTagName('h2')).map(el => el.textContent || '').join(' ')
    const bodyText = document.body?.textContent || ''

    // Calculate word frequencies
    const titleKeywords = this.extractKeywords(title)
    const descriptionKeywords = this.extractKeywords(description)
    const headingKeywords = this.extractKeywords(`${h1s} ${h2s}`)
    const contentKeywords = this.extractKeywords(bodyText)

    // Combine all unique keywords
    const keywords = new Set<string>()
    Array.from(titleKeywords.keys()).forEach(k => keywords.add(k))
    Array.from(descriptionKeywords.keys()).forEach(k => keywords.add(k))
    Array.from(headingKeywords.keys()).forEach(k => keywords.add(k))
    Array.from(contentKeywords.keys()).forEach(k => keywords.add(k))

    const totalWords = this.tokenizer.tokenize(bodyText)?.length || 1

    const results: KeywordMetrics[] = []

    for (const keyword of keywords) {
      // Skip single characters and common words
      if (keyword.length < 2) continue

      const count = contentKeywords.get(keyword) || 0
      const usage: KeywordUsage = {
        keyword,
        count,
        positions: {
          title: Boolean(titleKeywords.get(keyword)),
          description: Boolean(descriptionKeywords.get(keyword)),
          headings: Boolean(headingKeywords.get(keyword)),
          content: count > 0
        },
        density: this.calculateDensity(count, totalWords)
      }

      // Get competitor data for main keywords
      let competitors: CompetitorData[] = []
      if (usage.positions.title || usage.positions.headings || usage.density > 1) {
        competitors = await this.getCompetitorData(keyword)
      }

      // Get related keywords from Google
      const suggestions = usage.density > 0.5 
        ? await this.fetchKeywordSuggestions(keyword) 
        : []

      results.push({
        keyword,
        usage,
        competition: {
          difficulty: this.calculateDifficulty(competitors, keyword),
          competitorCount: competitors.length,
          topCompetitors: competitors.slice(0, 5)
        },
        suggestions: [
          ...suggestions.map(s => ({
            keyword: s,
            source: 'google' as const
          }))
        ]
      })
    }

    // Sort by relevance (density * position importance)
    return results.sort((a, b) => {
      const scoreA = a.usage.density * 
        ((a.usage.positions.title ? 4 : 0) + 
         (a.usage.positions.headings ? 2 : 0) + 
         (a.usage.positions.description ? 1 : 0))
      const scoreB = b.usage.density * 
        ((b.usage.positions.title ? 4 : 0) + 
         (b.usage.positions.headings ? 2 : 0) + 
         (b.usage.positions.description ? 1 : 0))
      return scoreB - scoreA
    })
  }
}