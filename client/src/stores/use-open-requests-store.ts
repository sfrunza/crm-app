import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Request } from "@/domains/requests/request.types";
import { useRequestStore } from "@/stores/use-request-store";

const MAX_OPEN = 10;

// Lightweight metadata displayed in the minimized bar
export type RequestEntry = {
  id: number;
  customerName: string;
  unsaved: Partial<Request>;
};

type OpenRequestsState = {
  // The currently visible overlay request (null = no overlay)
  activeId: number | null;
  // All tracked requests (active + minimized)
  entries: RequestEntry[];

  // Open a request overlay. Saves current unsaved edits, then switches.
  open: (requestId: number) => void;
  // Minimize the active overlay (hides it, keeps state)
  minimize: () => void;
  // Close a request completely (removes from entries)
  close: (requestId: number) => void;
  // Update display metadata when API data loads
  updateMeta: (
    requestId: number,
    meta: Pick<RequestEntry, "customerName">,
  ) => void;
};

/**
 * Captures current unsaved edits from the request store and
 * saves them into the entry for the given request ID.
 */
function saveCurrentUnsaved(entries: RequestEntry[], requestId: number | null): RequestEntry[] {
  if (!requestId) return entries;
  const { unsaved } = useRequestStore.getState();
  return entries.map((e) =>
    e.id === requestId ? { ...e, unsaved } : e,
  );
}

export const useOpenRequestsStore = create<OpenRequestsState>()(
  persist(
    (set, get) => ({
      activeId: null,
      entries: [],

      open: (requestId) => {
        const { activeId, entries } = get();

        // Nothing to do if already active
        if (activeId === requestId) return;

        // Save unsaved edits for the currently active request
        let updated = saveCurrentUnsaved(entries, activeId);

        // Add entry if it doesn't exist yet
        if (!updated.find((e) => e.id === requestId)) {
          updated = [
            ...updated,
            {
              id: requestId,
              customerName: "",
              unsaved: {},
            },
          ].slice(-MAX_OPEN);
        }

        // Reset the request store BEFORE switching to prevent stale
        // unsaved edits from the previous request bleeding into the
        // new request's first render (draft = request + unsaved).
        useRequestStore.getState().reset();

        set({ activeId: requestId, entries: updated });
      },

      minimize: () => {
        const { activeId, entries } = get();
        if (!activeId) return;

        const updated = saveCurrentUnsaved(entries, activeId);
        // Clear the request store so it's fresh for next open
        useRequestStore.getState().reset();
        set({ activeId: null, entries: updated });
      },

      close: (requestId) => {
        const { activeId, entries } = get();
        const updated = entries.filter((e) => e.id !== requestId);

        if (activeId === requestId) {
          useRequestStore.getState().reset();
          set({ activeId: null, entries: updated });
        } else {
          set({ entries: updated });
        }
      },

      updateMeta: (requestId, meta) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === requestId ? { ...e, ...meta } : e,
          ),
        })),
    }),
    {
      name: "open-requests",
    },
  ),
);

/**
 * Utility to open a request from anywhere (including non-React code
 * like mutation callbacks). Components can also use the store hook directly.
 */
export function openRequest(requestId: number) {
  useOpenRequestsStore.getState().open(requestId);
}
