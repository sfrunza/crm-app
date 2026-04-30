import { useGetDispatch } from "@/domains/dispatch/dispatch.queries";
import type { ParklotSlot, Request } from "@/domains/requests/request.types";
import { useParklotStore } from "@/stores/use-parklot-store";
import { formatDate, parseDateOnly } from "@/lib/format-date";
import { useMemo } from "react";

const GRID_START = 420; // 7:00 AM in minutes
const GRID_END = 1320; // 10:00 PM in minutes

type DateLike = Parameters<typeof formatDate>[0];

function normalizeDateKey(value: DateLike) {
  const formatted = formatDate(value, "yyyy-MM-dd");
  return formatted === "TBD" ? null : formatted;
}

// ====================================================================
// PICKUP: single slot on the moving date.
// Mirrors server-side ParklotSlotGenerator#build_pickup_slot.
// ====================================================================

function computePickupSlotTimes(
  draft: Request,
): { startMinutes: number; endMinutes: number } {
  const start = draft.start_time_window ?? GRID_START;
  const duration = getJobDuration(draft);
  return { startMinutes: start, endMinutes: start + duration };
}

// ====================================================================
// DELIVERY: schedule window days, uses schedule/delivery time windows.
// Mirrors server-side ParklotSlotGenerator#delivery_time_for_day.
// ====================================================================

function computeDeliverySlotTimes(
  draft: Request,
  selectedDate: string,
): { startMinutes: number; endMinutes: number } {
  const schedStart = draft.schedule_date_window_start;
  const schedEnd = draft.schedule_date_window_end;

  const isFirst = selectedDate === schedStart;
  const isLast = selectedDate === schedEnd;

  if (isFirst && isLast) {
    return {
      startMinutes:
        draft.start_time_window_schedule ??
        draft.start_time_window_delivery ??
        GRID_START,
      endMinutes:
        draft.end_time_window_schedule ??
        draft.end_time_window_delivery ??
        GRID_END,
    };
  }
  if (isFirst) {
    return {
      startMinutes:
        draft.start_time_window_schedule ??
        draft.start_time_window_delivery ??
        GRID_START,
      endMinutes: GRID_END,
    };
  }
  if (isLast) {
    return {
      startMinutes: GRID_START,
      endMinutes:
        draft.end_time_window_schedule ??
        draft.end_time_window_delivery ??
        GRID_END,
    };
  }
  // Middle day
  return { startMinutes: GRID_START, endMinutes: GRID_END };
}

function getJobDuration(draft: Request): number {
  const workMax = draft.work_time?.max ?? 0;
  const travel = draft.travel_time ?? 0;
  const minTotal = draft.min_total_time ?? 0;
  return Math.max(workMax + travel, minTotal);
}

function isDateWithinRange(
  target: string | null,
  start?: string | null,
  end?: string | null,
) {
  if (!target || (!start && !end)) return false;
  const targetDate = parseDateOnly(target);
  const startDate = start ? parseDateOnly(start) : null;
  const endDate = end ? parseDateOnly(end) : null;
  if (!targetDate) return false;
  if (startDate && endDate)
    return startDate <= targetDate && targetDate <= endDate;
  if (startDate && !endDate) return startDate <= targetDate;
  if (!startDate && endDate) return targetDate <= endDate;
  return false;
}

// ====================================================================
// Build virtual PICKUP draft slot (moving date only, pickup trucks).
// ====================================================================

function buildPickupDraftSlots(
  draft: Request,
  selectedDate: string,
): ParklotSlot[] {
  if (!draft.moving_date) return [];

  const truckIds = draft.pickup_truck_ids ?? draft.truck_ids ?? [];
  if (truckIds.length === 0) return [];

  const draftDateKey = normalizeDateKey(draft.moving_date);
  if (draftDateKey !== selectedDate) return [];

  const { startMinutes, endMinutes } = computePickupSlotTimes(draft);

  return truckIds.map((truckId, index) => ({
    id: -(draft.id * 100 + index),
    slot_type: "pickup" as const,
    is_moving_day: true,
    start_minutes: startMinutes,
    end_minutes: endMinutes,
    date: selectedDate,
    truck_id: truckId,
    request: draft,
  }));
}

