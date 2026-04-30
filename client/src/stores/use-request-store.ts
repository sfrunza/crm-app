import { create } from "zustand";
import type { Request } from "@/domains/requests/request.types";
import { calculateRequest, calculateRoutes } from "@/domains/requests/request.api";

const DEBOUNCE_DELAY = 500;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let routeDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const ADDRESS_FIELDS: (keyof Request)[] = ["origin", "destination", "stops"];

type RequestState = {
  requestId: number | null;
  unsaved: Partial<Request>;
  isDirty: boolean;
  calculatedRequest: Request | null;
  isCalculating: boolean;
  // Actions
  setRequestId: (id: number) => void;
  setField: <K extends keyof Request>(key: K, value: Request[K], isCalculatorEnabled?: boolean) => void;
  setCalculatedRequest: (request: Request | null) => void;
  clear: () => void;
  reset: () => void;
};

export const useRequestStore = create<RequestState>((set, get) => ({
  requestId: null,
  unsaved: {},
  isDirty: false,
  calculatedRequest: null,
  isCalculating: false,

  setRequestId: (id) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (routeDebounceTimer) clearTimeout(routeDebounceTimer);
    set({
      requestId: id,
      unsaved: {},
      isDirty: false,
      calculatedRequest: null,
      isCalculating: false,
    });
  },

  setField: (key, value, isCalculatorEnabled = false) => {
    const newUnsaved = { ...get().unsaved, [key]: value };
    
    set({
      unsaved: newUnsaved,
      isDirty: Object.keys(newUnsaved).length > 0,
    });

    // Don't auto-calculate when toggling the calculator switch itself
    // The CalculatorSwitch component handles that separately
    if (key === "is_calculator_enabled") return;

    const requestId = get().requestId;
    if (!requestId) return;

    // If address field changed, always calculate routes (regardless of calculator enabled)
    if (ADDRESS_FIELDS.includes(key)) {
      if (routeDebounceTimer) clearTimeout(routeDebounceTimer);

      set({ isCalculating: true });

      routeDebounceTimer = setTimeout(async () => {
        try {
          const result = await calculateRoutes(requestId, { ...newUnsaved, save: false });
          set({ calculatedRequest: result, isCalculating: false });
        } catch {
          set({ isCalculating: false });
        }
      }, DEBOUNCE_DELAY);

      return;
    }

    // If calculator is enabled, debounce and call the calculate endpoint
    if (isCalculatorEnabled) {
      if (debounceTimer) clearTimeout(debounceTimer);

      set({ isCalculating: true });

      debounceTimer = setTimeout(async () => {
        try {
          const result = await calculateRequest(requestId, { ...newUnsaved, save: false });
          set({ calculatedRequest: result, isCalculating: false });
        } catch {
          set({ isCalculating: false });
        }
      }, DEBOUNCE_DELAY);
    }
  },

  setCalculatedRequest: (request) =>
    set({ calculatedRequest: request }),

  clear: () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (routeDebounceTimer) clearTimeout(routeDebounceTimer);
    set({
      unsaved: {},
      isDirty: false,
      calculatedRequest: null,
      isCalculating: false,
    });
  },

  reset: () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (routeDebounceTimer) clearTimeout(routeDebounceTimer);
    set({
      requestId: null,
      unsaved: {},
      isDirty: false,
      calculatedRequest: null,
      isCalculating: false,
    });
  },
}));
