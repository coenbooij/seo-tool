'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { BacklinkType } from "@prisma/client"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/providers/language-provider"
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

interface BacklinkMessages {
  loading: {
    state1: string
    state2: string
    state3: string
  }
  error: string
  empty: {
    title: string
    description: string
  }
  metrics: {
    activeBacklinks: string
    avgDomainAuthority: string
    newThisMonth: string
    lostLinks: string
  }
  table: {
    title: string
    description: string
    columns: {
      url: string
      target: string
      anchor: string
      da: string
      type: string
      status: string
      firstSeen: string
      actions: string
    }
    filter: {
      label: string
      all: string
      active: string
      lost: string
      broken: string
    }
  }
  dialog: {
    add: {
      title: string
      button: string
      adding: string
      sourceUrl: {
        label: string
        placeholder: string
        tooltip: string
      }
      targetUrl: {
        label: string
        placeholder: string
        tooltip: string
      }
      anchorText: {
        label: string
        placeholder: string
        tooltip: string
      }
      linkType: {
        label: string
        tooltip: string
        options: {
          dofollow: string
          nofollow: string
          ugc: string
          sponsored: string
        }
      }
      actions: {
        cancel: string
        submit: string
      }
      messages: {
        invalidUrl: string
        success: {
          title: string
          description: string
        }
        error: {
          title: string
          description: string
        }
      }
    }
  }
  actions: {
    add: string
    edit: string
    delete: string
    recheckAll: string
    recheck: string
  }
  deleteDialog: {
    title: string
    description: string
    cancel: string
    confirm: string
  }
  toast: {
    deleteSuccess: {
      title: string
      description: string
    }
    deleteError: {
      title: string
      description: string
    }
  }
}

export function AddBacklinkDialog({ projectId, onBacklinkAdded }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { messages } = useLanguage()
  const t = messages.projects.backlinks as unknown as BacklinkMessages
  const dialog = t.dialog.add

  const [formData, setFormData] = useState({
    url: '',
    targetUrl: '',
    anchorText: '',
    type: 'DOFOLLOW' as BacklinkType
  })

  const formatUrl = (url: string): string => {
    if (!url) return url
    
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url
    }
    
    try {
      const urlObject = new URL(url)
      return urlObject.toString()
    } catch {
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
      const formattedData = {
        ...formData,
        url: formatUrl(formData.url),
        targetUrl: formatUrl(formData.targetUrl)
      }

      if (!validateUrl(formattedData.url) || !validateUrl(formattedData.targetUrl)) {
        throw new Error(dialog.messages.invalidUrl)
      }

      const response = await fetch(`/api/projects/${projectId}/backlinks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || dialog.messages.error.description)
      }

      setFormData({
        url: '',
        targetUrl: '',
        anchorText: '',
        type: 'DOFOLLOW'
      })
      setIsOpen(false)
      onBacklinkAdded()

      toast({
        title: dialog.messages.success.title,
        description: dialog.messages.success.description,
      })
    } catch (error) {
      console.error('Error adding backlink:', error)
      toast({
        title: dialog.messages.error.title,
        description: error instanceof Error ? error.message : dialog.messages.error.description,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 px-6 font-medium bg-indigo-600 hover:bg-indigo-500 text-white">
          {dialog.button}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialog.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="url" className="text-sm font-medium">{dialog.sourceUrl.label}</label>
              <TooltipProvider delayDuration={200}>
                <Tooltip defaultOpen={false}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 text-gray-500 hover:text-gray-900"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{dialog.sourceUrl.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="url"
              placeholder={dialog.sourceUrl.placeholder}
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="targetUrl" className="text-sm font-medium">{dialog.targetUrl.label}</label>
              <TooltipProvider delayDuration={200}>
                <Tooltip defaultOpen={false}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 text-gray-500 hover:text-gray-900"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{dialog.targetUrl.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="targetUrl"
              placeholder={dialog.targetUrl.placeholder}
              value={formData.targetUrl}
              onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="anchorText" className="text-sm font-medium">{dialog.anchorText.label}</label>
              <TooltipProvider delayDuration={200}>
                <Tooltip defaultOpen={false}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 text-gray-500 hover:text-gray-900"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{dialog.anchorText.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="anchorText"
              placeholder={dialog.anchorText.placeholder}
              value={formData.anchorText}
              onChange={(e) => setFormData({ ...formData, anchorText: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="type" className="text-sm font-medium">{dialog.linkType.label}</label>
              <TooltipProvider delayDuration={200}>
                <Tooltip defaultOpen={false}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 text-gray-500 hover:text-gray-900"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{dialog.linkType.tooltip}</p>
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
                <SelectItem value="DOFOLLOW">{dialog.linkType.options.dofollow}</SelectItem>
                <SelectItem value="NOFOLLOW">{dialog.linkType.options.nofollow}</SelectItem>
                <SelectItem value="UGC">{dialog.linkType.options.ugc}</SelectItem>
                <SelectItem value="SPONSORED">{dialog.linkType.options.sponsored}</SelectItem>
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
              {dialog.actions.cancel}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              size="sm" 
              className="h-8 px-6 font-medium bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {isLoading ? dialog.adding : dialog.actions.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}