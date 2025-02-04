'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import StatCard from '@/components/dashboard/stat-card'
import { ChartBarIcon, UsersIcon, ArrowUpRightIcon, DocumentIcon } from '@heroicons/react/24/outline'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface AnalyticsData {
  traffic: {
    total: number
    organic: number
    direct: number
    referral: number
    change: number
  }
  engagement: {
    avgTimeOnPage: string
    bounceRate: number
    pagesPerSession: number
    change: number
  }
  conversions: {
    total: number
    rate: number
    goals: {
      newsletter: number
      contact: number
      purchase: number
    }
    change: number
  }
  topPages: Array<{
    url: string
    views: number
    conversions: number
  }>
  timeline: {
    daily: Array<{
      date: string
      visits: number
      conversions: number
    }>
  }
}

export default function Analytics() {
  const params = useParams()
  const { data: analytics, isLoading } = useSWR<AnalyticsData>(
    `/api/projects/${params.id}/analytics`,
    fetcher
  )

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-96 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Traffic"
          value={analytics.traffic.total}
          icon={<ChartBarIcon className="h-6 w-6" />}
          description={`${analytics.traffic.change > 0 ? '+' : ''}${analytics.traffic.change}%`}
          iconColor="indigo"
          format="compact"
        />
        <StatCard
          title="Organic Traffic"
          value={analytics.traffic.organic}
          icon={<UsersIcon className="h-6 w-6" />}
          description={`${analytics.traffic.change > 0 ? '+' : ''}${analytics.traffic.change}%`}
          iconColor="blue"
          format="compact"
        />
        <StatCard
          title="Conversion Rate"
          value={analytics.conversions.rate}
          icon={<ArrowUpRightIcon className="h-6 w-6" />}
          description={`${analytics.conversions.change > 0 ? '+' : ''}${analytics.conversions.change}%`}
          iconColor="green"
          format="percentage"
        />
        <StatCard
          title="Pages/Session"
          value={analytics.engagement.pagesPerSession}
          icon={<DocumentIcon className="h-6 w-6" />}
          description={`${analytics.engagement.change > 0 ? '+' : ''}${analytics.engagement.change}%`}
          iconColor="purple"
          format="numeric"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="font-semibold">Traffic Sources</h3>
            <div className="mt-4 space-y-4">
              {[
                { label: 'Organic', value: analytics.traffic.organic },
                { label: 'Direct', value: analytics.traffic.direct },
                { label: 'Referral', value: analytics.traffic.referral }
              ].map((source) => (
                <div key={source.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{source.label}</span>
                  <span className="font-medium">{source.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="font-semibold">Top Pages</h3>
            <div className="mt-4 space-y-4">
              {analytics.topPages.map((page) => (
                <div key={page.url} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate max-w-[200px]">
                    {page.url}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {page.views.toLocaleString()} views
                    </span>
                    <span className="text-sm text-green-600">
                      {page.conversions} conv.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="font-semibold mb-4">Traffic Over Time</h3>
          <div className="h-[300px]">
            <div className="text-sm text-gray-500 text-center pt-20">
              Coming soon: Traffic trend visualization will be added in the next update.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}