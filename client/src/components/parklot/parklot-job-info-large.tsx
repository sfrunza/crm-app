import type { Request } from "@/domains/requests/request.types";
import { timeWindowToString } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { UsersIcon } from "@/components/icons";

type ParklotJobInfoLargeProps = {
  request: Request;
  slotType?: "pickup" | "delivery";
  isActive: boolean;
  left: number;
  width: number;
  bgClass: string;
  handleRequestClick: (request: Request) => void;
  className?: string;
};

export function ParklotJobInfoLarge({
  request,
  slotType = "pickup",
  isActive,
  left,
  width,
  bgClass,
  handleRequestClick,
  className,
}: ParklotJobInfoLargeProps) {
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

  const assignedForeman = isDelivery
    ? (request.delivery_foreman ?? request.foreman)
    : request.foreman;
  return (
    <div
      className={cn(
        "absolute top-1/2 flex h-[calc(100%-10px)] -translate-y-1/2 rounded-sm p-1 text-white",
        "cursor-pointer transition select-none",
        bgClass,
        {
          "after:border-background after:absolute after:inset-0 after:rounded-sm after:border-2 after:border-dashed":
            isActive,
        },
        className,
      )}
      style={{
        left: `${left}%`,
        width: `${width}%`,
      }}
      onClick={(e) => {
        e.preventDefault();
        handleRequestClick(request);
      }}
      onMouseDown={(e) => e.stopPropagation()} // important for draggable grids
    >
      <div className="relative h-full w-full overflow-hidden p-2">
        {request.status === "completed" ? (
          <span className="bg-background/20 absolute top-0 right-0 shrink-0 rounded px-1.5 py-0.5 text-[10px] leading-tight font-semibold uppercase">
            Completed
          </span>
        ) : assignedForeman ? (
          <span className="bg-background/20 absolute top-0 right-0 shrink-0 truncate rounded px-1.5 py-0.5 text-[12px] leading-tight font-semibold">
            👷🏻{" "}
            {`${assignedForeman.first_name} ${assignedForeman.last_name[0]}.`}
          </span>
        ) : null}
        <div className="flex h-full flex-col justify-between text-xs font-semibold">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm">
              {request.customer?.first_name} {request.customer?.last_name}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 opacity-80">
            <span>#{request.id}</span>
            <span>•</span>
            <span>{request.move_size?.name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 opacity-80">
            <span>{timeWindowToString(startTime, endTime)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <UsersIcon className="size-3" />
              {crewSize}
            </span>
            {isDelivery && (
              <>
                <span>•</span>
                <span className="text-[10px] font-semibold uppercase">
                  Delivery
                </span>
              </>
            )}
          </div>
          <div className="flex gap-2 opacity-80">
            <span className="truncate">
              {request.origin.city}, {request.origin.state} {request.origin.zip}
            </span>
            <span>→</span>
            <span className="truncate">
              {request.destination.city}, {request.destination.state}{" "}
              {request.destination.zip}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
