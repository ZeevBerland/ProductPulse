"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface InsightsFeedProps {
  insights: Doc<"insights">[];
  showProjectName?: boolean;
}

const sentimentConfig = {
  positive: {
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    icon: TrendingUp,
    iconColor: "text-green-500",
  },
  negative: {
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    icon: TrendingDown,
    iconColor: "text-red-500",
  },
  neutral: {
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
    icon: Minus,
    iconColor: "text-gray-500",
  },
};

const actionabilityConfig = {
  high: "border-l-4 border-l-orange-500",
  medium: "border-l-4 border-l-blue-500",
  low: "border-l-4 border-l-gray-300",
};

export function InsightsFeed({ insights, showProjectName }: InsightsFeedProps) {
  if (insights.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No insights yet. Add sources and wait for feeds to be fetched and analyzed.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => {
        const sentiment = sentimentConfig[insight.sentimentLabel];
        const SentimentIcon = sentiment.icon;

        return (
          <Card
            key={insight._id}
            className={`${actionabilityConfig[insight.actionability]} transition-shadow hover:shadow-md`}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">
                      {insight.feedItemTitle}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(insight.feedItemPublishedAt, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={sentiment.color} variant="secondary">
                      <SentimentIcon className={`h-3 w-3 mr-1 ${sentiment.iconColor}`} />
                      {insight.sentimentLabel}
                    </Badge>
                    {insight.actionability === "high" && (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        High Priority
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <p className="text-sm text-muted-foreground">{insight.summary}</p>

                {/* Themes */}
                {insight.themes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {insight.themes.map((theme) => (
                      <Badge key={theme} variant="outline" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Entities */}
                {insight.entities.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Mentions:</span>{" "}
                    {insight.entities.join(", ")}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>
                      Sentiment: {insight.sentimentScore > 0 ? "+" : ""}{insight.sentimentScore.toFixed(2)}
                    </span>
                    {insight.relevanceScore !== undefined && (
                      <span className={
                        insight.relevanceScore >= 0.7 
                          ? "text-green-600" 
                          : insight.relevanceScore >= 0.5 
                          ? "text-amber-600" 
                          : "text-gray-500"
                      }>
                        Relevance: {(insight.relevanceScore * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={insight.feedItemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Source
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function InsightsFeedCard({
  insights,
  title = "Recent Insights",
  maxHeight = "400px",
}: {
  insights: Doc<"insights">[];
  title?: string;
  maxHeight?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ maxHeight }} className="pr-4">
          <InsightsFeed insights={insights} />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
