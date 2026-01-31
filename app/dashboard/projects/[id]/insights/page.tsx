"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/dashboard/header";
import { InsightsFeed } from "@/components/dashboard/insights-feed";
import { StatsCards, TopThemesCard, TopEntitiesCard } from "@/components/dashboard/stats-cards";
import { SentimentTrendChart, SentimentDistributionChart } from "@/components/dashboard/sentiment-chart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, RefreshCw, Square, Loader2 } from "lucide-react";
import { ExportButton } from "@/components/dashboard/export-button";
import { useToast } from "@/hooks/use-toast";

export default function InsightsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const projectId = id as Id<"projects">;

  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [relevanceFilter, setRelevanceFilter] = useState<string>("all");
  const [competitorFilter, setCompetitorFilter] = useState<string>("all");
  const [daysBack, setDaysBack] = useState(30);

  const { toast } = useToast();
  
  const project = useQuery(api.projects.get, { id: projectId });
  const insights = useQuery(api.insights.listByProject, {
    projectId,
    limit: 50,
    sentimentFilter:
      sentimentFilter === "all"
        ? undefined
        : (sentimentFilter as "positive" | "negative" | "neutral"),
    minRelevance:
      relevanceFilter === "all"
        ? undefined
        : parseFloat(relevanceFilter),
    competitorFilter:
      competitorFilter === "all"
        ? undefined
        : competitorFilter,
  });

  const triggerFetchProject = useAction(api.feeds.fetch.triggerFetchProject);
  const triggerAnalysis = useAction(api.analysis.gemini.triggerBatchAnalysis);
  const requestStopFetch = useMutation(api.projects.requestStopFetch);

  const [isFetching, setIsFetching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  // Server-side fetch status
  const serverFetchStatus = project?.fetchStatus || "idle";
  const isServerFetching = serverFetchStatus === "fetching";
  const isServerStopping = serverFetchStatus === "stopping";

  const handleFetch = async () => {
    // Warn if already fetching
    if (isServerFetching) {
      toast({
        title: "Fetch in progress",
        description: "A fetch is already running. Please wait or stop it first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsFetching(true);
    try {
      const result = await triggerFetchProject({ projectId });
      if (result.stopped) {
        toast({
          title: "Fetch stopped",
          description: `Stopped after fetching ${result.successful}/${result.total} sources. ${result.itemsAdded} new items.`,
        });
      } else {
        toast({
          title: "Fetch complete",
          description: `Fetched ${result.successful}/${result.total} sources. ${result.itemsAdded} new items.`,
        });
      }
    } catch (error) {
      toast({
        title: "Fetch failed",
        description: "An error occurred while fetching feeds.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
      setIsStopping(false);
    }
  };

  const handleStopFetch = async () => {
    setIsStopping(true);
    try {
      const result = await requestStopFetch({ id: projectId });
      if (result.success) {
        toast({
          title: "Stop requested",
          description: "Fetch will stop after current source completes.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop fetching.",
        variant: "destructive",
      });
      setIsStopping(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await triggerAnalysis();
      toast({
        title: "Analysis complete",
        description: `Analyzed ${result.successful} items. ${result.skipped} skipped (low relevance).`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "An error occurred during analysis.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

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
      <Header title="Insights" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Insights for {project?.name}
            </h2>
            <p className="text-muted-foreground">
              AI-analyzed feedback from your RSS sources
            </p>
          </div>
          <div className="flex gap-2">
            <ExportButton projectId={projectId} projectName={project?.name || "project"} />
            {(isFetching || isServerFetching) && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleStopFetch}
                disabled={isStopping || isServerStopping}
              >
                {isStopping || isServerStopping ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Square className="mr-2 h-4 w-4" />
                )}
                {isStopping || isServerStopping ? "Stopping..." : "Stop"}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleFetch}
              disabled={isFetching || isServerFetching}
            >
              {isFetching || isServerFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {isFetching || isServerFetching ? "Fetching..." : "Fetch Feeds"}
            </Button>
            <Button
              variant="outline"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              {isAnalyzing ? "Analyzing..." : "Analyze Now"}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <StatsCards projectId={projectId} daysBack={daysBack} />

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={sentimentFilter}
            onValueChange={setSentimentFilter}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiments</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={relevanceFilter}
            onValueChange={setRelevanceFilter}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Relevance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Relevance</SelectItem>
              <SelectItem value="0.7">High (70%+)</SelectItem>
              <SelectItem value="0.5">Medium (50%+)</SelectItem>
              <SelectItem value="0.3">Low (30%+)</SelectItem>
            </SelectContent>
          </Select>

          {project?.competitors && project.competitors.length > 0 && (
            <Select
              value={competitorFilter}
              onValueChange={setCompetitorFilter}
            >
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Competitor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Competitors</SelectItem>
                {project.competitors.map((competitor) => (
                  <SelectItem key={competitor} value={competitor}>
                    {competitor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={daysBack.toString()}
            onValueChange={(v) => setDaysBack(parseInt(v))}
          >
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="feed" className="space-y-4">
          <TabsList>
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="themes">Themes & Entities</TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="mt-4">
            {insights === undefined ? (
              <div className="space-y-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            ) : (
              <InsightsFeed insights={insights} />
            )}
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <SentimentTrendChart projectId={projectId} daysBack={daysBack} />
              <SentimentDistributionChart projectId={projectId} daysBack={daysBack} />
            </div>
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TopThemesCard projectId={projectId} daysBack={daysBack} />
              <TopEntitiesCard projectId={projectId} daysBack={daysBack} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
