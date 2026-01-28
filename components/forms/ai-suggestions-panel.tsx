"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Plus,
  Check,
  Hash,
  Users,
  MessageSquare,
  Code,
  Newspaper,
  Globe,
} from "lucide-react";

export interface SubredditSuggestion {
  name: string;
  description: string;
  relevanceScore: number;
}

export interface StackExchangeTag {
  tag: string;
  site: string;
}

export interface DiscourseForumSuggestion {
  name: string;
  domain: string;
}

export interface ProjectSuggestions {
  keywords: string[];
  competitors: string[];
  subreddits: SubredditSuggestion[];
  stackExchangeTags: StackExchangeTag[];
  hackerNewsQueries: string[];
  discourseForums: DiscourseForumSuggestion[];
  productCategory: string;
}

interface AISuggestionsPanelProps {
  suggestions: ProjectSuggestions;
  selectedKeywords: string[];
  selectedCompetitors: string[];
  selectedSubreddits: string[];
  selectedStackExchange: string[];
  selectedHackerNews: string[];
  selectedDiscourse: string[];
  onKeywordsChange: (keywords: string[]) => void;
  onCompetitorsChange: (competitors: string[]) => void;
  onSubredditsChange: (subreddits: string[]) => void;
  onStackExchangeChange: (tags: string[]) => void;
  onHackerNewsChange: (queries: string[]) => void;
  onDiscourseChange: (forums: string[]) => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function AISuggestionsPanel({
  suggestions,
  selectedKeywords,
  selectedCompetitors,
  selectedSubreddits,
  selectedStackExchange,
  selectedHackerNews,
  selectedDiscourse,
  onKeywordsChange,
  onCompetitorsChange,
  onSubredditsChange,
  onStackExchangeChange,
  onHackerNewsChange,
  onDiscourseChange,
  onRegenerate,
  isRegenerating,
}: AISuggestionsPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    keywords: true,
    competitors: true,
    subreddits: true,
    stackexchange: true,
    hackernews: true,
    discourse: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleKeyword = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      onKeywordsChange(selectedKeywords.filter(k => k !== keyword));
    } else {
      onKeywordsChange([...selectedKeywords, keyword]);
    }
  };

  const toggleCompetitor = (competitor: string) => {
    if (selectedCompetitors.includes(competitor)) {
      onCompetitorsChange(selectedCompetitors.filter(c => c !== competitor));
    } else {
      onCompetitorsChange([...selectedCompetitors, competitor]);
    }
  };

  const toggleSubreddit = (name: string) => {
    if (selectedSubreddits.includes(name)) {
      onSubredditsChange(selectedSubreddits.filter(s => s !== name));
    } else {
      onSubredditsChange([...selectedSubreddits, name]);
    }
  };

  const toggleStackExchange = (key: string) => {
    if (selectedStackExchange.includes(key)) {
      onStackExchangeChange(selectedStackExchange.filter(t => t !== key));
    } else {
      onStackExchangeChange([...selectedStackExchange, key]);
    }
  };

  const toggleHackerNews = (query: string) => {
    if (selectedHackerNews.includes(query)) {
      onHackerNewsChange(selectedHackerNews.filter(q => q !== query));
    } else {
      onHackerNewsChange([...selectedHackerNews, query]);
    }
  };

  const toggleDiscourse = (domain: string) => {
    if (selectedDiscourse.includes(domain)) {
      onDiscourseChange(selectedDiscourse.filter(d => d !== domain));
    } else {
      onDiscourseChange([...selectedDiscourse, domain]);
    }
  };

  const selectAllKeywords = () => onKeywordsChange([...suggestions.keywords]);
  const selectAllCompetitors = () => onCompetitorsChange([...suggestions.competitors]);
  const selectAllSubreddits = () => onSubredditsChange(suggestions.subreddits.map(s => s.name));
  const selectAllStackExchange = () => 
    onStackExchangeChange(suggestions.stackExchangeTags.map(t => `${t.site}:${t.tag}`));
  const selectAllHackerNews = () => onHackerNewsChange([...suggestions.hackerNewsQueries]);
  const selectAllDiscourse = () => onDiscourseChange(suggestions.discourseForums.map(f => f.domain));

  const totalSourcesSelected = 
    selectedSubreddits.length + 
    selectedStackExchange.length + 
    selectedHackerNews.length + 
    selectedDiscourse.length;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Suggestions</CardTitle>
          </div>
          {onRegenerate && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? "Generating..." : "Regenerate"}
            </Button>
          )}
        </div>
        <CardDescription>
          Review and select the suggestions you want to use. Category: {" "}
          <Badge variant="outline">{suggestions.productCategory}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="max-h-[500px] pr-4">
          <div className="space-y-4">
            {/* Keywords Section */}
            <SuggestionSection
              title="Keywords"
              icon={<Hash className="h-4 w-4" />}
              count={suggestions.keywords.length}
              selectedCount={selectedKeywords.length}
              isExpanded={expandedSections.keywords}
              onToggle={() => toggleSection("keywords")}
              onSelectAll={selectAllKeywords}
            >
              <div className="flex flex-wrap gap-2">
                {suggestions.keywords.map(keyword => (
                  <label
                    key={keyword}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedKeywords.includes(keyword)}
                      onCheckedChange={() => toggleKeyword(keyword)}
                    />
                    <Badge 
                      variant={selectedKeywords.includes(keyword) ? "default" : "outline"}
                      className="cursor-pointer"
                    >
                      {keyword}
                    </Badge>
                  </label>
                ))}
              </div>
            </SuggestionSection>

            <Separator />

            {/* Competitors Section */}
            {suggestions.competitors.length > 0 && (
              <>
                <SuggestionSection
                  title="Competitors"
                  icon={<Users className="h-4 w-4" />}
                  count={suggestions.competitors.length}
                  selectedCount={selectedCompetitors.length}
                  isExpanded={expandedSections.competitors}
                  onToggle={() => toggleSection("competitors")}
                  onSelectAll={selectAllCompetitors}
                >
                  <div className="flex flex-wrap gap-2">
                    {suggestions.competitors.map(competitor => (
                      <label
                        key={competitor}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedCompetitors.includes(competitor)}
                          onCheckedChange={() => toggleCompetitor(competitor)}
                        />
                        <Badge 
                          variant={selectedCompetitors.includes(competitor) ? "secondary" : "outline"}
                          className="cursor-pointer"
                        >
                          {competitor}
                        </Badge>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected competitors will be added as keywords to track mentions.
                  </p>
                </SuggestionSection>
                <Separator />
              </>
            )}

            {/* Subreddits Section */}
            {suggestions.subreddits.length > 0 && (
              <>
                <SuggestionSection
                  title="Subreddits"
                  icon={<MessageSquare className="h-4 w-4" />}
                  count={suggestions.subreddits.length}
                  selectedCount={selectedSubreddits.length}
                  isExpanded={expandedSections.subreddits}
                  onToggle={() => toggleSection("subreddits")}
                  onSelectAll={selectAllSubreddits}
                >
                  <div className="space-y-2">
                    {suggestions.subreddits
                      .sort((a, b) => b.relevanceScore - a.relevanceScore)
                      .map(subreddit => (
                        <label
                          key={subreddit.name}
                          className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedSubreddits.includes(subreddit.name)}
                            onCheckedChange={() => toggleSubreddit(subreddit.name)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">r/{subreddit.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {subreddit.relevanceScore}/10
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {subreddit.description}
                            </p>
                          </div>
                        </label>
                      ))}
                  </div>
                </SuggestionSection>
                <Separator />
              </>
            )}

            {/* Stack Exchange Section */}
            {suggestions.stackExchangeTags.length > 0 && (
              <>
                <SuggestionSection
                  title="Stack Exchange"
                  icon={<Code className="h-4 w-4" />}
                  count={suggestions.stackExchangeTags.length}
                  selectedCount={selectedStackExchange.length}
                  isExpanded={expandedSections.stackexchange}
                  onToggle={() => toggleSection("stackexchange")}
                  onSelectAll={selectAllStackExchange}
                >
                  <div className="space-y-2">
                    {suggestions.stackExchangeTags.map(tag => {
                      const key = `${tag.site}:${tag.tag}`;
                      const siteName = tag.site === "stackoverflow" ? "Stack Overflow" : tag.site;
                      return (
                        <label
                          key={key}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedStackExchange.includes(key)}
                            onCheckedChange={() => toggleStackExchange(key)}
                          />
                          <div>
                            <span className="font-medium text-sm">[{tag.tag}]</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              on {siteName}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </SuggestionSection>
                <Separator />
              </>
            )}

            {/* Hacker News Section */}
            {suggestions.hackerNewsQueries.length > 0 && (
              <>
                <SuggestionSection
                  title="Hacker News"
                  icon={<Newspaper className="h-4 w-4" />}
                  count={suggestions.hackerNewsQueries.length}
                  selectedCount={selectedHackerNews.length}
                  isExpanded={expandedSections.hackernews}
                  onToggle={() => toggleSection("hackernews")}
                  onSelectAll={selectAllHackerNews}
                >
                  <div className="space-y-2">
                    {suggestions.hackerNewsQueries.map(query => (
                      <label
                        key={query}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedHackerNews.includes(query)}
                          onCheckedChange={() => toggleHackerNews(query)}
                        />
                        <span className="text-sm">Search: &quot;{query}&quot;</span>
                      </label>
                    ))}
                  </div>
                </SuggestionSection>
                <Separator />
              </>
            )}

            {/* Discourse Forums Section */}
            {suggestions.discourseForums.length > 0 && (
              <SuggestionSection
                title="Discourse Forums"
                icon={<Globe className="h-4 w-4" />}
                count={suggestions.discourseForums.length}
                selectedCount={selectedDiscourse.length}
                isExpanded={expandedSections.discourse}
                onToggle={() => toggleSection("discourse")}
                onSelectAll={selectAllDiscourse}
              >
                <div className="space-y-2">
                  {suggestions.discourseForums.map(forum => (
                    <label
                      key={forum.domain}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedDiscourse.includes(forum.domain)}
                        onCheckedChange={() => toggleDiscourse(forum.domain)}
                      />
                      <div>
                        <span className="font-medium text-sm">{forum.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {forum.domain}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </SuggestionSection>
            )}
          </div>
        </ScrollArea>

        {/* Summary */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Selected: {selectedKeywords.length} keywords, {selectedCompetitors.length} competitors, {totalSourcesSelected} sources
            </span>
            {totalSourcesSelected > 0 && (
              <Badge variant="secondary">
                <Check className="h-3 w-3 mr-1" />
                {totalSourcesSelected} sources ready
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Sub-component for collapsible sections
interface SuggestionSectionProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  selectedCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectAll: () => void;
  children: React.ReactNode;
}

function SuggestionSection({
  title,
  icon,
  count,
  selectedCount,
  isExpanded,
  onToggle,
  onSelectAll,
  children,
}: SuggestionSectionProps) {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger className="flex items-center gap-2 hover:text-primary transition-colors">
          {icon}
          <span className="font-medium text-sm">{title}</span>
          <Badge variant="outline" className="text-xs">
            {selectedCount}/{count}
          </Badge>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </CollapsibleTrigger>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSelectAll();
          }}
          className="h-7 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add All
        </Button>
      </div>
      <CollapsibleContent className="pt-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
