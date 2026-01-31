"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderKanban, Rss, Lightbulb, TrendingUp, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const projects = useQuery(api.projects.list);
  const dashboardStats = useQuery(api.insights.getDashboardStats);

  const totalProjects = projects?.length || 0;

  return (
    <div className="flex flex-col h-full w-full">
      <Header title="Dashboard" />
      
      <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 overflow-auto">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-sm text-muted-foreground">
              Here&apos;s an overview of your product feedback intelligence.
            </p>
          </div>
          <Link href="/dashboard/projects/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {projects === undefined ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl md:text-3xl font-bold">{totalProjects}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Tracking product feedback
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
              <Rss className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {dashboardStats === undefined ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl md:text-3xl font-bold">{dashboardStats.activeSources}</div>
              )}
              <p className="text-xs text-muted-foreground">
                RSS feeds being monitored
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dashboardStats === undefined ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{dashboardStats.totalInsights}</div>
              )}
              <p className="text-xs text-muted-foreground">
                AI-analyzed feedback items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Sentiment</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dashboardStats === undefined ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {dashboardStats.totalInsights > 0 
                    ? (dashboardStats.avgSentiment > 0 ? "+" : "") + dashboardStats.avgSentiment.toFixed(2)
                    : "N/A"}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Across all projects
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>
                  Monitor and analyze feedback for your products
                </CardDescription>
              </div>
              <Link href="/dashboard/projects">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {projects === undefined ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first project to start tracking product feedback.
                </p>
                <Link href="/dashboard/projects/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project._id}
                    href={`/dashboard/projects/${project._id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {project.keywords.length} keywords tracked
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
