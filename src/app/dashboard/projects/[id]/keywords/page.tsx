'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { useState } from 'react'
import TrendCard from '@/components/metrics/trend-card'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Keyword {
  id: number
  term: string
  position: number
  volume: number
  difficulty: number
  lastUpdated: string
}

export default function KeywordsPage() {
  const params = useParams()
  const [searchTerm, setSearchTerm] = useState('')
  const { data: keywords } = useSWR<Keyword[]>(
    `/api/projects/${params.id}/keywords`,
    fetcher
  )

  if (!keywords) {
    return <div>Loading...</div>
  }

  const filteredKeywords = keywords.filter((keyword) =>
    keyword.term.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate metrics
  const top10Keywords = keywords.filter((k) => k.position <= 10).length
  const avgPosition =
    Math.round(
      (keywords.reduce((acc, k) => acc + k.position, 0) / keywords.length) * 10
    ) / 10
  const totalVolume = keywords.reduce((acc, k) => acc + k.volume, 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <TrendCard
          title="Top 10 Rankings"
          value={top10Keywords}
          change={2.5}
          changeTimeframe="last month"
          trend="up"
        />
        <TrendCard
          title="Average Position"
          value={avgPosition}
          change={-0.8}
          changeTimeframe="last month"
          trend="down"
        />
        <TrendCard
          title="Total Search Volume"
          value={totalVolume}
          change={5.3}
          changeTimeframe="last month"
          trend="up"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Keywords</h1>
            <p className="mt-2 text-sm text-gray-700">
              Track your keyword rankings and performance
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full rounded-md border-gray-300 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Search keywords"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keywords Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keyword
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredKeywords.map((keyword) => (
                <tr key={keyword.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {keyword.term}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        keyword.position <= 3
                          ? 'bg-green-100 text-green-800'
                          : keyword.position <= 10
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {keyword.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {keyword.volume.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            keyword.difficulty < 30
                              ? 'bg-green-500'
                              : keyword.difficulty < 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${keyword.difficulty}%` }}
                        ></div>
                      </div>
                      <span>{keyword.difficulty}/100</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(keyword.lastUpdated).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
