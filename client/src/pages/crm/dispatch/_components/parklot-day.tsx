import {
  ParklotGrid,
  ParklotDateSelector,
  ParklotJobs,
  ParklotTimeline,
  ParklotTrucks,
} from "@/components/parklot"
import { useGetDispatch } from "@/domains/dispatch/dispatch.queries"
import type { Request } from "@/domains/requests/request.types"
import { useTrucks } from "@/hooks/api/use-trucks"

interface ParklotDayProps {
  selectedDate: string | null
  setSelectedDate: (date: Date) => void
  selectedRequestId: number | null
  handleRequestClick: (request: Request) => void
}
export function ParklotDay({
  selectedDate,
  setSelectedDate,
  selectedRequestId,
  handleRequestClick,
}: ParklotDayProps) {
  const { data: trucks } = useTrucks({
    select: (data) => data.filter((truck) => truck.active),
  })

  const { data: dispatchSlots, isPending } = useGetDispatch(
    { date: selectedDate!, with_filters: true },
    {
      enabled: !!selectedDate,
    }
  )

  return (
    <ParklotGrid
      DateSelector={() => (
        <ParklotDateSelector
          hideCalendar
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      )}
      Trucks={() => <ParklotTrucks size="lg" trucks={trucks ?? []} />}
      Timeline={() => <ParklotTimeline />}
      Jobs={() => (
        <ParklotJobs
          size="lg"
          selectedRequestId={selectedRequestId}
          handleRequestClick={handleRequestClick}
          trucks={trucks ?? []}
          slots={dispatchSlots ?? {}}
        />
      )}
      isLoading={isPending}
    />
  )
}
