import type { RequestLog } from "@/domains/request-logs/request-log.types";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { FieldChangeDetail } from "./field-change-detail";
import { getActionConfig, getActionDescription } from "./log-action-config";

export function LogEntry({ log }: { log: RequestLog }) {
  const config = getActionConfig(log.action);
  const Icon = config.icon;
  const details = log.details;
  const userName = log.user
    ? `${log.user.first_name} ${log.user.last_name}`
    : "System";

  return (
    <div className="group relative flex gap-3 py-3">
      {/* Timeline dot + icon */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          config.bg,
        )}
      >
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div
        // className="flex items-start justify-between gap-2"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              <span className="text-foreground">{userName}</span>
              <span className="text-muted-foreground">
                {" "}
                {getActionDescription(log)}
              </span>
            </p>

            {/* Field change details */}
            {log.action === "field_updated" &&
              typeof details.field === "string" && (
                <FieldChangeDetail details={details} />
              )}

            {/* Message preview */}
            {log.action === "message_sent" &&
              typeof details.content_preview === "string" && (
                <p className="text-muted-foreground mt-1 text-xs italic">
                  &ldquo;{details.content_preview}&rdquo;
                </p>
              )}

            {/* Email preview */}
            {log.action === "email_sent" &&
              typeof details.template_name === "string" && (
                <p className="text-muted-foreground mt-1 text-xs italic">
                  {details.template_name}
                </p>
              )}

            {/* Timestamp */}
            <span className="text-muted-foreground/70 max-w-24 shrink-0 text-xs">
              {formatDate(log.created_at, "PPPPpp")} &bull; {log.ip_address}
            </span>
          </div>

          {/* Timestamp */}
          {/* <span className="text-muted-foreground max-w-24 shrink-0 text-xs">
            {formatDate(log.created_at, "PPPpp")}
          </span> */}
        </div>
      </div>
    </div>
  );
}
