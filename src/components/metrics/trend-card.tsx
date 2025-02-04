'use client'

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

interface TrendCardProps {
  title: string
  value: string | number
  change: number
  changeTimeframe: string
  trend: 'up' | 'down'
  format?: 'numeric' | 'percentage' | 'currency' | 'compact'
  loading?: boolean
  tooltip?: string
  className?: string
  footer?: React.ReactNode
}

export default function TrendCard({
  title,
  value,
  change,
  changeTimeframe,
  trend,
  format = 'numeric',
  loading = false,
  tooltip,
  className = '',
  footer
}: TrendCardProps) {
  const isPositive = trend === 'up'
  const changeText = `${isPositive ? '+' : ''}${change}%`

  const formatValue = (val: string | number) => {
    const num = Number(val)
    if (isNaN(num)) return val

    switch (format) {
      case 'percentage':
        return `${num.toLocaleString()}%`
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(num)
      case 'compact':
        return new Intl.NumberFormat('en-US', {
          notation: 'compact',
          maximumFractionDigits: 1
        }).format(num)
      default:
        return num.toLocaleString()
    }
  }

  if (loading) {
    return (
      <div className={`bg-white overflow-hidden rounded-lg shadow animate-pulse ${className}`}>
        <div className="p-5">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="mt-4 flex items-baseline space-x-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white overflow-hidden rounded-lg shadow ${className}`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {title}
              </h3>
              {tooltip && (
                <div className="ml-2 group relative">
                  <InformationCircleIcon className="h-5 w-5 text-gray-400" />
                  <div className="hidden group-hover:block absolute z-10 w-64 p-2 text-sm bg-gray-900 text-white rounded-md -left-1/2 transform -translate-x-1/2 mt-1">
                    {tooltip}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">
                {formatValue(value)}
              </p>
              <div className="ml-4">
                <span
                  className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    isPositive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpIcon className="-ml-1 mr-0.5 h-4 w-4 flex-shrink-0 self-center text-green-500" />
                  ) : (
                    <ArrowDownIcon className="-ml-1 mr-0.5 h-4 w-4 flex-shrink-0 self-center text-red-500" />
                  )}
                  {changeText}
                </span>
                <span className="ml-1 text-sm text-gray-500">
                  vs {changeTimeframe}
                </span>
              </div>
            </div>
          </div>
        </div>
        {footer && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
