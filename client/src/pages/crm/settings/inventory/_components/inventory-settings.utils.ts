// import type { InventoryItemBrowserTypeFilter } from "@/components/inventory/inventory-item-browser";
import type { Item } from "@/domains/items/item.types";

// export type ItemTypeFilter = InventoryItemBrowserTypeFilter;

export interface ItemForm {
  name: string;
  description: string;
  volume: number;
  weight: number;
  item_type: "furniture" | "box";
  room_tag_ids: number[];
  image: File | null;
}

export const EMPTY_ITEM_FORM: ItemForm = {
  name: "",
  description: "",
  volume: 0,
  weight: 0,
  item_type: "furniture",
  room_tag_ids: [],
  image: null,
};

export function itemFromRecord(item: Item): ItemForm {
  return {
    name: item.name,
    description: item.description ?? "",
    volume: Number(item.volume) || 0,
    weight: Number(item.weight) || 0,
    item_type: item.is_furniture ? "furniture" : "box",
    room_tag_ids: [...(item.category_ids ?? [])],
    image: null,
  };
}
