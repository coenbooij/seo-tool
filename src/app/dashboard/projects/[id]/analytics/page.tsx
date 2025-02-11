'use client'

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReloadIcon, GearIcon } from "@radix-ui/react-icons";
import { useToast } from "@/components/ui/use-toast";
import TrendCard from '@/components/metrics/trend-card';
import Link from 'next/link';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TimeSpan } from '@/services/seo/google-analytics-service';
import type { GSCData } from '@/services/seo/google-search-console-service';

const fetcher = (url: string) => fetch(url).then((res) => {
    if (res.status === 401) {
        throw new Error('Authentication failed');
    }
    return res.json()
});

interface PageAnalytics { path: string; pageViews: number; change: number; }
interface TrafficSource { source: string; users: number; change: number; }

type Analytics = {
  users: number;
  usersChange: number;
  pageViews: number;
  pageViewsChange: number;
  avgSessionDuration: number;
  avgSessionDurationChange: number;
  bounceRate: number;
  bounceRateChange: number;
  topPages: PageAnalytics[];
  trafficSources: TrafficSource[];
  gaPropertyId?: string;
  gscVerifiedSite?: string;
  gscData?: GSCData;
};

interface APIResponse {
  error?: string;
  message?: string;
  data?: Analytics;
}

const timespanOptions: { value: TimeSpan; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '180d', label: 'Last 180 days' },
  { value: '365d', label: 'Last 365 days' },
];

