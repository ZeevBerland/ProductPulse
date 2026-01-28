"use node";

import { v } from "convex/values";
import { internalAction, action } from "../_generated/server";
import { internal } from "../_generated/api";

// Slack block types - using any for flexibility with Slack's complex API
interface SlackMessage {
  text: string;
  blocks?: unknown[];
}

// Send a message to Slack webhook
export const sendSlackMessage = internalAction({
  args: {
    webhookUrl: v.string(),
    message: v.object({
      text: v.string(),
      blocks: v.optional(v.any()),
    }),
  },
  handler: async (_, args): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(args.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(args.message),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Slack API error: ${response.status} - ${text}`);
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error sending Slack message:", errorMessage);
      return { success: false, error: errorMessage };
    }
  },
});

// Send an insight alert to Slack
export const sendInsightAlert = internalAction({
  args: {
    alertId: v.id("alerts"),
    insightId: v.id("insights"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    // Get alert configuration
    const alert = await ctx.runQuery(internal.alerts.queries.getAlert, {
      id: args.alertId,
    });

    if (!alert || !alert.slackWebhook) {
      return { success: false, error: "Alert not found or no webhook configured" };
    }

    // Get insight details
    const insight = await ctx.runQuery(internal.alerts.queries.getInsight, {
      id: args.insightId,
    });

    if (!insight) {
      return { success: false, error: "Insight not found" };
    }

    // Get project name
    const project = await ctx.runQuery(internal.alerts.queries.getProject, {
      id: alert.projectId,
    });

    const projectName = project?.name || "Unknown Project";

    // Build Slack message
    const sentimentEmoji =
      insight.sentimentLabel === "positive"
        ? ":white_check_mark:"
        : insight.sentimentLabel === "negative"
        ? ":warning:"
        : ":large_blue_circle:";

    const actionabilityEmoji =
      insight.actionability === "high"
        ? ":rotating_light:"
        : insight.actionability === "medium"
        ? ":bell:"
        : ":small_blue_diamond:";

    const message: SlackMessage = {
      text: `New insight alert for ${projectName}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${actionabilityEmoji} ProductPulse Alert: ${alert.name}`,
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Project:* ${projectName}\n*Alert Type:* ${alert.type.replace("_", " ")}`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${insight.feedItemTitle}*`,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Sentiment:* ${sentimentEmoji} ${insight.sentimentLabel} (${insight.sentimentScore.toFixed(2)})`,
            },
            {
              type: "mrkdwn",
              text: `*Actionability:* ${insight.actionability}`,
            },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Summary:*\n${insight.summary}`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Themes:* ${insight.themes.join(", ") || "None"}\n*Entities:* ${insight.entities.join(", ") || "None"}`,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "View Source",
                emoji: true,
              },
              url: insight.feedItemUrl,
            },
          ],
        },
      ],
    };

    return await ctx.runAction(internal.alerts.slack.sendSlackMessage, {
      webhookUrl: alert.slackWebhook,
      message,
    });
  },
});

// Test a Slack webhook
export const testSlackWebhook = action({
  args: {
    webhookUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    const message: SlackMessage = {
      text: "ProductPulse webhook test",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: ":white_check_mark: *ProductPulse Webhook Test*\n\nYour Slack integration is working correctly!",
          },
        },
      ],
    };

    return await ctx.runAction(internal.alerts.slack.sendSlackMessage, {
      webhookUrl: args.webhookUrl,
      message,
    });
  },
});
