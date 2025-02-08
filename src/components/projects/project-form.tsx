'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { useAnalyticsSites } from '@/hooks/use-analytics-sites'

interface ProjectFormProps {
  onSubmit: (project: {
    name: string;
    url: string;
    googleAnalyticsPropertyId?: string;
    googleSearchConsolePropertyId?: string;
  }) => void
  onCancel: () => void
}

export default function ProjectForm({ onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [gaProperty, setGaProperty] = useState('')
  const [gscProperty, setGscProperty] = useState('')
  const [error, setError] = useState('')
  const { gaProperties, gscSites, isLoadingProperties, isLoadingSites } = useAnalyticsSites()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    const trimmedUrl = url.trim()
    const trimmedGaProperty = gaProperty.trim()
    const trimmedGscProperty = gscProperty.trim()

    if (!trimmedName || !trimmedUrl) {
      setError('Name and URL are required')
      return
    }

    // Add https:// if missing
    let finalUrl = trimmedUrl
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl
    }

    try {
      onSubmit({
        name: trimmedName,
        url: finalUrl,
        ...(trimmedGaProperty && { googleAnalyticsPropertyId: trimmedGaProperty }),
        ...(trimmedGscProperty && { googleSearchConsolePropertyId: trimmedGscProperty }),
      })
    } catch (error) {
      setError('Failed to create project')
      console.error('Form submission error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Project Name
        </label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Website"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="url" className="text-sm font-medium">
          URL
        </label>
        <Input
          type="text"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="gaProperty" className="text-sm font-medium">
          Google Analytics Property (Optional)
        </label>
        <select
          id="gaProperty"
          name="gaProperty"
          value={gaProperty}
          onChange={(e) => setGaProperty(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          aria-describedby="gaProperty-description"
          disabled={isLoadingProperties}
        >
          <option value="">Select a property</option>
          {gaProperties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name} ({property.id}) - {property.accountName}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="gscProperty" className="text-sm font-medium">
          Google Search Console Site (Optional)
        </label>
        <select
          id="gscProperty"
          name="gscProperty"
          value={gscProperty}
          onChange={(e) => setGscProperty(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          aria-describedby="gscProperty-description"
          disabled={isLoadingSites}
        >
          <option value="">Select a site</option>
          {gscSites.map((site) => (
            <option key={site.url} value={site.url}>
              {site.url} ({site.permissionLevel})
            </option>
          ))}
        </select>
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
