import { api } from "@/lib/axios"
import type { OnlineCustomersResponse } from "@/types/api"

const ENDPOINT = "/online_customers"

export async function getOnlineCustomers(): Promise<OnlineCustomersResponse> {
  const res = await api.get<OnlineCustomersResponse>(ENDPOINT)
  return res.data
}
