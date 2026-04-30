import { Badge } from "@/components/ui/badge";
import {
  STATUS_BG_COLOR,
  STATUS_TEXT_COLOR,
} from "@/domains/requests/request.constants";
import type { Status } from "@/domains/requests/request.types";
import { cn } from "@/lib/utils";
import { formatFieldValue } from "./format-field-value";

// For FK fields the backend provides old_display / new_display (resolved
// record names). For every other field we format the raw value on the
// frontend using the FIELD_FORMATTERS map in format-field-value.ts.

function displayValue(details: Record<string, unknown>, key: "old" | "new") {
  const display = details[`${key}_display`] as string | undefined;
  if (display) return display;

  return formatFieldValue(details.field as string, details[`${key}_value`]);
}

export function FieldChangeDetail({
  details,
}: {
  details: Record<string, unknown>;
}) {
  const field = details.field as string;
  const isStatus = field === "status";

  const oldDisplay = displayValue(details, "old");
  const newDisplay = displayValue(details, "new");

  return (
    <div className="mt-1.5 space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <Badge variant="outline" className="font-normal">
          {(details.label as string) || field}
        </Badge>
        {!isStatus && (
          <>
            <span className="text-muted-foreground line-through">
              {oldDisplay}
            </span>
            <span className="text-muted-foreground">&rarr;</span>
            <span className="font-medium">{newDisplay}</span>
          </>
        )}
      </div>
      {isStatus && (
        <div className="flex items-center gap-1.5">
          <StatusBadge status={details.old_value as string} />
          <span className="text-muted-foreground text-xs">&rarr;</span>
          <StatusBadge status={details.new_value as string} />
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = status as Status;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        STATUS_BG_COLOR[s] ?? "bg-muted",
        STATUS_TEXT_COLOR[s] ? "text-white" : "text-foreground",
      )}
    >
      {status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  );
}
