"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { KeywordData } from "./types";
import { useToast } from "@/components/ui/use-toast";
import { AddKeywordsDialog } from "./add-keywords-dialog";
import { KeywordTable } from "./keyword-table";

interface KeywordMetrics {
  totalKeywords: number;
  averagePosition: number;
  rankedKeywords: number;
  top10Keywords: number;
}

interface KeywordsOverviewProps {
  projectId: string;
  initialKeywords: KeywordData[];
}

export function KeywordsOverview({ projectId, initialKeywords }: KeywordsOverviewProps) {
  const [keywords, setKeywords] = useState<KeywordData[]>(initialKeywords);
  const [metrics, setMetrics] = useState<KeywordMetrics>({
    totalKeywords: 0,
    averagePosition: 0,
    rankedKeywords: 0,
    top10Keywords: 0,
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>("position");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();

  const handleKeywordRecheck = async (keywordId: string) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/keywords/${keywordId}/check-ranking`,
        { method: "POST" }
      );

      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
        return;
      }

      const { rank } = await response.json();
      
      setKeywords(prevKeywords => prevKeywords.map(k => 
        k.id === keywordId 
          ? { 
              ...k, 
              currentRank: rank,
              bestRank: !k.bestRank || rank < k.bestRank ? rank : k.bestRank,
              lastChecked: new Date()
            } 
          : k
      ));

      toast({
        description: "Keyword ranking updated successfully",
      });
    } catch (error) {
      console.error('Failed to recheck keyword:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update keyword ranking. Please try again.",
      });
    }
  };

  const handleApiError = async (response: globalThis.Response): Promise<string> => {
    let errorMessage = "An error occurred";
    const responseClone = response.clone();
    
    try {
      const errorJson = await response.json();
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      const errorText = await responseClone.text();
      if (errorText) errorMessage = errorText;
    }
    return errorMessage;
  };

  useEffect(() => {
    calculateMetrics(keywords);
  }, [keywords]);

  const calculateMetrics = (keywordData: KeywordData[]) => {
    const rankedKeywords = keywordData.filter(k => k.currentRank !== null);
    const positions = rankedKeywords.map(k => k.currentRank || 0);
    const top10 = rankedKeywords.filter(k => (k.currentRank || 0) <= 10);

    setMetrics({
      totalKeywords: keywordData.length,
      averagePosition: positions.length ? 
        Math.round(positions.reduce((a, b) => a + b, 0) / positions.length) : 0,
      rankedKeywords: rankedKeywords.length,
      top10Keywords: top10.length,
    });
  };

  const handleAddKeywords = async (newKeywords: KeywordData[]) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: newKeywords }),
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
        return;
      }

      const addedKeywords: KeywordData[] = await response.json();
      setKeywords([...keywords, ...addedKeywords]);
      
      toast({
        description: `Successfully added ${addedKeywords.length} keywords`,
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to add keywords:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add keywords. Please try again.",
      });
    }
  };

  const handleKeywordDelete = async (keywordId: string) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/keywords/${keywordId}`,
        { 
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
        return;
      }

      setKeywords(keywords.filter(k => k.id !== keywordId));
      toast({
        description: "Keyword deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete keyword:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete keyword. Please try again.",
      });
    }
  };

  const handleSort = (columnKey: string) => {
    const isAsc = sortColumn === columnKey && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortColumn(columnKey);

    const sortedKeywords = [...keywords].sort((a, b) => {
      const aValue = a[columnKey as keyof KeywordData] ?? null;
      const bValue = b[columnKey as keyof KeywordData] ?? null;

      // Handle null/undefined values
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      // Safe comparison after null checks
      if (aValue < bValue) return isAsc ? 1 : -1;
      if (aValue > bValue) return isAsc ? -1 : 1;
      return 0;
    });

    setKeywords(sortedKeywords);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500">
              Total Keywords
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.totalKeywords}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5">
            <dt className="text-sm font-medium text-gray-500">
              Average Position
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.averagePosition || "-"}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5">
            <dt className="text-sm font-medium text-gray-500">
              Ranked Keywords
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.rankedKeywords}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5">
            <dt className="text-sm font-medium text-gray-500">
              Top 10 Rankings
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.top10Keywords}
            </dd>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="bg-white shadow-sm rounded-lg px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Keywords</h1>
            <p className="mt-2 text-sm text-gray-700">
              Track and monitor your keyword rankings
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Add Keywords
            </Button>
          </div>
        </div>
      </div>

      {/* Keywords Table */}
      <div className="bg-white shadow-sm rounded-lg">
        <KeywordTable 
          keywords={keywords}
          onKeywordDelete={handleKeywordDelete}
          onKeywordRecheck={handleKeywordRecheck}
          onSortChange={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
        />
      </div>

      {/* Add Keywords Dialog */}
      {isAddDialogOpen && (
        <AddKeywordsDialog
          open={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={handleAddKeywords}
        />
      )}
    </div>
  );
}
