'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface AnalyticsData {
  totalVisits: number
  uniqueVisitors: number
  bounceRate: number
  avgSessionDuration: string
}

export default function Analytics() {
  const params = useParams()
  const { data: analytics } = useSWR<AnalyticsData>(
    `/api/projects/${params.id}/analytics`,
    fetcher
  )

  if (!analytics) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Analytics</h1>
      <p>Total Visits: {analytics.totalVisits}</p>
      <p>Unique Visitors: {analytics.uniqueVisitors}</p>
      <p>Bounce Rate: {analytics.bounceRate}%</p>
      <p>Average Session Duration: {analytics.avgSessionDuration}</p>
    </div>
  )
}