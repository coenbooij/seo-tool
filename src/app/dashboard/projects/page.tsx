'use client'

import { useState } from 'react'
import useSWR from 'swr'
import ProjectForm from '@/components/projects/project-form'
import { useLanguage } from '@/providers/language-provider'

interface Project {
  id: string // Changed from number to string since we're using CUID
  name: string
  url: string
  gaPropertyId?: string | null
  gscVerifiedSite?: string | null
  createdAt: string
}

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const { messages } = useLanguage()
  
  const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || messages.projects.errors.creating)
    }
    return res.json()
  }

  const { data: projects, error, mutate } = useSWR<Project[]>('/api/projects', fetcher)

  const handleCreateProject = async (projectData: {
    name: string
    url: string
    gaPropertyId?: string
    gscVerifiedSite?: string
  }) => {
    try {
      setErrorMessage('')
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || messages.projects.errors.creating)
      }

      await mutate() // Refresh the projects list
      setShowForm(false)
    } catch (error) {
      console.error('Error creating project:', error)
      setErrorMessage(error instanceof Error ? error.message : messages.projects.errors.creating)
    }
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 border border-red-200">
        <h3 className="text-sm font-medium text-red-800">{messages.projects.errors.loading}</h3>
        <div className="mt-2 text-sm text-red-700">
          {error.message || messages.projects.errors.loadingDesc}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{messages.projects.title}</h1>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true)
              setErrorMessage('')
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {messages.projects.addProject}
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200">
          <div className="text-sm text-red-700">{errorMessage}</div>
        </div>
      )}

      {showForm ? (
        <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
          <ProjectForm
            onSubmit={handleCreateProject}
            onCancel={() => {
              setShowForm(false)
              setErrorMessage('')
            }}
          />
        </div>
      ) : null}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {!projects ? (
          <div className="p-4 text-center text-gray-600">{messages.projects.loading}</div>
        ) : projects.length === 0 ? (
          <div className="p-4 text-center text-gray-600">
            {messages.projects.empty}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {projects.map((project) => (
              <li key={project.id}>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-indigo-600">
                        <a href={`/dashboard/projects/${project.id}`}>
                          {project.name}
                        </a>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {project.url}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {messages.projects.status}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
