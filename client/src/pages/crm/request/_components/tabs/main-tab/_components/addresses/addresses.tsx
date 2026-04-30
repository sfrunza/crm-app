import { PlusIcon, Trash2Icon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { getRequestUIBehavior } from "@/domains/requests/request.behavior"
import { requestKeys } from "@/domains/requests/request.keys"
import {
  useCreateRequest,
  usePairRequests,
} from "@/domains/requests/request.mutations"
import type { Address, AddressType } from "@/domains/requests/request.types"
import { useRequest } from "@/hooks/use-request"
import { queryClient } from "@/lib/query-client"
import { ConnectRequestForm } from "../connect-request-form"
import { PairedRequestInfo } from "../paired-request-info"
import { AddressForm } from "./address-form"
import { OpenGoogleMapsButton } from "./open-google-maps-button"
import {
  AddressBox,
  AddressBoxAction,
  AddressBoxContent,
  AddressBoxHeader,
  AddressBoxTitle,
} from "./address-box"
import { ButtonGroup } from "@/components/ui/button-group"
import { useSettings } from "@/hooks/api/use-settings"

const getAddressString = (address: Address): string => {
  const location = address?.location
  if (!location?.lng || !location?.lat) return ""
  return `${address?.street}, ${address?.city}, ${address?.state} ${address?.zip}`
}

/** Form values use optional lat/lng; Address expects a full Location when present. */
type AddressFormPatch = {
  street?: string
  city?: string
  state?: string
  zip?: string
  apt?: string
  floor_id?: number | null
  location?: { lat?: number; lng?: number }
}

function mergeAddressFromForm(base: Address, patch: AddressFormPatch): Address {
  return {
    ...base,
    ...patch,
    location:
      patch.location !== undefined
        ? {
            lat: patch.location.lat ?? base.location?.lat ?? 0,
            lng: patch.location.lng ?? base.location?.lng ?? 0,
          }
        : base.location,
  }
}

export function Addresses() {
  const { data: settings } = useSettings()
  const { request, draft, setField, isDirty } = useRequest()

  const parkingAddress = settings?.parking_address
  const originAddress = draft?.origin
    ? getAddressString(draft?.origin)
    : undefined
  const destinationAddress = draft?.destination
    ? getAddressString(draft?.destination)
    : undefined

  const {
    showOrigin,
    showDestination,
    showStorageOrigin,
    showStorageDestination,
    showPairRequestsButtons,
  } = getRequestUIBehavior(draft)

  const totalDistance =
    showDestination && !showOrigin
      ? draft?.directions?.DP?.total_distance
      : showOrigin && !showDestination
        ? draft?.directions?.OP?.total_distance
        : draft?.directions?.OD?.total_distance

  const { mutate: pairRequestsMutation } = usePairRequests()

  const { mutate: createRequestMutation, isPending: isCreating } =
    useCreateRequest({
      onSettled: (newRequest, error) => {
        if (error) {
          queryClient.cancelQueries({ queryKey: requestKeys.lists() })
        }
        if (newRequest) {
          if (!request) return
          pairRequestsMutation({
            requestId: request.id,
            pairedRequestId: newRequest.id,
          })
        }
      },
    })

  function handleCreateDeliveryRequest() {
    if (!request) return
    createRequestMutation({
      ...request,
      moving_date: null,
      status: "pending",
      is_moving_from_storage: true,
      truck_ids: [],
    })
  }

  function handleAddExtraStop(type: AddressType) {
    const newStop: Address = {
      type,
      street: "",
      city: "",
      state: "",
      zip: "",
      floor_id: null,
      apt: "",
      location: { lat: 0, lng: 0 },
    }
    setField("stops", [...(draft?.stops || []), newStop])
  }

  function handleDeleteAddress(idx: number) {
    const newStops = draft?.stops?.filter((_, i) => i !== idx)
    if (!newStops) return
    setField("stops", newStops)
  }

  return (
    <div className="grid gap-y-6 *:px-4 md:grid-cols-2">
      {/* Origin */}
      <AddressBox>
        {(showOrigin || showStorageOrigin) && (
          <AddressBoxHeader>
            <AddressBoxTitle
              title="Origin"
              origin={parkingAddress}
              destination={originAddress}
            />
          </AddressBoxHeader>
        )}
        <AddressBoxContent>
          {showOrigin && (
            <AddressForm
              data={draft?.origin}
              onAddressChange={(values) => {
                if (!draft?.origin) return
                setField("origin", mergeAddressFromForm(draft.origin, values))
              }}
            />
          )}
          {showStorageOrigin && request && (
            <PairedRequestInfo
              currentRequestId={request.id}
              service={request.service}
              movingDate={request.paired_request?.moving_date}
              pairedRequestId={request.paired_request_id}
              type="in"
            />
          )}
        </AddressBoxContent>
      </AddressBox>

      {/* Destination */}
      <AddressBox>
        {(showDestination ||
          showStorageDestination ||
          showPairRequestsButtons) && (
          <AddressBoxHeader>
            <AddressBoxTitle
              title="Destination"
              origin={destinationAddress}
              destination={parkingAddress}
            />
            <AddressBoxAction>
              <OpenGoogleMapsButton
                origin={showOrigin ? originAddress : parkingAddress}
                destination={
                  showDestination ? destinationAddress : parkingAddress
                }
                stops={draft?.stops?.map((stop) => getAddressString(stop))}
              >
                Total {totalDistance} miles
              </OpenGoogleMapsButton>
            </AddressBoxAction>
          </AddressBoxHeader>
        )}
        <AddressBoxContent>
          {showDestination && (
            <AddressForm
              data={draft?.destination}
              onAddressChange={(values) => {
                if (!draft?.destination) return
                setField(
                  "destination",
                  mergeAddressFromForm(draft.destination, values)
                )
              }}
            />
          )}
          {showPairRequestsButtons && (
            <div className="space-y-2">
              <Button
                disabled={isDirty || isCreating}
                onClick={handleCreateDeliveryRequest}
                className="w-full"
                variant="outline"
              >
                <LoadingSwap
                  isLoading={isCreating}
                  className="inline-flex items-center justify-center gap-1.5"
                >
                  <PlusIcon />
                  Create delivery request
                </LoadingSwap>
              </Button>
              <ConnectRequestForm />
            </div>
          )}
          {showStorageDestination && request && (
            <PairedRequestInfo
              currentRequestId={request.id}
              service={request.service}
              movingDate={request.paired_request?.moving_date}
              pairedRequestId={request.paired_request_id}
              type="out"
            />
          )}
        </AddressBoxContent>
      </AddressBox>

      {/* Extra Stops */}
      {draft?.stops?.map((stop, i) => (
        <AddressBox key={i}>
          <AddressBoxHeader>
            <AddressBoxTitle
              title={stop.type === "pick_up" ? "Extra pickup" : "Extra dropoff"}
            />
            <AddressBoxAction>
              <Button
                size="icon"
                type="button"
                variant="ghost"
                onClick={() => handleDeleteAddress(i)}
              >
                <Trash2Icon />
              </Button>
            </AddressBoxAction>
          </AddressBoxHeader>
          <AddressBoxContent>
            <AddressForm
              data={stop}
              onAddressChange={(values) => {
                setField(
                  "stops",
                  draft?.stops?.map((stop, j) =>
                    j === i ? mergeAddressFromForm(stop, values) : stop
                  )
                )
              }}
            />
          </AddressBoxContent>
        </AddressBox>
      ))}

      {/* Add Extra Stops Buttons */}
      <div className="px-6 md:col-span-2">
        <ButtonGroup>
          <Button
            variant="outline"
            type="button"
            onClick={() => handleAddExtraStop("pick_up")}
          >
            <PlusIcon />
            Add pickup
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => handleAddExtraStop("drop_off")}
          >
            <PlusIcon />
            Add drop off
          </Button>
        </ButtonGroup>
      </div>
    </div>
  )
}
