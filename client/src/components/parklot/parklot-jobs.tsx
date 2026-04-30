import { STATUS_BG_COLOR } from "@/domains/requests/request.constants";
import type {
  ParklotSlot,
  Request,
  Status,
} from "@/domains/requests/request.types";
import type { Truck } from "@/types/index";
import { cn } from "@/lib/utils";
import { Fragment } from "react";
import { ParklotJobInfoLarge } from "./parklot-job-info-large";
import { ParklotJobInfoSmall } from "./parklot-job-info-small";

const TIME_SLOTS = [
  "07 AM",
  "08 AM",
  "09 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "01 PM",
  "02 PM",
  "03 PM",
  "04 PM",
  "05 PM",
  "06 PM",
  "07 PM",
  "08 PM",
  "09 PM",
];

const GRID_START_HOUR = 7; // 7 AM
const TOTAL_SLOTS = TIME_SLOTS.length;
const SCHEDULE_BG_COLOR = "bg-yellow-300";
// const DELIVERY_BG_COLOR = "bg-blue-300";

const minutesToGridPosition = (minutes: number): number => {
  const hours = minutes / 60;
  return ((hours - GRID_START_HOUR) / TOTAL_SLOTS) * 100;
};

const durationToWidth = (durationMinutes: number): number => {
  return (durationMinutes / 60 / TOTAL_SLOTS) * 100;
};

const getRequestDurationMinutes = (request: Request): number => {
  const totalMax = (request.work_time?.max ?? 0) + (request.travel_time ?? 0);
  const minTotal = request.min_total_time ?? 0;
  return Math.max(totalMax, minTotal);
};

interface ParklotJobsProps {
  selectedRequestId: number | null;
  trucks: Truck[];
  slots: Record<number, ParklotSlot[]>;
  handleRequestClick: (request: Request) => void;
  size?: "sm" | "lg";
}

export function ParklotJobs({
  selectedRequestId,
  handleRequestClick,
  trucks,
  slots,
  size = "sm",
}: ParklotJobsProps) {
  const rowHight = {
    sm: "auto-rows-[55px]",
    lg: "auto-rows-[100px]",
  };

  const border = {
    sm: "border-b border-r",
    lg: "border-b",
  };

  return (
    <div className={cn("grid", rowHight[size])}>
      {trucks?.map((truck) => (
        <div key={truck.id} className="relative">
          <div className="grid h-full auto-cols-[70px] grid-flow-col grid-rows-[100%]">
            {TIME_SLOTS.map((time) => (
              <div key={time} className={cn(border[size])}>
                {" "}
              </div>
            ))}
          </div>
          {(slots?.[truck.id] ?? []).map((slot) => {
            const left = minutesToGridPosition(slot.start_minutes);
            const width = durationToWidth(
              slot.end_minutes - slot.start_minutes
            );
            const isActive = selectedRequestId === slot.request.id;
            const bgColor = SCHEDULE_BG_COLOR;

            const statusDurationMinutes = getRequestDurationMinutes(
              slot.request
            );
            const jobWidth = Math.min(
              durationToWidth(statusDurationMinutes),
              100
            );

            console.log("slot", slot);

            const jobNode =
              size === "lg" ? (
                <div>
                  {/* Schedule / delivery bubble */}
                  <ParklotJobInfoLarge
                    request={slot.request}
                    slotType={slot.slot_type}
                    isActive={isActive}
                    left={left}
                    width={width}
                    bgClass={bgColor}
                    handleRequestClick={handleRequestClick}
                    className="text-foreground dark:text-muted"
                  />
                  {/* Status-colored bar on the actual moving day */}
                  {slot.is_moving_day && (
                    <ParklotJobInfoLarge
                      request={slot.request}
                      slotType={slot.slot_type}
                      isActive={isActive}
                      left={left}
                      width={jobWidth}
                      bgClass={STATUS_BG_COLOR[slot.request.status as Status]}
                      handleRequestClick={handleRequestClick}
                    />
                  )}
                </div>
              ) : (
                <div>
                  <ParklotJobInfoSmall
                    request={slot.request}
                    slotType={slot.slot_type}
                    isActive={isActive}
                    left={left}
                    width={width}
                    bgClass={bgColor}
                    className="text-foreground dark:text-muted"
                  />
                  {slot.is_moving_day && (
                    <ParklotJobInfoSmall
                      request={slot.request}
                      slotType={slot.slot_type}
                      isActive={isActive}
                      left={left}
                      width={jobWidth}
                      bgClass={STATUS_BG_COLOR[slot.request.status as Status]}
                      className="z-10"
                    />
                  )}
                </div>
              );

            return <Fragment key={slot.id}>{jobNode}</Fragment>;
          })}
        </div>
      ))}
    </div>
  );
}
