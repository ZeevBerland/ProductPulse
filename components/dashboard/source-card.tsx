"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Trash2,
  ExternalLink,
  RefreshCw,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface SourceCardProps {
  source: Doc<"sources">;
  onDelete: (id: Doc<"sources">["_id"]) => void;
  onFetch?: (id: Doc<"sources">["_id"]) => void;
}

const sourceTypeColors: Record<string, string> = {
  reddit: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  hackernews: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  stackexchange: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  discourse: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  rss: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
};

export function SourceCard({ source, onDelete, onFetch }: SourceCardProps) {
  const { toast } = useToast();
  const toggleSource = useMutation(api.sources.toggle);

  const handleToggle = async () => {
    try {
      await toggleSource({ id: source._id });
      toast({
        title: source.active ? "Source paused" : "Source activated",
        description: source.active
          ? "This source will no longer fetch new items."
          : "This source will start fetching new items.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle source. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3 p-4 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-base font-medium truncate">{source.name}</CardTitle>
            <Badge className={sourceTypeColors[source.type]} variant="secondary">
              {source.type}
            </Badge>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Switch
              checked={source.active}
              onCheckedChange={handleToggle}
              aria-label="Toggle source active"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onFetch && (
                  <DropdownMenuItem onClick={() => onFetch(source._id)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Fetch Now
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <a
                    href={source.feedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Feed
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(source._id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground truncate break-all" title={source.feedUrl}>
            {source.feedUrl}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">
                {source.lastFetched
                  ? `Last fetched ${formatDistanceToNow(source.lastFetched, { addSuffix: true })}`
                  : "Never fetched"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
