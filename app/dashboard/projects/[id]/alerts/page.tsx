"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/dashboard/header";
import { AlertForm } from "@/components/forms/alert-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Plus,
  MoreVertical,
  Trash2,
  AlertTriangle,
  TrendingDown,
  Hash,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const alertTypeIcons: Record<string, typeof Bell> = {
  high_actionability: AlertTriangle,
  sentiment_drop: TrendingDown,
  keyword_mention: Hash,
  competitor_mention: Users,
};

const alertTypeLabels: Record<string, string> = {
  high_actionability: "High Actionability",
  sentiment_drop: "Sentiment Drop",
  keyword_mention: "Keyword Mention",
  competitor_mention: "Competitor Mention",
};

export default function AlertsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const projectId = id as Id<"projects">;

  const project = useQuery(api.projects.get, { id: projectId });
  const alerts = useQuery(api.alerts.listByProject, { projectId });
  const toggleAlert = useMutation(api.alerts.toggle);
  const removeAlert = useMutation(api.alerts.remove);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState<Id<"alerts"> | null>(null);

  const { toast } = useToast();

  const handleToggle = async (alertId: Id<"alerts">) => {
    try {
      await toggleAlert({ id: alertId });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!alertToDelete) return;

    try {
      await removeAlert({ id: alertToDelete });
      toast({
        title: "Alert deleted",
        description: "The alert has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete alert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setAlertToDelete(null);
    }
  };

  if (project === undefined || alerts === undefined) {
    return (
      <div className="flex flex-col h-full w-full">
        <Header title="Loading..." />
        <div className="flex-1 p-6 overflow-auto">
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <Header title="Alerts" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Alert Configuration</h2>
            <p className="text-muted-foreground">
              Set up Slack notifications for {project?.name}
            </p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Alert
          </Button>
        </div>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bell className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No alerts configured</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Create alerts to get notified via Slack when important feedback
                is detected.
              </p>
              <Button size="lg" onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Alert
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {alerts.map((alert) => {
              const Icon = alertTypeIcons[alert.type] || Bell;

              return (
                <Card key={alert._id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{alert.name}</CardTitle>
                          <CardDescription>
                            {alertTypeLabels[alert.type]}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={alert.active}
                          onCheckedChange={() => handleToggle(alert._id)}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setAlertToDelete(alert._id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {/* Conditions */}
                      {alert.conditions.threshold !== undefined && (
                        <div className="text-muted-foreground">
                          Threshold: {alert.conditions.threshold}
                        </div>
                      )}
                      {alert.conditions.keywords &&
                        alert.conditions.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {alert.conditions.keywords.map((keyword) => (
                              <Badge key={keyword} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}

                      {/* Status */}
                      <div className="flex items-center gap-2 pt-2">
                        <Badge variant={alert.active ? "default" : "secondary"}>
                          {alert.active ? "Active" : "Paused"}
                        </Badge>
                        {alert.slackWebhook && (
                          <Badge variant="outline" className="text-xs">
                            Slack Connected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Alert Dialog */}
      <AlertForm
        projectId={projectId}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Alert</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this alert? You will no longer
              receive notifications for this condition.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
