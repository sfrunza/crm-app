import type { Request } from "@/domains/requests/request.types";
import { cn } from "@/lib/utils";
import { UsersIcon } from "@/components/icons";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";
import { formatCentsToDollarsString, timeWindowToString } from "@/lib/helpers";
import { openRequest } from "@/stores/use-open-requests-store";

type ParklotJobInfoSmallProps = {
  request: Request;
  slotType?: "pickup" | "delivery";
  isActive: boolean;
  left: number;
  width: number;
  bgClass: string;
  className?: string;
};

export function ParklotJobInfoSmall({
  request,
  slotType = "pickup",
  isActive,
  left,
  width,
  bgClass,
  className,
}: ParklotJobInfoSmallProps) {
  const isDelivery = slotType === "delivery";

  const crewSize = isDelivery
    ? request.crew_size_delivery || request.crew_size
    : request.crew_size;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "absolute top-1/2 flex h-[calc(100%-10px)] -translate-y-1/2 rounded-sm px-2 py-1 text-white",
            "cursor-pointer transition select-none",
            bgClass,
            {
              "after:border-background after:absolute after:inset-0 after:rounded-sm after:border-3 after:border-dashed":
                isActive,
            },
            className,
          )}
          style={{
            left: `${left}%`,
            width: `${width}%`,
          }}
          onMouseDown={(e) => e.stopPropagation()} // important for draggable grids
        >
          <div className="h-full overflow-hidden">
            <div className="divide-muted/30 flex h-full items-center gap-2 divide-x-2 truncate text-xs font-semibold [&>*:not(:last-child)]:pr-2">
              <div className="flex items-center gap-2">
                <span>#{request.id}</span>
                <span className="flex items-center gap-1">
                  <UsersIcon className="size-3" />
                  {crewSize}
                </span>
                {isDelivery && (
                  <span className="text-[9px] font-semibold uppercase opacity-80">
                    Del
                  </span>
                )}
              </div>

              <div className="flex flex-col justify-between truncate">
                <span className="truncate">
                  {request.customer?.first_name} {request.customer?.last_name}
                </span>
              </div>

              <div className="flex gap-1 truncate">
                <span className="truncate">{request.origin.city}</span>
                <span>→</span>
                <span className="truncate">{request.destination.city}</span>
              </div>
            </div>
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-60"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <JobInfoPopover request={request} slotType={slotType} />
      </PopoverContent>
    </Popover>
  );
}

function JobInfoPopover({
  request,
  slotType = "pickup",
}: {
  request: Request;
  slotType?: "pickup" | "delivery";
}) {
  const isDelivery = slotType === "delivery";

  const crewSize = isDelivery
    ? request.crew_size_delivery || request.crew_size
    : request.crew_size;

  const startTime = isDelivery
    ? (request.start_time_window_delivery ?? request.start_time_window)
    : request.start_time_window;

  const endTime = isDelivery
    ? (request.end_time_window_delivery ?? request.end_time_window)
    : request.end_time_window;

  return (
    <div className="space-y-3">
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between">
          <p className="font-semibold">#{request.id}</p>
          {isDelivery && (
            <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase">
              Delivery
            </span>
          )}
        </div>
        <p>
          {request.customer?.first_name} {request.customer?.last_name}
        </p>
        <p className="text-muted-foreground">
          {formatDate(request.moving_date, "MMM dd, yyyy")}
        </p>
        <p className="text-muted-foreground">
          {timeWindowToString(startTime, endTime)}
        </p>
        <p className="text-muted-foreground">
          {formatCentsToDollarsString(request.rate)}/hr
        </p>
        <p className="text-muted-foreground">{crewSize} movers</p>
        <p className="text-muted-foreground">
          {request.move_size?.name ?? "N/A"}
        </p>
      </div>
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            openRequest(request.id);
          }}
        >
          View request
        </Button>
      </div>
    </div>
  );
}
