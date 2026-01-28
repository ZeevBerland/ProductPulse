"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/dashboard/header";
import { ProjectForm } from "@/components/forms/project-form";
import { DeleteProjectCard } from "@/components/dashboard/delete-project-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const project = useQuery(api.projects.get, { id: id as Id<"projects"> });

  if (project === undefined) {
    return (
      <div className="flex flex-col h-full w-full">
        <Header title="Loading..." />
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="flex flex-col h-full w-full">
        <Header title="Project Not Found" />
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Project not found</h3>
                <p className="text-muted-foreground mb-4">
                  The project you&apos;re looking for doesn&apos;t exist or has been deleted.
                </p>
                <Link href="/dashboard/projects">
                  <Button>Back to Projects</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <Header title="Project Settings" />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Project Form with all sections */}
          <ProjectForm
            mode="edit"
            initialData={{
              id: project._id,
              name: project.name,
              description: project.description,
              keywords: project.keywords,
              competitors: project.competitors,
              fetchInterval: project.fetchInterval,
            }}
          />

          {/* Danger Zone - Delete Project */}
          <DeleteProjectCard
            projectId={project._id}
            projectName={project.name}
          />
        </div>
      </div>
    </div>
  );
}
