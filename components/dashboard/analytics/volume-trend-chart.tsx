"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";

interface VolumeTrendChartProps {
  projectId: Id<"projects">;
  daysBack?: number;
}

export function VolumeTrendChart({ projectId, daysBack = 30 }: VolumeTrendChartProps) {
  const volumeData = useQuery(api.insights.getVolumeTrend, {
    projectId,
    daysBack,
  });

  if (volumeData === undefined) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (volumeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No data available yet. Insights will appear here once analyzed.
      </div>
    );
  }

  const totalVolume = volumeData.reduce((sum, d) => sum + d.count, 0);
  const avgDaily = (totalVolume / volumeData.length).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Total: </span>
          <span className="font-medium">{totalVolume}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Avg/day: </span>
          <span className="font-medium">{avgDaily}</span>
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={volumeData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
              className="text-xs"
              tick={{ fontSize: 11 }}
            />
            <YAxis className="text-xs" tick={{ fontSize: 11 }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">
                      Count: {payload[0]?.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      7-day avg: {payload[1]?.value}
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              fill="hsl(var(--primary) / 0.2)"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Daily Count"
            />
            <Line
              type="monotone"
              dataKey="movingAvg"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="7-day Moving Avg"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
