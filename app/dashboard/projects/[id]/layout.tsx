"use client";

import { use } from "react";
import { ProjectSidebar } from "@/components/dashboard/project-sidebar";

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  
  return (
    <div className="flex h-full w-full">
      <ProjectSidebar projectId={id} />
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
