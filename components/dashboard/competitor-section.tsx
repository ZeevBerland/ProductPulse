"use client";

import { useState } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import { 
  Users, 
  Plus, 
  X, 
  Sparkles, 
  Loader2, 
  ExternalLink,
  Building2,
  TrendingUp,
  Zap
} from "lucide-react";

interface CompetitorSuggestion {
  name: string;
  description: string;
  website?: string;
  category: string;
}

interface CompetitorSectionProps {
  projectId: Id<"projects">;
  productName: string;
  productDescription: string;
  competitors: string[];
}

export function CompetitorSection({
  projectId,
  productName,
  productDescription,
  competitors,
}: CompetitorSectionProps) {
  const { toast } = useToast();
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<CompetitorSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const addCompetitor = useMutation(api.projects.addCompetitor);
  const removeCompetitor = useMutation(api.projects.removeCompetitor);
  const setCompetitors = useMutation(api.projects.setCompetitors);
  const suggestCompetitors = useAction(api.ai.suggest.suggestCompetitors);

  // Get insights to show competitor mention counts
  const insights = useQuery(api.insights.listByProject, { projectId });

  // Count mentions for each competitor
  const getMentionCount = (competitor: string) => {
    if (!insights) return 0;
    const competitorLower = competitor.toLowerCase();
    return insights.filter((insight) => {
      const content = `${insight.summary} ${insight.themes.join(" ")} ${insight.entities.join(" ")}`.toLowerCase();
      return content.includes(competitorLower);
    }).length;
  };

  const handleDiscoverCompetitors = async () => {
    if (productDescription.length < 20) {
      toast({
        title: "Description too short",
        description: "Please add a more detailed product description in project settings.",
        variant: "destructive",
      });
      return;
    }

    setIsDiscovering(true);
    setSuggestions([]);
    setSelectedSuggestions([]);

    try {
      const result = await suggestCompetitors({
        productName,
        productDescription,
        existingCompetitors: competitors,
      });

      if (result.success && result.competitors) {
        setSuggestions(result.competitors as CompetitorSuggestion[]);
        // Pre-select direct competitors
        const directCompetitors = (result.competitors as CompetitorSuggestion[])
          .filter((c) => c.category === "direct")
          .map((c) => c.name);
        setSelectedSuggestions(directCompetitors);
        setIsDialogOpen(true);
      } else {
        toast({
          title: "Discovery failed",
          description: result.error || "Could not discover competitors. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to discover competitors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleAddManual = async () => {
    const name = manualInput.trim();
    if (!name) return;

    setIsAdding(true);
    try {
      await addCompetitor({ projectId, competitor: name });
      setManualInput("");
      toast({
        title: "Competitor added",
        description: `Now tracking "${name}".`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add competitor.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (competitor: string) => {
    try {
      await removeCompetitor({ projectId, competitor });
      toast({
        title: "Competitor removed",
        description: `No longer tracking "${competitor}".`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove competitor.",
        variant: "destructive",
      });
    }
  };

  const handleAddSelected = async () => {
    if (selectedSuggestions.length === 0) return;

    setIsAdding(true);
    try {
      const newCompetitors = [...new Set([...competitors, ...selectedSuggestions.map(s => s.toLowerCase())])];
      await setCompetitors({ projectId, competitors: newCompetitors });
      setIsDialogOpen(false);
      setSuggestions([]);
      setSelectedSuggestions([]);
      toast({
        title: "Competitors added",
        description: `Added ${selectedSuggestions.length} competitor${selectedSuggestions.length !== 1 ? "s" : ""} to track.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add competitors.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const toggleSuggestion = (name: string) => {
    if (selectedSuggestions.includes(name)) {
      setSelectedSuggestions(selectedSuggestions.filter((s) => s !== name));
    } else {
      setSelectedSuggestions([...selectedSuggestions, name]);
    }
  };

  const categoryIcon = (category: string) => {
    switch (category) {
      case "direct":
        return <Building2 className="h-3 w-3" />;
      case "indirect":
        return <TrendingUp className="h-3 w-3" />;
      case "emerging":
        return <Zap className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const categoryColor = (category: string) => {
    switch (category) {
      case "direct":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "indirect":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "emerging":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Competitors</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDiscoverCompetitors}
            disabled={isDiscovering}
            className="gap-2"
          >
            {isDiscovering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Discover with AI
          </Button>
        </div>
        <CardDescription>
          Track competitors to monitor mentions and compare sentiment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Manual */}
        <div className="flex gap-2">
          <Input
            placeholder="Add competitor name..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddManual()}
            disabled={isAdding}
          />
          <Button
            variant="outline"
            onClick={handleAddManual}
            disabled={isAdding || !manualInput.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Competitors List */}
        {competitors.length > 0 ? (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Tracked Competitors</Label>
            <div className="flex flex-wrap gap-2">
              {competitors.map((competitor) => {
                const mentions = getMentionCount(competitor);
                return (
                  <Badge
                    key={competitor}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm flex items-center gap-2"
                  >
                    {competitor}
                    {mentions > 0 && (
                      <span className="text-xs bg-primary/20 px-1.5 py-0.5 rounded">
                        {mentions} mention{mentions !== 1 ? "s" : ""}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemove(competitor)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No competitors tracked yet. Add manually or use AI discovery.
          </p>
        )}

        {/* AI Discovery Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Discovered Competitors
              </DialogTitle>
              <DialogDescription>
                Select competitors to track. AI found these based on your product description.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-3">
                {suggestions.map((suggestion) => {
                  const isSelected = selectedSuggestions.includes(suggestion.name);
                  const isExisting = competitors.some(
                    (c) => c.toLowerCase() === suggestion.name.toLowerCase()
                  );
                  return (
                    <label
                      key={suggestion.name}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                      } ${isExisting ? "opacity-50" : ""}`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSuggestion(suggestion.name)}
                        disabled={isExisting}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{suggestion.name}</span>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${categoryColor(suggestion.category)}`}
                          >
                            {categoryIcon(suggestion.category)}
                            <span className="ml-1">{suggestion.category}</span>
                          </Badge>
                          {isExisting && (
                            <Badge variant="outline" className="text-xs">
                              Already tracking
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {suggestion.description}
                        </p>
                        {suggestion.website && (
                          <a
                            href={`https://${suggestion.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {suggestion.website}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                {selectedSuggestions.length} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSelected}
                  disabled={selectedSuggestions.length === 0 || isAdding}
                >
                  {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Selected
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
