"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ThemeTrendsChartProps {
  projectId: Id<"projects">;
  daysBack?: number;
}

// Color palette for themes
const THEME_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
];

export function ThemeTrendsChart({ projectId, daysBack = 30 }: ThemeTrendsChartProps) {
  const data = useQuery(api.insights.getThemeTrends, {
    projectId,
    daysBack,
    topN: 5,
  });

  if (data === undefined) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (data.topThemes.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-muted-foreground">
        No theme data available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Theme Trends Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.trends}>
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
                    {payload.map((entry) => (
                      <p
                        key={entry.name}
                        className="text-sm capitalize"
                        style={{ color: entry.color }}
                      >
                        {entry.name}: {entry.value}
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-xs capitalize">{value}</span>
              )}
            />
            {data.topThemes.map((theme, index) => (
              <Line
                key={theme}
                type="monotone"
                dataKey={theme}
                stroke={THEME_COLORS[index % THEME_COLORS.length]}
                strokeWidth={2}
                dot={false}
                name={theme}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Theme Growth Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {data.themeGrowth.map((item, index) => (
          <div
            key={item.theme}
            className="p-2 rounded-lg border bg-muted/50 text-sm"
          >
            <div className="flex items-center gap-1 capitalize font-medium truncate">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: THEME_COLORS[index % THEME_COLORS.length] }}
              />
              {item.theme}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {item.growth > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : item.growth < 0 ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : null}
              <span
                className={
                  item.growth > 0
                    ? "text-green-500"
                    : item.growth < 0
                    ? "text-red-500"
                    : ""
                }
              >
                {item.growth > 0 ? "+" : ""}
                {item.growth}%
              </span>
              <span>vs prev week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Emerging Themes */}
      {data.emergingThemes.length > 0 && (
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Emerging Themes (new this week)
          </div>
          <div className="flex flex-wrap gap-2">
            {data.emergingThemes.map((item) => (
              <Badge key={item.theme} variant="outline" className="capitalize">
                {item.theme} ({item.count})
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
