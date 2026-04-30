import type { RequestLog } from "@/domains/request-logs/request-log.types";
import { formatDate } from "@/lib/format-date";

export function groupLogsByDate(
  logs: RequestLog[],
): { date: string; logs: RequestLog[] }[] {
  const groups: Map<string, RequestLog[]> = new Map();

  for (const log of logs) {
    const dateKey = formatDate(log.created_at, "yyyy-MM-dd");
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(log);
  }

  return Array.from(groups.entries()).map(([date, logs]) => ({ date, logs }));
}

export function formatGroupDate(dateStr: string): string {
  const today = formatDate(new Date(), "yyyy-MM-dd");
  const yesterday = formatDate(new Date(Date.now() - 86400000), "yyyy-MM-dd");

  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return formatDate(dateStr, "EEEE, MMM d, yyyy");
}
