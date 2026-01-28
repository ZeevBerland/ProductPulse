"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Rss,
  Lightbulb,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  projectId?: string;
}

export function Sidebar({ projectId }: SidebarProps) {
  const pathname = usePathname();

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Projects",
      href: "/dashboard/projects",
      icon: FolderKanban,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const projectNavItems = projectId
    ? [
        {
          title: "Overview",
          href: `/dashboard/projects/${projectId}`,
          icon: LayoutDashboard,
        },
        {
          title: "Sources",
          href: `/dashboard/projects/${projectId}/sources`,
          icon: Rss,
        },
        {
          title: "Insights",
          href: `/dashboard/projects/${projectId}/insights`,
          icon: Lightbulb,
        },
        {
          title: "Analytics",
          href: `/dashboard/projects/${projectId}/analytics`,
          icon: BarChart3,
        },
        {
          title: "Alerts",
          href: `/dashboard/projects/${projectId}/alerts`,
          icon: Bell,
        },
        {
          title: "Settings",
          href: `/dashboard/projects/${projectId}/settings`,
          icon: Settings,
        },
      ]
    : [];

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-xl">ProductPulse</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        {/* Back to projects if viewing a specific project */}
        {projectId && (
          <div className="mb-4">
            <Link href="/dashboard/projects">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Button>
            </Link>
          </div>
        )}

        {/* Main Navigation */}
        {!projectId && (
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Navigation
            </p>
            {mainNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === item.href && "bg-secondary"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>
        )}

        {/* Project Navigation */}
        {projectId && (
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Project
            </p>
            {projectNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === item.href && "bg-secondary"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground text-center">
          ProductPulse v1.0
        </p>
      </div>
    </div>
  );
}
