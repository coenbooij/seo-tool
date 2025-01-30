'use client'

import { useState } from 'react'

interface ProjectFormProps {
  onSubmit: (project: { name: string; domain: string; googleProperty?: string }) => void
  onCancel: () => void
}

export default function ProjectForm({ onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [googleProperty, setGoogleProperty] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    const trimmedDomain = domain.trim()

    if (!trimmedName || !trimmedDomain) {
      setError('Name and domain are required')
      return
    }

    try {
      onSubmit({
        name: trimmedName,
        domain: trimmedDomain,
        googleProperty: googleProperty.trim() || undefined
      })
    } catch (error) {
      setError('Failed to create project')
      console.error('Form submission error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Project Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="My Website"
          />
        </div>
      </div>

      <div>
        <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
          Domain
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="googleProperty" className="block text-sm font-medium text-gray-700">
          Google Analytics Property ID (Optional)
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="googleProperty"
            value={googleProperty}
            onChange={(e) => setGoogleProperty(e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="UA-XXXXX-Y"
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Project
        </button>
      </div>
    </form>
  )
}
