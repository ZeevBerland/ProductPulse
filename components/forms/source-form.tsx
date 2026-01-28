"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";

type SourceType = "reddit" | "hackernews" | "stackexchange" | "discourse" | "rss";

interface SourceFormProps {
  projectId: Id<"projects">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const sourceTemplates: Record<
  SourceType,
  { label: string; templates: { name: string; urlTemplate: string; fields: string[] }[] }
> = {
  reddit: {
    label: "Reddit",
    templates: [
      {
        name: "Subreddit Feed",
        urlTemplate: "https://www.reddit.com/r/{subreddit}.rss",
        fields: ["subreddit"],
      },
      {
        name: "Subreddit Search",
        urlTemplate:
          "https://www.reddit.com/r/{subreddit}/search.rss?q={keyword}&sort=new&restrict_sr=on",
        fields: ["subreddit", "keyword"],
      },
    ],
  },
  hackernews: {
    label: "Hacker News",
    templates: [
      {
        name: "Search Newest",
        urlTemplate: "https://hnrss.org/newest?q={keyword}",
        fields: ["keyword"],
      },
      {
        name: "Front Page",
        urlTemplate: "https://hnrss.org/frontpage",
        fields: [],
      },
      {
        name: "Show HN",
        urlTemplate: "https://hnrss.org/show?q={keyword}",
        fields: ["keyword"],
      },
      {
        name: "Ask HN",
        urlTemplate: "https://hnrss.org/ask",
        fields: [],
      },
    ],
  },
  stackexchange: {
    label: "Stack Exchange",
    templates: [
      {
        name: "Stack Overflow Tag",
        urlTemplate: "https://stackoverflow.com/feeds/tag/{tag}",
        fields: ["tag"],
      },
      {
        name: "Other SE Site Tag",
        urlTemplate: "https://{site}.stackexchange.com/feeds/tag/{tag}",
        fields: ["site", "tag"],
      },
    ],
  },
  discourse: {
    label: "Discourse Forum",
    templates: [
      {
        name: "Latest Posts",
        urlTemplate: "https://{domain}/latest.rss",
        fields: ["domain"],
      },
      {
        name: "Category Feed",
        urlTemplate: "https://{domain}/c/{category}.rss",
        fields: ["domain", "category"],
      },
      {
        name: "Tag Feed",
        urlTemplate: "https://{domain}/tag/{tag}.rss",
        fields: ["domain", "tag"],
      },
    ],
  },
  rss: {
    label: "Custom RSS",
    templates: [
      {
        name: "Custom URL",
        urlTemplate: "{url}",
        fields: ["url"],
      },
    ],
  },
};

const fieldLabels: Record<string, string> = {
  subreddit: "Subreddit Name",
  keyword: "Search Keyword",
  tag: "Tag Name",
  site: "Site Name",
  domain: "Domain (e.g., meta.discourse.org)",
  category: "Category Slug",
  url: "Full RSS URL",
};

export function SourceForm({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: SourceFormProps) {
  const { toast } = useToast();
  const createSource = useMutation(api.sources.create);

  const [sourceType, setSourceType] = useState<SourceType>("reddit");
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [name, setName] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentTemplate = sourceTemplates[sourceType].templates[selectedTemplate];

  // Reset form when dialog opens/closes or source type changes
  useEffect(() => {
    setSelectedTemplate(0);
    setFieldValues({});
    setName("");
  }, [sourceType, open]);

  const buildFeedUrl = () => {
    let url = currentTemplate.urlTemplate;
    for (const field of currentTemplate.fields) {
      url = url.replace(`{${field}}`, fieldValues[field] || "");
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this source.",
        variant: "destructive",
      });
      return;
    }

    // Validate all fields are filled
    for (const field of currentTemplate.fields) {
      if (!fieldValues[field]?.trim()) {
        toast({
          title: "Missing field",
          description: `Please fill in the ${fieldLabels[field]} field.`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await createSource({
        projectId,
        type: sourceType,
        name: name.trim(),
        feedUrl: buildFeedUrl(),
        config: {
          template: currentTemplate.name,
          fields: fieldValues,
        },
      });

      toast({
        title: "Source created",
        description: "The source has been added and will start fetching soon.",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create source. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Source</DialogTitle>
            <DialogDescription>
              Configure an RSS feed to monitor for product feedback.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Source Type */}
            <div className="space-y-2">
              <Label htmlFor="sourceType">Source Type</Label>
              <Select
                value={sourceType}
                onValueChange={(value) => setSourceType(value as SourceType)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sourceTemplates).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template Selection */}
            {sourceTemplates[sourceType].templates.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="template">Feed Type</Label>
                <Select
                  value={selectedTemplate.toString()}
                  onValueChange={(value) => {
                    setSelectedTemplate(parseInt(value));
                    setFieldValues({});
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceTemplates[sourceType].templates.map((template, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Source Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Source Name</Label>
              <Input
                id="name"
                placeholder="e.g., r/SaaS Product Mentions"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Dynamic Fields */}
            {currentTemplate.fields.map((field) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field}>{fieldLabels[field]}</Label>
                <Input
                  id={field}
                  placeholder={
                    field === "url"
                      ? "https://example.com/feed.rss"
                      : `Enter ${fieldLabels[field].toLowerCase()}`
                  }
                  value={fieldValues[field] || ""}
                  onChange={(e) =>
                    setFieldValues({ ...fieldValues, [field]: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>
            ))}

            {/* Preview URL */}
            {currentTemplate.fields.length > 0 && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Feed URL Preview</Label>
                <code className="block p-2 bg-muted rounded text-xs break-all">
                  {buildFeedUrl()}
                </code>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Source
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
