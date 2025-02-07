'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { Button } from "@/components/ui/button"
import { ReloadIcon } from "@radix-ui/react-icons"
import TrendCard from '@/components/metrics/trend-card'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Issue {
  type: 'error' | 'warning'
  message: string
  impact: 'high' | 'medium' | 'low'
}

interface TechnicalData {
  performance: {
    score: number
    metrics: {
      fcp: number // First Contentful Paint
      lcp: number // Largest Contentful Paint
      cls: number // Cumulative Layout Shift
      tbt: number // Total Blocking Time
      si: number // Speed Index
      tti: number // Time to Interactive
    }
    environment: {
      emulatedDevice: string
      networkThrottling: {
        rttMs: number
        throughputKbps: number
        cpuSlowdown: number
      }
      userAgent: string
      timestamp: string
    }
    issues: Issue[]
  }
  seo: {
    score: number
    issues: Issue[]
  }
  accessibility: {
    score: number
    issues: Issue[]
  }
  bestPractices: {
    score: number
    issues: Issue[]
  }
}

export default function TechnicalPage() {
  const params = useParams()
  const [isReloading, setIsReloading] = useState(false)
  
  const { data: technical, isLoading, mutate } = useSWR<TechnicalData>(
    `/api/projects/${params.id}/technical`,
    fetcher
  )

  const handleReload = async () => {
    setIsReloading(true)
    await mutate()
    setIsReloading(false)
  }

  if (!technical || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <ReloadIcon className="h-8 w-8 animate-spin text-gray-500" />
        <p className="text-sm text-gray-500">Analyzing technical performance, this may take a while...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with PageSpeed Logo and Reload Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">PageSpeed Insights</h1>
            <p className="text-sm text-gray-500">
              Report from {new Date(technical.performance.environment.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        <Button 
          onClick={handleReload} 
          size="sm"
          variant="ghost"
          disabled={isReloading}
        >
          <ReloadIcon className={`h-4 w-4 mr-2 ${isReloading ? 'animate-spin' : ''}`} />
          Reload Data
        </Button>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <TrendCard
          title="Performance"
          value={technical.performance.score}
          change={0}
          changeTimeframe="last check"
          trend="up"
          format="numeric"
        />
        <TrendCard
          title="SEO"
          value={technical.seo.score}
          change={0}
          changeTimeframe="last check"
          trend="up"
          format="numeric"
        />
        <TrendCard
          title="Best Practices"
          value={technical.bestPractices.score}
          change={0}
          changeTimeframe="last check"
          trend="up"
          format="numeric"
        />
        <TrendCard
          title="Accessibility"
          value={technical.accessibility.score}
          change={0}
          changeTimeframe="last check"
          trend="up"
          format="numeric"
        />
      </div>

      {/* Core Web Vitals */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Core Web Vitals
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
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
              Total Blocking Time
            </h3>
            <p
              className={`mt-1 text-2xl font-semibold ${
                technical.performance.metrics.tbt < 200
                  ? 'text-green-600'
                  : technical.performance.metrics.tbt < 600
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {technical.performance.metrics.tbt}ms
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
              Speed Index
            </h3>
            <p
              className={`mt-1 text-2xl font-semibold ${
                technical.performance.metrics.si < 3.4
                  ? 'text-green-600'
                  : technical.performance.metrics.si < 5.8
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {technical.performance.metrics.si}s
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
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">Test Environment</h4>
          <p className="mt-1 text-sm text-gray-500">
            Emulated {technical.performance.environment.emulatedDevice} with Slow 4G throttling ({technical.performance.environment.networkThrottling.throughputKbps}Kbps/{technical.performance.environment.networkThrottling.rttMs}ms RTT)
          </p>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Technical Issues
        </h2>
        <div className="space-y-6">
          {['high', 'medium', 'low'].map((impact) => {
            const allIssues = [
              ...technical.performance.issues,
              ...technical.seo.issues,
              ...technical.accessibility.issues,
              ...technical.bestPractices.issues,
            ]
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
