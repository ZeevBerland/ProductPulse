"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Plus, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";

type AlertType =
  | "sentiment_drop"
  | "keyword_mention"
  | "competitor_mention"
  | "high_actionability";

interface AlertFormProps {
  projectId: Id<"projects">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const alertTypeOptions: { value: AlertType; label: string; description: string }[] = [
  {
    value: "high_actionability",
    label: "High Actionability",
    description: "Alert when high-priority insights are detected",
  },
  {
    value: "sentiment_drop",
    label: "Sentiment Drop",
    description: "Alert when sentiment drops below a threshold",
  },
  {
    value: "keyword_mention",
    label: "Keyword Mention",
    description: "Alert when specific keywords are mentioned",
  },
  {
    value: "competitor_mention",
    label: "Competitor Mention",
    description: "Alert when competitors are mentioned",
  },
];

export function AlertForm({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: AlertFormProps) {
  const { toast } = useToast();
  const createAlert = useMutation(api.alerts.create);
  const testWebhook = useAction(api.alerts.slack.testSlackWebhook);

  const [name, setName] = useState("");
  const [type, setType] = useState<AlertType>("high_actionability");
  const [slackWebhook, setSlackWebhook] = useState("");
  const [threshold, setThreshold] = useState("-0.3");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<"success" | "error" | null>(null);

  const addKeyword = () => {
    const keyword = keywordInput.trim().toLowerCase();
    if (keyword && !keywords.includes(keyword)) {
      setKeywords([...keywords, keyword]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleTestWebhook = async () => {
    if (!slackWebhook) return;

    setIsTesting(true);
    setTestStatus(null);

    try {
      const result = await testWebhook({ webhookUrl: slackWebhook });
      if (result.success) {
        setTestStatus("success");
        toast({
          title: "Webhook test successful",
          description: "Check your Slack channel for the test message.",
        });
      } else {
        setTestStatus("error");
        toast({
          title: "Webhook test failed",
          description: result.error || "Could not send test message.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestStatus("error");
      toast({
        title: "Webhook test failed",
        description: "An error occurred while testing the webhook.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this alert.",
        variant: "destructive",
      });
      return;
    }

    if (!slackWebhook.trim()) {
      toast({
        title: "Webhook required",
        description: "Please enter a Slack webhook URL.",
        variant: "destructive",
      });
      return;
    }

    if (
      (type === "keyword_mention" || type === "competitor_mention") &&
      keywords.length === 0
    ) {
      toast({
        title: "Keywords required",
        description: "Please add at least one keyword to track.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createAlert({
        projectId,
        name: name.trim(),
        type,
        conditions: {
          threshold: type === "sentiment_drop" ? parseFloat(threshold) : undefined,
          keywords: keywords.length > 0 ? keywords : undefined,
        },
        slackWebhook: slackWebhook.trim(),
      });

      toast({
        title: "Alert created",
        description: "You'll receive notifications when conditions are met.",
      });

      // Reset form
      setName("");
      setType("high_actionability");
      setSlackWebhook("");
      setThreshold("-0.3");
      setKeywords([]);
      setTestStatus(null);

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create alert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Alert</DialogTitle>
            <DialogDescription>
              Set up notifications for important feedback events.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Alert Name</Label>
              <Input
                id="name"
                placeholder="e.g., Negative Sentiment Alert"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Alert Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Alert Type</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as AlertType)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {alertTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Threshold (for sentiment_drop) */}
            {type === "sentiment_drop" && (
              <div className="space-y-2">
                <Label htmlFor="threshold">Sentiment Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  step="0.1"
                  min="-1"
                  max="1"
                  placeholder="-0.3"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Alert when sentiment score drops below this value (-1 to 1)
                </p>
              </div>
            )}

            {/* Keywords (for keyword/competitor mentions) */}
            {(type === "keyword_mention" || type === "competitor_mention") && (
              <div className="space-y-2">
                <Label htmlFor="keywords">
                  {type === "competitor_mention" ? "Competitor Names" : "Keywords"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="keywords"
                    placeholder={
                      type === "competitor_mention"
                        ? "Add competitor name..."
                        : "Add keyword..."
                    }
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addKeyword}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary">
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-2 hover:text-destructive"
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Slack Webhook */}
            <div className="space-y-2">
              <Label htmlFor="webhook">Slack Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  id="webhook"
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackWebhook}
                  onChange={(e) => {
                    setSlackWebhook(e.target.value);
                    setTestStatus(null);
                  }}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestWebhook}
                  disabled={isSubmitting || isTesting || !slackWebhook}
                >
                  {isTesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : testStatus === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : testStatus === "error" ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    "Test"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Create an incoming webhook in your Slack workspace settings
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Alert
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
