import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/use-toast'

export interface GAProperty {
  id: string
  name: string
  websiteUrl: string
  accountId: string
  accountName: string
}

export interface GSCVerifiedSite {
  url: string
  permissionLevel: string
}

export function useAnalyticsSites() {
  const [isLoadingProperties, setIsLoadingProperties] = useState(true)
  const [isLoadingSites, setIsLoadingSites] = useState(true)
  const [gaProperties, setGaProperties] = useState<GAProperty[]>([])
  const [gscSites, setGscSites] = useState<GSCVerifiedSite[]>([])
  const [hasLoadedGA, setHasLoadedGA] = useState(false)
  const [hasLoadedGSC, setHasLoadedGSC] = useState(false)
  const { toast } = useToast()
  const { status } = useSession()

  useEffect(() => {
    const fetchGAProperties = async () => {
      if (hasLoadedGA) {
        setIsLoadingProperties(false)
        return
      }

      try {
        const response = await fetch('/api/analytics/properties')
        if (!response.ok) throw new Error('Failed to fetch GA properties')
        const properties = await response.json()
        setGaProperties(properties)
        setHasLoadedGA(true)
      } catch (error) {
        console.error('Error fetching GA properties:', error)
        toast({
          description: "Failed to load Google Analytics properties",
          variant: "destructive"
        })
      } finally {
        setIsLoadingProperties(false)
      }
    }

    fetchGAProperties()
  }, [toast, hasLoadedGA])

  useEffect(() => {
    const fetchGscSites = async () => {
      if (hasLoadedGSC) {
        setIsLoadingSites(false)
        return
      }

      try {
        const response = await fetch('/api/search-console/sites')
        if (!response.ok) throw new Error('Failed to fetch GSC sites')
        const sites = await response.json()
        setGscSites(sites)
        setHasLoadedGSC(true)
      } catch (error) {
        console.error('Error fetching GSC sites:', error)
        toast({
          description: "Failed to load Google Search Console sites",
          variant: "destructive"
        })
      } finally {
        setIsLoadingSites(false)
      }
    }

    if (status === 'authenticated') {
      fetchGscSites()
    }
  }, [status, toast, hasLoadedGSC])

  return {
    gaProperties,
    gscSites,
    isLoadingProperties,
    isLoadingSites
  }
}