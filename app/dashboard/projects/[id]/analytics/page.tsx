"use client";

import { use, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { VolumeTrendChart } from "@/components/dashboard/analytics/volume-trend-chart";
import { CompetitorChart } from "@/components/dashboard/analytics/competitor-chart";
import { ThemeTrendsChart } from "@/components/dashboard/analytics/theme-trends-chart";
import { SourceComparisonChart } from "@/components/dashboard/analytics/source-comparison-chart";
import { ActionabilityChart } from "@/components/dashboard/analytics/actionability-chart";
import { BarChart3, TrendingUp, Users, Layers, Target } from "lucide-react";

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const projectId = id as Id<"projects">;

  const [daysBack, setDaysBack] = useState(30);

  const project = useQuery(api.projects.get, { id: projectId });

  if (project === undefined) {
    return (
      <div className="flex flex-col h-full w-full">
        <Header title="Loading..." />
        <div className="flex-1 p-6 overflow-auto">
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <Header title="Analytics" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Analytics for {project?.name}
            </h2>
            <p className="text-muted-foreground">
              Deep insights and trends from your feedback data
            </p>
          </div>
          <div className="flex gap-2">
            <Select
              value={daysBack.toString()}
              onValueChange={(v) => setDaysBack(parseInt(v))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Volume Trends */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base font-medium">
                  <TrendingUp className="inline-block mr-2 h-4 w-4" />
                  Feedback Volume
                </CardTitle>
                <CardDescription>
                  Daily insight counts with 7-day moving average
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <VolumeTrendChart projectId={projectId} daysBack={daysBack} />
            </CardContent>
          </Card>

          {/* Actionability Distribution */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base font-medium">
                  <Target className="inline-block mr-2 h-4 w-4" />
                  Actionability Distribution
                </CardTitle>
                <CardDescription>
                  Priority breakdown of feedback items
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ActionabilityChart projectId={projectId} daysBack={daysBack} />
            </CardContent>
          </Card>

          {/* Theme Trends */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base font-medium">
                  <Layers className="inline-block mr-2 h-4 w-4" />
                  Theme Trends
                </CardTitle>
                <CardDescription>
                  How discussion topics evolve over time
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ThemeTrendsChart projectId={projectId} daysBack={daysBack} />
            </CardContent>
          </Card>

          {/* Competitor Analysis */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base font-medium">
                  <Users className="inline-block mr-2 h-4 w-4" />
                  Competitor Mentions
                </CardTitle>
                <CardDescription>
                  Mentions and sentiment analysis
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <CompetitorChart projectId={projectId} daysBack={daysBack} />
            </CardContent>
          </Card>

          {/* Source Performance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base font-medium">
                  <BarChart3 className="inline-block mr-2 h-4 w-4" />
                  Source Performance
                </CardTitle>
                <CardDescription>
                  Insights by data source
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <SourceComparisonChart projectId={projectId} daysBack={daysBack} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
