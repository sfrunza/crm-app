import axios from "axios"

import {
  createCustomer,
  findCustomerByEmail,
  type CreateCustomerPayload,
} from "@/domains/customer/customer.api"
import { createRequest } from "@/domains/requests/request.api"
import type { Request } from "@/domains/requests/request.types"
import type { BookingFormValues } from "./booking-form-schema"

function generateCustomerBootstrapPassword(length = 24): string {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789"
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let s = ""
  for (let i = 0; i < length; i++) {
    s += alphabet[bytes[i] % alphabet.length]
  }
  return s
}

function emptyAddress(zip: string, floorId: number): Request["origin"] {
  return {
    street: "",
    city: "",
    state: "",
    zip,
    apt: "",
    floor_id: floorId,
    location: { lat: 0, lng: 0 },
  }
}

export function buildBookingRequestPayload(
  values: BookingFormValues,
  customerId: number
): Partial<Request> {
  return {
    moving_date: values.moving_date,
    service_id: values.service_id,
    packing_type_id: values.packing_type_id,
    move_size_id: values.move_size_id,
    customer_id: customerId,
    origin: emptyAddress(values.origin_zip, values.origin_floor_id),
    destination: emptyAddress(
      values.destination_zip,
      values.destination_floor_id
    ),
  }
}

async function resolveCustomerId(values: BookingFormValues): Promise<number> {
  try {
    const existing = await findCustomerByEmail(values.email_address)
    if (existing?.id) {
      return existing.id
    }
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error
    const status = error.response?.status
    if (status !== 401 && status !== 403 && status !== 404) {
      throw error
    }
  }

  const payload: CreateCustomerPayload = {
    first_name: values.first_name,
    last_name: values.last_name,
    email_address: values.email_address,
    phone: values.phone,
    password: generateCustomerBootstrapPassword(),
  }

  const created = await createCustomer(payload)

  if (!created?.id) {
    throw new Error("Could not create customer profile.")
  }

  return created.id
}

export async function submitBookingRequest(
  values: BookingFormValues
): Promise<Request> {
  const customerId = await resolveCustomerId(values)
  const payload = buildBookingRequestPayload(values, customerId)
  return createRequest(payload)
}
