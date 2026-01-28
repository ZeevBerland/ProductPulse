"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";

interface SentimentChartProps {
  projectId: Id<"projects">;
  daysBack?: number;
}

export function SentimentTrendChart({ projectId, daysBack = 30 }: SentimentChartProps) {
  const trend = useQuery(api.insights.getSentimentTrend, {
    projectId,
    daysBack,
  });

  if (trend === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Trend</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (trend.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Trend</CardTitle>
          <CardDescription>Last {daysBack} days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data available yet. Insights will appear here once analyzed.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Trend</CardTitle>
        <CardDescription>Average sentiment score over last {daysBack} days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
                className="text-xs"
              />
              <YAxis
                domain={[-1, 1]}
                tickFormatter={(value) => value.toFixed(1)}
                className="text-xs"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">
                        Avg: {payload[0].value?.toFixed(2)}
                      </p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="avg"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function SentimentDistributionChart({ projectId, daysBack = 30 }: SentimentChartProps) {
  const trend = useQuery(api.insights.getSentimentTrend, {
    projectId,
    daysBack,
  });

  if (trend === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (trend.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Distribution</CardTitle>
          <CardDescription>By day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data available yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Distribution</CardTitle>
        <CardDescription>Positive, neutral, and negative by day</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <p className="text-sm font-medium">{label}</p>
                      {payload.map((entry) => (
                        <p
                          key={entry.name}
                          className="text-sm"
                          style={{ color: entry.color }}
                        >
                          {entry.name}: {entry.value}
                        </p>
                      ))}
                    </div>
                  );
                }}
              />
              <Legend />
              <Bar dataKey="positive" stackId="a" fill="#22c55e" name="Positive" />
              <Bar dataKey="neutral" stackId="a" fill="#94a3b8" name="Neutral" />
              <Bar dataKey="negative" stackId="a" fill="#ef4444" name="Negative" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
