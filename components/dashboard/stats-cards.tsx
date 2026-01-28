"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Hash,
  MessageSquare,
} from "lucide-react";

interface StatsCardsProps {
  projectId: Id<"projects">;
  daysBack?: number;
}

export function StatsCards({ projectId, daysBack = 30 }: StatsCardsProps) {
  const stats = useQuery(api.insights.getStats, { projectId, daysBack });

  if (stats === undefined) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const sentimentTrend =
    stats.avgSentiment >= 0.2
      ? { icon: TrendingUp, color: "text-green-500", label: "Positive" }
      : stats.avgSentiment <= -0.2
      ? { icon: TrendingDown, color: "text-red-500", label: "Negative" }
      : { icon: null, color: "text-gray-500", label: "Neutral" };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Insights */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
          <Lightbulb className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalInsights}</div>
          <p className="text-xs text-muted-foreground">
            Last {daysBack} days
          </p>
        </CardContent>
      </Card>

      {/* Average Sentiment */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Sentiment</CardTitle>
          {sentimentTrend.icon && (
            <sentimentTrend.icon className={`h-4 w-4 ${sentimentTrend.color}`} />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalInsights > 0 ? stats.avgSentiment.toFixed(2) : "-"}
          </div>
          <p className={`text-xs ${sentimentTrend.color}`}>
            {stats.totalInsights > 0 ? sentimentTrend.label : "No data"}
          </p>
        </CardContent>
      </Card>

      {/* High Actionability */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.highActionability}</div>
          <p className="text-xs text-muted-foreground">
            Items needing attention
          </p>
        </CardContent>
      </Card>

      {/* Sentiment Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sentiment Split</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 text-sm font-medium">
            <span className="text-green-600">+{stats.sentimentCounts.positive}</span>
            <span className="text-gray-500">{stats.sentimentCounts.neutral}</span>
            <span className="text-red-600">-{stats.sentimentCounts.negative}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pos / Neutral / Neg
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function TopThemesCard({ projectId, daysBack = 30 }: StatsCardsProps) {
  const stats = useQuery(api.insights.getStats, { projectId, daysBack });

  if (stats === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Top Themes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stats.topThemes.length === 0 ? (
          <p className="text-muted-foreground text-sm">No themes identified yet.</p>
        ) : (
          <div className="space-y-2">
            {stats.topThemes.map(([theme, count]) => (
              <div key={theme} className="flex items-center justify-between">
                <Badge variant="outline">{theme}</Badge>
                <span className="text-sm text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TopEntitiesCard({ projectId, daysBack = 30 }: StatsCardsProps) {
  const stats = useQuery(api.insights.getStats, { projectId, daysBack });

  if (stats === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Mentions</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Top Mentions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stats.topEntities.length === 0 ? (
          <p className="text-muted-foreground text-sm">No entities identified yet.</p>
        ) : (
          <div className="space-y-2">
            {stats.topEntities.map(([entity, count]) => (
              <div key={entity} className="flex items-center justify-between">
                <span className="text-sm font-medium truncate max-w-[180px]">
                  {entity}
                </span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
