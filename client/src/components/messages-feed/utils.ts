import type { Message } from "@/types/index";

export function groupMessagesByDate(messages: Message[]): [string, Message[]][] {
  const groups = new Map<string, Message[]>();
  for (const msg of messages) {
    const date = formatDate(msg.created_at);
    const group = groups.get(date);
    if (group) {
      group.push(msg);
    } else {
      groups.set(date, [msg]);
    }
  }
  return Array.from(groups.entries());
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
