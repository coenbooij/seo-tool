'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { BacklinkStatus, BacklinkType } from "@prisma/client"
import { useLanguage, Messages } from '@/providers/language-provider'

type StatusMap = {
  [K in BacklinkStatus | BacklinkType]: {
    color: string
    description: string
  }
}

function getStatusInfo(messages: Messages): StatusMap {
  return {
    ACTIVE: {
      color: "bg-green-100 text-green-800",
      description: messages.projects.backlinks.tooltips?.status?.active ?? "Link is live and successfully points to the target URL"
    },
    LOST: {
      color: "bg-red-100 text-red-800",
      description: messages.projects.backlinks.tooltips?.status?.lost ?? "Link was found but no longer points to the target URL"
    },
    BROKEN: {
      color: "bg-yellow-100 text-yellow-800",
      description: messages.projects.backlinks.tooltips?.status?.broken ?? "Unable to access the link URL (404, timeout, etc.)"
    },
    DOFOLLOW: {
      color: "bg-blue-100 text-blue-800",
      description: messages.projects.backlinks.tooltips?.type?.dofollow ?? "Standard link that passes SEO value"
    },
    NOFOLLOW: {
      color: "bg-gray-100 text-gray-800",
      description: messages.projects.backlinks.tooltips?.type?.nofollow ?? "Link with rel='nofollow' that doesn't pass SEO value"
    },
    UGC: {
      color: "bg-purple-100 text-purple-800",
      description: messages.projects.backlinks.tooltips?.type?.ugc ?? "User-generated content link (comments, forums, etc.)"
    },
    SPONSORED: {
      color: "bg-orange-100 text-orange-800", 
      description: messages.projects.backlinks.tooltips?.type?.sponsored ?? "Paid or sponsored link that must be marked as such"
    }
  }
}

interface StatusBadgeProps {
  status: BacklinkStatus | BacklinkType
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { messages } = useLanguage()
  const info = getStatusInfo(messages)[status]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${info.color}`}
          >
            {status.toLowerCase()}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{info.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
