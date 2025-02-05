import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { ContentAnalyzer } from '@/services/seo/analyzers/content-analyzer'
import { XMLParser } from 'fast-xml-parser'
import { ContentMetrics, Issue } from '@/services/seo/types'

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: string
}

interface Sitemap {
  urlset: {
    url: SitemapUrl[] | SitemapUrl
  } | undefined
}

interface PageAnalysis {
  url: string
  title: string | null
  wordCount: number
  score: number
  lastUpdated: string
  metrics: ContentMetrics
  issues: Issue[]
}

async function fetchSitemap(baseUrl: string, customSitemapUrl?: string): Promise<SitemapUrl[]> {
  const urls = customSitemapUrl 
    ? [customSitemapUrl] 
    : [
        `${baseUrl.replace(/\/$/, '')}/sitemap.xml`,
        `${baseUrl}/sitemap.xml`,
        `${baseUrl}/sitemap_index.xml`,
        `${baseUrl}/wp-sitemap.xml`, // WordPress
        `${baseUrl}/sitemap.php` // Other CMS
      ]

  for (const url of urls) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        continue
      }

      const xml = await response.text()
      const parser = new XMLParser()
      const sitemap = parser.parse(xml) as Sitemap

      if (!sitemap?.urlset?.url) {
        continue
      }

      // Handle both single and multiple URL cases
      const sitemapUrls = Array.isArray(sitemap.urlset.url) 
        ? sitemap.urlset.url 
        : [sitemap.urlset.url]

      return sitemapUrls
    } catch (error) {
      console.error(`Error fetching sitemap from ${url}:`, error)
      continue
    }
  }

  // If no sitemap is found, return just the base URL
  return [{ loc: baseUrl }]
}

async function analyzePage(url: string): Promise<PageAnalysis> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`)
    }

    const html = await response.text()
    const analyzer = new ContentAnalyzer()
    const metrics = await analyzer.analyze(html, url)
    const analysis = analyzer.getAnalysis(metrics)

    return {
      url,
      title: metrics.title,
      wordCount: metrics.wordCount,
      score: analysis.score,
      lastUpdated: new Date().toISOString(),
      metrics,
      issues: analysis.issues
    }
  } catch (error) {
    console.error(`Error analyzing page ${url}:`, error)
    return {
      url,
      title: null,
      wordCount: 0,
      score: 0,
      lastUpdated: new Date().toISOString(),
      metrics: {
        title: null,
        titleLength: 0,
        description: null,
        descriptionLength: 0,
        h1Count: 0,
        h1Tags: [],
        h2Count: 0,
        h2Tags: [],
        imageCount: 0,
        imagesWithoutAlt: 0,
        wordCount: 0,
        hasCanonical: false,
        hasRobots: false,
        hasViewport: false,
        hasSchema: false,
        metaTags: []
      },
      issues: [{
        type: 'error',
        message: `Failed to analyze page: ${error instanceof Error ? error.message : 'Unknown error'}`,
        impact: 'high'
      }]
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const customSitemapUrl = searchParams.get('sitemapUrl')

    const id = params.id
    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    const projectId = parseInt(id)
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: parseInt(session.user.id)
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Ensure domain has proper protocol
    const domain = project.domain.startsWith('http') 
      ? project.domain 
      : `https://${project.domain}`

    // Fetch sitemap and get all URLs
    const sitemapUrls = await fetchSitemap(domain, customSitemapUrl || undefined)
    if (sitemapUrls.length === 0) {
      return NextResponse.json(
        { error: 'No URLs found in sitemap' },
        { status: 404 }
      )
    }

    // Analyze each page (limit to first 50 pages for now)
    const results = await Promise.all(
      sitemapUrls.slice(0, 50).map(url => analyzePage(url.loc))
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error in content analysis:', error)
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    )
  }
}
