// /** Normalized display item for both admin and request inventory views */
// export type InventoryDisplayItem = {
//   id: string | number;
//   name: string;
//   description?: string;
//   volumeCuft: number;
//   itemType: "furniture" | "box";
//   imageUrl?: string | null;
//   /** Quantity in request mode */
//   quantity?: number;
//   /** Request mode: item has been added to the room */
//   isRequestItem?: boolean;
//   /** Request mode: request_item id for updates/deletes */
//   requestItemId?: number;
//   /** Admin mode: room names this item belongs to */
//   filterTags?: string[];
// };

// export type InventoryTypeFilter = "all" | "furniture" | "box";

// /** Room row for sidebar display */
// export type InventoryRoomRow = {
//   id: string | number;
//   label: string;
//   description?: string;
//   image_url: string | null;
// };

// export type InventoryVariant = "admin" | "request";
