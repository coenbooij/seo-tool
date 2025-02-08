'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { useAnalyticsSites } from '@/hooks/use-analytics-sites'

interface Project {
  id: string
  name: string
  url: string
  sitemapUrl?: string | null
  gaPropertyId?: string | null
  gscVerifiedSite?: string | null
}

interface EditProjectFormProps {
  project: Project
}

export default function EditProjectForm({ project }: EditProjectFormProps) {
  const [name, setName] = useState(project.name)
  const [url, setUrl] = useState(project.url)
  const [sitemapUrl, setSitemapUrl] = useState(project.sitemapUrl || '')
  const [gaPropertyId, setGaPropertyId] = useState(project.gaPropertyId || '')
  const [gscVerifiedSite, setGscVerifiedSite] = useState(project.gscVerifiedSite || '')
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { gaProperties, gscSites, isLoadingProperties, isLoadingSites } = useAnalyticsSites()

  useEffect(() => {
    setName(project.name)
    setUrl(project.url)
    setSitemapUrl(project.sitemapUrl || '')
    setGaPropertyId(project.gaPropertyId || '')
    setGscVerifiedSite(project.gscVerifiedSite || '')
  }, [project])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    setter(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const trimmedName = name.trim()
    const trimmedUrl = url.trim()

    if (!trimmedName || !trimmedUrl) {
      toast({
        description: "Name and URL are required",
        variant: "destructive"
      })
      setIsSaving(false)
      return
    }

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          url: trimmedUrl,
          sitemapUrl: sitemapUrl.trim() || null,
          gaPropertyId: gaPropertyId.trim() || null,
          gscVerifiedSite: gscVerifiedSite.trim() || null, // Keep sending as string
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update project')
      }

      toast({
        description: "Project settings updated successfully",
      })
    } catch (error) {
      toast({
        description: "Failed to update project settings",
        variant: "destructive"
      })
      console.error('Form submission error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-6">Project Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            Project Name
          </label>
          <Input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => handleInputChange(e, setName)}
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
            name="url"
            value={url}
            onChange={(e) => handleInputChange(e, setUrl)}
            placeholder="example.com"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="sitemapUrl" className="text-sm font-medium">
            Sitemap URL
          </label>
          <Input
            type="text"
            id="sitemapUrl"
            name="sitemapUrl"
            value={sitemapUrl}
            onChange={(e) => handleInputChange(e, setSitemapUrl)}
            placeholder="https://example.com/sitemap.xml"
            aria-describedby="sitemapUrl-description"
          />
          <p className="mt-1 text-sm text-gray-500" id="sitemapUrl-description">
            Optional: URL to your XML sitemap
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="gaPropertyId" className="text-sm font-medium">
            Google Analytics Property
          </label>
          <select
            id="gaPropertyId"
            name="gaPropertyId"
            value={gaPropertyId}
            onChange={(e) => setGaPropertyId(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            aria-describedby="gaPropertyId-description"
            disabled={isLoadingProperties}
          >
            <option value="">Select a property</option>
            {gaProperties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name} ({property.id}) - {property.accountName}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500" id="gaPropertyId-description">
            Select your Google Analytics 4 property
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="gscVerifiedSite" className="text-sm font-medium">
            Google Search Console Site
          </label>
          <select
            id="gscVerifiedSite"
            name="gscVerifiedSite"
            value={gscVerifiedSite}
            onChange={(e) => setGscVerifiedSite(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            aria-describedby="gscVerifiedSite-description"
            disabled={isLoadingSites}
          >
            <option value="">Select a site</option>
            {gscSites.map((site) => (
              <option key={site.url} value={site.url}>
                {site.url} ({site.permissionLevel})
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500" id="gscVerifiedSite-description">
            Select your verified site in Google Search Console
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Card>
  )
}