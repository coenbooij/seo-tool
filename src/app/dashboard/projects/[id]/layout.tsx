'use client'

import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Project {
  id: number
  name: string
  domain: string
}

const navigation = [
  { name: 'Overview', href: '' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Backlinks', href: '/backlinks' },
  { name: 'Keywords', href: '/keywords' },
  { name: 'Content', href: '/content' },
  { name: 'Technical SEO', href: '/technical' },
  { name: 'Settings', href: '/settings' },
]

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const pathname = usePathname()
  const { data: project, error } = useSWR<Project>(`/api/projects/${params.id}`, fetcher)

  if (error) {
    return <div className="text-red-500">Error loading project</div>
  }

  return (
    <div>
      {/* Project header */}
      <div className="mb-8">
        <div className="mb-4">
          {project ? (
            <>
              <h1 className="text-2xl font-semibold text-gray-900">
                {project.name}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {project.domain}
              </p>
            </>
          ) : (
            <div className="animate-pulse">
              <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 rounded"></div>
            </div>
          )}
        </div>

        {/* Project navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {navigation.map((item) => {
              const href = `/dashboard/projects/${params.id}${item.href}`
              const isActive = pathname === href
              return (
                <Link
                  key={item.name}
                  href={href}
                  className={`${
                    isActive
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Page content */}
      <div>{children}</div>
    </div>
  )
}
