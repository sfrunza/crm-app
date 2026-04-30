import type { Item } from "@/domains/items/item.types"
import type { Room } from "@/domains/rooms/room.types"
import { create } from "zustand"

type InventoryState = {
  selectedRoomId: number | null
  search: string
  typeFilter: "all" | "furniture" | "box"

  editingItem: Item | null
  isItemModalOpen: boolean

  editingRoom: Room | null
  isRoomModalOpen: boolean

  draggedItemId: number | null
  isSidebarCollapsed: boolean

  setSelectedRoomId: (id: number | null) => void
  setSearch: (value: string) => void
  setTypeFilter: (value: "all" | "furniture" | "box") => void

  openItemModal: (item?: Item) => void
  closeItemModal: () => void

  openRoomModal: (room?: Room) => void
  closeRoomModal: () => void

  setDraggedItem: (id: number | null) => void
  toggleSidebar: () => void
}

export const useInventoryStore = create<InventoryState>((set) => ({
  selectedRoomId: null,
  search: "",
  typeFilter: "all",

  editingItem: null,
  isItemModalOpen: false,

  editingRoom: null,
  isRoomModalOpen: false,

  draggedItemId: null,
  isSidebarCollapsed: false,

  setSelectedRoomId: (id) => set({ selectedRoomId: id }),
  setSearch: (value) => set({ search: value }),
  setTypeFilter: (value) => set({ typeFilter: value }),

  openItemModal: (item) =>
    set({ editingItem: item ?? null, isItemModalOpen: true }),
  closeItemModal: () =>
    set({ editingItem: null, isItemModalOpen: false }),

  openRoomModal: (room) =>
    set({ editingRoom: room ?? null, isRoomModalOpen: true }),
  closeRoomModal: () =>
    set({ editingRoom: null, isRoomModalOpen: false }),

  setDraggedItem: (id) => set({ draggedItemId: id }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}))