import { Badge } from "@/components/ui/badge";
import {
  STATUS_BG_COLOR,
  STATUS_TEXT_COLOR,
} from "@/domains/requests/request.constants";
import type { Status } from "@/domains/requests/request.types";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface StatusCellProps {
  status: Status;
}

export const StatusCell = memo(({ status }: StatusCellProps) => {
  return (
    <Badge
      className={cn(
        "relative overflow-hidden bg-transparent capitalize",
        STATUS_TEXT_COLOR[status],
      )}
    >
      <span
        className={`${STATUS_BG_COLOR[status]} absolute inset-0 opacity-15`}
      />
      {status.replace("_", " ")}
      <div
        className={cn("ml-1 size-1.5 rounded-full", STATUS_BG_COLOR[status])}
      />
    </Badge>
  );
});
