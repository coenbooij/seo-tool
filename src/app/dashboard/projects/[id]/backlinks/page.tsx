'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Backlink {
  id: number
  url: string
  anchorText: string
  domainAuth: number
  status: string
  firstSeen: string
  lastChecked: string
}

export default function BacklinksPage() {
  const params = useParams()
  const [filter, setFilter] = useState('all') // all, active, lost
  const { data: backlinks } = useSWR<Backlink[]>(
    `/api/projects/${params.id}/backlinks`,
    fetcher
  )

  if (!backlinks) {
    return <div>Loading...</div>
  }

  const filteredBacklinks = backlinks.filter((link) => {
    if (filter === 'all') return true
    return link.status === filter
  })

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Backlinks
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {backlinks.length}
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
                backlinks.reduce((acc, link) => acc + link.domainAuth, 0) /
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
      </div>

      {/* Filters */}
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
              onChange={(e) => setFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Links</option>
              <option value="active">Active</option>
              <option value="lost">Lost</option>
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
                  Anchor Text
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DA
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
                    {link.anchorText}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {link.domainAuth}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        link.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {link.status}
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
