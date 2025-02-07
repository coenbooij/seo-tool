'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ReloadIcon, GearIcon } from "@radix-ui/react-icons"
import TrendCard from '@/components/metrics/trend-card'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface PageAnalytics {
  path: string
  pageViews: number
  change: number
}

interface TrafficSource {
  source: string
  users: number
  change: number
}

interface Analytics {
  users: number
  usersChange: number
  pageViews: number
  pageViewsChange: number
  avgSessionDuration: number
  avgSessionDurationChange: number
  bounceRate: number
  bounceRateChange: number
  topPages: PageAnalytics[]
  trafficSources: TrafficSource[]
  message?: string
  gaPropertyId?: string
  gscVerifiedSite?: string
}

export default function AnalyticsPage() {
  const params = useParams();
  const { data: analytics, isLoading, mutate } = useSWR<Analytics>(
    `/api/projects/${params.id}/analytics`,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ReloadIcon className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!analytics) {
    return <div>Error loading analytics</div>
  }

  // Check for configuration message
  if (analytics.message) {
    return (
      <div className="p-6">
        <div className="mb-4 text-sm text-gray-500">{analytics.message}</div>
        <Card className="p-6">
          <h3 className="font-medium mb-4">Current Configuration</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Google Analytics Property ID</p>
              <p className="text-sm text-gray-500">{analytics.gaPropertyId || 'Not configured'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Google Search Console Verified Site</p>
              <p className="text-sm text-gray-500">{analytics.gscVerifiedSite || 'Not configured'}</p>
            </div>
          </div>
          <div className="mt-6">
            <Link 
              href={`/dashboard/projects/${params.id}/settings`}
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <GearIcon className="h-4 w-4 mr-2" />
              Configure Analytics
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">Overview of your site&apos;s performance</p>
        </div>
        <Button
          onClick={() => mutate()}
          size="sm"
          variant="ghost"
        >
          <ReloadIcon className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <TrendCard
          title="Users"
          value={analytics.users}
          change={analytics.usersChange}
          changeTimeframe="vs last period"
          trend={analytics.usersChange >= 0 ? "up" : "down"}
          format="numeric"
        />
        <TrendCard
          title="Page Views"
          value={analytics.pageViews}
          change={analytics.pageViewsChange}
          changeTimeframe="vs last period"
          trend={analytics.pageViewsChange >= 0 ? "up" : "down"}
          format="numeric"
        />
        <TrendCard
          title="Avg. Session Duration"
          value={analytics.avgSessionDuration}
          change={analytics.avgSessionDurationChange}
          changeTimeframe="vs last period"
          trend={analytics.avgSessionDurationChange >= 0 ? "up" : "down"}
          format="numeric"
        />
        <TrendCard
          title="Bounce Rate"
          value={analytics.bounceRate}
          change={analytics.bounceRateChange}
          changeTimeframe="vs last period"
          trend={analytics.bounceRateChange <= 0 ? "up" : "down"}
          format="percentage"
        />
      </div>

      {/* Top Pages */}
      <Card className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Top Pages</h2>
        <div className="space-y-4">
          {analytics.topPages.map((page, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {page.path}
                </p>
                <p className="text-sm text-gray-500">
                  {page.pageViews} views
                </p>
              </div>
              <div className="ml-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  page.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {page.change >= 0 ? '+' : ''}{page.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Traffic Sources */}
      <Card className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Traffic Sources</h2>
        <div className="space-y-4">
          {analytics.trafficSources.map((source, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {source.source}
                </p>
                <p className="text-sm text-gray-500">
                  {source.users} users
                </p>
              </div>
              <div className="ml-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  source.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {source.change >= 0 ? '+' : ''}{source.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}