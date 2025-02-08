'use client'

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

interface TrendCardProps {
  title: string
  value: string | number
  change: number | undefined
  changeTimeframe?: string
  trend?: 'up' | 'down'
  format?: 'numeric' | 'percentage' | 'currency' | 'compact'
  loading?: boolean
  tooltip?: string
  className?: string
  footer?: React.ReactNode
  invertColors?: boolean // For metrics where increase is bad
  valuePrefix?: string // For adding a prefix to the value
}

export default function TrendCard({
  title,
  value,
  change,
  changeTimeframe = "vs last period",
  trend = 'up',
  format = 'numeric',
  loading = false,
  tooltip,
  className = '',
  footer,
  invertColors = false,
  valuePrefix = '',
}: TrendCardProps) {
  const isPositive = trend === 'up'
  const changeText = change !== undefined ? `${isPositive ? '+' : ''}${Math.round(change)}%` : '--'

  const formatValue = (val: string | number) => {
    const num = Number(val)
    if (isNaN(num)) return val

    let formattedValue = ''
    switch (format) {
      case 'percentage':
        formattedValue = `${num.toLocaleString()}%`
        break
      case 'currency':
        formattedValue = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(num)
        break
      case 'compact':
        formattedValue = new Intl.NumberFormat('en-US', {
          notation: 'compact',
          maximumFractionDigits: 1
        }).format(num)
        break
      default:
        formattedValue = num.toLocaleString()
    }

    return valuePrefix ? `${valuePrefix}${formattedValue}` : formattedValue
  }

  // Determine color scheme based on trend and invertColors prop
  const getColorScheme = () => {
    if (change === undefined) return 'bg-gray-100 text-gray-800'
    const isGood = invertColors ? !isPositive : isPositive
    return isGood ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  // Get icon color based on trend and invertColors prop
  const getIconColor = () => {
    const isGood = invertColors ? !isPositive : isPositive
    return isGood ? 'text-green-500' : 'text-red-500'
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
    <div className={`relative bg-white overflow-visible rounded-lg shadow ${className}`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {title}
              </h3>
              {tooltip && (
                <div className="ml-2 relative group">
                  <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-help" />
                  <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 text-sm bg-gray-900 text-white rounded-md shadow-lg z-50">
                    {tooltip}
                    {/* Arrow */}
                    <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
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
                  className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${getColorScheme()}`}
                >
                  {change !== undefined ? (
                    isPositive ? (
                      <ArrowUpIcon className={`-ml-1 mr-0.5 h-4 w-4 flex-shrink-0 self-center ${getIconColor()}`} />
                    ) : (
                      <ArrowDownIcon className={`-ml-1 mr-0.5 h-4 w-4 flex-shrink-0 self-center ${getIconColor()}`} />
                    )
                  ) : null}
                  {changeText}
                </span>
                {changeTimeframe && (
                  <span className="ml-1 text-sm text-gray-500">
                    {changeTimeframe}
                  </span>
                )}
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
