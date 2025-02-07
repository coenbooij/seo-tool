'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

import { Backlink, BacklinkStatus } from '@prisma/client'

interface BacklinkMetrics {
  anchorTextDistribution: Record<string, number>
  backlinkGrowth: Record<string, {
    active: number
    lost: number
    broken: number
  }>
}

interface BacklinksResponse {
  backlinks: Backlink[]
  metrics: BacklinkMetrics
}

export default function BacklinksPage() {
  const params = useParams()
  const [filter, setFilter] = useState<BacklinkStatus | 'all'>('all')
  const { data, error } = useSWR<BacklinksResponse>(
    `/api/projects/${params.id}/backlinks`,
    fetcher
  )

  if (error) {
    return <div className="text-red-500">Failed to load backlinks data</div>
  }

  if (!data?.backlinks || !data?.metrics) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500">Loading backlinks data...</div>
      </div>
    )
  }

  const { backlinks, metrics } = data

  // Handle empty state
  if (backlinks.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-lg font-medium text-gray-900">No backlinks found</h3>
        <p className="mt-1 text-sm text-gray-500">
          We haven&apos;t discovered any backlinks for your website yet. This could be because:
        </p>
        <ul className="mt-4 text-sm text-gray-500 list-disc list-inside">
          <li>Your website is new and hasn&apos;t acquired any backlinks</li>
          <li>The backlink discovery process is still running</li>
          <li>Your website&apos;s backlinks are not yet indexed</li>
        </ul>
        <p className="mt-4 text-sm text-gray-500">
          Check back later as we continuously monitor for new backlinks.
        </p>
      </div>
    )
  }

  const filteredBacklinks = backlinks.filter((link) => {
    if (filter === 'all') return true
    return link.status === filter
  })

  // Calculate total active backlinks
  const activeBacklinks = backlinks.filter((link) => link.status === 'ACTIVE')

  // Get the latest growth data point
  const latestGrowthDate = Object.keys(metrics.backlinkGrowth).sort().pop()
  const latestGrowth = latestGrowthDate ? metrics.backlinkGrowth[latestGrowthDate] : { active: 0, lost: 0, broken: 0 }

  // Get top anchor texts
  const topAnchorTexts = Object.entries(metrics.anchorTextDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Active Backlinks
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {activeBacklinks.length}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Average Domain Authority
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {Math.round(
                backlinks.reduce((acc, link) => acc + link.domainAuthority, 0) /
                  backlinks.length
              )}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              New This Month
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {
                backlinks.filter(
                  (link) =>
                    new Date(link.firstSeen) >
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length
              }
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Lost Links (30d)
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {latestGrowth.lost}
            </dd>
          </div>
        </div>
      </div>

      {/* Anchor Text Distribution */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">Top Anchor Texts</h3>
        <div className="mt-4">
          {topAnchorTexts.map(([text, count]) => (
            <div key={text} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">{text}</span>
              <span className="text-sm font-medium text-gray-900">{count} links</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Backlinks</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all backlinks pointing to your website
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <select
              id="backlink-filter"
              name="backlink-filter"
              aria-label="Filter backlinks"
              value={filter}
              onChange={(e) => setFilter(e.target.value as BacklinkStatus | 'all')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Links</option>
              <option value="ACTIVE">Active</option>
              <option value="LOST">Lost</option>
              <option value="BROKEN">Broken</option>
            </select>
          </div>
        </div>
      </div>

      {/* Backlinks Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Anchor Text
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  First Seen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBacklinks.map((link) => (
                <tr key={link.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-indigo-900"
                    >
                      {link.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {link.targetUrl}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {link.anchorText}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {link.domainAuthority}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {link.type ? link.type.toLowerCase() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        link.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : link.status === 'LOST'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {link.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(link.firstSeen).toLocaleDateString()}
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
