"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Plus, 
  Loader2, 
  Sparkles, 
  Hash, 
  Users, 
  Rss,
  Clock,
  ExternalLink,
  MessageSquare,
  Code,
  Newspaper,
  Globe,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import { 
  buildSourcesFromSelections,
  SourceConfig,
} from "./source-recommendations";

// Types for AI suggestions
interface SubredditSuggestion {
  name: string;
  description: string;
  relevanceScore: number;
}

interface StackExchangeTag {
  tag: string;
  site: string;
}

interface DiscourseForumSuggestion {
  name: string;
  domain: string;
}

interface ProjectSuggestions {
  keywords: string[];
  competitors: string[];
  subreddits: SubredditSuggestion[];
  stackExchangeTags: StackExchangeTag[];
  hackerNewsQueries: string[];
  discourseForums: DiscourseForumSuggestion[];
  productCategory: string;
}

interface CompetitorSuggestion {
  name: string;
  description: string;
  website?: string;
  category: string;
}

const FETCH_INTERVALS = [
  { value: "0", label: "Manual only" },
  { value: "360", label: "Every 6 hours" },
  { value: "720", label: "Every 12 hours (Recommended)" },
  { value: "1440", label: "Every 24 hours" },
];

interface ProjectFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: Id<"projects">;
    name: string;
    description?: string;
    keywords: string[];
    competitors?: string[];
    fetchInterval?: number;
  };
}

