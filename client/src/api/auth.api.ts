// import { api } from '@/lib/axios'
// import type { SessionUser } from '@/types/user';

// export async function login({ email_address, password }: { email_address: string, password: string }): Promise<{ user: SessionUser }> {
//   const response = await api.post('/session', { email_address, password })
//   return response.data
// }

// export async function logout(): Promise<void> {
//   await api.delete('/session')
//   return;
// }

// export async function getSession(): Promise<{ user?: SessionUser, error?: string }> {
//   const response = await api.get('/session')
//   return response.data
// }

// export async function validateSession(): Promise<{ user?: SessionUser, error?: string }> {
//   const response = await api.get('/session');
//   return response.data;
// }

// export async function autoLogin({ token }: { token: string }): Promise<{ user: SessionUser }> {
//   const response = await api.get(`/session/auto_login?token=${token}`)
//   return response.data
// }

// export async function forgotPassword({ email_address }: { email_address: string }): Promise<{ message: string }> {
//   const response = await api.post('/passwords', { email_address })
//   return response.data
// }

// export async function resetPassword({ password, token }: { password: string, token: string }): Promise<{ message: string }> {
//   const response = await api.put(`/passwords/${token}`, { password })
//   return response.data
// }
