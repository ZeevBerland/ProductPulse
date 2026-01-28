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

interface CompetitorChartProps {
  projectId: Id<"projects">;
  daysBack?: number;
}

export function CompetitorChart({ projectId, daysBack = 30 }: CompetitorChartProps) {
  const data = useQuery(api.insights.getCompetitorMentions, {
    projectId,
    daysBack,
  });

  if (data === undefined) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (data.competitors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-2">
        <p>No competitor mentions found.</p>
        <p className="text-sm">Add competitors in Settings to track them.</p>
      </div>
    );
  }

  // Color based on sentiment
  const getBarColor = (sentiment: number) => {
    if (sentiment > 0.2) return "#22c55e"; // green
    if (sentiment < -0.2) return "#ef4444"; // red
    return "#94a3b8"; // gray
  };

  return (
    <div className="space-y-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.competitors}
            layout="vertical"
            margin={{ left: 0, right: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <p className="text-sm font-medium capitalize">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Mentions: {item.mentions}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Avg Sentiment: {item.avgSentiment.toFixed(2)}
                    </p>
                    <div className="flex gap-2 text-xs mt-1">
                      <span className="text-green-500">+{item.positive}</span>
                      <span className="text-gray-500">{item.neutral}</span>
                      <span className="text-red-500">-{item.negative}</span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="mentions" radius={[0, 4, 4, 0]}>
              {data.competitors.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.avgSentiment)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sentiment Legend */}
      <div className="flex flex-wrap gap-2">
        {data.competitors.slice(0, 5).map((comp) => (
          <Badge
            key={comp.name}
            variant={
              comp.avgSentiment > 0.2
                ? "default"
                : comp.avgSentiment < -0.2
                ? "destructive"
                : "secondary"
            }
            className="capitalize"
          >
            {comp.name}: {comp.avgSentiment > 0 ? "+" : ""}
            {comp.avgSentiment.toFixed(2)}
          </Badge>
        ))}
      </div>
    </div>
  );
}
