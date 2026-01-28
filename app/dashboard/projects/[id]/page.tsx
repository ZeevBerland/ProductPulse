"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Rss,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const project = useQuery(api.projects.getWithStats, {
    id: id as Id<"projects">,
  });
  const sources = useQuery(api.sources.listByProject, {
    projectId: id as Id<"projects">,
  });
  const insights = useQuery(api.insights.listByProject, {
    projectId: id as Id<"projects">,
    limit: 5,
  });

  if (project === undefined) {
    return (
      <div className="flex flex-col h-full w-full">
        <Header title="Loading..." />
        <div className="flex-1 p-6 space-y-6 overflow-auto">
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="flex flex-col h-full w-full">
        <Header title="Project Not Found" />
        <div className="flex-1 p-6 overflow-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Project not found</h3>
              <p className="text-muted-foreground mb-4">
                The project you&apos;re looking for doesn&apos;t exist or has been deleted.
              </p>
              <Link href="/dashboard/projects">
                <Button>Back to Projects</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const sentimentIcon =
    project.stats.avgSentiment >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );

  return (
    <div className="flex flex-col h-full w-full">
      <Header title={project.name} />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Project Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{project.name}</CardTitle>
                <CardDescription className="mt-1">
                  {project.description || "No description"}
                </CardDescription>
              </div>
              <Link href={`/dashboard/projects/${id}/settings`}>
                <Button variant="outline" size="sm">
                  Edit Project
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Tracking Keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {project.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
              <Rss className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.stats.activeSourcesCount}
              </div>
              <p className="text-xs text-muted-foreground">
                of {project.stats.sourcesCount} total sources
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.stats.insightsCount}</div>
              <p className="text-xs text-muted-foreground">
                AI-analyzed feedback items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Sentiment</CardTitle>
              {sentimentIcon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.stats.insightsCount > 0
                  ? project.stats.avgSentiment.toFixed(2)
                  : "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                Scale: -1 (negative) to 1 (positive)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sentiment Split</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 text-sm">
                <span className="text-green-600">
                  +{project.stats.sentimentCounts.positive}
                </span>
                <span className="text-gray-500">
                  {project.stats.sentimentCounts.neutral}
                </span>
                <span className="text-red-600">
                  -{project.stats.sentimentCounts.negative}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Positive / Neutral / Negative
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Sources Quick View */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Sources</CardTitle>
                <Link href={`/dashboard/projects/${id}/sources`}>
                  <Button variant="ghost" size="sm">
                    Manage
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {sources === undefined ? (
                <Skeleton className="h-32" />
              ) : sources.length === 0 ? (
                <div className="text-center py-6">
                  <Rss className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-3">No sources configured</p>
                  <Link href={`/dashboard/projects/${id}/sources`}>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Source
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {sources.slice(0, 4).map((source) => (
                    <div
                      key={source._id}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {source.type}
                        </Badge>
                        <span className="text-sm font-medium">{source.name}</span>
                      </div>
                      <Badge variant={source.active ? "default" : "secondary"}>
                        {source.active ? "Active" : "Paused"}
                      </Badge>
                    </div>
                  ))}
                  {sources.length > 4 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      +{sources.length - 4} more sources
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Insights Quick View */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Insights</CardTitle>
                <Link href={`/dashboard/projects/${id}/insights`}>
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {insights === undefined ? (
                <Skeleton className="h-32" />
              ) : insights.length === 0 ? (
                <div className="text-center py-6">
                  <Lightbulb className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No insights yet. Add sources and fetch feeds to generate insights.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {insights.map((insight) => (
                    <div key={insight._id} className="p-3 rounded-lg border">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium line-clamp-1">
                          {insight.feedItemTitle}
                        </p>
                        <Badge
                          variant={
                            insight.sentimentLabel === "positive"
                              ? "success"
                              : insight.sentimentLabel === "negative"
                              ? "destructive"
                              : "secondary"
                          }
                          className="shrink-0"
                        >
                          {insight.sentimentLabel}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {insight.summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
