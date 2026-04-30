import type { Request } from "./request.types"
import type { ServiceCode } from "@/types/enums"

type ServiceBehavior = {
  hasOrigin: boolean
  hasDestination: boolean
  isStorage: boolean
  isFlatRate: boolean
}

const DEFAULT_SERVICE_BEHAVIOR: ServiceBehavior = {
  hasOrigin: false,
  hasDestination: false,
  isStorage: false,
  isFlatRate: false,
}

export const SERVICE_BEHAVIOR_MAP = {
  local_move: {
    hasOrigin: true,
    hasDestination: true,
    isStorage: false,
    isFlatRate: false,
  },
  flat_rate: {
    hasOrigin: true,
    hasDestination: true,
    isStorage: false,
    isFlatRate: true,
  },
  moving_with_storage: {
    hasOrigin: true,
    hasDestination: true,
    isStorage: true,
    isFlatRate: false,
  },

  overnight_truck_storage: {
    hasOrigin: true,
    hasDestination: false,
    isStorage: true,
    isFlatRate: false,
  },

  loading_help: {
    hasOrigin: true,
    hasDestination: false,
    isStorage: false,
    isFlatRate: false,
  },

  unloading_help: {
    hasOrigin: false,
    hasDestination: true,
    isStorage: false,
    isFlatRate: false,
  },

  packing_only: {
    hasOrigin: true,
    hasDestination: false,
    isStorage: false,
    isFlatRate: false,
  },
} satisfies Record<ServiceCode, ServiceBehavior>

function isServiceCode(code: unknown): code is ServiceCode {
  return typeof code === 'string' && code in SERVICE_BEHAVIOR_MAP
}


export function getServiceBehavior(code?: unknown): ServiceBehavior {
  if (isServiceCode(code)) return SERVICE_BEHAVIOR_MAP[code]
  return DEFAULT_SERVICE_BEHAVIOR
}

type RequestUIBehavior = {
  showOrigin: boolean
  showDestination: boolean
  showStorageOrigin: boolean
  showStorageDestination: boolean
  showPairRequestsButtons: boolean
  showDeliveryDateTime: boolean
  showTransitDateTime: boolean
  showIfFlatRate: boolean
}

const DEFAULT_REQUEST_UI_BEHAVIOR: RequestUIBehavior = {
  showOrigin: false,
  showDestination: false,
  showStorageOrigin: false,
  showStorageDestination: false,
  showPairRequestsButtons: false,
  showDeliveryDateTime: false,
  showTransitDateTime: false,
  showIfFlatRate: false,
}

type RequestLikeForUIBehavior = Pick<
  Request,
  'paired_request_id' | 'is_moving_from_storage' | 'is_same_day_delivery'
> & {
  service?: { code?: unknown } | null
}


export function getRequestUIBehavior(
  request: RequestLikeForUIBehavior | null | undefined,
): RequestUIBehavior {
  if (!request?.service) return DEFAULT_REQUEST_UI_BEHAVIOR

  const {
    service,
    is_moving_from_storage,
    paired_request_id,
    is_same_day_delivery,
  } = request

  const behavior = getServiceBehavior(service.code)
  const hasPairedRequest = paired_request_id != null

  const showOrigin = behavior.isStorage
    ? !is_moving_from_storage
    : behavior.hasOrigin

  const showDestination = behavior.isStorage
    ? is_moving_from_storage
    : behavior.hasDestination

  const showDeliveryDateTime = behavior.isFlatRate && !is_same_day_delivery || hasPairedRequest && !is_moving_from_storage


  return {
    showOrigin,
    showDestination,
    showStorageOrigin:
      behavior.isStorage && is_moving_from_storage && hasPairedRequest,
    showStorageDestination:
      behavior.isStorage && !is_moving_from_storage && hasPairedRequest,
    showPairRequestsButtons:
      behavior.isStorage && !hasPairedRequest,
    showDeliveryDateTime: showDeliveryDateTime,
    showTransitDateTime: showDeliveryDateTime,
    showIfFlatRate: behavior.isFlatRate,
  }
}
