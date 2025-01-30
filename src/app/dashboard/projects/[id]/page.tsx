'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import TrendCard from '@/components/metrics/trend-card'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ProjectMetrics {
  keywords: {
    total: number
    topThree: number
    change: number
  }
  backlinks: {
    total: number
    newLinks: number
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
  const { data: metrics } = useSWR<ProjectMetrics>(
    `/api/projects/${params.id}/metrics`,
    fetcher
  )

  if (!metrics) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <TrendCard
          title="Keyword Rankings"
          value={metrics.keywords.total}
          change={metrics.keywords.change}
          changeTimeframe="last month"
          trend={metrics.keywords.change >= 0 ? 'up' : 'down'}
        />
        <TrendCard
          title="Total Backlinks"
          value={metrics.backlinks.total}
          change={metrics.backlinks.change}
          changeTimeframe="last month"
          trend={metrics.backlinks.change >= 0 ? 'up' : 'down'}
        />
        <TrendCard
          title="Content Score"
          value={`${metrics.content.avgScore}/100`}
          change={metrics.content.change}
          changeTimeframe="last month"
          trend={metrics.content.change >= 0 ? 'up' : 'down'}
          format="text"
        />
        <TrendCard
          title="Technical Score"
          value={`${metrics.technical.score}/100`}
          change={metrics.technical.change}
          changeTimeframe="last month"
          trend={metrics.technical.change >= 0 ? 'up' : 'down'}
          format="text"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Top Keywords */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Keywords
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">digital marketing</span>
              <span className="font-medium">Position 3</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">seo services</span>
              <span className="font-medium">Position 5</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">content strategy</span>
              <span className="font-medium">Position 7</span>
            </div>
          </div>
        </div>

        {/* Recent Backlinks */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Backlinks
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">example.com</span>
              <span className="font-medium">DA: 45</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">blog.site.com</span>
              <span className="font-medium">DA: 38</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">news.website.com</span>
              <span className="font-medium">DA: 52</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Issues */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Technical Issues
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">
              3 pages with missing meta descriptions
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">
              2 pages with slow loading times
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">
              4 images missing alt text
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
