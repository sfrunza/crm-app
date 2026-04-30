import type { RequestItem } from "@/domains/request-items/request-item.types";
import type { Room } from "@/domains/rooms/room.types";

export type CreateRequestRoomPayload = {
  name: string;
  is_custom?: boolean;
  position?: number;
};

export type UpdateRequestRoomPayload = Partial<CreateRequestRoomPayload>;

// export type RequestRoom = {
//   id: number               // request_room id
//   room_id: number | null   // null if custom room
//   name: string
//   is_custom: boolean
//   position: number
//   totals: {
//     items: number
//     boxes: number
//     volume: number
//     weight: number
//   },
//   request_items: RequestItem[]
// }


export interface RequestRoom
  extends Omit<
    Room,
    "id" | "position" | "active" | "description"
  > {
  id: number;           // request_item id
  room_id: number | null; // reference to template room
  is_custom: boolean;
  position: number;
  totals: {
    items: number
    boxes: number
    volume: number
    weight: number
  },
  request_items: RequestItem[]
}