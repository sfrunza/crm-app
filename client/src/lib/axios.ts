
import axios from 'axios'

interface ApiError {
  error?: string;
  errors?: string[];
  base?: string[];
}

const STORAGE_KEY = 'session_token' // same key you use when saving after login

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Rails/JSON:API style: { name: ['has already been taken'], email: ['is invalid'] }
function formatFieldErrors(data: Record<string, unknown>): string | null {
  const parts: string[] = []
  for (const [field, value] of Object.entries(data)) {
    if (field === 'error' || field === 'errors' || field === 'base') continue
    if (!Array.isArray(value) || value.length === 0) continue
    if (!value.every((v) => typeof v === 'string')) continue
    parts.push(`${field}: ${(value as string[]).join(', ')}`)
  }
  return parts.length > 0 ? parts.join('; ') : null
}

export function extractError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | Record<string, unknown> | undefined

    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const record = data as Record<string, unknown>
      if (typeof record.error === 'string' && record.error) return record.error
      const nestedErrors = record.errors
      if (
        nestedErrors &&
        typeof nestedErrors === 'object' &&
        !Array.isArray(nestedErrors)
      ) {
        const fromNested = formatFieldErrors(nestedErrors as Record<string, unknown>)
        if (fromNested) return fromNested
      }
      if (Array.isArray(record.errors) && record.errors.length) {
        const errs = record.errors
        if (errs.every((e) => typeof e === 'string')) return errs.join(', ')
      }
      if (Array.isArray(record.base) && record.base.length) {
        const base = record.base
        if (base.every((b) => typeof b === 'string')) return base.join(', ')
      }
      const fromFields = formatFieldErrors(record)
      if (fromFields) return fromFields
    }

    return error.message
  }
  return 'An unexpected error occurred'
}
