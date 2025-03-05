"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/providers/language-provider"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Keyword } from "@prisma/client"

interface Props {
  projectId: string
  keywords: Keyword[]
  onRankingsUpdated: () => void
}

export function RecheckRankingsButton({ projectId, keywords, onRankingsUpdated }: Props) {
  const [isChecking, setIsChecking] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()
  const { messages } = useLanguage()

  const handleRecheckAll = async () => {
    setIsChecking(true)
    setProgress(0)
    let completed = 0

    try {
      // Check keywords in parallel with a max concurrency of 5
      const chunks = chunk(keywords, 5)
      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(async (keyword) => {
            try {
              await fetch(
                `/api/projects/${projectId}/keywords/${keyword.id}/check-ranking`,
                { method: "POST" }
              )
            } catch (error) {
              console.error(`Error checking keyword ${keyword.id}:`, error)
            }
            completed++
            setProgress((completed / keywords.length) * 100)
          })
        )
      }

      onRankingsUpdated()
      toast({
        title: messages.projects.keywords.toast.recheckSuccess?.title || "Rankings Updated",
        description: messages.projects.keywords.toast.recheckSuccess?.description || "All keyword rankings have been rechecked",
      })
    } catch (error) {
      console.error("Error rechecking rankings:", error)
      toast({
        title: messages.projects.keywords.toast.recheckError?.title || "Error",
        description: messages.projects.keywords.toast.recheckError?.description || "Failed to recheck some keyword rankings",
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
      disabled={isChecking || keywords.length === 0}
      className="relative"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
      {isChecking ? (
        <>
          {messages.projects.keywords.actions.checking} ({Math.round(progress)}%)
          <div
            className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </>
      ) : (
        messages.projects.keywords.actions.recheckAll
      )}
    </Button>
  )
}
