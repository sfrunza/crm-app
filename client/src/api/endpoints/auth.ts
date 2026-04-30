import { api } from '@/lib/axios';
import type { UserRole } from '@/types/user';

export interface LoginResponse {
  token: string;
  user?: {
    id: number;
    email_address?: string;
    role: UserRole;
  };
}

export async function login(email_address: string, password: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/session', { email_address, password })
  return res.data
}

export async function logout(): Promise<void> {
  await api.delete('/session')
  return;
}

export async function autoLogin(token: string): Promise<LoginResponse> {
  const res = await api.get<LoginResponse>(`/session/auto_login?token=${token}`)
  return res.data
}

export async function forgotPassword(email_address: string): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>('/passwords', { email_address })
  return res.data
}

export async function resetPassword(password: string, token: string): Promise<{ message: string }> {
  const res = await api.put<{ message: string }>(`/passwords/${token}`, { password })
  return res.data
}


