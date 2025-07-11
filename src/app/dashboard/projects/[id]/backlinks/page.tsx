'use client'

import { useParams } from 'next/navigation'
import { useLanguage } from '@/providers/language-provider'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Backlink, BacklinkStatus } from '@prisma/client'
import { AddBacklinkDialog } from './add-backlink-dialog'
import { EditBacklinkDialog } from './edit-backlink-dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { StatusBadge } from './status-badge'
import { RecheckStatusButton } from './recheck-status-button'
import { RecheckAllButton } from './recheck-all-button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface BacklinkMetrics {
  anchorTextDistribution: Record<string, number>
  backlinkGrowth: Record<string, {
    active: number
    lost: number
    broken: number
  }>
}

interface BacklinksResponse {
  backlinks: Backlink[]
  metrics: BacklinkMetrics
  discovered: number
}

export default function BacklinksPage() {
  const params = useParams()
  const [filter, setFilter] = useState<BacklinkStatus | 'all'>('all')
  const { data, error, isLoading, mutate } = useSWR<BacklinksResponse>(
    `/api/projects/${params.id}/backlinks`,
    fetcher
  )
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [backlinkToDelete, setBacklinkToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  const { messages } = useLanguage();
  const loadingStates = [
    messages.projects.backlinks.loading.state1,
    messages.projects.backlinks.loading.state2,
    messages.projects.backlinks.loading.state3,
  ]
  const [loadingState, setLoadingState] = useState(0)
  
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingState((prev) => (prev + 1) % loadingStates.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isLoading, loadingStates.length])

  const handleDelete = async (backlinkId: string) => {
    try {
      const response = await fetch(
        `/api/projects/${params.id}/backlinks?backlinkId=${backlinkId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Failed to delete backlink')
      }

      mutate()
      toast({
        title: messages.projects.backlinks.toast.deleteSuccess.title,
        description: messages.projects.backlinks.toast.deleteSuccess.description,
      })
    } catch (error) {
      console.error('Error deleting backlink:', error)
      toast({
        title: messages.projects.backlinks.toast.deleteError.title,
        description: messages.projects.backlinks.toast.deleteError.description,
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setBacklinkToDelete(null)
    }
  }

  if (error) {
    return <div className="text-red-500">{messages.projects.backlinks.error}</div>
  }

  if (isLoading || !data?.backlinks || !data?.metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-48">
        <div className="text-gray-500">
          <p>{loadingStates[loadingState]}</p>
          <div className="mt-4">
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500" 
                style={{ width: `${((loadingState + 1) / loadingStates.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { backlinks, metrics } = data
  
  if (backlinks.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-lg font-medium text-gray-900">{messages.projects.backlinks.empty.title}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {messages.projects.backlinks.empty.description}
        </p>
        <div className="mt-6">
          <AddBacklinkDialog projectId={params.id as string} onBacklinkAdded={() => mutate()} />
        </div>
      </div>
    )
  }

  const filteredBacklinks = backlinks.filter((link) => {
    if (filter === 'all') return true
    return link.status === filter
  })

  // Calculate stats
  const activeBacklinks = backlinks.filter((link) => link.status === 'ACTIVE')
  const avgDomainAuthority = backlinks.length > 0
    ? Math.round(
        backlinks.reduce((acc, link) => acc + (link.domainAuthority || 0), 0) /
        backlinks.length
      )
    : 0

  const latestGrowthDate = Object.keys(metrics.backlinkGrowth).sort().pop()
  const latestGrowth = latestGrowthDate ? metrics.backlinkGrowth[latestGrowthDate] : { active: 0, lost: 0, broken: 0 }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {messages.projects.backlinks.metrics.activeBacklinks}
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {activeBacklinks.length}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {messages.projects.backlinks.metrics.avgDomainAuthority}
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {avgDomainAuthority}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {messages.projects.backlinks.metrics.newThisMonth}
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {
                backlinks.filter(
                  (link) =>
                    new Date(link.firstSeen) >
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length
              }
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {messages.projects.backlinks.metrics.lostLinks}
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {latestGrowth.lost}
            </dd>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">{messages.projects.backlinks.table.title}</h1>
            <p className="mt-2 text-sm text-gray-700">
              {messages.projects.backlinks.table.description}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center gap-2">
              <div className="flex items-center gap-2 mr-4">
                <RecheckAllButton
                  projectId={params.id as string}
                  backlinks={backlinks}
                  onStatusesUpdated={() => mutate()}
                />
                <select
                  id="backlink-filter"
                  name="backlink-filter"
                  aria-label={messages.projects.backlinks.table.filter.label}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as BacklinkStatus | 'all')}
                  className="block rounded-md border-gray-300 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 w-32 text-center h-8"
                >
                  <option value="all">{messages.projects.backlinks.table.filter.all}</option>
                  <option value="ACTIVE">{messages.projects.backlinks.table.filter.active}</option>
                  <option value="LOST">{messages.projects.backlinks.table.filter.lost}</option>
                  <option value="BROKEN">{messages.projects.backlinks.table.filter.broken}</option>
                </select>
                
              </div>
              <div>
                <AddBacklinkDialog
                  projectId={params.id as string}
                  onBacklinkAdded={() => mutate()}
                />
              </div>
          </div>
        </div>
      </div>

      {/* Backlink Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{messages.projects.backlinks.table.columns.url}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{messages.projects.backlinks.table.columns.target}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{messages.projects.backlinks.table.columns.anchor}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{messages.projects.backlinks.table.columns.da}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{messages.projects.backlinks.table.columns.type}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{messages.projects.backlinks.table.columns.status}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{messages.projects.backlinks.table.columns.firstSeen}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{messages.projects.backlinks.table.columns.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBacklinks.map((link) => (
                <tr key={link.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-900">
                      {link.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{link.targetUrl}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{link.anchorText}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{link.domainAuthority}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <StatusBadge status={link.type} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={link.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(link.firstSeen).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <RecheckStatusButton
                        projectId={params.id as string}
                        backlinkId={link.id}
                        onStatusUpdated={() => mutate()}
                      />
                      <EditBacklinkDialog
                        projectId={params.id as string}
                        backlink={link}
                        onBacklinkUpdated={() => mutate()}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setBacklinkToDelete(link.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{messages.projects.backlinks.deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {messages.projects.backlinks.deleteDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBacklinkToDelete(null)}>{messages.projects.backlinks.deleteDialog.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => backlinkToDelete && handleDelete(backlinkToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              {messages.projects.backlinks.deleteDialog.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
