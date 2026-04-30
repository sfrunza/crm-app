import type { Item } from "@/domains/items/item.types";

export interface RequestItem
  extends Omit<
    Item,
    "id" | "position" | "active" | "category_ids" | "description"
  > {
  id: number;           // request_item id
  item_id: number | null; // reference to template item
  request_room_id: number; // reference to request room
  quantity: number;
  is_custom: boolean;
}