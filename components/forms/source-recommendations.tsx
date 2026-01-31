"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Rss, ExternalLink } from "lucide-react";
import {
  SourceConfig,
  buildRedditSource,
  buildHackerNewsSource,
  buildStackExchangeSource,
  buildDiscourseSource,
} from "@/lib/source-templates";

// Re-export SourceConfig for use by project-form
export type { SourceConfig };
import type { ProjectSuggestions } from "./ai-suggestions-panel";

interface SourceRecommendationsProps {
  suggestions: ProjectSuggestions;
  selectedSubreddits: string[];
  selectedStackExchange: string[];
  selectedHackerNews: string[];
  selectedDiscourse: string[];
}

export function SourceRecommendations({
  suggestions,
  selectedSubreddits,
  selectedStackExchange,
  selectedHackerNews,
  selectedDiscourse,
}: SourceRecommendationsProps) {
  // Build source configs from selections
  const selectedSources = useMemo(() => {
    const sources: SourceConfig[] = [];

    // Reddit sources
    selectedSubreddits.forEach(name => {
      const subreddit = suggestions.subreddits.find(s => s.name === name);
      if (subreddit) {
        sources.push(buildRedditSource(name, subreddit.description));
      }
    });

    // Stack Exchange sources
    selectedStackExchange.forEach(key => {
      const [site, tag] = key.split(":");
      sources.push(buildStackExchangeSource(tag, site));
    });

    // Hacker News sources
    selectedHackerNews.forEach(query => {
      sources.push(buildHackerNewsSource(query));
    });

    // Discourse sources
    selectedDiscourse.forEach(domain => {
      const forum = suggestions.discourseForums.find(f => f.domain === domain);
      if (forum) {
        sources.push(buildDiscourseSource(forum.name, domain));
      }
    });

    return sources;
  }, [
    suggestions,
    selectedSubreddits,
    selectedStackExchange,
    selectedHackerNews,
    selectedDiscourse,
  ]);

  if (selectedSources.length === 0) {
    return null;
  }

  const sourceTypeColors: Record<string, string> = {
    reddit: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
    hackernews: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    stackexchange: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    discourse: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    rss: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Rss className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Sources to Create</CardTitle>
        </div>
        <CardDescription>
          These RSS sources will be automatically created when you submit the form.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-2">
            {selectedSources.map((source, index) => (
              <div
                key={`${source.type}-${source.name}-${index}`}
                className="flex items-start justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={sourceTypeColors[source.type]} 
                      variant="secondary"
                    >
                      {source.type}
                    </Badge>
                    <span className="font-medium text-sm truncate">
                      {source.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {source.description}
                  </p>
                  <code className="text-xs text-muted-foreground block truncate">
                    {source.feedUrl}
                  </code>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  asChild
                >
                  <a
                    href={source.feedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Preview feed URL"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Total: {selectedSources.length} source{selectedSources.length !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              {selectedSubreddits.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {selectedSubreddits.length} Reddit
                </Badge>
              )}
              {selectedHackerNews.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {selectedHackerNews.length} HN
                </Badge>
              )}
              {selectedStackExchange.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {selectedStackExchange.length} SE
                </Badge>
              )}
              {selectedDiscourse.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {selectedDiscourse.length} Discourse
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to convert selections to source configs (exported for use in form)
export function buildSourcesFromSelections(
  suggestions: ProjectSuggestions,
  selectedSubreddits: string[],
  selectedStackExchange: string[],
  selectedHackerNews: string[],
  selectedDiscourse: string[]
): SourceConfig[] {
  const sources: SourceConfig[] = [];

  // Reddit sources
  selectedSubreddits.forEach(name => {
    const subreddit = suggestions.subreddits.find(s => s.name === name);
    if (subreddit) {
      sources.push(buildRedditSource(name, subreddit.description));
    }
  });

  // Stack Exchange sources
  selectedStackExchange.forEach(key => {
    const [site, tag] = key.split(":");
    sources.push(buildStackExchangeSource(tag, site));
  });

  // Hacker News sources
  selectedHackerNews.forEach(query => {
    sources.push(buildHackerNewsSource(query));
  });

  // Discourse sources
  selectedDiscourse.forEach(domain => {
    const forum = suggestions.discourseForums.find(f => f.domain === domain);
    if (forum) {
      sources.push(buildDiscourseSource(forum.name, domain));
    }
  });

  return sources;
}
