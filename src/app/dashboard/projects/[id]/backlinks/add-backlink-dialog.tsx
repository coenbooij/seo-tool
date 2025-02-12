'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { BacklinkType } from "@prisma/client"
import { useToast } from "@/components/ui/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from 'lucide-react'

interface Props {
  projectId: string
  onBacklinkAdded: () => void
}

export function AddBacklinkDialog({ projectId, onBacklinkAdded }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    url: '',
    targetUrl: '',
    anchorText: '',
    type: 'DOFOLLOW' as BacklinkType
  })

  const formatUrl = (url: string): string => {
    if (!url) return url
    
    // Add protocol if missing
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url
    }
    
    try {
      // Create URL object to validate and normalize
      const urlObject = new URL(url)
      // Return normalized URL
      return urlObject.toString()
    } catch {
      // Return original if invalid
      return url
    }
  }

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Format URLs before submission
      const formattedData = {
        ...formData,
        url: formatUrl(formData.url),
        targetUrl: formatUrl(formData.targetUrl)
      }

      // Validate URLs
      if (!validateUrl(formattedData.url) || !validateUrl(formattedData.targetUrl)) {
        throw new Error('Please enter valid URLs')
      }

      const response = await fetch(`/api/projects/${projectId}/backlinks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add backlink')
      }

      // Reset form and close dialog
      setFormData({
        url: '',
        targetUrl: '',
        anchorText: '',
        type: 'DOFOLLOW'
      })
      setIsOpen(false)
      onBacklinkAdded()

      toast({
        title: "Success",
        description: "Backlink added successfully",
      })
    } catch (error) {
      console.error('Error adding backlink:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add backlink",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 px-4">
          Add Backlink
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Backlink</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="url" className="text-sm font-medium">Source URL</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The URL where the backlink is located.<br/>
                    Protocol (http/https) will be added if missing.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="url"
              placeholder="example.com/article"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="targetUrl" className="text-sm font-medium">Target URL</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your page that is being linked to.<br/>
                    Should be a page from your website.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="targetUrl"
              placeholder="yoursite.com/page"
              value={formData.targetUrl}
              onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="anchorText" className="text-sm font-medium">Anchor Text</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The clickable text of the backlink.<br/>
                    Important for SEO relevance.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="anchorText"
              placeholder="Click here"
              value={formData.anchorText}
              onChange={(e) => setFormData({ ...formData, anchorText: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="type" className="text-sm font-medium">Link Type</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>DOFOLLOW: Passes SEO value<br/>
                    NOFOLLOW: No SEO value<br/>
                    UGC: User generated content<br/>
                    SPONSORED: Paid links</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={formData.type}
              onValueChange={(value: BacklinkType) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DOFOLLOW">Dofollow</SelectItem>
                <SelectItem value="NOFOLLOW">Nofollow</SelectItem>
                <SelectItem value="UGC">UGC</SelectItem>
                <SelectItem value="SPONSORED">Sponsored</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Backlink'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}