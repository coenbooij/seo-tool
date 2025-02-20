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
import { useLanguage } from '@/providers/language-provider';

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
  { value: '7d', label: 'timeperiods.7d' },
  { value: '30d', label: 'timeperiods.30d' },
  { value: '90d', label: 'timeperiods.90d' },
  { value: '180d', label: 'timeperiods.180d' },
  { value: '365d', label: 'timeperiods.365d' },
];

export default function AnalyticsPage() {
  const params = useParams();
  const { toast } = useToast();
  const { messages } = useLanguage();
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
          toast({
            title: messages.projects.analytics.errors.auth.title,
            description: messages.projects.analytics.errors.auth.description,
            variant: "destructive",
          });
        }
      },
      onSuccess: (data) => {
        if (data?.data && Object.keys(data.data).length > 0) {
          setStableAnalytics(data.data);
        }
      },
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      dedupingInterval: 2000
    }
  );

  const isInitialLoading = isLoading && !stableAnalytics;
  const isRefetchLoading = isLoading && stableAnalytics;

  const currentAnalytics = stableAnalytics || apiResponse?.data;

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ReloadIcon className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error && !stableAnalytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-gray-500">
          {error.message === "Authentication failed"
            ? messages.projects.analytics.errors.auth.description
            : "Unable to load analytics data"
          }
        </p>
        <Link
          href={`/dashboard/projects/${params.id}/settings`}
          className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90"
        >
          <GearIcon className="h-4 w-4 mr-2" />
          {messages.projects.analytics.actions.reconfigure}
        </Link>
      </div>
    )
  }

  const loadingIndicator = isRefetchLoading && (
    <div className="fixed top-4 right-4">
      <ReloadIcon className="h-4 w-4 animate-spin text-gray-400" />
    </div>
  );

  if (apiResponse?.message) {
    return (
      <div className="p-6">
        <div className="mb-4 text-sm text-gray-500">{apiResponse.message}</div>
        <Card className="p-6">
          <h3 className="font-medium mb-4">{messages.projects.analytics.configuration.title}</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700">{messages.projects.analytics.configuration.gaProperty}</p>
              <p className="text-sm text-gray-500">{apiResponse?.data?.gaPropertyId || messages.projects.analytics.configuration.notConfigured}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{messages.projects.analytics.configuration.gscSite}</p>
              <p className="text-sm text-gray-500">{apiResponse?.data?.gscVerifiedSite || messages.projects.analytics.configuration.notConfigured}</p>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href={`/dashboard/projects/${params.id}/settings`}
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <GearIcon className="h-4 w-4 mr-2" />
              {messages.projects.analytics.actions.configure}
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
          <h1 className="text-2xl font-semibold text-gray-900">{messages.projects.analytics.title}</h1>
          <p className="text-sm text-gray-500">{messages.projects.analytics.description}</p>
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
                    title: messages.projects.analytics.errors.refresh.title,
                    description: messages.projects.analytics.errors.refresh.description,
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
                      {messages.projects.analytics.timeperiods[option.value as keyof typeof messages.projects.analytics.timeperiods]}
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
                    title: messages.projects.analytics.success.refresh.title,
                    description: messages.projects.analytics.success.refresh.description,
                  });
                } catch {
                  toast({
                    title: messages.projects.analytics.errors.refresh.title,
                    description: messages.projects.analytics.errors.refresh.description,
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
              {messages.projects.analytics.actions.refresh}
            </Button>
          </div>
        </div>
      </div>

      {/* User Behavior */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">{messages.projects.analytics.sections.behavior}</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <TrendCard
            title={messages.projects.analytics.metrics.users.title}
            value={currentAnalytics?.users ?? 0}
            change={currentAnalytics?.usersChange ?? 0}
            changeTimeframe={messages.projects.analytics.metrics.comparison}
            trend={(currentAnalytics?.usersChange ?? 0) >= 0 ? "up" : "down"}
            format="numeric"
            tooltip={messages.projects.analytics.metrics.users.tooltip}
          />
          <TrendCard
            title={messages.projects.analytics.metrics.pageViews.title}
            value={currentAnalytics?.pageViews ?? 0}
            change={currentAnalytics?.pageViewsChange ?? 0}
            changeTimeframe={messages.projects.analytics.metrics.comparison}
            trend={(currentAnalytics?.pageViewsChange ?? 0) >= 0 ? "up" : "down"}
            format="numeric"
            tooltip={messages.projects.analytics.metrics.pageViews.tooltip}
          />
          <TrendCard
            title={messages.projects.analytics.metrics.sessionDuration.title}
            value={currentAnalytics?.avgSessionDuration ? Math.round(currentAnalytics.avgSessionDuration * 10) / 10 + ' s' : 0}
            change={currentAnalytics?.avgSessionDurationChange ?? 0}
            changeTimeframe={messages.projects.analytics.metrics.comparison}
            trend={(currentAnalytics?.avgSessionDurationChange ?? 0) >= 0 ? "up" : "down"}
            format="numeric"
            tooltip={messages.projects.analytics.metrics.sessionDuration.tooltip}
          />
          <TrendCard
            title={messages.projects.analytics.metrics.bounceRate.title}
            value={currentAnalytics?.bounceRate ? Math.round(currentAnalytics.bounceRate * 10) / 10 : 0}
            change={currentAnalytics?.bounceRateChange ?? 0}
            changeTimeframe={messages.projects.analytics.metrics.comparison}
            trend={(currentAnalytics?.bounceRateChange ?? 0) >= 0 ? "up" : "down"}
            invertColors={true}
            format="percentage"
            tooltip={messages.projects.analytics.metrics.bounceRate.tooltip}
          />
        </div>
      </div>

      {/* Search Performance */}
      {currentAnalytics?.gscData && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">{messages.projects.analytics.search.title}</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <TrendCard
              title={messages.projects.analytics.search.metrics.clicks.title}
              value={currentAnalytics.gscData.clicks}
              change={currentAnalytics.gscData.clicksChange}
              changeTimeframe={messages.projects.analytics.metrics.comparison}
              trend={currentAnalytics.gscData.clicksChange >= 0 ? "up" : "down"}
              format="numeric"
              tooltip={messages.projects.analytics.search.metrics.clicks.tooltip}
            />
            <TrendCard
              title={messages.projects.analytics.search.metrics.impressions.title}
              value={currentAnalytics.gscData.impressions}
              change={currentAnalytics.gscData.impressionsChange}
              changeTimeframe={messages.projects.analytics.metrics.comparison}
              trend={currentAnalytics.gscData.impressionsChange >= 0 ? "up" : "down"}
              format="numeric"
              tooltip={messages.projects.analytics.search.metrics.impressions.tooltip}
            />
            <TrendCard
              title={messages.projects.analytics.search.metrics.ctr.title}
              value={Math.round(currentAnalytics.gscData.ctr * 1000) / 10}
              change={currentAnalytics.gscData.ctrChange}
              changeTimeframe={messages.projects.analytics.metrics.comparison}
              trend={currentAnalytics.gscData.ctrChange >= 0 ? "up" : "down"}
              format="percentage"
              tooltip={messages.projects.analytics.search.metrics.ctr.tooltip}
            />
            <TrendCard
              title={messages.projects.analytics.search.metrics.position.title}
              value={Math.round(currentAnalytics.gscData.position * 10) / 10}
              change={currentAnalytics.gscData.positionChange
                ? Math.round((currentAnalytics.gscData.positionChange) * -100) / 100
                : 0
              }
              changeTimeframe={messages.projects.analytics.metrics.comparison}
              trend={currentAnalytics.gscData.positionChange <= 0 ? "up" : "down"}
              invertColors={true}
              format="numeric"
              valuePrefix="#"
              tooltip={messages.projects.analytics.search.metrics.position.tooltip}
            />
          </div>
        </div>
      )}

      {/* Top Pages */}
      <Card className="p-6 bg-white">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{messages.projects.analytics.sections.topPages.title}</h2>
        <div className="space-y-4">
          {currentAnalytics?.topPages && currentAnalytics.topPages.length > 0 ? (
            currentAnalytics.topPages.map((page: PageAnalytics, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {page.path}
                  </p>
                  <p className="text-sm text-gray-500">
                    {page.pageViews} {messages.projects.analytics.sections.topPages.views}
                  </p>
                </div>
                <div className="ml-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    page.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {page.change >= 0 ? '+' : ''}{Math.round(page.change)}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">{messages.projects.analytics.sections.topPages.noData}</p>
          )}
        </div>
      </Card>

      {/* Traffic Sources */}
      <Card className="p-6 bg-white">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{messages.projects.analytics.sections.trafficSources.title}</h2>
        <div className="space-y-4">
          {currentAnalytics?.trafficSources && currentAnalytics.trafficSources.length > 0 ? (
            currentAnalytics.trafficSources.map((source: TrafficSource, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {source.source}
                  </p>
                  <p className="text-sm text-gray-500">
                    {source.users} {messages.projects.analytics.sections.trafficSources.users}
                  </p>
                </div>
                <div className="ml-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    source.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {source.change >= 0 ? '+' : ''}{Math.round(source.change)}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">{messages.projects.analytics.sections.trafficSources.noData}</p>
          )}
        </div>
      </Card>
    </div>
  );
}
