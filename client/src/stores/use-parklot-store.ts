import { formatDate } from '@/lib/format-date';
import { create } from 'zustand';

export type ParklotContext = "pickup" | "delivery";

interface ParklotStoreProps {
  // Utility state
  selectedDate: string;
  selectedRequestId: number | null;
  parklotContext: ParklotContext;

  // Actions
  setSelectedDate: (date: string) => void;
  setSelectedRequestId: (requestId: number | null) => void;
  setParklotContext: (context: ParklotContext) => void;
}

export const useParklotStore = create<ParklotStoreProps>((set) => ({
  selectedDate: formatDate(new Date(), "yyyy-MM-dd"),
  selectedRequestId: null,
  parklotContext: "pickup",

  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedRequestId: (requestId) => set({ selectedRequestId: requestId }),
  setParklotContext: (context) => set({ parklotContext: context }),
}));
