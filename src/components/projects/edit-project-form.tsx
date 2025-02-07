'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

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

  useEffect(() => {
    setName(project.name)
    setUrl(project.url)
    setSitemapUrl(project.sitemapUrl || '')
    setGaPropertyId(project.gaPropertyId || '')
    setGscVerifiedSite(project.gscVerifiedSite || '')
  }, [project])

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
          gscVerifiedSite: gscVerifiedSite.trim() || null,
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
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Project Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="My Website"
            />
          </div>
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            URL
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="url"
              name="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="sitemapUrl" className="block text-sm font-medium text-gray-700">
            Sitemap URL
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="sitemapUrl"
              name="sitemapUrl"
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="https://example.com/sitemap.xml"
              aria-describedby="sitemapUrl-description"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500" id="sitemapUrl-description">
            Optional: URL to your XML sitemap
          </p>
        </div>

        <div>
          <label htmlFor="gaPropertyId" className="block text-sm font-medium text-gray-700">
            Google Analytics Property ID
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="gaPropertyId"
              name="gaPropertyId"
              value={gaPropertyId}
              onChange={(e) => setGaPropertyId(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
              aria-describedby="gaPropertyId-description"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500" id="gaPropertyId-description">
            Optional: Your Google Analytics 4 measurement ID or Universal Analytics tracking ID
          </p>
        </div>

        <div>
          <label htmlFor="gscVerifiedSite" className="block text-sm font-medium text-gray-700">
            Google Search Console Verified Site
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="gscVerifiedSite"
              name="gscVerifiedSite"
              value={gscVerifiedSite}
              onChange={(e) => setGscVerifiedSite(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="https://example.com"
              aria-describedby="gscVerifiedSite-description"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500" id="gscVerifiedSite-description">
            Optional: Your verified site URL in Google Search Console
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