import { GoogleMaps } from "@/components/google-maps/google-maps"
import { PencilLineIcon, PlusIcon, Trash2Icon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRequestUIBehavior } from "@/domains/requests/request.behavior"
import { storageIcons } from "@/domains/requests/request.constants"
import { requestKeys } from "@/domains/requests/request.keys"
import { useUpdateRequest } from "@/domains/requests/request.mutations"
import type { Address } from "@/domains/requests/request.types"
import { useEntranceTypes } from "@/hooks/api/use-entrance-types"
import { useSettings } from "@/hooks/api/use-settings"
import { useRequest } from "@/hooks/use-request"
import { queryClient } from "@/lib/query-client"
import { cn } from "@/lib/utils"
import { useSearchParams } from "react-router"
import { toast } from "sonner"

// ─── Timeline dot ───────────────────────────────────────────────────
function TimelineDot({
  color,
  isLast,
}: {
  color: "green" | "red" | "blue"
  isLast?: boolean
}) {
  const dotColor = {
    green: "bg-green-500 ring-green-500/20",
    red: "bg-red-500 ring-red-500/20",
    blue: "bg-blue-500 ring-blue-500/20",
  }[color]

  return (
    <div className="flex w-3 shrink-0 flex-col items-center pt-1">
      <div className={cn("size-3 shrink-0 rounded-full ring-4", dotColor)} />
      {!isLast && (
        <div className="w-0 flex-1 border-l-2 border-dashed border-muted-foreground/20" />
      )}
    </div>
  )
}

// ─── Timeline add-stop button (between dots) ────────────────────────
function TimelineAddStopButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="relative flex gap-3">
      {/* Continuous dashed line — same w-3 column as TimelineDot */}
      <div className="flex w-3 shrink-0 flex-col items-center">
        <div className="w-0 flex-1 border-l-2 border-dashed border-muted-foreground/20" />
      </div>
      {/* + button overlaid on the line, centered vertically */}
      <div className="items-center justify-center pb-5">
        <Button variant="outline" onClick={onClick}>
          <PlusIcon />
          Add a stop
        </Button>
      </div>
    </div>
  )
}

