"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ActionabilityChartProps {
  projectId: Id<"projects">;
  daysBack?: number;
}

const ACTIONABILITY_COLORS = {
  high: "#ef4444", // red - needs attention
  medium: "#f59e0b", // amber
  low: "#22c55e", // green - no urgent action
};

export function ActionabilityChart({ projectId, daysBack = 30 }: ActionabilityChartProps) {
  const data = useQuery(api.insights.getActionabilityStats, {
    projectId,
    daysBack,
  });

  if (data === undefined) {
    return <Skeleton className="h-64 w-full" />;
  }

  const total = data.distribution.high + data.distribution.medium + data.distribution.low;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No actionability data available yet.
      </div>
    );
  }

  const pieData = [
    { name: "High Priority", value: data.distribution.high, key: "high" },
    { name: "Medium Priority", value: data.distribution.medium, key: "medium" },
    { name: "Low Priority", value: data.distribution.low, key: "low" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) =>
                `${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {pieData.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={ACTIONABILITY_COLORS[entry.key as keyof typeof ACTIONABILITY_COLORS]}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.value} items ({((item.value / total) * 100).toFixed(1)}%)
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              formatter={(value: string) => (
                <span className="text-xs">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* High Priority Themes */}
      {data.topHighPriorityThemes.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-sm font-medium mb-2">High-Priority Topics</p>
          <div className="flex flex-wrap gap-2">
            {data.topHighPriorityThemes.slice(0, 5).map((item) => (
              <Badge key={item.theme} variant="destructive" className="capitalize">
                {item.theme} ({item.count})
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
