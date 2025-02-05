interface PageSpeedAudit {
  id: string
  title: string
  description: string
  score: number | null
  numericValue?: number
  details?: {
    type: string
    items?: unknown[]
  }
}

interface PageSpeedCategory {
  id: string
  title: string
  score: number
  auditRefs: Array<{
    id: string
    weight: number
    group?: string
  }>
}

interface PageSpeedResponse {
  lighthouseResult: {
    categories: {
      performance: PageSpeedCategory
      seo: PageSpeedCategory
      accessibility: PageSpeedCategory
      'best-practices': PageSpeedCategory
    }
    audits: {
      [key: string]: PageSpeedAudit
    }
    configSettings?: {
      emulatedFormFactor?: string
      throttling?: {
        rttMs?: number
        throughputKbps?: number
        cpuSlowdownMultiplier?: number
      }
    }
    environment?: {
      networkUserAgent?: string
      hostUserAgent?: string
      benchmarkIndex?: number
    }
    fetchTime?: string
  }
  error?: {
    message: string
  }
}

function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100
}

export async function getPageSpeedData(url: string) {
  const pageSpeedApiKey = process.env.GOOGLE_PAGESPEED_API_KEY
  
  if (!pageSpeedApiKey) {
    throw new Error('GOOGLE_PAGESPEED_API_KEY environment variable is not set')
  }

  if (!url) {
    throw new Error('URL is required')
  }

  try {
    // Validate URL format
    new URL(url)
  } catch {
    throw new Error('Invalid URL format')
  }

  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
    url
  )}&key=${pageSpeedApiKey}&strategy=mobile&category=performance&category=seo&category=accessibility&category=best-practices`

  try {
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to fetch PageSpeed data')
    }

    const data: PageSpeedResponse = await response.json()

    if (data.error) {
      throw new Error(data.error.message)
    }

    const {
      lighthouseResult: {
        categories,
        audits,
        categories: {
          performance,
          seo,
          accessibility,
          'best-practices': bestPractices,
        },
        configSettings,
        environment,
        fetchTime = new Date().toISOString(),
      },
    } = data

    // Transform the data to match our technical data structure
    const technical = {
      performance: {
        score: Math.round(performance.score * 100),
        metrics: {
          fcp: roundToTwoDecimals(audits['first-contentful-paint'].numericValue! / 1000),
          lcp: roundToTwoDecimals(audits['largest-contentful-paint'].numericValue! / 1000),
          cls: roundToTwoDecimals(audits['cumulative-layout-shift'].numericValue!),
          tbt: roundToTwoDecimals(audits['total-blocking-time'].numericValue!),
          si: roundToTwoDecimals(audits['speed-index'].numericValue! / 1000),
          tti: roundToTwoDecimals(audits['interactive'].numericValue! / 1000),
        },
        environment: {
          emulatedDevice: configSettings?.emulatedFormFactor || 'Mobile',
          networkThrottling: {
            rttMs: configSettings?.throttling?.rttMs || 150,
            throughputKbps: configSettings?.throttling?.throughputKbps || 1638.4,
            cpuSlowdown: configSettings?.throttling?.cpuSlowdownMultiplier || 4,
          },
          userAgent: environment?.networkUserAgent || 'Chrome',
          timestamp: fetchTime,
        },
        issues: Object.values(audits)
          .filter(
            (audit) =>
              audit.score !== null &&
              audit.score < 1 &&
              audit.details?.type === 'opportunity'
          )
          .map((audit) => ({
            type: audit.score! < 0.5 ? 'error' : 'warning',
            category: 'Performance',
            message: audit.title,
            description: audit.description,
            impact: audit.score! < 0.5 ? 'high' : 'medium',
          })),
      },
      seo: {
        score: Math.round(seo.score * 100),
        issues: Object.values(audits)
          .filter(
            (audit) =>
              audit.score !== null &&
              audit.score < 1 &&
              categories.seo.auditRefs.some(
                (ref) => ref.id === audit.id
              )
          )
          .map((audit) => ({
            type: audit.score! < 0.5 ? 'error' : 'warning',
            category: 'SEO',
            message: audit.title,
            description: audit.description,
            impact: audit.score! < 0.5 ? 'high' : 'medium',
          })),
      },
      accessibility: {
        score: Math.round(accessibility.score * 100),
        issues: Object.values(audits)
          .filter(
            (audit) =>
              audit.score !== null &&
              audit.score < 1 &&
              categories.accessibility.auditRefs.some(
                (ref) => ref.id === audit.id
              )
          )
          .map((audit) => ({
            type: audit.score! < 0.5 ? 'error' : 'warning',
            category: 'Accessibility',
            message: audit.title,
            description: audit.description,
            impact: audit.score! < 0.5 ? 'high' : 'medium',
          })),
      },
      bestPractices: {
        score: Math.round(bestPractices.score * 100),
        issues: Object.values(audits)
          .filter(
            (audit) =>
              audit.score !== null &&
              audit.score < 1 &&
              categories['best-practices'].auditRefs.some(
                (ref) => ref.id === audit.id
              )
          )
          .map((audit) => ({
            type: audit.score! < 0.5 ? 'error' : 'warning',
            category: 'Best Practices',
            message: audit.title,
            description: audit.description,
            impact: audit.score! < 0.5 ? 'high' : 'medium',
          })),
      },
    }

    return technical
  } catch (error) {
    console.error('PageSpeed API Error:', error)
    throw error
  }
}