'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KeywordData } from './types';
import { cn } from '@/lib/utils';
import { KeywordBrainstormSection } from '@/app/dashboard/projects/[id]/keywords/sections/keyword-brainstorm-section';
import { KeywordDataSection } from '@/app/dashboard/projects/[id]/keywords/sections/keyword-data-section';
import { KeywordAnalysisSection } from '@/app/dashboard/projects/[id]/keywords/sections/keyword-analysis-section';
import { KeywordSerpSection } from '@/app/dashboard/projects/[id]/keywords/sections/keyword-serp-section';
import { KeywordClusteringSection } from '@/app/dashboard/projects/[id]/keywords/sections/keyword-clustering-section';
import { KeywordContentSection } from '@/app/dashboard/projects/[id]/keywords/sections/keyword-content-section';
import { KeywordTrackingSection } from '@/app/dashboard/projects/[id]/keywords/sections/keyword-tracking-section';

interface KeywordWorkflowTabsProps {
  projectId: string;
  keywords: KeywordData[];
  onKeywordsChange: (keywords: KeywordData[]) => void;
}

const workflowSteps = [
  { id: 'brainstorm', name: 'Brainstorm & Seed', description: 'Generate and collect initial keywords' },
  { id: 'data', name: 'Data Collection', description: 'Import data from various sources' },
  { id: 'analysis', name: 'Analysis', description: 'Analyze volume and competition' },
  { id: 'serp', name: 'SERP Analysis', description: 'Study search results and competition' },
  { id: 'clustering', name: 'Intent & Clustering', description: 'Group and categorize keywords' },
  { id: 'content', name: 'Content Planning', description: 'Plan and optimize content' },
  { id: 'tracking', name: 'Tracking', description: 'Monitor performance over time' },
];

export function KeywordWorkflowTabs({
  projectId,
  keywords,
  onKeywordsChange,
}: KeywordWorkflowTabsProps) {
  return (
    <Tabs defaultValue="brainstorm" className="w-full">
      <TabsList className="w-full h-auto py-4 bg-white border-b">
        <div className="flex flex-wrap gap-4 px-2">
          {workflowSteps.map((step, index) => (
            <TabsTrigger
              key={step.id}
              value={step.id}
              className={cn(
                "relative min-w-[140px] h-auto rounded-lg px-4 py-2 text-sm transition-all",
                "border border-transparent",
                "data-[state=inactive]:bg-gray-50",
                "data-[state=inactive]:hover:bg-gray-100",
                "data-[state=inactive]:text-gray-700",
                "data-[state=active]:border-primary",
                "data-[state=active]:bg-primary-200",
                "data-[state=active]:text-purple-600",
              )}
            >
              <div className="flex items-start gap-2">
                <span className="font-bold min-w-[20px]">{index + 1}.</span>
                <div className="text-left">
                  <div className="font-medium">{step.name}</div>
                  <div className="text-xs opacity-80 font-normal">{step.description}</div>
                </div>
              </div>
            </TabsTrigger>
          ))}
        </div>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="brainstorm">
          <KeywordBrainstormSection
            projectId={projectId}
            keywords={keywords}
            onKeywordsAdd={(newKeywords) => {
              onKeywordsChange([...keywords, ...newKeywords]);
            }}
          />
        </TabsContent>

        <TabsContent value="data">
          <KeywordDataSection
            projectId={projectId}
            keywords={keywords}
            onKeywordsUpdate={onKeywordsChange}
          />
        </TabsContent>

        <TabsContent value="analysis">
          <KeywordAnalysisSection
            projectId={projectId}
            keywords={keywords}
            onKeywordsUpdate={onKeywordsChange}
          />
        </TabsContent>

        <TabsContent value="serp">
          <KeywordSerpSection
            projectId={projectId}
            keywords={keywords}
            onKeywordsUpdate={onKeywordsChange}
          />
        </TabsContent>

        <TabsContent value="clustering">
          <KeywordClusteringSection
            projectId={projectId}
            keywords={keywords}
            onKeywordsUpdate={onKeywordsChange}
          />
        </TabsContent>

        <TabsContent value="content">
          <KeywordContentSection
            projectId={projectId}
            keywords={keywords}
            onKeywordsUpdate={onKeywordsChange}
          />
        </TabsContent>

        <TabsContent value="tracking">
          <KeywordTrackingSection
            projectId={projectId}
            keywords={keywords}
            onKeywordsUpdate={onKeywordsChange}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}