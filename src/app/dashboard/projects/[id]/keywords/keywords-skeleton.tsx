import { Skeleton } from "@/components/ui/skeleton";

export function KeywordsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Header Section */}
      <div className="bg-white shadow-sm rounded-lg px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5">
          {/* Header */}
          <div className="flex space-x-8 border-b border-gray-200 pb-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-24" />
            ))}
          </div>
          {/* Rows */}
          <div className="space-y-6 pt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-8">
                {[...Array(5)].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-24" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
