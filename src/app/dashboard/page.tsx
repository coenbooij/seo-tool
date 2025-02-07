'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { useState } from 'react'
import StatCard from '@/components/dashboard/stat-card'
import TrendCard from '@/components/metrics/trend-card'
import Link from 'next/link'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

const fetcher = async (url: string) => {
  const response = await fetch(url)
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'An error occurred')
  }
  
  return data
}

interface Project {
  id: string
  name: string
  domain: string
  createdAt: string
}

interface DashboardStats {
  totalProjects: number
  averagePosition: number
  positionChange: number
}

export default function Dashboard() {
  const { data: session } = useSession()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data: projects, error: projectsError } = useSWR<Project[]>(
    '/api/projects',
    fetcher
  )

  const { data: stats, error: statsError, mutate } = useSWR<DashboardStats>(
    '/api/dashboard/stats',
    fetcher
  )

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      await mutate()
    } finally {
      setIsRefreshing(false)
    }
  }

  const isLoading = !projects && !projectsError
  const isError = projectsError || statsError
  const projectsToShow = Array.isArray(projects) ? projects.slice(0, 5) : []

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back{session?.user?.email ? `, ${session.user.email}` : ''}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here&apos;s an overview of your SEO performance
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <StatCard
          title="Total Projects"
          value={stats?.totalProjects || 0}
          loading={isLoading}
          icon={
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          }
          onClick={() => window.location.href = '/dashboard/projects'}
        />

        <TrendCard
          title="Average Position"
          value={stats?.averagePosition || 0}
          change={stats?.positionChange || 0}
          changeTimeframe="last month"
          trend={stats?.positionChange && stats.positionChange <= 0 ? 'up' : 'down'}
          loading={isLoading}
          format="numeric"
          tooltip="Average position across all tracked keywords"
        />
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Projects</h2>
          <Link
            href="/dashboard/projects"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all
          </Link>
        </div>

        {isError ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">
              Failed to load dashboard data. Please try refreshing the page.
            </p>
          </div>
        ) : isLoading ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {projectsToShow.length === 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-gray-500">
                    No projects yet.{' '}
                    <Link
                      href="/dashboard/projects/new"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Create your first project
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {projectsToShow.map((project) => (
                    <li key={project.id}>
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="block hover:bg-gray-50"
                      >
                        <div className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {project.name}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                Last updated {new Date(project.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Active
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
