"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/dashboard/header";
import { SourceCard } from "@/components/dashboard/source-card";
import { SourceForm } from "@/components/forms/source-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Rss } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SourcesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const projectId = id as Id<"projects">;

  const project = useQuery(api.projects.get, { id: projectId });
  const sources = useQuery(api.sources.listByProject, { projectId });
  const removeSource = useMutation(api.sources.remove);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<Id<"sources"> | null>(null);

  const { toast } = useToast();

  const handleDelete = async () => {
    if (!sourceToDelete) return;

    try {
      await removeSource({ id: sourceToDelete });
      toast({
        title: "Source deleted",
        description: "The source and its data have been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete source. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSourceToDelete(null);
    }
  };

  if (project === undefined || sources === undefined) {
    return (
      <div className="flex flex-col h-full w-full">
        <Header title="Loading..." />
        <div className="flex-1 p-6 space-y-4 overflow-auto">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <Header title="Sources" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">RSS Sources</h2>
            <p className="text-muted-foreground">
              Configure RSS feeds to monitor for {project?.name || "this project"}.
            </p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Source
          </Button>
        </div>

        {/* Sources Grid */}
        {sources.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Rss className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No sources configured</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Add RSS sources from Reddit, Hacker News, Stack Exchange, or any
                custom feed to start monitoring product feedback.
              </p>
              <Button size="lg" onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Source
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sources.map((source) => (
              <SourceCard
                key={source._id}
                source={source}
                onDelete={(id) => {
                  setSourceToDelete(id);
                  setDeleteDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Source Dialog */}
      <SourceForm
        projectId={projectId}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Source</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this source? This will also remove
              all feed items and insights associated with it. This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Source
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
