"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteProjectCardProps {
  projectId: Id<"projects">;
  projectName: string;
}

export function DeleteProjectCard({ projectId, projectName }: DeleteProjectCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const deleteProject = useMutation(api.projects.remove);

  const handleDelete = async () => {
    if (confirmName !== projectName) {
      toast({
        title: "Name doesn't match",
        description: "Please type the project name exactly to confirm deletion.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProject({ id: projectId });
      toast({
        title: "Project deleted",
        description: "The project and all its data have been permanently deleted.",
      });
      router.push("/dashboard/projects");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
        </div>
        <CardDescription>
          Permanently delete this project and all associated data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Project
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Project
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  This action cannot be undone. This will permanently delete the
                  project <strong>&quot;{projectName}&quot;</strong> and all associated:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Sources and feed configurations</li>
                  <li>All fetched feed items</li>
                  <li>All analyzed insights</li>
                  <li>Alert configurations</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="confirm-name">
                Type <strong>{projectName}</strong> to confirm:
              </Label>
              <Input
                id="confirm-name"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder="Enter project name"
                disabled={isDeleting}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={confirmName !== projectName || isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p className="text-sm text-muted-foreground mt-3">
          Once deleted, all data will be permanently removed and cannot be recovered.
        </p>
      </CardContent>
    </Card>
  );
}