export function ProjectForm({ mode, initialData }: ProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Mutations and actions
  const createProject = useMutation(api.projects.create);
  const createProjectWithSources = useMutation(api.projects.createWithSources);
  const updateProject = useMutation(api.projects.update);
  const addSourcesToProject = useMutation(api.projects.addSources);
  const updateFetchInterval = useMutation(api.projects.updateFetchInterval);
  const setCompetitors = useMutation(api.projects.setCompetitors);
  const suggestProjectSetup = useAction(api.ai.suggest.suggestProjectSetup);
  const suggestCompetitorsAction = useAction(api.ai.suggest.suggestCompetitors);

  // Form state
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keywords state
  const [keywords, setKeywords] = useState<string[]>(initialData?.keywords || []);
  const [keywordInput, setKeywordInput] = useState("");
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [selectedSuggestedKeywords, setSelectedSuggestedKeywords] = useState<string[]>([]);

  // Competitors state
  const [competitors, setCompetitors_] = useState<string[]>(initialData?.competitors || []);
  const [competitorInput, setCompetitorInput] = useState("");
  const [isGeneratingCompetitors, setIsGeneratingCompetitors] = useState(false);
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<CompetitorSuggestion[]>([]);
  const [selectedSuggestedCompetitors, setSelectedSuggestedCompetitors] = useState<string[]>([]);

  // Sources state
  const [suggestions, setSuggestions] = useState<ProjectSuggestions | null>(null);
  const [selectedSubreddits, setSelectedSubreddits] = useState<string[]>([]);
  const [selectedStackExchange, setSelectedStackExchange] = useState<string[]>([]);
  const [selectedHackerNews, setSelectedHackerNews] = useState<string[]>([]);
  const [selectedDiscourse, setSelectedDiscourse] = useState<string[]>([]);
  const [isGeneratingSources, setIsGeneratingSources] = useState(false);

  // Fetch interval state
  const [fetchInterval, setFetchInterval] = useState<string>(
    (initialData?.fetchInterval ?? 15).toString()
  );
  const [isFetching, setIsFetching] = useState(false);
  const [fetchResult, setFetchResult] = useState<{ 
    itemsAdded: number; 
    successful: number; 
    total: number;
    errors: string[];
  } | null>(null);

  // Fetch action
  const triggerFetchProject = useAction(api.feeds.fetch.triggerFetchProject);

  // Keyword functions
  const addKeyword = () => {
    const keyword = keywordInput.trim().toLowerCase();
    if (keyword && !keywords.includes(keyword)) {
      setKeywords([...keywords, keyword]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const addSelectedKeywords = () => {
    const newKeywords = [...new Set([...keywords, ...selectedSuggestedKeywords])];
    setKeywords(newKeywords);
    setSelectedSuggestedKeywords([]);
    toast({ title: "Keywords added", description: `Added ${newKeywords.length - keywords.length + selectedSuggestedKeywords.length} keywords.` });
  };

  // Competitor functions
  const addCompetitor = () => {
    const competitor = competitorInput.trim().toLowerCase();
    if (competitor && !competitors.includes(competitor)) {
      setCompetitors_([...competitors, competitor]);
      setCompetitorInput("");
    }
  };

  const removeCompetitor = (competitor: string) => {
    setCompetitors_(competitors.filter((c) => c !== competitor));
  };

  const addSelectedCompetitors = () => {
    const newCompetitors = [...new Set([...competitors, ...selectedSuggestedCompetitors.map(c => c.toLowerCase())])];
    setCompetitors_(newCompetitors);
    setSelectedSuggestedCompetitors([]);
    toast({ title: "Competitors added", description: `Added ${selectedSuggestedCompetitors.length} competitors.` });
  };

  // Generate keyword suggestions
  const handleGenerateKeywords = async () => {
    if (!name.trim() || description.length < 20) {
      toast({
        title: "More info needed",
        description: "Please enter a product name and description (20+ chars) first.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingKeywords(true);
    try {
      const result = await suggestProjectSetup({
        productName: name.trim(),
        productDescription: description.trim(),
      });

      if (result.success && result.suggestions) {
        const suggested = result.suggestions.keywords.filter(
          (k: string) => !keywords.includes(k.toLowerCase())
        );
        setSuggestedKeywords(suggested);
        setSelectedSuggestedKeywords(suggested.slice(0, 8));
        
        // Also store full suggestions for sources later
        setSuggestions(result.suggestions as ProjectSuggestions);
        
        toast({ title: "Keywords generated!", description: `Found ${suggested.length} keyword suggestions.` });
      } else {
        toast({ title: "Generation failed", description: result.error || "Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to generate keywords.", variant: "destructive" });
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  // Generate competitor suggestions
  const handleGenerateCompetitors = async () => {
    if (!name.trim() || description.length < 20) {
      toast({
        title: "More info needed",
        description: "Please enter a product name and description (20+ chars) first.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingCompetitors(true);
    try {
      const result = await suggestCompetitorsAction({
        productName: name.trim(),
        productDescription: description.trim(),
        existingCompetitors: competitors,
      });

      if (result.success && result.competitors) {
        setSuggestedCompetitors(result.competitors as CompetitorSuggestion[]);
        // Pre-select direct competitors
        const directOnes = (result.competitors as CompetitorSuggestion[])
          .filter(c => c.category === "direct")
          .map(c => c.name);
        setSelectedSuggestedCompetitors(directOnes);
        
        toast({ title: "Competitors found!", description: `Discovered ${result.competitors.length} competitors.` });
      } else {
        toast({ title: "Discovery failed", description: result.error || "Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to discover competitors.", variant: "destructive" });
    } finally {
      setIsGeneratingCompetitors(false);
    }
  };

  // Generate source suggestions
  const handleGenerateSources = async () => {
    if (suggestions) {
      // Already have suggestions from keyword generation
      const highRelevance = suggestions.subreddits
        .filter(s => s.relevanceScore >= 7)
        .map(s => s.name);
      setSelectedSubreddits(highRelevance);
      setSelectedHackerNews(suggestions.hackerNewsQueries.slice(0, 2));
      setSelectedStackExchange(
        suggestions.stackExchangeTags.slice(0, 2).map(t => `${t.site}:${t.tag}`)
      );
      toast({ title: "Sources ready!", description: "Select the sources you want to add." });
      return;
    }

    if (!name.trim() || description.length < 20) {
      toast({
        title: "More info needed",
        description: "Please enter a product name and description (20+ chars) first.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingSources(true);
    try {
      const result = await suggestProjectSetup({
        productName: name.trim(),
        productDescription: description.trim(),
      });

      if (result.success && result.suggestions) {
        setSuggestions(result.suggestions as ProjectSuggestions);
        const highRelevance = result.suggestions.subreddits
          .filter((s: SubredditSuggestion) => s.relevanceScore >= 7)
          .map((s: SubredditSuggestion) => s.name);
        setSelectedSubreddits(highRelevance);
        setSelectedHackerNews(result.suggestions.hackerNewsQueries.slice(0, 2));
        setSelectedStackExchange(
          result.suggestions.stackExchangeTags.slice(0, 2).map(
            (t: StackExchangeTag) => `${t.site}:${t.tag}`
          )
        );
        
        toast({ title: "Sources generated!", description: "Select the sources you want to add." });
      } else {
        toast({ title: "Generation failed", description: result.error || "Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to generate sources.", variant: "destructive" });
    } finally {
      setIsGeneratingSources(false);
    }
  };

  // Build sources from selections
  const getSelectedSources = (): SourceConfig[] => {
    if (!suggestions) return [];
    return buildSourcesFromSelections(
      suggestions,
      selectedSubreddits,
      selectedStackExchange,
      selectedHackerNews,
      selectedDiscourse
    );
  };

  const totalSelectedSources = 
    selectedSubreddits.length + 
    selectedStackExchange.length + 
    selectedHackerNews.length + 
    selectedDiscourse.length;

  // Submit handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({ title: "Name required", description: "Please enter a project name.", variant: "destructive" });
      return;
    }

    if (keywords.length === 0) {
      toast({ title: "Keywords required", description: "Please add at least one keyword.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const sources = getSelectedSources();
        
        if (sources.length > 0) {
          const projectId = await createProjectWithSources({
            name: name.trim(),
            description: description.trim() || undefined,
            keywords,
            sources: sources.map(s => ({ type: s.type, name: s.name, feedUrl: s.feedUrl })),
          });

          // Update competitors and fetch interval
          if (competitors.length > 0) {
            await setCompetitors({ projectId, competitors });
          }
          if (fetchInterval !== "15") {
            await updateFetchInterval({ id: projectId, fetchInterval: parseInt(fetchInterval) });
          }

          toast({ title: "Project created!", description: `Created with ${keywords.length} keywords and ${sources.length} sources.` });
          router.push(`/dashboard/projects/${projectId}`);
        } else {
          const projectId = await createProject({
            name: name.trim(),
            description: description.trim() || undefined,
            keywords,
          });

          if (competitors.length > 0) {
            await setCompetitors({ projectId, competitors });
          }
          if (fetchInterval !== "15") {
            await updateFetchInterval({ id: projectId, fetchInterval: parseInt(fetchInterval) });
          }

          toast({ title: "Project created!", description: "Your project has been created." });
          router.push(`/dashboard/projects/${projectId}`);
        }
      } else if (initialData) {
        await updateProject({
          id: initialData.id,
          name: name.trim(),
          description: description.trim() || undefined,
          keywords,
        });

        await setCompetitors({ projectId: initialData.id, competitors });
        await updateFetchInterval({ id: initialData.id, fetchInterval: parseInt(fetchInterval) });

        // Add new sources if selected
        const sources = getSelectedSources();
        if (sources.length > 0) {
          await addSourcesToProject({
            projectId: initialData.id,
            sources: sources.map(s => ({ type: s.type, name: s.name, feedUrl: s.feedUrl })),
          });
        }

        toast({ title: "Project updated!", description: "Your changes have been saved." });
        router.push(`/dashboard/projects/${initialData.id}`);
      }
    } catch {
      toast({ title: "Error", description: `Failed to ${mode} project.`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle fetch now
  const handleFetchNow = async () => {
    if (!initialData?.id) {
      toast({ title: "Save first", description: "Please save the project before fetching.", variant: "destructive" });
      return;
    }
    
    setIsFetching(true);
    setFetchResult(null);
    try {
      const result = await triggerFetchProject({ projectId: initialData.id });
      setFetchResult({ 
        itemsAdded: result.itemsAdded,
        successful: result.successful,
        total: result.total,
        errors: result.errors || [],
      });
      
      if (result.successful === result.total) {
        toast({
          title: "Fetch complete",
          description: `Fetched ${result.total} sources. ${result.itemsAdded} new items found.`,
        });
      } else {
        toast({
          title: "Fetch partially complete",
          description: `${result.successful}/${result.total} sources succeeded. ${result.errors?.length || 0} errors.`,
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Fetch failed", description: "An error occurred.", variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Section 1: Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Create Project" : "Edit Project"}</CardTitle>
          <CardDescription>
            {mode === "create" 
              ? "Set up a new project to track product feedback."
              : "Update your project details."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              placeholder="e.g., My SaaS Product"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Product Description</Label>
            <p className="text-sm text-muted-foreground">
              Describe your product for better AI suggestions (min 20 characters).
            </p>
            <Textarea
              id="description"
              placeholder="e.g., A collaborative task management tool for remote teams..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
            <span className="text-xs text-muted-foreground">
              {description.length} characters {description.length < 20 && "(need 20+)"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Keywords */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Keywords</CardTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateKeywords}
              disabled={isGeneratingKeywords || description.length < 20}
              className="gap-2"
            >
              {isGeneratingKeywords ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Suggest Keywords
            </Button>
          </div>
          <CardDescription>Keywords to monitor across RSS sources.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Manual input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a keyword..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
              disabled={isSubmitting}
            />
            <Button type="button" variant="outline" onClick={addKeyword} disabled={isSubmitting}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Current keywords */}
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="px-3 py-1">
                  {keyword}
                  <button type="button" onClick={() => removeKeyword(keyword)} className="ml-2 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Suggested keywords */}
          {suggestedKeywords.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">AI Suggestions</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addSelectedKeywords} disabled={selectedSuggestedKeywords.length === 0}>
                    <Plus className="h-3 w-3 mr-1" /> Add Selected
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedKeywords.map((keyword) => (
                    <label key={keyword} className="flex items-center gap-1.5 cursor-pointer">
                      <Checkbox
                        checked={selectedSuggestedKeywords.includes(keyword)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSuggestedKeywords([...selectedSuggestedKeywords, keyword]);
                          } else {
                            setSelectedSuggestedKeywords(selectedSuggestedKeywords.filter(k => k !== keyword));
                          }
                        }}
                      />
                      <Badge variant={selectedSuggestedKeywords.includes(keyword) ? "default" : "outline"}>
                        {keyword}
                      </Badge>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Competitors */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Competitors</CardTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateCompetitors}
              disabled={isGeneratingCompetitors || description.length < 20}
              className="gap-2"
            >
              {isGeneratingCompetitors ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Discover Competitors
            </Button>
          </div>
          <CardDescription>Track competitor mentions in feedback.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Manual input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a competitor..."
              value={competitorInput}
              onChange={(e) => setCompetitorInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCompetitor())}
              disabled={isSubmitting}
            />
            <Button type="button" variant="outline" onClick={addCompetitor} disabled={isSubmitting}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Current competitors */}
          {competitors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {competitors.map((competitor) => (
                <Badge key={competitor} variant="secondary" className="px-3 py-1">
                  {competitor}
                  <button type="button" onClick={() => removeCompetitor(competitor)} className="ml-2 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Suggested competitors */}
          {suggestedCompetitors.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">AI Suggestions</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addSelectedCompetitors} disabled={selectedSuggestedCompetitors.length === 0}>
                    <Plus className="h-3 w-3 mr-1" /> Add Selected
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedCompetitors.map((comp) => {
                    const isSelected = selectedSuggestedCompetitors.includes(comp.name);
                    const isExisting = competitors.some(c => c.toLowerCase() === comp.name.toLowerCase());
                    return (
                      <label key={comp.name} className={`flex items-center gap-1.5 cursor-pointer ${isExisting ? "opacity-50" : ""}`}>
                        <Checkbox
                          checked={isSelected}
                          disabled={isExisting}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSuggestedCompetitors([...selectedSuggestedCompetitors, comp.name]);
                            } else {
                              setSelectedSuggestedCompetitors(selectedSuggestedCompetitors.filter(c => c !== comp.name));
                            }
                          }}
                        />
                        <Badge variant={isSelected ? "default" : "outline"}>
                          {comp.name}
                        </Badge>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Sources */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rss className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Sources</CardTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateSources}
              disabled={isGeneratingSources || description.length < 20}
              className="gap-2"
            >
              {isGeneratingSources ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Suggest Sources
            </Button>
          </div>
          <CardDescription>RSS feeds to monitor (Reddit, HN, Stack Exchange, Discourse).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestions ? (
            <div className="space-y-4">
              {/* Subreddits */}
              {suggestions.subreddits.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-orange-500" />
                    <Label className="text-sm">Reddit ({selectedSubreddits.length}/{suggestions.subreddits.length})</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.subreddits.sort((a, b) => b.relevanceScore - a.relevanceScore).map((sub) => (
                      <label key={sub.name} className="flex items-center gap-1.5 cursor-pointer">
                        <Checkbox
                          checked={selectedSubreddits.includes(sub.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSubreddits([...selectedSubreddits, sub.name]);
                            } else {
                              setSelectedSubreddits(selectedSubreddits.filter(s => s !== sub.name));
                            }
                          }}
                        />
                        <Badge variant={selectedSubreddits.includes(sub.name) ? "default" : "outline"} className="text-xs">
                          r/{sub.name}
                          <span className="ml-1 opacity-70">{sub.relevanceScore}/10</span>
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Hacker News */}
              {suggestions.hackerNewsQueries.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4 text-orange-600" />
                    <Label className="text-sm">Hacker News ({selectedHackerNews.length}/{suggestions.hackerNewsQueries.length})</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.hackerNewsQueries.map((query) => (
                      <label key={query} className="flex items-center gap-1.5 cursor-pointer">
                        <Checkbox
                          checked={selectedHackerNews.includes(query)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedHackerNews([...selectedHackerNews, query]);
                            } else {
                              setSelectedHackerNews(selectedHackerNews.filter(q => q !== query));
                            }
                          }}
                        />
                        <Badge variant={selectedHackerNews.includes(query) ? "default" : "outline"} className="text-xs">
                          &quot;{query}&quot;
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Stack Exchange */}
              {suggestions.stackExchangeTags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-blue-500" />
                    <Label className="text-sm">Stack Exchange ({selectedStackExchange.length}/{suggestions.stackExchangeTags.length})</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.stackExchangeTags.map((tag) => {
                      const key = `${tag.site}:${tag.tag}`;
                      return (
                        <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                          <Checkbox
                            checked={selectedStackExchange.includes(key)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedStackExchange([...selectedStackExchange, key]);
                              } else {
                                setSelectedStackExchange(selectedStackExchange.filter(k => k !== key));
                              }
                            }}
                          />
                          <Badge variant={selectedStackExchange.includes(key) ? "default" : "outline"} className="text-xs">
                            [{tag.tag}] {tag.site}
                          </Badge>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Discourse */}
              {suggestions.discourseForums.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-purple-500" />
                    <Label className="text-sm">Discourse ({selectedDiscourse.length}/{suggestions.discourseForums.length})</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.discourseForums.map((forum) => (
                      <label key={forum.domain} className="flex items-center gap-1.5 cursor-pointer">
                        <Checkbox
                          checked={selectedDiscourse.includes(forum.domain)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedDiscourse([...selectedDiscourse, forum.domain]);
                            } else {
                              setSelectedDiscourse(selectedDiscourse.filter(d => d !== forum.domain));
                            }
                          }}
                        />
                        <Badge variant={selectedDiscourse.includes(forum.domain) ? "default" : "outline"} className="text-xs">
                          {forum.name}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {totalSelectedSources > 0 && (
                <div className="pt-2 border-t text-sm text-muted-foreground">
                  {totalSelectedSources} source{totalSelectedSources !== 1 ? "s" : ""} selected
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click &quot;Suggest Sources&quot; to get AI-recommended RSS feeds, or add sources manually after creating the project.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section 5: Fetch Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Fetch Settings</CardTitle>
            </div>
            {mode === "edit" && initialData?.id && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFetchNow}
                disabled={isFetching}
                className="gap-2"
              >
                {isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Fetch Now
              </Button>
            )}
          </div>
          <CardDescription>How often to automatically fetch new content from sources.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={fetchInterval} onValueChange={setFetchInterval} disabled={isSubmitting}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FETCH_INTERVALS.map((interval) => (
                <SelectItem key={interval.value} value={interval.value}>
                  {interval.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Fetch Result */}
          {fetchResult && (
            <div className="space-y-2">
              <div className={`flex items-center gap-2 p-2 rounded-md ${
                fetchResult.successful === fetchResult.total 
                  ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                  : "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300"
              }`}>
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">
                  {fetchResult.successful}/{fetchResult.total} sources fetched, {fetchResult.itemsAdded} new item{fetchResult.itemsAdded !== 1 ? "s" : ""}
                </span>
              </div>
              {fetchResult.errors.length > 0 && (
                <div className="text-xs text-destructive space-y-1 p-2 bg-destructive/10 rounded-md">
                  <p className="font-medium">Errors:</p>
                  {fetchResult.errors.slice(0, 3).map((err, i) => (
                    <p key={i} className="truncate">{err}</p>
                  ))}
                  {fetchResult.errors.length > 3 && (
                    <p>...and {fetchResult.errors.length - 3} more</p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? (
            totalSelectedSources > 0 
              ? `Create Project with ${totalSelectedSources} Sources` 
              : "Create Project"
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
