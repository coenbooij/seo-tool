'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import EditProjectForm from '@/components/projects/edit-project-form'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ProjectSettingsPage() {
  const params = useParams()
  const { data: project, error } = useSWR(`/api/projects/${params.id}`, fetcher)

  if (error) {
    return (
      <div className="text-red-500">
        Error loading project settings
      </div>
    )
  }

  if (!project) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <EditProjectForm project={project} />
    </div>
  )
}