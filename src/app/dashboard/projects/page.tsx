'use client'

import { useState } from 'react'
import useSWR from 'swr'
import ProjectForm from '@/components/projects/project-form'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Project {
  id: number
  name: string
  domain: string
  googleProperty?: string
  createdAt: string
}

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false)
  const { data: projects, error, mutate } = useSWR<Project[]>('/api/projects', fetcher)

  const handleCreateProject = async (projectData: { 
    name: string
    domain: string
    googleProperty?: string 
  }) => {
    try {
      console.log('Creating project:', projectData)
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project')
      }

      await mutate() // Refresh the projects list
      setShowForm(false)
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  if (error) {
    return (
      <div className="text-red-600">
        Failed to load projects. Please try again later.
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Project
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
          <ProjectForm
            onSubmit={handleCreateProject}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : null}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {!projects ? (
          <div className="p-4 text-center text-gray-600">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="p-4 text-center text-gray-600">
            No projects yet. Create your first project to get started!
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
                        {project.domain}
                      </p>
                      {project.googleProperty && (
                        <p className="mt-1 text-xs text-gray-400">
                          GA Property: {project.googleProperty}
                        </p>
                      )}
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
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
