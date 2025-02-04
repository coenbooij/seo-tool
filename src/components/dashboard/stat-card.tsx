'use client'

import { InformationCircleIcon } from '@heroicons/react/24/outline'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  format?: 'numeric' | 'percentage' | 'currency' | 'compact'
  loading?: boolean
  tooltip?: string
  className?: string
  iconColor?: 'indigo' | 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  onClick?: () => void
}

export default function StatCard({
  title,
  value,
  description,
  icon,
  format = 'numeric',
  loading = false,
  tooltip,
  className = '',
  iconColor = 'indigo',
  onClick
}: StatCardProps) {
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

  const colorClasses = {
    indigo: 'bg-indigo-500 text-white',
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    red: 'bg-red-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    purple: 'bg-purple-500 text-white'
  }

  if (loading) {
    return (
      <div className={`bg-white overflow-hidden shadow rounded-lg animate-pulse ${className}`}>
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-md bg-gray-200"></div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="mt-2 h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-white overflow-hidden shadow rounded-lg ${
        onClick ? 'cursor-pointer hover:bg-gray-50 transition-colors duration-200' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`flex items-center justify-center h-12 w-12 rounded-md ${colorClasses[iconColor]}`}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="flex items-center text-sm font-medium text-gray-500 truncate">
                {title}
                {tooltip && (
                  <div className="ml-2 group relative">
                    <InformationCircleIcon className="h-4 w-4 text-gray-400" />
                    <div className="hidden group-hover:block absolute z-10 w-64 p-2 text-sm bg-gray-900 text-white rounded-md left-1/2 transform -translate-x-1/2 mt-1">
                      {tooltip}
                    </div>
                  </div>
                )}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatValue(value)}
                </div>
                {description && (
                  <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-600">
                    {description}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