export default function AnalyticsPage() {
  const params = useParams();
  const { toast } = useToast();
  const [timespan, setTimespan] = useState<TimeSpan>('30d');
  const [stableAnalytics, setStableAnalytics] = useState<Analytics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: apiResponse, isLoading, error, mutate } = useSWR<APIResponse>(
    `/api/projects/${params.id}/analytics?timespan=${timespan}`,
    fetcher,
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onError: (err) => {
        if (err.message === 'Authentication failed') {
          // Handle the 401 error, e.g., show a message or redirect
          toast({
            title: "Authentication Error",
            description: "Google Analytics authentication has expired. Please reconfigure in settings.",
            variant: "destructive",
          });
        }
      },
      onSuccess: (data) => {
        // Only update stable state if we have valid data
        if (data?.data && Object.keys(data.data).length > 0) {
          setStableAnalytics(data.data);
        }
      },
      // Add retry configuration
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      dedupingInterval: 2000
    }
  );

  // Determine if we&apos;re in a loading state
  const isInitialLoading = isLoading && !stableAnalytics;
  const isRefetchLoading = isLoading && stableAnalytics;

  // Use stableAnalytics as the source of truth when available
  const currentAnalytics = stableAnalytics || apiResponse?.data;

  // Show loading state only on first load
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ReloadIcon className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  // Handle error states, but only if we don&apos;t have stable analytics
  if (error && !stableAnalytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-gray-500">
          {error.message === "Authentication failed"
            ? "Google Analytics authentication has expired"
            : "Unable to load analytics data"
          }
        </p>
        <Link
          href={`/dashboard/projects/${params.id}/settings`}
          className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90"
        >
          <GearIcon className="h-4 w-4 mr-2" />
          Reconfigure Analytics
        </Link>
      </div>
    )
  }

  // Add a subtle loading indicator during refetches
  const loadingIndicator = isRefetchLoading && (
    <div className="fixed top-4 right-4">
      <ReloadIcon className="h-4 w-4 animate-spin text-gray-400" />
    </div>
  );

  // Show configuration state if message exists (no GA/GSC configured)
  if (apiResponse?.message) {
    return (
      <div className="p-6">
        <div className="mb-4 text-sm text-gray-500">{apiResponse.message}</div>
        <Card className="p-6">
          <h3 className="font-medium mb-4">Current Configuration</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Google Analytics Property ID</p>
              <p className="text-sm text-gray-500">{apiResponse?.data?.gaPropertyId || 'Not configured'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Google Search Console Verified Site</p>
              <p className="text-sm text-gray-500">{apiResponse?.data?.gscVerifiedSite || 'Not configured'}</p>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href={`/dashboard/projects/${params.id}/settings`}
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <GearIcon className="h-4 w-4 mr-2" />
              Configure Analytics
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {loadingIndicator}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">Overview of your site&apos;s performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Select
              value={timespan}
              onValueChange={async (value: TimeSpan) => {
                setTimespan(value);
                setIsRefreshing(true);
                try {
                  await mutate();
                } catch {
                  toast({
                    title: "Error",
                    description: "Failed to update analytics data",
                    variant: "destructive",
                  });
                } finally {
                  setIsRefreshing(false);
                }
              }}
              disabled={isRefreshing}
            >
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent className="bg-white border rounded-md shadow-md">
                <SelectGroup>
                  {timespanOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="hover:bg-gray-100 cursor-pointer transition-colors">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              onClick={async () => {
                setIsRefreshing(true);
                try {
                  await mutate();
                  toast({
                    title: "Success",
                    description: "Analytics data has been refreshed",
                  });
                } catch {
                  toast({
                    title: "Error",
                    description: "Failed to refresh analytics data",
                    variant: "destructive",
                  });
                } finally {
                  setIsRefreshing(false);
                }
              }}
              size="sm"
              variant="ghost"
              disabled={isRefreshing}
            >
              <ReloadIcon className={`h-4 w-4 mr-2 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* Google Analytics Overview */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">User Behavior</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <TrendCard
            title="Users"
            value={currentAnalytics?.users ?? 0}
            change={currentAnalytics?.usersChange ?? 0}
            changeTimeframe="vs last period"
            trend={(currentAnalytics?.usersChange ?? 0) >= 0 ? "up" : "down"}
            format="numeric"
            tooltip="Number of unique visitors over the selected period."
          />
          <TrendCard
            title="Page Views"
            value={currentAnalytics?.pageViews ?? 0}
            change={currentAnalytics?.pageViewsChange ?? 0}
            changeTimeframe="vs last period"
            trend={(currentAnalytics?.pageViewsChange ?? 0) >= 0 ? "up" : "down"}
            format="numeric"
            tooltip="Total number of pages viewed during the selected period."
          />
          <TrendCard
            title="Avg. Session Duration"
            value={currentAnalytics?.avgSessionDuration ? Math.round(currentAnalytics.avgSessionDuration * 10) / 10 + ' s' : 0}
            change={currentAnalytics?.avgSessionDurationChange ?? 0}
            changeTimeframe="vs last period"
            trend={(currentAnalytics?.avgSessionDurationChange ?? 0) >= 0 ? "up" : "down"}
            format="numeric"
            tooltip="Average length of user sessions in seconds."
          />
          <TrendCard
            title="Bounce Rate"
            value={currentAnalytics?.bounceRate ? Math.round(currentAnalytics.bounceRate * 10) / 10 : 0}
            change={currentAnalytics?.bounceRateChange ?? 0}
            changeTimeframe="vs last period"
            trend={(currentAnalytics?.bounceRateChange ?? 0) >= 0 ? "up" : "down"}
            invertColors={true}
            format="percentage"
            tooltip="Percentage of sessions in which users left without taking further action."
          />
        </div>
      </div>

      {/* Search Performance */}
      {currentAnalytics?.gscData && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Search Performance</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <TrendCard
              title="Search Clicks"
              value={currentAnalytics.gscData.clicks}
              change={currentAnalytics.gscData.clicksChange}
              changeTimeframe="vs last period"
              trend={currentAnalytics.gscData.clicksChange >= 0 ? "up" : "down"}
              format="numeric"
              tooltip="Total number of times users clicked through to your site from Google search results"
            />
            <TrendCard
              title="Search Impressions"
              value={currentAnalytics.gscData.impressions}
              change={currentAnalytics.gscData.impressionsChange}
              changeTimeframe="vs last period"
              trend={currentAnalytics.gscData.impressionsChange >= 0 ? "up" : "down"}
              format="numeric"
              tooltip="Total number of times your site appeared in Google search results"
            />
            <TrendCard
              title="Search CTR"
              value={Math.round(currentAnalytics.gscData.ctr * 1000) / 10}
              change={currentAnalytics.gscData.ctrChange}
              changeTimeframe="vs last period"
              trend={currentAnalytics.gscData.ctrChange >= 0 ? "up" : "down"}
              format="percentage"
              tooltip="Click-through rate: clicks divided by impressions"
            />
            <TrendCard
              title="Avg. Position"
              value={Math.round(currentAnalytics.gscData.position * 10) / 10}
              change={currentAnalytics.gscData.positionChange
                ? Math.round((currentAnalytics.gscData.positionChange) * -100) / 100
                : 0
              }
              changeTimeframe="vs last period"
              trend={currentAnalytics.gscData.positionChange <= 0 ? "up" : "down"}
              invertColors={true}
              format="numeric"
              valuePrefix="#"
              tooltip="Average ranking position in Google search results. A lower number is better!"
            />
          </div>
        </div>
      )}

      {/* Top Pages */}
      <Card className="p-6 bg-white">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Top Pages</h2>
        <div className="space-y-4">
          {currentAnalytics?.topPages && currentAnalytics.topPages.length > 0 ? (
            currentAnalytics.topPages.map((page: PageAnalytics, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {page.path}
                  </p>
                  <p className="text-sm text-gray-500">
                    {page.pageViews} views
                  </p>
                </div>
                <div className="ml-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${page.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {page.change >= 0 ? '+' : ''}{Math.round(page.change)}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No data available.</p>
          )}
        </div>
      </Card>

      {/* Traffic Sources */}
      <Card className="p-6 bg-white">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Traffic Sources</h2>
        <div className="space-y-4">
          {currentAnalytics?.trafficSources && currentAnalytics.trafficSources.length > 0 ? (
            currentAnalytics.trafficSources.map((source: TrafficSource, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {source.source}
                  </p>
                  <p className="text-sm text-gray-500">
                    {source.users} users
                  </p>
                </div>
                <div className="ml-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${source.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {source.change >= 0 ? '+' : ''}{Math.round(source.change)}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No data available.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
