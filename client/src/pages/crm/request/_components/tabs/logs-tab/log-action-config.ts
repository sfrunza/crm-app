import type { RequestLog, RequestLogAction } from "@/domains/request-logs/request-log.types";
import {
  EyeIcon,
  MailIcon,
  MessageCircleIcon,
  PlusIcon,
  RefreshCwIcon,
} from "@/components/icons";

export type ActionConfig = {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
};

const ACTION_CONFIG: Record<RequestLogAction, ActionConfig> = {
  request_created: {
    label: "Request created",
    icon: PlusIcon,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  request_viewed: {
    label: "Request viewed",
    icon: EyeIcon,
    color: "text-slate-600",
    bg: "bg-slate-50",
  },
  field_updated: {
    label: "Field updated",
    icon: RefreshCwIcon,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  message_sent: {
    label: "Message sent",
    icon: MessageCircleIcon,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  email_sent: {
    label: "Email sent",
    icon: MailIcon,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
};

export function getActionConfig(action: string): ActionConfig {
  return (
    ACTION_CONFIG[action as RequestLogAction] ?? {
      label: action.replace(/_/g, " "),
      icon: RefreshCwIcon,
      color: "text-muted-foreground",
      bg: "bg-muted",
    }
  );
}

export function getActionDescription(log: RequestLog): string {
  const details = log.details;

  switch (log.action) {
    case "request_created":
      return "created this request";
    case "request_viewed":
      return "viewed this request";
    case "field_updated": {
      if (details.field === "status") return "changed the status";
      const label =
        (details.label as string) ||
        (details.field as string)?.replace(/_/g, " ") ||
        "a field";
      return `updated ${label.toLowerCase()}`;
    }
    case "message_sent":
      return "sent a message";
    case "email_sent":
      return "sent an email";
    default:
      return (log.action as RequestLogAction).replace(/_/g, " ");
  }
}
