"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface SourceComparisonChartProps {
  projectId: Id<"projects">;
  daysBack?: number;
}

// Source type colors
const SOURCE_COLORS: Record<string, string> = {
  reddit: "#ff4500",
  hackernews: "#ff6600",
  stackexchange: "#1e88e5",
  discourse: "#27ae60",
  rss: "#9b59b6",
};

export function SourceComparisonChart({ projectId, daysBack = 30 }: SourceComparisonChartProps) {
  const sourceStats = useQuery(api.insights.getSourceStats, {
    projectId,
    daysBack,
  });

  if (sourceStats === undefined) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (sourceStats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-2">
        <p>No source data available.</p>
        <p className="text-sm">Add sources in the Sources tab to start tracking.</p>
      </div>
    );
  }

  // Take top 8 sources
  const topSources = sourceStats.slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topSources}
            layout="vertical"
            margin={{ left: 0, right: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 10 }}
              tickFormatter={(value) =>
                value.length > 12 ? value.substring(0, 12) + "..." : value
              }
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      Type: {item.type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Insights: {item.insightCount}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Avg Sentiment: {item.avgSentiment.toFixed(2)}
                    </p>
                    <div className="flex gap-2 text-xs mt-1">
                      <span className="text-green-500">
                        +{item.sentimentCounts.positive}
                      </span>
                      <span className="text-gray-500">
                        {item.sentimentCounts.neutral}
                      </span>
                      <span className="text-red-500">
                        -{item.sentimentCounts.negative}
                      </span>
                    </div>
                    <div className="text-xs mt-1 text-muted-foreground">
                      High priority: {item.actionabilityCounts.high}
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="insightCount" radius={[0, 4, 4, 0]}>
              {topSources.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={SOURCE_COLORS[entry.type] || "#64748b"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Source Type Legend */}
      <div className="flex flex-wrap gap-2">
        {Array.from(new Set(topSources.map((s) => s.type))).map((type) => (
          <Badge
            key={type}
            variant="outline"
            className="capitalize"
            style={{ borderColor: SOURCE_COLORS[type] || "#64748b" }}
          >
            <span
              className="w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: SOURCE_COLORS[type] || "#64748b" }}
            />
            {type}
          </Badge>
        ))}
      </div>
    </div>
  );
}
