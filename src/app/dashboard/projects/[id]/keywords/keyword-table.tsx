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
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface KeywordTableProps {
  keywords: KeywordData[];
  onKeywordDelete: (keywordId: string) => void;
  onSortChange?: (columnKey: string) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
}

export function KeywordTable({
  keywords,
  onKeywordDelete,
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
              Position {getSortIndicator("currentRank")}
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
            <TableRow key={keyword.keyword}>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 hover:text-indigo-900">
                {keyword.keyword}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                <Badge variant={getRankingBadgeVariant(keyword.currentRank).variant}>
                  {getRankingBadgeVariant(keyword.currentRank).label}
                </Badge>
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
