import axios from "axios"

import {
  createCustomer,
  findCustomerByEmail,
  type CreateCustomerPayload,
} from "@/domains/customer/customer.api"
import { createRequest } from "@/domains/requests/request.api"
import type { Request } from "@/domains/requests/request.types"
import type { FormSchema } from "./booking-form-schema"

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

// function emptyAddress(zip: string, floorId: number): Request["origin"] {
//   return {
//     street: "",
//     city: "",
//     state: "",
//     zip,
//     apt: "",
//     floor_id: floorId,
//     location: { lat: 0, lng: 0 },
//   }
// }

export function buildBookingRequestPayload(
  values: FormSchema,
  customerId: number
): Partial<Request> {
  return {
    moving_date: values.moving_date,
    service_id: values.service_id,
    move_size_id: values.move_size_id,
    customer_id: customerId,
    origin: values.origin as Request["origin"],
    destination: values.destination as Request["destination"],
  }
}

async function resolveCustomerId(values: FormSchema): Promise<number> {
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

export type BookingSubmitResult = {
  request: Request
  magicLoginToken: string | null
}

type CreateRequestResponse = Request & { magic_login_token?: string }

export async function submitBookingRequest(
  values: FormSchema
): Promise<BookingSubmitResult> {
  const customerId = await resolveCustomerId(values)
  const payload = buildBookingRequestPayload(values, customerId)
  const created = (await createRequest(payload)) as CreateRequestResponse

  return {
    request: created,
    magicLoginToken: created.magic_login_token ?? null,
  }
}
