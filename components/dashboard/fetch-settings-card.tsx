"use client";

import { useState } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import { RefreshCw, Clock, Loader2, CheckCircle, AlertTriangle, Square } from "lucide-react";

interface FetchSettingsCardProps {
  projectId: Id<"projects">;
  currentInterval?: number;
}

const FETCH_INTERVALS = [
  { value: "0", label: "Manual only", description: "Only fetch when you click the button" },
  { value: "360", label: "Every 6 hours", description: "4 times per day" },
  { value: "720", label: "Every 12 hours", description: "Twice per day" },
  { value: "1440", label: "Every 24 hours", description: "Once per day" },
];

export function FetchSettingsCard({ projectId, currentInterval = 360 }: FetchSettingsCardProps) {
  const { toast } = useToast();
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [fetchResult, setFetchResult] = useState<{ success: boolean; itemsAdded: number; stopped?: boolean } | null>(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [fetchStartTime, setFetchStartTime] = useState<number | null>(null);

  const updateFetchInterval = useMutation(api.projects.updateFetchInterval);
  const triggerFetchProject = useAction(api.feeds.fetch.triggerFetchProject);
  const requestStopFetch = useMutation(api.projects.requestStopFetch);

  // Get project to check fetch status
  const project = useQuery(api.projects.get, { id: projectId });
  
  // Get sources for this project to show last fetch times
  const sources = useQuery(api.sources.listByProject, { projectId });
  
  // Server-side fetch status
  const serverFetchStatus = project?.fetchStatus || "idle";
  const isServerFetching = serverFetchStatus === "fetching";
  const isServerStopping = serverFetchStatus === "stopping";

  const handleIntervalChange = async (value: string) => {
    setIsSaving(true);
    try {
      await updateFetchInterval({
        id: projectId,
        fetchInterval: parseInt(value, 10),
      });
      toast({
        title: "Settings saved",
        description: value === "0" 
          ? "Automatic fetching disabled. Use manual fetch." 
          : `Feeds will now be fetched ${FETCH_INTERVALS.find(i => i.value === value)?.label.toLowerCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update fetch interval.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Check if a fetch is likely still in progress (started less than 2 minutes ago)
  const isFetchLikelyInProgress = () => {
    if (fetchStartTime) {
      const elapsed = Date.now() - fetchStartTime;
      return elapsed < 2 * 60 * 1000; // 2 minutes
    }
    return false;
  };

  const handleFetchNowClick = () => {
    if (isFetchLikelyInProgress() || isServerFetching) {
      setShowWarningDialog(true);
    } else {
      executeFetch();
    }
  };

  const executeFetch = async () => {
    setIsFetching(true);
    setFetchResult(null);
    setFetchStartTime(Date.now());
    try {
      const result = await triggerFetchProject({ projectId });
      setFetchResult({ success: true, itemsAdded: result.itemsAdded, stopped: result.stopped });
      
      if (result.stopped) {
        toast({
          title: "Fetch stopped",
          description: `Stopped after fetching ${result.successful}/${result.total} sources. ${result.itemsAdded} new items found.`,
        });
      } else {
        toast({
          title: "Fetch complete",
          description: `Fetched ${result.successful}/${result.total} sources. ${result.itemsAdded} new items found.`,
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
      setFetchStartTime(null);
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
          description: "The fetch will stop after the current source completes.",
        });
      } else {
        toast({
          title: "Cannot stop",
          description: result.message,
          variant: "destructive",
        });
        setIsStopping(false);
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

  // Format last fetch time
  const formatLastFetch = (timestamp?: number) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  // Get oldest and newest fetch times
  const fetchTimes = sources
    ?.map((s) => s.lastFetched)
    .filter((t): t is number => t !== undefined)
    .sort((a, b) => b - a) || [];
  
  const mostRecent = fetchTimes[0];
  const oldest = fetchTimes[fetchTimes.length - 1];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Fetch Settings</CardTitle>
          </div>
          <div className="flex gap-2">
            {(isFetching || isServerFetching) && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleStopFetch}
                disabled={isStopping || isServerStopping}
                className="gap-2"
              >
                {isStopping || isServerStopping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                {isStopping || isServerStopping ? "Stopping..." : "Stop"}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleFetchNowClick}
              disabled={isFetching || isServerFetching || !sources?.length}
              className="gap-2"
            >
              {isFetching || isServerFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isFetching || isServerFetching ? "Fetching..." : "Fetch Now"}
            </Button>
          </div>
        </div>
        <CardDescription>
          Configure how often feeds are automatically fetched for this project.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fetch Interval Selector */}
        <div className="space-y-2">
          <Label>Automatic Fetch Interval</Label>
          <Select
            value={currentInterval.toString()}
            onValueChange={handleIntervalChange}
            disabled={isSaving}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FETCH_INTERVALS.map((interval) => (
                <SelectItem key={interval.value} value={interval.value}>
                  <div className="flex flex-col">
                    <span>{interval.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {interval.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fetch Status */}
        {sources && sources.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-sm text-muted-foreground">Fetch Status</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {sources.length} source{sources.length !== 1 ? "s" : ""}
              </Badge>
              {mostRecent && (
                <Badge variant="secondary" className="text-xs">
                  Last fetch: {formatLastFetch(mostRecent)}
                </Badge>
              )}
              {oldest && oldest !== mostRecent && (
                <Badge variant="outline" className="text-xs">
                  Oldest: {formatLastFetch(oldest)}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Fetch Result */}
        {fetchResult && (
          <div className={`flex items-center gap-2 p-2 rounded-md ${
            fetchResult.stopped 
              ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
              : "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
          }`}>
            {fetchResult.stopped ? (
              <Square className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <span className="text-sm">
              {fetchResult.stopped ? "Stopped - " : ""}
              {fetchResult.itemsAdded} new item{fetchResult.itemsAdded !== 1 ? "s" : ""} fetched
            </span>
          </div>
        )}

        {/* No sources message */}
        {sources && sources.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No sources configured. Add sources to start fetching feeds.
          </p>
        )}

        {/* In Progress Warning */}
        {(isFetching || isServerFetching) && (
          <div className={`flex items-center gap-2 p-2 rounded-md ${
            isStopping || isServerStopping
              ? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
              : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
          }`}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">
              {isStopping || isServerStopping 
                ? "Stopping... Will finish after current source completes."
                : "Fetching in progress... This may take a few minutes."
              }
            </span>
          </div>
        )}
      </CardContent>

      {/* Warning Dialog */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Fetch Already in Progress
            </AlertDialogTitle>
            <AlertDialogDescription>
              A fetch operation was recently started and may still be running. 
              Starting another fetch now could cause duplicate requests or rate limiting issues.
              <br /><br />
              Are you sure you want to start a new fetch?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowWarningDialog(false);
                executeFetch();
              }}
            >
              Fetch Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
