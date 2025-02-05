'use client'

import React, { useState, Fragment } from 'react'
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

interface KeywordData {
  keyword: string
  usage: {
    count: number
    density: number
    positions: {
      title: boolean
      description: boolean
      headings: boolean
      content: boolean
    }
  }
  competition: {
    difficulty: number
    competitorCount: number
  }
  suggestions: Array<{
    keyword: string
    source: 'google' | 'content' | 'related'
  }>
}

interface ApiResponse {
  keywords: KeywordData[]
  analyzed: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const columns: ColumnDef<KeywordData>[] = [
  {
    accessorKey: 'keyword',
    header: 'Keyword',
  },
  {
    accessorKey: 'usage.count',
    header: 'Count',
  },
  {
    accessorKey: 'usage.density',
    header: 'Density',
    cell: ({ row }) => {
      const density = row.original.usage.density
      return `${density.toFixed(2)}%`
    },
  },
  {
    accessorKey: 'competition.difficulty',
    header: 'Difficulty',
    cell: ({ row }) => {
      const difficulty = row.original.competition.difficulty
      return (
        <div className={`font-medium ${
          difficulty < 30 ? 'text-green-600' :
          difficulty < 60 ? 'text-yellow-600' :
          'text-red-600'
        }`}>
          {difficulty}
        </div>
      )
    },
  },
  {
    id: 'placement',
    header: 'Placement',
    cell: ({ row }) => {
      const positions = row.original.usage.positions
      const icons = []
      if (positions.title) icons.push('🏷️')
      if (positions.description) icons.push('📝')
      if (positions.headings) icons.push('📌')
      if (positions.content) icons.push('📄')
      return icons.join(' ')
    },
  }
]

export default function KeywordsPage() {
  const params = useParams()
  const [isReloading, setIsReloading] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  
  const { data, isLoading, mutate } = useSWR<ApiResponse>(
    `/api/projects/${params.id}/keywords`,
    fetcher
  )

  const handleReload = async () => {
    setIsReloading(true)
    await mutate()
    setIsReloading(false)
  }

  const handleRowClick = (keyword: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [keyword]: !prev[keyword]
    }))
  }

  const table = useReactTable({
    data: data?.keywords || [],
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

  if (isLoading) {
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
          <h1 className="text-2xl font-semibold text-gray-900">Keyword Analysis</h1>
          {data && (
            <p className="text-sm text-gray-500">
              Last analyzed: {new Date(data.analyzed).toLocaleString()}
            </p>
          )}
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

      {/* Filter */}
      <div className="flex items-center py-4">
        <input
          placeholder="Filter keywords..."
          value={(table.getColumn('keyword')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('keyword')?.setFilterValue(event.target.value)
          }
          className="max-w-sm border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      {/* Keywords Table */}
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
              <Fragment key={row.original.keyword}>
                <TableRow 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRowClick(row.original.keyword)}
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
                {expandedRows[row.original.keyword] && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="bg-gray-50 p-4">
                      <div className="space-y-4">
                        {/* Usage Details */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Usage Details</h3>
                          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Placement</p>
                              <div className="mt-1 space-y-1">
                                {Object.entries(row.original.usage.positions).map(([key, value]) => (
                                  <p key={key} className="text-sm text-gray-900">
                                    {key.charAt(0).toUpperCase() + key.slice(1)}: {' '}
                                    <span className={value ? 'text-green-600' : 'text-red-600'}>
                                      {value ? '✓' : '✗'}
                                    </span>
                                  </p>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Usage Stats</p>
                              <div className="mt-1 space-y-1">
                                <p className="text-sm text-gray-900">
                                  Count: {row.original.usage.count}
                                </p>
                                <p className="text-sm text-gray-900">
                                  Density: {row.original.usage.density.toFixed(2)}%
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Competition</p>
                              <div className="mt-1 space-y-1">
                                <p className="text-sm text-gray-900">
                                  Difficulty: {row.original.competition.difficulty}
                                </p>
                                <p className="text-sm text-gray-900">
                                  Competitors: {row.original.competition.competitorCount}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Related Keywords */}
                        {row.original.suggestions.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">Related Keywords</h3>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {row.original.suggestions.map((suggestion, index) => (
                                <span
                                  key={`${row.original.keyword}-suggestion-${index}`}
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    suggestion.source === 'google'
                                      ? 'bg-blue-100 text-blue-800'
                                      : suggestion.source === 'content'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {suggestion.keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
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
