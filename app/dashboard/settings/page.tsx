"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Sun, 
  Moon, 
  Monitor,
  Bell,
  Eye,
  Layout,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Settings stored in localStorage
interface UserSettings {
  notifications: {
    emailAlerts: boolean;
    browserNotifications: boolean;
    digestFrequency: "realtime" | "daily" | "weekly" | "none";
  };
  display: {
    defaultInsightsView: "feed" | "charts" | "table";
    insightsPerPage: number;
    showRelevanceScore: boolean;
    compactMode: boolean;
  };
}

const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    emailAlerts: true,
    browserNotifications: true,
    digestFrequency: "daily",
  },
  display: {
    defaultInsightsView: "feed",
    insightsPerPage: 20,
    showRelevanceScore: true,
    compactMode: false,
  },
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("productpulse-settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {
        // Use defaults if parse fails
      }
    }
  }, []);

  // Update a nested setting
  const updateSetting = <K extends keyof UserSettings>(
    category: K,
    key: keyof UserSettings[K],
    value: UserSettings[K][keyof UserSettings[K]]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  // Save settings
  const saveSettings = () => {
    localStorage.setItem("productpulse-settings", JSON.stringify(settings));
    setHasChanges(false);
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  // Reset to defaults
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">User Settings</h2>
            <p className="text-muted-foreground">
              Customize your ProductPulse experience.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetSettings}>
              Reset to Defaults
            </Button>
            <Button onClick={saveSettings} disabled={!hasChanges}>
              <Check className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how ProductPulse looks on your device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="flex-1"
                >
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="flex-1"
                >
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="flex-1"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure how you receive alerts and updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for high-priority insights.
                </p>
              </div>
              <Switch
                checked={settings.notifications.emailAlerts}
                onCheckedChange={(checked) =>
                  updateSetting("notifications", "emailAlerts", checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Browser Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show desktop notifications when new insights arrive.
                </p>
              </div>
              <Switch
                checked={settings.notifications.browserNotifications}
                onCheckedChange={(checked) =>
                  updateSetting("notifications", "browserNotifications", checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Digest Frequency</Label>
                <p className="text-sm text-muted-foreground">
                  How often to receive summary digests.
                </p>
              </div>
              <Select
                value={settings.notifications.digestFrequency}
                onValueChange={(value) =>
                  updateSetting("notifications", "digestFrequency", value as UserSettings["notifications"]["digestFrequency"])
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Display
            </CardTitle>
            <CardDescription>
              Customize how insights and data are displayed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Default Insights View</Label>
                <p className="text-sm text-muted-foreground">
                  Which tab to show by default on the Insights page.
                </p>
              </div>
              <Select
                value={settings.display.defaultInsightsView}
                onValueChange={(value) =>
                  updateSetting("display", "defaultInsightsView", value as UserSettings["display"]["defaultInsightsView"])
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feed">Feed</SelectItem>
                  <SelectItem value="charts">Charts</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Insights Per Page</Label>
                <p className="text-sm text-muted-foreground">
                  Number of insights to load at once.
                </p>
              </div>
              <Select
                value={settings.display.insightsPerPage.toString()}
                onValueChange={(value) =>
                  updateSetting("display", "insightsPerPage", parseInt(value))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Relevance Score</Label>
                <p className="text-sm text-muted-foreground">
                  Display relevance scores on insight cards.
                </p>
              </div>
              <Switch
                checked={settings.display.showRelevanceScore}
                onCheckedChange={(checked) =>
                  updateSetting("display", "showRelevanceScore", checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use smaller cards and tighter spacing.
                </p>
              </div>
              <Switch
                checked={settings.display.compactMode}
                onCheckedChange={(checked) =>
                  updateSetting("display", "compactMode", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Data & Privacy
            </CardTitle>
            <CardDescription>
              Manage your data and privacy settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">
                  Download all your insights and project data.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Clear Local Data</Label>
                <p className="text-sm text-muted-foreground">
                  Remove cached data and preferences from this browser.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.removeItem("productpulse-settings");
                  setSettings(DEFAULT_SETTINGS);
                  toast({
                    title: "Local data cleared",
                    description: "Your preferences have been reset.",
                  });
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
