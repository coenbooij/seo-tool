'use client'

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'

interface TrendCardProps {
  title: string
  value: string | number
  change: number
  changeTimeframe: string
  trend: 'up' | 'down'
  format?: string
}

export default function TrendCard({
  title,
  value,
  change,
  changeTimeframe,
  trend,
  format = 'numeric'
}: TrendCardProps) {
  const isPositive = trend === 'up'
  const changeText = `${isPositive ? '+' : ''}${change}%`

  return (
    <div className="bg-white overflow-hidden rounded-lg shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {title}
              </h3>
            </div>
            <div className="mt-3 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">
                {format === 'numeric' ? Number(value).toLocaleString() : value}
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
      </div>
    </div>
  )
}