// ─── Timeline address item ──────────────────────────────────────────
function TimelineAddressItem({
  title,
  address,
  dotColor,
  isLast,
  canEdit,
  onEdit,
  onDelete,
}: {
  title: string
  address: Address
  dotColor: "green" | "red" | "blue"
  isLast?: boolean
  canEdit?: boolean
  onEdit?: () => void
  onDelete?: () => void
}) {
  const { data: entranceTypes } = useEntranceTypes()

  const floorName = address.floor_id
    ? entranceTypes?.find((f) => f.id === address.floor_id)?.name
    : null

  return (
    <div className="flex gap-3">
      <TimelineDot color={dotColor} isLast={isLast} />
      <div className={cn("flex min-w-0 flex-1 gap-2", !isLast && "pb-5")}>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="truncate text-sm">
            {address.street}
            {address.apt ? `, Apt ${address.apt}` : ""}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {address.city ? `${address.city}, ` : ""}
            {address.state} {address.zip}
          </p>
          {floorName && (
            <p className="text-xs text-muted-foreground">{floorName}</p>
          )}
        </div>
        {canEdit && (
          <div className="flex shrink-0 items-start gap-1">
            {onEdit && (
              <Button variant="outline" size="icon-sm" onClick={onEdit}>
                <PencilLineIcon />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2Icon />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Timeline storage item ──────────────────────────────────────────
function TimelineStorageItem({
  title,
  dotColor,
  isLast,
}: {
  title: string
  dotColor: "green" | "red"
  isLast?: boolean
}) {
  const { data: settings } = useSettings()

  const address = settings?.parking_address

  return (
    <div className="flex gap-3">
      <TimelineDot color={dotColor} isLast={isLast} />
      <div className={cn("min-w-0 flex-1", !isLast && "pb-5")}>
        <p className="text-sm font-semibold">{title}</p>
        <p className="truncate text-sm">{address ?? ""}</p>
        <div className="mt-2 pl-6">
          <img
            src={storageIcons["Moving with Storage"]}
            className="aspect-square size-10"
          />
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════
// Page
// ═════════════════════════════════════════════════════════════════════
export function AddressesCard() {
  const [, setSearchParams] = useSearchParams()
  const { data: settings } = useSettings()
  const parkingLocation = settings?.parking_location
  const { request } = useRequest()

  const { mutate: updateRequestMutation } = useUpdateRequest(
    {
      onSettled: (_, err) => {
        if (err) {
          toast.error("Failed to save changes")
        } else {
          if (request) {
            queryClient.invalidateQueries({
              queryKey: requestKeys.detail(request.id),
            })
            toast.success("Changes saved")
          }
        }
      },
    },
    { forceCalculate: true }
  )

  const {
    showOrigin,
    showDestination,
    showStorageOrigin,
    showStorageDestination,
  } = getRequestUIBehavior(request)

  const canEdit = request?.can_edit_request
  const hasStops = (request?.stops?.length ?? 0) > 0

  // Whether destination is the last item (no stops after it)
  const hasOriginSection = showOrigin || showStorageOrigin
  const hasDestinationSection = showDestination || showStorageDestination

  function openEditAddress(key: string) {
    setSearchParams({ edit_address: key })
  }

  function handleDeleteStop(index: number) {
    if (!request) return
    const newStops = request.stops?.filter((_, i) => i !== index) ?? []
    updateRequestMutation({
      id: request.id,
      data: { stops: newStops },
    })
  }

  // ── Build timeline items ──────────────────────────────────────────
  function renderAddressTimeline() {
    if (!request) return null
    const items: React.ReactNode[] = []

    // Origin
    if (showOrigin && request.origin) {
      items.push(
        <TimelineAddressItem
          key="origin"
          title="Origin"
          address={request.origin}
          dotColor="green"
          canEdit={canEdit}
          onEdit={() => openEditAddress("origin")}
          isLast={!hasStops && !showDestination && !showStorageDestination}
        />
      )
    }
    if (showStorageOrigin) {
      items.push(
        <TimelineStorageItem
          key="storage-origin"
          title="Company storage"
          dotColor="green"
        />
      )
    }

    // Add stop button (between origin and first stop / destination)
    if (canEdit && hasOriginSection && hasDestinationSection) {
      items.push(
        <TimelineAddStopButton
          key="add-stop-top"
          onClick={() => openEditAddress("new_stop")}
        />
      )
    }

    // Stops
    if (hasStops) {
      request.stops?.forEach((stop, i) => {
        items.push(
          <TimelineAddressItem
            key={`stop-${i}`}
            title={stop.type === "pick_up" ? "Extra pickup" : "Extra drop-off"}
            address={stop}
            dotColor="blue"
            canEdit={canEdit}
            onEdit={() => openEditAddress(`stop_${i}`)}
            onDelete={() => handleDeleteStop(i)}
          />
        )
      })
    }

    // Destination
    if (showDestination && request.destination) {
      items.push(
        <TimelineAddressItem
          key="destination"
          title="Destination"
          address={request.destination}
          dotColor="red"
          isLast
          canEdit={canEdit}
          onEdit={() => openEditAddress("destination")}
        />
      )
    }
    if (showStorageDestination) {
      items.push(
        <TimelineStorageItem
          key="storage-destination"
          title="Company storage"
          dotColor="red"
          isLast
        />
      )
    }

    return items
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Addresses</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Addresses timeline + Map */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Timeline addresses */}
          <div>{renderAddressTimeline()}</div>

          {/* Google Map */}
          <div className="max-h-[500px] min-h-50 overflow-hidden rounded-lg lg:h-full">
            <GoogleMaps
              origin={
                showOrigin
                  ? request?.origin.location
                  : showStorageOrigin
                    ? parkingLocation
                    : undefined
              }
              destination={
                showDestination
                  ? request?.destination.location
                  : showStorageDestination
                    ? parkingLocation
                    : undefined
              }
              waypoints={request?.stops?.flatMap((stop) =>
                stop.location ? [stop.location] : []
              )}
              className="h-full w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
