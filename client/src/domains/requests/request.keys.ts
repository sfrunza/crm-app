export type RequestListFilters = {
  statusFilter?: string
  dateFilter?: string
  page?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filter?: "current" | "past"
}

export const requestKeys = {
  all: ['requests'] as const,

  lists: () =>
    [...requestKeys.all, 'list'] as const,

  list: (filters: RequestListFilters) =>
    [...requestKeys.lists(), filters] as const,

  details: () =>
    [...requestKeys.all, 'detail'] as const,

  detail: (id: number) =>
    [...requestKeys.details(), id] as const,

  statusCounts: () =>
    [...requestKeys.all, 'statusCounts'] as const,

  bookingStats: () =>
    [...requestKeys.all, 'bookingStats'] as const,
}
