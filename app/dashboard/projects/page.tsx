"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FolderKanban, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

export default function ProjectsPage() {
  const projects = useQuery(api.projects.listWithStats);
  const removeProject = useMutation(api.projects.remove);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Id<"projects"> | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!projectToDelete) return;

    try {
      await removeProject({ id: projectToDelete });
      toast({
        title: "Project deleted",
        description: "The project and all its data have been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <Header title="Projects" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">All Projects</h2>
            <p className="text-muted-foreground">
              Manage your product feedback tracking projects.
            </p>
          </div>
          <Link href="/dashboard/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Projects Grid */}
        {projects === undefined ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderKanban className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Create your first project to start monitoring product feedback
                across Reddit, Hacker News, and more.
              </p>
              <Link href="/dashboard/projects/new">
                <Button size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project._id} className="relative group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Link href={`/dashboard/projects/${project._id}`}>
                        <CardTitle className="hover:text-primary transition-colors cursor-pointer">
                          {project.name}
                        </CardTitle>
                      </Link>
                      <CardDescription className="line-clamp-2">
                        {project.description || "No description"}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/projects/${project._id}/settings`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setProjectToDelete(project._id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Keywords */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Tracking Keywords
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {project.keywords.slice(0, 4).map((keyword) => (
                          <Badge key={keyword} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {project.keywords.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.keywords.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                      <span>{project.sourceCount} {project.sourceCount === 1 ? "source" : "sources"}</span>
                      <span>{project.insightCount} {project.insightCount === 1 ? "insight" : "insights"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This will permanently
              remove all sources, feed items, and insights associated with it.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
