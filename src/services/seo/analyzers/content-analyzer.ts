import { JSDOM } from 'jsdom'
import type { Analyzer, ContentMetrics, AnalyzerResult, MetaTag } from '../types'

export class ContentAnalyzer implements Analyzer {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async analyze(html: string, url: string): Promise<ContentMetrics> {
    const dom = new JSDOM(html)
    const document = dom.window.document

    // Get meta tags
    const metaTags: MetaTag[] = Array.from(document.getElementsByTagName('meta')).map(el => ({
      name: (el as HTMLMetaElement).getAttribute('name') || undefined,
      property: (el as HTMLMetaElement).getAttribute('property') || undefined,
      content: (el as HTMLMetaElement).getAttribute('content') || undefined
    }))
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || null
    const viewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content')
    const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content')
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href')

    // Get h1 and h2 tags
    const h1Tags = Array.from(document.getElementsByTagName('h1')).map(el => (el as HTMLHeadingElement).textContent?.trim() || '')
    const h2Tags = Array.from(document.getElementsByTagName('h2')).map(el => (el as HTMLHeadingElement).textContent?.trim() || '')

    // Get images
    const images = document.getElementsByTagName('img')
    const imagesWithoutAlt = Array.from(images).filter(img => !(img as HTMLImageElement).getAttribute('alt')).length

    // Get word count
    const bodyText = document.body?.textContent || ''
    const wordCount = bodyText.trim().split(/\s+/).length

    // Check for schema markup
    const hasSchema = document.querySelector('script[type="application/ld+json"]') !== null ||
                     document.querySelector('[itemtype]') !== null

    return {
      avgScore: 0, // Initial score, will be updated after analysis
      change: 0, // Initial change, would need historical data to calculate
      title: document.title || null,
      titleLength: document.title?.length || 0,
      description,
      descriptionLength: description?.length || 0,
      h1Count: h1Tags.length,
      h1Tags,
      h2Count: h2Tags.length,
      h2Tags,
      imageCount: images.length,
      imagesWithoutAlt,
      wordCount,
      hasCanonical: !!canonical,
      hasRobots: !!robots,
      hasViewport: !!viewport,
      hasSchema,
      metaTags
    }
  }

  getAnalysis(result: ContentMetrics): AnalyzerResult {
    const issues: AnalyzerResult['issues'] = []

    // Title checks
    if (!result.title) {
      issues.push({
        type: 'error',
        message: 'Page is missing a title tag',
        impact: 'high'
      })
    } else if (result.titleLength < 10) {
      issues.push({
        type: 'error',
        message: 'Title tag is too short (< 10 characters)',
        impact: 'high'
      })
    } else if (result.titleLength > 60) {
      issues.push({
        type: 'warning',
        message: 'Title tag is too long (> 60 characters)',
        impact: 'medium'
      })
    }

    // Meta description checks
    if (!result.description) {
      issues.push({
        type: 'error',
        message: 'Page is missing a meta description',
        impact: 'high'
      })
    } else if (result.descriptionLength < 50) {
      issues.push({
        type: 'warning',
        message: 'Meta description is too short (< 50 characters)',
        impact: 'medium'
      })
    } else if (result.descriptionLength > 160) {
      issues.push({
        type: 'warning',
        message: 'Meta description is too long (> 160 characters)',
        impact: 'medium'
      })
    }

    // H1 checks
    if (result.h1Count === 0) {
      issues.push({
        type: 'error',
        message: 'Page is missing an H1 tag',
        impact: 'high'
      })
    } else if (result.h1Count > 1) {
      issues.push({
        type: 'warning',
        message: `Page has multiple H1 tags (${result.h1Count})`,
        impact: 'medium'
      })
    }

    // Image checks
    if (result.imagesWithoutAlt > 0) {
      issues.push({
        type: 'warning',
        message: `${result.imagesWithoutAlt} images are missing alt attributes`,
        impact: 'medium'
      })
    }

    // Technical checks
    if (!result.hasViewport) {
      issues.push({
        type: 'error',
        message: 'Page is missing viewport meta tag',
        impact: 'high'
      })
    }

    if (!result.hasRobots) {
      issues.push({
        type: 'warning',
        message: 'Page is missing robots meta tag',
        impact: 'low'
      })
    }

    if (!result.hasCanonical) {
      issues.push({
        type: 'warning',
        message: 'Page is missing canonical URL',
        impact: 'medium'
      })
    }

    if (!result.hasSchema) {
      issues.push({
        type: 'warning',
        message: 'Page is missing structured data markup',
        impact: 'medium'
      })
    }

    // Content checks
    if (result.wordCount < 300) {
      issues.push({
        type: 'warning',
        message: 'Page has thin content (< 300 words)',
        impact: 'medium'
      })
    }

    return {
      score: Math.max(0, 100 - (issues.filter(i => i.type === 'error').length * 15) - 
                              (issues.filter(i => i.type === 'warning').length * 5)),
      issues
    }
  }
}