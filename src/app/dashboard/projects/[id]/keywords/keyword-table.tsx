"use client";

import { KeywordData } from "./types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatNumber, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

export interface KeywordTableProps {
  keywords: KeywordData[];
  onKeywordDelete: (keywordId: string) => void;
  onKeywordRecheck: (keywordId: string) => Promise<void>;
  onSortChange?: (columnKey: string) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
}

export function KeywordTable({
  keywords,
  onKeywordDelete,
  onKeywordRecheck,
  onSortChange,
  sortColumn,
  sortDirection,
}: KeywordTableProps) {
  const handleSort = (columnKey: string) => {
    if (onSortChange) {
      onSortChange(columnKey);
    }
  };

  const getSortIndicator = (columnKey: string) => {
    if (columnKey !== sortColumn) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getRankingBadgeVariant = (rank: number | null): {
    variant: "default" | "success" | "warning" | "error";
    label: string;
  } => {
    if (!rank) return { variant: "default", label: "Not ranked" };
    if (rank <= 3) return { variant: "success", label: `#${rank}` };
    if (rank <= 10) return { variant: "warning", label: `#${rank}` };
    return { variant: "error", label: `#${rank}` };
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead onClick={() => handleSort("keyword")} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
              Keyword {getSortIndicator("keyword")}
            </TableHead>
            <TableHead onClick={() => handleSort("currentRank")} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
              Current Position {getSortIndicator("currentRank")}
            </TableHead>
            <TableHead onClick={() => handleSort("bestRank")} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
              Best Position {getSortIndicator("bestRank")}
            </TableHead>
            <TableHead onClick={() => handleSort("lastChecked")} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
              Last Checked {getSortIndicator("lastChecked")}
            </TableHead>
            <TableHead onClick={() => handleSort("searchVolume")} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
              Volume {getSortIndicator("searchVolume")}
            </TableHead>
            <TableHead onClick={() => handleSort("intent")} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
              Intent {getSortIndicator("intent")}
            </TableHead>
            <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keywords.map((keyword) => (
            <TableRow key={keyword.id}>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 hover:text-indigo-900">
                {keyword.keyword.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                <Badge variant={getRankingBadgeVariant(keyword.currentRank).variant}>
                  {getRankingBadgeVariant(keyword.currentRank).label}
                </Badge>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                <Badge variant={getRankingBadgeVariant(keyword.bestRank ?? null).variant}>
                  {getRankingBadgeVariant(keyword.bestRank ?? null).label}
                </Badge>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {keyword.lastChecked ? formatDate(keyword.lastChecked) : 'Never'}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatNumber(keyword.searchVolume)}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                {keyword.intent.toLowerCase()}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center space-x-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onKeywordRecheck(keyword.id)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-900"
                    onClick={() => onKeywordDelete(keyword.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
