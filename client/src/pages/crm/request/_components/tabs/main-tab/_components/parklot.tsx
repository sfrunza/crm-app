import { getRequestUIBehavior } from "@/domains/requests/request.behavior";
import type { Request } from "@/domains/requests/request.types";
import {
  ParklotDateSelector,
  ParklotGrid,
  ParklotJobs,
  ParklotTimeline,
  ParklotTrucks,
} from "@/components/parklot";
import { useParklot } from "@/hooks/use-parklot";
import { useRequest } from "@/hooks/use-request";
import { formatDate } from "@/lib/format-date";
import { openRequest } from "@/stores/use-open-requests-store";
import { useMemo } from "react";
import { useTrucks } from "@/hooks/api/use-trucks";

export function Parklot() {
  const { draft, setField } = useRequest();
  const { showIfFlatRate } = getRequestUIBehavior(draft);

  const {
    isPending,
    selectedDate,
    selectedRequestId,
    parklotContext,
    dispatchSlots,
    setSelectedDate,
    setSelectedRequestId,
    setParklotContext,
  } = useParklot(draft);

  const { data: trucks } = useTrucks({
    select: (data) => data.filter((truck) => truck.active),
  });

  // Use the explicit context from the store (set by the Pickup/Delivery tabs)
  const isDeliveryContext = parklotContext === "delivery";

  // Get the appropriate truck_ids based on context
  const activeTruckIds = useMemo(() => {
    if (!draft) return [];
    return isDeliveryContext
      ? (draft.delivery_truck_ids ?? [])
      : (draft.pickup_truck_ids ?? draft.truck_ids ?? []);
  }, [draft, isDeliveryContext]);

  function handleDateChange(date: Date) {
    setSelectedDate(formatDate(date, "yyyy-MM-dd"));
  }

  function handleRequestClick(request: Request) {
    if (draft?.id === request.id) {
      setSelectedRequestId(request.id);
      return;
    }
    // Open a different request in the overlay
    openRequest(request.id);
  }

  function handleTruckClick(truckId: number) {
    const field = isDeliveryContext ? "delivery_truck_ids" : "pickup_truck_ids";
    const currentIds = activeTruckIds;

    if (currentIds.includes(truckId)) {
      setField(
        field,
        currentIds.filter((id) => id !== truckId),
      );
    } else {
      setField(field, [...currentIds, truckId]);
    }
  }

  return (
    <ParklotGrid
      DateSelector={() => (
        <ParklotDateSelector
          selectedDate={selectedDate}
          setSelectedDate={handleDateChange}
          movingDate={draft?.moving_date}
          deliveryDate={draft?.delivery_date_window_start}
          scheduleStartDate={draft?.schedule_date_window_start}
          showDateTabs={showIfFlatRate && !draft?.is_same_day_delivery && !!draft?.schedule_date_window_start}
          activeTab={parklotContext}
          onTabChange={setParklotContext}
        />
      )}
      Trucks={() => (
        <ParklotTrucks
          trucks={trucks ?? []}
          onTruckClick={handleTruckClick}
          selectedTrucks={activeTruckIds}
        />
      )}
      Timeline={() => <ParklotTimeline />}
      Jobs={() => (
        <ParklotJobs
          selectedRequestId={selectedRequestId}
          handleRequestClick={handleRequestClick}
          trucks={trucks ?? []}
          slots={dispatchSlots}
        />
      )}
      isLoading={isPending}
    />
  );
}
