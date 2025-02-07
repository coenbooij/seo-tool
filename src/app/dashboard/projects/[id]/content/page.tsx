'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { Button } from "@/components/ui/button"
import { ReloadIcon } from "@radix-ui/react-icons"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { Issue, ContentMetrics } from '@/services/seo/types'

interface PageAnalysis {
  url: string
  title: string | null
  wordCount: number
  score: number
  lastUpdated: string
  metrics: ContentMetrics
  issues: Issue[]
}

interface ContentResponse {
  pages: PageAnalysis[]
  sitemapUrl: string | null
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const columns: ColumnDef<PageAnalysis>[] = [
  {
    accessorKey: 'url',
    header: 'URL',
    cell: ({ row }) => (
      <a 
        href={row.getValue('url') as string} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {new URL(row.getValue('url') as string).pathname}
      </a>
    ),
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => row.getValue('title') as string || 'No title',
  },
  {
    accessorKey: 'wordCount',
    header: 'Words',
    cell: ({ row }) => row.getValue('wordCount') as number,
  },
  {
    accessorKey: 'score',
    header: 'Score',
    cell: ({ row }) => {
      const score = row.getValue('score') as number
      return (
        <div className={`font-medium ${
          score >= 90 ? 'text-green-600' :
          score >= 70 ? 'text-yellow-600' :
          'text-red-600'
        }`}>
          {score}
        </div>
      )
    },
  },
  {
    accessorKey: 'lastUpdated',
    header: 'Last Updated',
    cell: ({ row }) => new Date(row.getValue('lastUpdated') as string).toLocaleString(),
  },
]

export default function ContentPage() {
  const params = useParams()
  const [isReloading, setIsReloading] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [customSitemapUrl, setCustomSitemapUrl] = useState('')
  const [currentSitemapUrl, setCurrentSitemapUrl] = useState('')
  
  const { data, isLoading, mutate } = useSWR<ContentResponse>(
    `/api/projects/${params.id}/content${currentSitemapUrl ? `?sitemapUrl=${encodeURIComponent(currentSitemapUrl)}` : ''}`,
    fetcher
  )

  // Set initial sitemap URL from API response
  useEffect(() => {
    if (data?.sitemapUrl && !currentSitemapUrl) {
      setCurrentSitemapUrl(data.sitemapUrl)
      setCustomSitemapUrl(data.sitemapUrl)
    }
  }, [data?.sitemapUrl])

  const table = useReactTable({
    data: data?.pages || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  const handleReload = async () => {
    setIsReloading(true)
    await mutate()
    setIsReloading(false)
  }

  const handleSitemapChange = async () => {
    setIsReloading(true)
    setCurrentSitemapUrl(customSitemapUrl)
    await mutate()
    setIsReloading(false)
  }

  const handleRowClick = (url: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [url]: !prev[url]
    }))
  }

  if (!data || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ReloadIcon className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Content Analysis</h1>
          <p className="text-sm text-gray-500">
            Analyzing {data.pages.length} pages from sitemap
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Custom sitemap URL"
              value={customSitemapUrl}
              onChange={(e) => setCustomSitemapUrl(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm min-w-[300px]"
            />
            <Button 
              onClick={handleSitemapChange}
              size="sm"
              variant="secondary"
              disabled={isReloading || customSitemapUrl === currentSitemapUrl}
            >
              {isReloading ? 'Updating...' : 'Update Sitemap'}
            </Button>
          </div>
          <Button 
            onClick={handleReload} 
            size="sm"
            variant="ghost"
            disabled={isReloading}
          >
            <ReloadIcon className={`h-4 w-4 mr-2 ${isReloading ? 'animate-spin' : ''}`} />
            Reload Data
          </Button>
        </div>
      </div>

      {/* Filter Input */}
      <div className="flex items-center py-4">
        <input
          placeholder="Filter URLs..."
          value={(table.getColumn('url')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('url')?.setFilterValue(event.target.value)
          }
          className="max-w-sm border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      {/* Pages Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow 
                key={row.original.url}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleRowClick(row.original.url)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {/* Expanded content rows */}
            {table.getRowModel().rows.map((row) => 
              expandedRows[row.original.url] ? (
                <TableRow key={`${row.original.url}-expanded`}>
                  <TableCell colSpan={columns.length} className="bg-gray-50 p-4">
                    <div className="space-y-4">
                      {/* Content Metrics */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Content Metrics</h3>
                        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Title</p>
                            <p className="mt-1 text-sm text-gray-900 break-words">
                              {row.original.metrics.title || 'No title'}
                            </p>
                            <p className={`text-xs ${
                              row.original.metrics.titleLength > 10 && row.original.metrics.titleLength < 60
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              Length: {row.original.metrics.titleLength} characters
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Meta Description</p>
                            <p className="mt-1 text-sm text-gray-900 break-words">
                              {row.original.metrics.description || 'No description'}
                            </p>
                            <p className={`text-xs ${
                              row.original.metrics.descriptionLength > 50 && row.original.metrics.descriptionLength < 160
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              Length: {row.original.metrics.descriptionLength} characters
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Content Stats</p>
                            <div className="mt-1 space-y-1">
                              <p className="text-sm text-gray-900">
                                Words: {row.original.metrics.wordCount}
                              </p>
                              <p className="text-sm text-gray-900">
                                H1 Tags: {row.original.metrics.h1Count}
                              </p>
                              <p className="text-sm text-gray-900">
                                H2 Tags: {row.original.metrics.h2Count}
                              </p>
                              <p className="text-sm text-gray-900">
                                Images: {row.original.metrics.imageCount} ({row.original.metrics.imagesWithoutAlt} missing alt)
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Technical Checks</p>
                            <div className="mt-1 space-y-1">
                              {[
                                { label: 'Canonical URL', value: row.original.metrics.hasCanonical },
                                { label: 'Robots Meta', value: row.original.metrics.hasRobots },
                                { label: 'Viewport Meta', value: row.original.metrics.hasViewport },
                                { label: 'Schema Markup', value: row.original.metrics.hasSchema },
                              ].map((check) => (
                                <p key={check.label} className="text-sm text-gray-900">
                                  {check.label}: {' '}
                                  <span className={check.value ? 'text-green-600' : 'text-red-600'}>
                                    {check.value ? '✓' : '✗'}
                                  </span>
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Issues */}
                      {row.original.issues.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Issues</h3>
                          <div className="mt-2 space-y-2">
                            {row.original.issues.map((issue, index) => (
                              <div
                                key={`${row.original.url}-issue-${index}`}
                                className={`flex items-start space-x-2 text-sm p-2 rounded-md ${
                                  issue.type === 'error' ? 'bg-red-50' : 'bg-yellow-50'
                                }`}
                              >
                                <div
                                  className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                    issue.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                                  }`}
                                />
                                <div>
                                  <p className={`font-medium ${
                                    issue.type === 'error' ? 'text-red-800' : 'text-yellow-800'
                                  }`}>
                                    {issue.message}
                                  </p>
                                  <p className={`text-xs ${
                                    issue.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                                  }`}>
                                    Impact: {issue.impact}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : null
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
