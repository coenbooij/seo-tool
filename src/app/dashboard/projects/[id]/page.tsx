'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import TrendCard from '@/components/metrics/trend-card'
import { useLanguage } from '@/providers/language-provider'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ProjectMetrics {
  keywords: {
    total: number
    averageRank: number
    averageVolume: number
    averageDifficulty: number
  }
  backlinks: {
    total: number
    averageAuthority: number
    change: number
  }
  content: {
    pages: number
    avgScore: number
    change: number
  }
  technical: {
    score: number
    issues: number
    change: number
  }
}

export default function ProjectOverview() {
  const params = useParams()
  const { messages } = useLanguage()
  const { data: metrics } = useSWR<ProjectMetrics>(
    `/api/projects/${params.id}/metrics`,
    fetcher
  )

  if (!metrics) {
    return <div>{messages.projects.overview.loading}</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.keywords && (
          <TrendCard
            title={messages.projects.overview.metrics.avgKeywordRank}
            value={metrics.keywords.averageRank || 0}
            change={metrics.keywords.averageDifficulty || 0}
            changeTimeframe={messages.projects.overview.metrics.lastMonth}
            trend={(metrics.keywords.averageDifficulty || 0) <= (metrics.keywords.averageRank || 0) ? 'up' : 'down'}
            format="numeric"
          />
        )}
        {metrics.backlinks && (
          <TrendCard
            title={messages.projects.overview.metrics.totalBacklinks}
            value={metrics.backlinks.total ?? 0}
            change={metrics.backlinks.change ?? 0}
            changeTimeframe={messages.projects.overview.metrics.lastMonth}
            trend={(metrics.backlinks.change ?? 0) >= 0 ? 'up' : 'down'}
          />
        )}
        {metrics.content && (
          <TrendCard
            title={messages.projects.overview.metrics.contentScore}
            value={`${metrics.content.avgScore}/100`}
            change={metrics.content.change}
            changeTimeframe={messages.projects.overview.metrics.lastMonth}
            trend={metrics.content.change >= 0 ? 'up' : 'down'}
            format="percentage"
          />
        )}
        {metrics.technical && (
          <TrendCard
            title={messages.projects.overview.metrics.technicalScore}
            value={`${metrics.technical.score}/100`}
            change={metrics.technical.change}
            changeTimeframe={messages.projects.overview.metrics.lastMonth}
            trend={metrics.technical.change >= 0 ? 'up' : 'down'}
            format="percentage"
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Top Keywords */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {messages.projects.overview.sections.topKeywords.title}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">digital marketing</span>
              <span className="font-medium">{messages.projects.overview.sections.topKeywords.position} 3</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">seo services</span>
              <span className="font-medium">{messages.projects.overview.sections.topKeywords.position} 5</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">content strategy</span>
              <span className="font-medium">{messages.projects.overview.sections.topKeywords.position} 7</span>
            </div>
          </div>
        </div>

        {/* Recent Backlinks */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {messages.projects.overview.sections.recentBacklinks.title}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">example.com</span>
              <span className="font-medium">{messages.projects.overview.sections.recentBacklinks.da}: 45</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">blog.site.com</span>
              <span className="font-medium">{messages.projects.overview.sections.recentBacklinks.da}: 38</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">news.website.com</span>
              <span className="font-medium">{messages.projects.overview.sections.recentBacklinks.da}: 52</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Issues */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {messages.projects.overview.sections.technicalIssues.title}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">
              3 {messages.projects.overview.sections.technicalIssues.issues.missingMeta}
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">
              2 {messages.projects.overview.sections.technicalIssues.issues.slowLoading}
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">
              4 {messages.projects.overview.sections.technicalIssues.issues.missingAlt}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
