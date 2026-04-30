import type { Status } from '@/domains/requests/request.types';
import { create } from 'zustand';

export type StatusFilter = Status | "all";

export type SortField = 'id' | 'created_at' | 'booked_at' | 'moving_date'
export type SortOrder = 'asc' | 'desc'
export type DateFilter = 'booked_this_month' | 'upcoming_this_month' | 'upcoming_all' | 'booked_all'

type TableRequestsState = {
  statusFilter: StatusFilter
  dateFilter: DateFilter
  page: number
  sortBy: SortField
  sortOrder: SortOrder
  setStatusFilter: (status: StatusFilter) => void
  setDateFilter: (filter: DateFilter) => void
  setPage: (page: number) => void
  /** Column id from the table (matches `SortField` for request rows). */
  setSort: (field: string, order: SortOrder) => void
}

export const useTableRequestsStore = create<TableRequestsState>((set) => ({
  statusFilter: 'pending',
  dateFilter: 'booked_all',
  page: 1,
  sortBy: 'id',
  sortOrder: 'desc',
  setStatusFilter: (status: StatusFilter) => set({ statusFilter: status }),
  setDateFilter: (filter: DateFilter) => set({ dateFilter: filter }),
  setPage: (page: number) => set({ page }),
  setSort: (field, order) =>
    set({ sortBy: field as SortField, sortOrder: order }),
}))
