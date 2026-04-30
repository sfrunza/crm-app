import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { LoadingSwap } from "@/components/ui/loading-swap"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { dispatchKeys } from "@/domains/dispatch/dispatch.keys"
import { useGetDispatch } from "@/domains/dispatch/dispatch.queries"
import { useGetEmployees } from "@/domains/employees/employee.queries"
import { requestKeys } from "@/domains/requests/request.keys"
import { useUpdateRequest } from "@/domains/requests/request.mutations"
import { useGetRequestById } from "@/domains/requests/request.queries"
import type { Request } from "@/domains/requests/request.types"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────

type CrewContext = "pickup" | "delivery"

interface CrewAssignmentFormProps {
  requestId: number
  selectedDate: string
}

interface CrewSectionProps {
  context: CrewContext
  request: Request
  crewSize: number
  sameTruckCrew: { foremanId: number | null; moverIds: number[] }
  foremen: Employee[]
  allMovers: Employee[]
  requestId: number
}

type Employee = {
  id: number
  first_name: string
  last_name: string
  role: string
  active: boolean
}

// ─────────────────────────────────────────────────
// Main form
// ─────────────────────────────────────────────────

export function CrewAssignmentForm({
  requestId,
  selectedDate,
}: CrewAssignmentFormProps) {
  const { data: request, isPending: isRequestPending } = useGetRequestById(
    requestId,
    { enabled: !!requestId }
  )

  const { data: employees } = useGetEmployees()

  const { data: dispatchData } = useGetDispatch(
    { date: selectedDate, with_filters: true },
    { enabled: !!selectedDate }
  )

  // Employee lists
  const foremen = useMemo(
    () =>
      (employees?.filter(
        (e) => e.role === "foreman" && e.active
      ) as Employee[]) ?? [],
    [employees]
  )

  const allMovers = useMemo(
    () =>
      (employees?.filter(
        (e) =>
          (e.role === "helper" ||
            e.role === "driver" ||
            e.role === "foreman") &&
          e.active
      ) as Employee[]) ?? [],
    [employees]
  )

  // Find which truck this request belongs to
  const truckForRequest = useMemo(() => {
    if (!dispatchData) return null
    for (const [truckId, slots] of Object.entries(dispatchData)) {
      if (slots.some((s) => s.request.id === requestId)) {
        return Number(truckId)
      }
    }
    return null
  }, [dispatchData, requestId])

  // Pickup same-truck crew
  const sameTruckCrewPickup = useMemo(() => {
    if (!truckForRequest || !dispatchData)
      return { foremanId: null as number | null, moverIds: [] as number[] }

    const truckSlots = dispatchData[truckForRequest] ?? []
    let foremanId: number | null = null
    const moverIds = new Set<number>()

    for (const slot of truckSlots) {
      const r = slot.request
      if (r.id === requestId) continue
      if (r.foreman_id && !foremanId) foremanId = r.foreman_id
      ;(r.pickup_mover_ids ?? r.mover_ids ?? []).forEach((id) =>
        moverIds.add(id)
      )
    }

    return { foremanId, moverIds: Array.from(moverIds) }
  }, [dispatchData, truckForRequest, requestId])

  // Delivery same-truck crew
  const sameTruckCrewDelivery = useMemo(() => {
    if (!truckForRequest || !dispatchData)
      return { foremanId: null as number | null, moverIds: [] as number[] }

    const truckSlots = dispatchData[truckForRequest] ?? []
    let foremanId: number | null = null
    const moverIds = new Set<number>()

    for (const slot of truckSlots) {
      const r = slot.request
      if (r.id === requestId) continue
      if (r.foreman_id_delivery && !foremanId) foremanId = r.foreman_id_delivery
      ;(r.delivery_mover_ids ?? []).forEach((id) => moverIds.add(id))
    }

    return { foremanId, moverIds: Array.from(moverIds) }
  }, [dispatchData, truckForRequest, requestId])

  // Is this a multi-day request?
  const isMultiDay =
    !!request &&
    !request.is_same_day_delivery &&
    !!request.schedule_date_window_start

  const pickupCrewSize = request?.crew_size ?? 0
  const deliveryCrewSize = request?.crew_size_delivery ?? 0

  // ─── Render ───

  if (isRequestPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-5" />
      </div>
    )
  }

  if (!request) return null

  return (
    <div className="mt-5 space-y-4">
      {/* Pickup Crew (always shown) */}
      <CrewSection
        context="pickup"
        request={request}
        crewSize={pickupCrewSize}
        sameTruckCrew={sameTruckCrewPickup}
        foremen={foremen}
        allMovers={allMovers}
        requestId={requestId}
      />

      {/* Delivery Crew (only for multi-day) */}
      {isMultiDay && (
        <>
          <Separator />
          <CrewSection
            context="delivery"
            request={request}
            crewSize={deliveryCrewSize}
            sameTruckCrew={sameTruckCrewDelivery}
            foremen={foremen}
            allMovers={allMovers}
            requestId={requestId}
          />
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────
// Crew section sub-component (pickup or delivery)
// ─────────────────────────────────────────────────

function CrewSection({
  context,
  request,
  crewSize,
  sameTruckCrew,
  foremen,
  allMovers,
  requestId,
}: CrewSectionProps) {
  const queryClient = useQueryClient()
  const isDelivery = context === "delivery"
  const moversNeeded = Math.max(crewSize - 1, 0)

  const updateRequest = useUpdateRequest({
    onSettled: (_, error) => {
      if (error) {
        toast.error(`Failed to save crew assignment: ${error.message}`)
      } else {
        toast.success(
          isDelivery
            ? "Delivery crew assignment saved"
            : "Crew assignment saved"
        )
        queryClient.invalidateQueries({ queryKey: dispatchKeys.all() })
        queryClient.invalidateQueries({
          queryKey: requestKeys.detail(requestId),
        })
      }
    },
  })

  // ─── Local state ───

  const [selectedForemanId, setSelectedForemanId] = useState<string>("")
  const [selectedMoverIds, setSelectedMoverIds] = useState<string[]>([])

  // Sync from request data, auto-populate from same truck if request has no crew
  useEffect(() => {
    const requestForemanId = isDelivery
      ? request.foreman_id_delivery
      : request.foreman_id
    const foremanId = requestForemanId ?? sameTruckCrew.foremanId
    setSelectedForemanId(foremanId ? String(foremanId) : "")

    const requestMoverIds = isDelivery
      ? (request.delivery_mover_ids ?? [])
      : (request.pickup_mover_ids ?? request.mover_ids ?? [])
    const moverSlots = new Array(moversNeeded).fill("")
    const moverSource =
      requestMoverIds.length > 0 ? requestMoverIds : sameTruckCrew.moverIds

    moverSource.forEach((id, index) => {
      if (index < moversNeeded) {
        moverSlots[index] = String(id)
      }
    })
    setSelectedMoverIds(moverSlots)
  }, [request, moversNeeded, sameTruckCrew, isDelivery])

  // Keep mover slots in sync with moversNeeded
  useEffect(() => {
    setSelectedMoverIds((prev) => {
      if (prev.length < moversNeeded) {
        return [...prev, ...new Array(moversNeeded - prev.length).fill("")]
      }
      if (prev.length > moversNeeded) {
        return prev.slice(0, moversNeeded)
      }
      return prev
    })
  }, [moversNeeded])

  // ─── Self-dedup filtering ───

  const allSelectedIds = useMemo(() => {
    const ids = new Set<string>()
    if (selectedForemanId) ids.add(selectedForemanId)
    selectedMoverIds.forEach((id) => {
      if (id) ids.add(id)
    })
    return ids
  }, [selectedForemanId, selectedMoverIds])

  function getAvailableForemenForSelect() {
    return foremen.filter(
      (f) =>
        !allSelectedIds.has(String(f.id)) || String(f.id) === selectedForemanId
    )
  }

  function getAvailableMoversForSlot(slotIndex: number) {
    const available = allMovers.filter(
      (m) =>
        !allSelectedIds.has(String(m.id)) ||
        String(m.id) === selectedMoverIds[slotIndex]
    )

    return {
      drivers: available.filter((m) => m.role === "driver"),
      helpers: available.filter((m) => m.role === "helper"),
      foremen: available.filter((m) => m.role === "foreman"),
    }
  }

  // ─── Handlers ───

  function handleMoverChange(index: number, value: string) {
    setSelectedMoverIds((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  function handleSave() {
    const foremanId = selectedForemanId ? Number(selectedForemanId) : null
    const moverIds = selectedMoverIds.filter((id) => id !== "").map(Number)

    if (isDelivery) {
      updateRequest.mutate({
        id: requestId,
        data: {
          foreman_id_delivery: foremanId,
          delivery_mover_ids: moverIds,
        },
      })
    } else {
      updateRequest.mutate({
        id: requestId,
        data: {
          foreman_id: foremanId,
          pickup_mover_ids: moverIds,
        },
      })
    }
  }

  function handleUnassign() {
    if (isDelivery) {
      updateRequest.mutate({
        id: requestId,
        data: {
          foreman_id_delivery: null,
          delivery_mover_ids: [],
        },
      })
    } else {
      updateRequest.mutate({
        id: requestId,
        data: {
          foreman_id: null,
          pickup_mover_ids: [],
        },
      })
    }
  }

  // ─── Derived state for UI ───

  const requestForemanId = isDelivery
    ? request.foreman_id_delivery
    : request.foreman_id
  const requestMoverIds = isDelivery
    ? (request.delivery_mover_ids ?? [])
    : (request.pickup_mover_ids ?? request.mover_ids ?? [])

  const hasChanges =
    String(requestForemanId ?? "") !== selectedForemanId ||
    JSON.stringify(requestMoverIds.map(String)) !==
      JSON.stringify(selectedMoverIds.filter((id) => id !== ""))

  const hasCrewAssigned = !!requestForemanId || requestMoverIds.length > 0

  const isAutoPopulated =
    !requestForemanId &&
    !requestMoverIds.length &&
    (!!sameTruckCrew.foremanId || sameTruckCrew.moverIds.length > 0)

  // ─── Render ───

  return (
    <FieldGroup className="p-4">
      <FieldSet className="gap-2">
        <FieldLegend>
          {isDelivery ? "Delivery crew" : "Crew assignment"}
          <span className="ml-2 text-xs text-muted-foreground">
            (Size: {crewSize})
          </span>
        </FieldLegend>

        {isDelivery && (
          <div className="flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5 text-xs">
            <span>Assigning crew for delivery</span>
          </div>
        )}

        {isAutoPopulated && (
          <div className="flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5 text-xs">
            <span className="text-muted-foreground">
              Auto-filled from same truck crew
            </span>
          </div>
        )}

        {crewSize === 0 ? (
          <p className="text-xs text-muted-foreground">
            No {isDelivery ? "delivery " : ""}crew size set for this request.
          </p>
        ) : (
          <FieldGroup className="gap-4">
            {/* Foreman Select */}
            <Field>
              <FieldLabel htmlFor={`foreman-${context}`}>Foreman</FieldLabel>
              <Select
                name={`foreman-${context}`}
                value={selectedForemanId}
                onValueChange={setSelectedForemanId}
              >
                <SelectTrigger
                  id={`foreman-${context}`}
                  className="w-full"
                  size="sm"
                >
                  <SelectValue placeholder="Select foreman" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {getAvailableForemenForSelect().map((foreman) => (
                      <SelectItem key={foreman.id} value={String(foreman.id)}>
                        {foreman.first_name} {foreman.last_name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            {/* Mover Selects */}
            {moversNeeded > 0 && (
              <Field>
                <FieldLabel>Movers</FieldLabel>
                {Array.from({ length: moversNeeded }).map((_, index) => {
                  const grouped = getAvailableMoversForSlot(index)
                  return (
                    <Select
                      key={index}
                      value={selectedMoverIds[index] ?? ""}
                      onValueChange={(value) => handleMoverChange(index, value)}
                    >
                      <SelectTrigger className="w-full" size="sm">
                        <SelectValue
                          placeholder={`Select mover ${index + 1}`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {grouped.drivers.length > 0 && (
                          <SelectGroup>
                            <SelectLabel>Drivers</SelectLabel>
                            {grouped.drivers.map((m) => (
                              <SelectItem key={m.id} value={String(m.id)}>
                                {m.first_name} {m.last_name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                        {grouped.helpers.length > 0 && (
                          <SelectGroup>
                            <SelectLabel>Helpers</SelectLabel>
                            {grouped.helpers.map((m) => (
                              <SelectItem key={m.id} value={String(m.id)}>
                                {m.first_name} {m.last_name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                        {grouped.foremen.length > 0 && (
                          <SelectGroup>
                            <SelectLabel>Foremen</SelectLabel>
                            {grouped.foremen.map((m) => (
                              <SelectItem key={m.id} value={String(m.id)}>
                                {m.first_name} {m.last_name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                      </SelectContent>
                    </Select>
                  )
                })}
              </Field>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateRequest.isPending || !hasChanges}
              >
                <LoadingSwap isLoading={updateRequest.isPending}>
                  {isDelivery ? "Assign delivery crew" : "Assign crew"}
                </LoadingSwap>
              </Button>
              {hasCrewAssigned && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUnassign}
                  disabled={updateRequest.isPending}
                >
                  <LoadingSwap isLoading={updateRequest.isPending}>
                    Unassign
                  </LoadingSwap>
                </Button>
              )}
            </div>
          </FieldGroup>
        )}
      </FieldSet>
    </FieldGroup>
  )
}
