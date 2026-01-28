"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Check if we're in a specific project view (has project ID in path)
  // Exclude /dashboard/projects, /dashboard/projects/new
  const isProjectView = /^\/dashboard\/projects\/(?!new$)[^/]+/.test(pathname);

  // For project views, don't show the main sidebar (project has its own compact sidebar)
  if (isProjectView) {
    return (
      <div className="flex h-screen w-screen overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
