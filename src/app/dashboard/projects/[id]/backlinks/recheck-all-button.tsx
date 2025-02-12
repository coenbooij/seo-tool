'use client'

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Backlink } from "@prisma/client"

interface Props {
  projectId: string
  backlinks: Backlink[]
  onStatusesUpdated: () => void
}

export function RecheckAllButton({ projectId, backlinks, onStatusesUpdated }: Props) {
  const [isChecking, setIsChecking] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const handleRecheckAll = async () => {
    setIsChecking(true)
    setProgress(0)
    let completed = 0

    try {
      // Check backlinks in parallel with a max concurrency of 5
      const chunks = chunk(backlinks, 5)
      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(async (backlink) => {
            try {
              await fetch(
                `/api/projects/${projectId}/backlinks/${backlink.id}/check`,
                { method: 'POST' }
              )
            } catch (error) {
              console.error(`Error checking backlink ${backlink.id}:`, error)
            }
            completed++
            setProgress((completed / backlinks.length) * 100)
          })
        )
      }

      onStatusesUpdated()
      toast({
        title: "Status Updated",
        description: "All backlinks have been rechecked",
      })
    } catch (error) {
      console.error('Error rechecking statuses:', error)
      toast({
        title: "Error",
        description: "Failed to recheck some backlinks",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
      setProgress(0)
    }
  }

  // Helper function to split array into chunks
  function chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleRecheckAll}
      disabled={isChecking || backlinks.length === 0}
      className="relative"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
      {isChecking ? (
        <>
          Checking ({Math.round(progress)}%)
          <div
            className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </>
      ) : (
        'Recheck All'
      )}
    </Button>
  )
}