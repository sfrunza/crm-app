import { api } from "@/lib/axios"
import type { User } from "@/types/index"

const ENDPOINT = "/users"

export async function getUsers(): Promise<User[]> {
  const res = await api.get(ENDPOINT)
  return res.data
}

export async function getCurrentUser(): Promise<User> {
  const res = await api.get<User>(`${ENDPOINT}/me`)
  return res.data
}

export async function getUserByEmail(email: string): Promise<User> {
  const res = await api.get(`${ENDPOINT}/find_by_email?email_address=${email}`)
  return res.data
}

export async function getUserById(id: number): Promise<User> {
  const res = await api.get(`${ENDPOINT}/${id}`)
  return res.data
}

export async function createUser(
  payload: Partial<User> & { password?: string }
): Promise<User> {
  const res = await api.post<User>(ENDPOINT, { user: payload })
  return res.data
}

export async function updateUser(
  id: number,
  payload: Partial<User> & { password?: string }
): Promise<User> {
  const res = await api.patch<User>(`${ENDPOINT}/${id}`, { user: payload })
  return res.data
}
