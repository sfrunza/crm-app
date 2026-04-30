import type { Item } from "@/domains/items/item.types"
import type { MoveSizeRoom } from "@/domains/move-size-rooms/move-size-room.types"
import type { RequestItem } from "@/domains/request-items/request-item.types"
import type { RequestRoom } from "@/domains/request-rooms/request-room.types"
import type { Room } from "@/domains/rooms/room.types"

export type InventoryItem = {
  id: number
  name: string
  quantity: number
  volume: number
  request_item_id?: number
  item_id?: number
  is_custom: boolean
  is_suggested: boolean
  is_box: boolean
  is_furniture: boolean
  is_special_handling: boolean
  image_url: string | null
}

export type InventoryRoom = {
  id: number
  name: string
  room_id?: number
  request_room?: RequestRoom
  suggested_items?: Record<number, number>
  items: InventoryItem[]
  totals: {
    items: number
    volume: number
    boxes: number
  }
  is_suggested: boolean
  is_custom: boolean
  image_url: string | null
}

export function buildInventory(
  globalRooms: Room[],
  globalItems: Item[],
  requestRooms: RequestRoom[],
  defaultRooms: MoveSizeRoom[]
): InventoryRoom[] {

  const requestRoomMap = new Map<number, RequestRoom>()
  requestRooms.forEach(room => {
    if (room.room_id) requestRoomMap.set(room.room_id, room)
  })

  const defaultRoomMap = new Map<number, MoveSizeRoom>()
  defaultRooms.forEach(room => {
    defaultRoomMap.set(room.room_id, room)
  })

  const rooms: InventoryRoom[] = []

  // TEMPLATE ROOMS
  for (const room of globalRooms) {

    const requestRoom = requestRoomMap.get(room.id)
    const defaultRoom = defaultRoomMap.get(room.id)

    const roomItems = buildInventoryItems(
      globalItems,
      requestRoom,
      defaultRoom
    )

    rooms.push({
      id: room.id,
      name: room.name,
      room_id: room.id,
      request_room: requestRoom,
      items: roomItems,
      totals: calculateTotals(roomItems),
      suggested_items: defaultRoom?.items,
      is_suggested: !!defaultRoom,
      is_custom: false,
      image_url: room.image_url
    })
  }

  // CUSTOM ROOMS
  const customRooms = requestRooms.filter(r => r.is_custom)

  for (const room of customRooms) {

    const roomItems = buildInventoryItems(
      globalItems,
      room,
      undefined
    )

    rooms.push({
      id: room.id,
      name: room.name,
      request_room: room,
      items: roomItems,
      totals: calculateTotals(roomItems),
      is_custom: true,
      is_suggested: false,
      image_url: room.image_url
    })
  }

  // SORT ORDER
  rooms.sort((a, b) => {

    if (a.is_suggested && !b.is_suggested) return -1
    if (!a.is_suggested && b.is_suggested) return 1

    if (a.request_room && !b.request_room) return -1
    if (!a.request_room && b.request_room) return 1

    if (a.is_custom && !b.is_custom) return 1
    if (!a.is_custom && b.is_custom) return -1

    return 0
  })

  return rooms
}

export function buildInventoryItems(
  globalItems: Item[],
  requestRoom?: RequestRoom,
  defaultRoom?: MoveSizeRoom
): InventoryItem[] {

  const requestItems = requestRoom?.request_items ?? []
  const suggestedItems = defaultRoom?.items ?? {}

  const requestItemMap = new Map<number, RequestItem>()
  requestItems.forEach(i => {
    if (i.item_id) requestItemMap.set(i.item_id, i)
  })

  const items: InventoryItem[] = []

  for (const item of globalItems) {

    const requestItem = requestItemMap.get(item.id)
    const suggestedQty = suggestedItems[item.id] ?? 0

    items.push({
      id: item.id,
      name: item.name,
      item_id: item.id,
      request_item_id: requestItem?.id,
      quantity: requestItem?.quantity ?? 0,
      volume: item.volume ?? 0,
      is_custom: false,
      is_suggested: suggestedQty > 0, // ✅ mark suggested
      is_box: item.is_box,
      is_furniture: item.is_furniture,
      is_special_handling: item.is_special_handling,
      image_url: item.image_url
    })
  }

  const customItems = requestItems.filter(i => i.is_custom)

  for (const item of customItems) {
    items.push({
      id: item.id,
      name: item.name,
      request_item_id: item.id,
      quantity: item.quantity,
      volume: item.volume ?? 0,
      is_custom: true,
      is_suggested: false,
      is_box: item.is_box,
      is_furniture: item.is_furniture,
      is_special_handling: item.is_special_handling,
      image_url: item.image_url
    })
  }

  return items
}

function calculateTotals(items: InventoryItem[]) {

  let totalItems = 0
  let totalVolume = 0

  let boxes = items.reduce((acc, item) => {
    if (item.is_box) {
      acc += item.quantity
    }
    return acc
  }, 0)

  for (const item of items) {
    totalItems += item.quantity
    totalVolume += item.quantity * item.volume

  }

  return {
    items: totalItems,
    volume: totalVolume,
    boxes
  }
}