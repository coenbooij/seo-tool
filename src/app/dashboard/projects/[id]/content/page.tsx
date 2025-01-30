'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { useState } from 'react'
import TrendCard from '@/components/metrics/trend-card'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ContentPage {
  id: number
  url: string
  title: string
  wordCount: number
  score: number
  lastUpdated: string
  issues: {
    type: 'error' | 'warning'
    message: string
  }[]
}

export default function ContentPage() {
  const params = useParams()
  const [filter, setFilter] = useState('all') // all, optimized, needs-work
  const { data: pages } = useSWR<ContentPage[]>(
    `/api/projects/${params.id}/content`,
    fetcher
  )

  if (!pages) {
    return <div>Loading...</div>
  }

  const filteredPages = pages.filter((page) => {
    if (filter === 'all') return true
    if (filter === 'optimized') return page.score >= 80
    return page.score < 80
  })

  // Calculate metrics
  const avgScore =
    Math.round(pages.reduce((acc, p) => acc + p.score, 0) / pages.length)
  const optimizedPages = pages.filter((p) => p.score >= 80).length
  const totalWords = pages.reduce((acc, p) => acc + p.wordCount, 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <TrendCard
          title="Average Content Score"
          value={`${avgScore}/100`}
          change={3.2}
          changeTimeframe="last month"
          trend="up"
          format="text"
        />
        <TrendCard
          title="Optimized Pages"
          value={optimizedPages}
          change={1}
          changeTimeframe="last month"
          trend="up"
        />
        <TrendCard
          title="Total Words"
          value={totalWords}
          change={5.8}
          changeTimeframe="last month"
          trend="up"
        />
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Content</h1>
            <p className="mt-2 text-sm text-gray-700">
              Analyze and optimize your content performance
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <select
              id="content-filter"
              name="content-filter"
              aria-label="Filter content"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Pages</option>
              <option value="optimized">Optimized</option>
              <option value="needs-work">Needs Work</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Pages */}
      <div className="space-y-4">
        {filteredPages.map((page) => (
          <div key={page.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-600"
                  >
                    {page.title}
                  </a>
                </h3>
                <p className="mt-1 text-sm text-gray-500">{page.url}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {page.wordCount.toLocaleString()} words
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    page.score >= 80
                      ? 'bg-green-100 text-green-800'
                      : page.score >= 60
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  Score: {page.score}/100
                </div>
              </div>
            </div>

            {/* Content Issues */}
            {page.issues.length > 0 && (
              <div className="mt-4 space-y-2">
                {page.issues.map((issue, index) => (
                  <div
                    key={index}
                    className="flex items-center text-sm"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        issue.type === 'error'
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                      }`}
                    ></div>
                    <span className="text-gray-600">{issue.message}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 text-sm text-gray-500">
              Last updated: {new Date(page.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
