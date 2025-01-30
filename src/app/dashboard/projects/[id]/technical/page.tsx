'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import TrendCard from '@/components/metrics/trend-card'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface TechnicalData {
  performance: {
    score: number
    metrics: {
      fcp: number // First Contentful Paint
      lcp: number // Largest Contentful Paint
      cls: number // Cumulative Layout Shift
      tti: number // Time to Interactive
    }
    issues: {
      type: 'error' | 'warning'
      category: string
      message: string
      impact: 'high' | 'medium' | 'low'
    }[]
  }
  seo: {
    score: number
    issues: {
      type: 'error' | 'warning'
      category: string
      message: string
      impact: 'high' | 'medium' | 'low'
    }[]
  }
  accessibility: {
    score: number
    issues: {
      type: 'error' | 'warning'
      category: string
      message: string
      impact: 'high' | 'medium' | 'low'
    }[]
  }
  bestPractices: {
    score: number
    issues: {
      type: 'error' | 'warning'
      category: string
      message: string
      impact: 'high' | 'medium' | 'low'
    }[]
  }
}

export default function TechnicalPage() {
  const params = useParams()
  const { data: technical } = useSWR<TechnicalData>(
    `/api/projects/${params.id}/technical`,
    fetcher
  )

  if (!technical) {
    return <div>Loading...</div>
  }

  const allIssues = [
    ...technical.performance.issues,
    ...technical.seo.issues,
    ...technical.accessibility.issues,
    ...technical.bestPractices.issues,
  ]

  const criticalIssues = allIssues.filter((i) => i.impact === 'high').length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <TrendCard
          title="Performance"
          value={`${technical.performance.score}/100`}
          change={2.5}
          changeTimeframe="last month"
          trend="up"
          format="text"
        />
        <TrendCard
          title="SEO Score"
          value={`${technical.seo.score}/100`}
          change={1.8}
          changeTimeframe="last month"
          trend="up"
          format="text"
        />
        <TrendCard
          title="Accessibility"
          value={`${technical.accessibility.score}/100`}
          change={-0.5}
          changeTimeframe="last month"
          trend="down"
          format="text"
        />
        <TrendCard
          title="Critical Issues"
          value={criticalIssues}
          change={-2}
          changeTimeframe="last month"
          trend="up"
        />
      </div>

      {/* Performance Metrics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Core Web Vitals
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              First Contentful Paint
            </h3>
            <p
              className={`mt-1 text-2xl font-semibold ${
                technical.performance.metrics.fcp < 2
                  ? 'text-green-600'
                  : technical.performance.metrics.fcp < 4
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {technical.performance.metrics.fcp}s
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Largest Contentful Paint
            </h3>
            <p
              className={`mt-1 text-2xl font-semibold ${
                technical.performance.metrics.lcp < 2.5
                  ? 'text-green-600'
                  : technical.performance.metrics.lcp < 4
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {technical.performance.metrics.lcp}s
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Cumulative Layout Shift
            </h3>
            <p
              className={`mt-1 text-2xl font-semibold ${
                technical.performance.metrics.cls < 0.1
                  ? 'text-green-600'
                  : technical.performance.metrics.cls < 0.25
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {technical.performance.metrics.cls}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Time to Interactive
            </h3>
            <p
              className={`mt-1 text-2xl font-semibold ${
                technical.performance.metrics.tti < 3.8
                  ? 'text-green-600'
                  : technical.performance.metrics.tti < 7.3
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {technical.performance.metrics.tti}s
            </p>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Technical Issues
        </h2>
        <div className="space-y-6">
          {['high', 'medium', 'low'].map((impact) => {
            const issuesForImpact = allIssues.filter((i) => i.impact === impact)
            if (issuesForImpact.length === 0) return null

            return (
              <div key={impact}>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  {impact.charAt(0).toUpperCase() + impact.slice(1)} Priority
                </h3>
                <div className="space-y-3">
                  {issuesForImpact.map((issue, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg"
                    >
                      <div
                        className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                          issue.type === 'error'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {issue.category}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {issue.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
