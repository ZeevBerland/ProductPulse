"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Rss,
  Lightbulb,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectSidebarProps {
  projectId: string;
}

const navItems = [
  { title: "Overview", href: "", icon: LayoutDashboard },
  { title: "Sources", href: "/sources", icon: Rss },
  { title: "Insights", href: "/insights", icon: Lightbulb },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Alerts", href: "/alerts", icon: Bell },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function ProjectSidebar({ projectId }: ProjectSidebarProps) {
  const pathname = usePathname();
  const project = useQuery(api.projects.get, { id: projectId as Id<"projects"> });

  const basePath = `/dashboard/projects/${projectId}`;

  const isActive = (href: string) => {
    const fullPath = `${basePath}${href}`;
    if (href === "") {
      return pathname === basePath;
    }
    return pathname.startsWith(fullPath);
  };

  return (
    <div className="flex h-full w-48 flex-col border-r bg-muted/30">
      {/* Back to Projects */}
      <div className="flex h-14 items-center px-3 border-b">
        <Link href="/dashboard/projects" className="flex-1">
          <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2">
            <ChevronLeft className="mr-1 h-4 w-4" />
            <span className="text-sm">Projects</span>
          </Button>
        </Link>
      </div>

      {/* Project Name */}
      <div className="px-3 py-3 border-b">
        {project ? (
          <div className="truncate">
            <p className="font-medium text-sm truncate">{project.name}</p>
          </div>
        ) : (
          <Skeleton className="h-5 w-full" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2">
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <Link key={item.href} href={`${basePath}${item.href}`}>
              <Button
                variant={isActive(item.href) ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start h-8 px-2",
                  isActive(item.href) && "bg-secondary"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span className="text-sm">{item.title}</span>
              </Button>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
