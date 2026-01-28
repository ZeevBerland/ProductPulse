"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  insightsToCSV,
  downloadCSV,
  formatDateForExport,
  InsightExport,
} from "@/lib/export";

interface ExportButtonProps {
  projectId: Id<"projects">;
  projectName: string;
}

export function ExportButton({ projectId, projectName }: ExportButtonProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // Get all insights for export (no limit)
  const insights = useQuery(api.insights.listByProject, {
    projectId,
  });

  const handleExport = async () => {
    if (!insights || insights.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no insights to export for this project.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Transform insights for export
      const exportData: InsightExport[] = insights.map((insight) => ({
        title: insight.feedItemTitle,
        url: insight.feedItemUrl,
        publishedAt: formatDateForExport(insight.feedItemPublishedAt),
        analyzedAt: formatDateForExport(insight.analyzedAt),
        sentimentScore: insight.sentimentScore,
        sentimentLabel: insight.sentimentLabel,
        actionability: insight.actionability,
        summary: insight.summary,
        themes: insight.themes.join("; "),
        entities: insight.entities.join("; "),
      }));

      const csv = insightsToCSV(exportData);
      const filename = `${projectName.toLowerCase().replace(/\s+/g, "-")}-insights-${
        new Date().toISOString().split("T")[0]
      }.csv`;

      downloadCSV(csv, filename);

      toast({
        title: "Export successful",
        description: `Exported ${insights.length} insights to ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "An error occurred while exporting data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleExport}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