// ====================================================================
// Build virtual DELIVERY draft slots (schedule window, delivery trucks).
// ====================================================================

function buildDeliveryDraftSlots(
  draft: Request,
  selectedDate: string,
): ParklotSlot[] {
  const truckIds = draft.delivery_truck_ids ?? [];
  if (truckIds.length === 0) return [];

  // Delivery spans the schedule window
  const isScheduleDay = isDateWithinRange(
    selectedDate,
    draft.schedule_date_window_start,
    draft.schedule_date_window_end,
  );
  if (!isScheduleDay) return [];

  const { startMinutes, endMinutes } = computeDeliverySlotTimes(
    draft,
    selectedDate,
  );

  return truckIds.map((truckId, index) => ({
    id: -(draft.id * 100 + index + 50),
    slot_type: "delivery" as const,
    is_moving_day: false,
    start_minutes: startMinutes,
    end_minutes: endMinutes,
    date: selectedDate,
    truck_id: truckId,
    request: draft,
  }));
}

// ====================================================================
// Hook
// ====================================================================

export function useParklot(draft?: Request | null) {
  const selectedDate = useParklotStore((state) => state.selectedDate);
  const selectedRequestId = useParklotStore(
    (state) => state.selectedRequestId,
  );
  const parklotContext = useParklotStore((state) => state.parklotContext);
  const setSelectedDate = useParklotStore((state) => state.setSelectedDate);
  const setSelectedRequestId = useParklotStore(
    (state) => state.setSelectedRequestId,
  );
  const setParklotContext = useParklotStore(
    (state) => state.setParklotContext,
  );

  const { data: serverDispatchSlots, isPending } = useGetDispatch(
    { date: selectedDate },
    { enabled: !!selectedDate },
  );


  // console.log("serverDispatchSlots", serverDispatchSlots);

  const dispatchSlots = useMemo<Record<number, ParklotSlot[]>>(() => {
    // Start with a copy of the server data
    const baseMap = new Map<number, ParklotSlot[]>();
    if (serverDispatchSlots) {
      Object.entries(serverDispatchSlots).forEach(([truckId, slots]) => {
        baseMap.set(Number(truckId), [...slots]);
      });
    }

    if (!draft) {
      return Object.fromEntries(baseMap) as Record<number, ParklotSlot[]>;
    }

    // Always remove stale server slots for this draft request from all trucks.
    // We'll replace them with fresh draft slots that reflect the user's edits.
    baseMap.forEach((slots, truckId) => {
      baseMap.set(
        truckId,
        slots.filter((slot) => slot.request.id !== draft.id),
      );
    });

    // Build BOTH pickup and delivery draft slots for the current date.
    // They are naturally exclusive by date:
    //   • Pickup only matches the moving date
    //   • Delivery only matches schedule window dates
    const pickupDrafts = buildPickupDraftSlots(draft, selectedDate);
    const deliveryDrafts = buildDeliveryDraftSlots(draft, selectedDate);

    for (const slot of [...pickupDrafts, ...deliveryDrafts]) {
      const current = baseMap.get(slot.truck_id) ?? [];
      baseMap.set(slot.truck_id, [...current, slot]);
    }

    return Object.fromEntries(baseMap) as Record<number, ParklotSlot[]>;
  }, [serverDispatchSlots, draft, selectedDate]);

  return {
    isPending,
    selectedDate,
    selectedRequestId,
    parklotContext,
    dispatchSlots,
    serverDispatchSlots,
    setSelectedDate,
    setSelectedRequestId,
    setParklotContext,
  };
}
