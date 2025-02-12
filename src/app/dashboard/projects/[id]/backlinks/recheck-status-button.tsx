'use client'

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface Props {
  projectId: string
  backlinkId: string
  onStatusUpdated: () => void
}

export function RecheckStatusButton({ projectId, backlinkId, onStatusUpdated }: Props) {
  const [isChecking, setIsChecking] = useState(false)
  const { toast } = useToast()

  const handleRecheck = async () => {
    setIsChecking(true)
    try {
      const response = await fetch(
        `/api/projects/${projectId}/backlinks/${backlinkId}/check`,
        { method: 'POST' }
      )

      if (!response.ok) {
        throw new Error('Failed to recheck backlink status')
      }

      onStatusUpdated()
      toast({
        title: "Status Updated",
        description: "Backlink status has been rechecked",
      })
    } catch (error) {
      console.error('Error rechecking status:', error)
      toast({
        title: "Error",
        description: "Failed to recheck backlink status",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={handleRecheck}
      disabled={isChecking}
      title="Recheck status"
    >
      <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
    </Button>
  )
}