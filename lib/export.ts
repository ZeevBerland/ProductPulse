// CSV Export utilities

export interface InsightExport {
  title: string;
  url: string;
  publishedAt: string;
  analyzedAt: string;
  sentimentScore: number;
  sentimentLabel: string;
  actionability: string;
  summary: string;
  themes: string;
  entities: string;
}

export function insightsToCSV(insights: InsightExport[]): string {
  const headers = [
    "Title",
    "URL",
    "Published At",
    "Analyzed At",
    "Sentiment Score",
    "Sentiment Label",
    "Actionability",
    "Summary",
    "Themes",
    "Entities",
  ];

  const escapeCSV = (value: string | number): string => {
    const stringValue = String(value);
    // If the value contains a comma, newline, or quote, wrap it in quotes and escape any quotes
    if (
      stringValue.includes(",") ||
      stringValue.includes("\n") ||
      stringValue.includes('"')
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const rows = insights.map((insight) =>
    [
      insight.title,
      insight.url,
      insight.publishedAt,
      insight.analyzedAt,
      insight.sentimentScore,
      insight.sentimentLabel,
      insight.actionability,
      insight.summary,
      insight.themes,
      insight.entities,
    ]
      .map(escapeCSV)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatDateForExport(timestamp: number): string {
  return new Date(timestamp).toISOString();
}
