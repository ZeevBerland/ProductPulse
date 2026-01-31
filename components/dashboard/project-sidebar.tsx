"use client";

import { useState, useEffect } from "react";
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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("project-sidebar-collapsed");
      return saved ? JSON.parse(saved) : isMobile;
    }
    return isMobile;
  });

  useEffect(() => {
    if (isMobile && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [isMobile, isCollapsed]);

  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (typeof window !== "undefined") {
      localStorage.setItem("project-sidebar-collapsed", JSON.stringify(newState));
    }
  };

  const basePath = `/dashboard/projects/${projectId}`;

  const isActive = (href: string) => {
    const fullPath = `${basePath}${href}`;
    if (href === "") {
      return pathname === basePath;
    }
    return pathname.startsWith(fullPath);
  };

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-muted/30 transition-all duration-300",
      isCollapsed ? "w-12" : "w-48"
    )}>
      {/* Back to Projects and Toggle */}
      <div className="flex h-14 items-center px-2 border-b justify-between">
        <Link href="/dashboard/projects" className="flex-1">
          {isCollapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-full h-8">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Back to Projects</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2">
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span className="text-sm">Projects</span>
            </Button>
          )}
        </Link>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="h-8 w-8 ml-1"
          >
            {isCollapsed ? <PanelLeftOpen className="h-3 w-3" /> : <PanelLeftClose className="h-3 w-3" />}
          </Button>
        )}
      </div>

      {/* Project Name */}
      {!isCollapsed && (
        <div className="px-3 py-3 border-b">
          {project ? (
            <div className="truncate">
              <p className="font-medium text-sm truncate">{project.name}</p>
            </div>
          ) : (
            <Skeleton className="h-5 w-full" />
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2">
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <Link key={item.href} href={`${basePath}${item.href}`}>
              {isCollapsed ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive(item.href) ? "secondary" : "ghost"}
                        size="icon"
                        className={cn(
                          "w-full h-8",
                          isActive(item.href) && "bg-secondary"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
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
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
