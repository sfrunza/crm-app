export type ItemRoomCategory = {
  id: number;
  item_id: number;
  room_id: number;
  created_at: string;
  updated_at: string;
};

export type CreateItemRoomCategoryPayload = {
  item_id: number;
  room_id: number;
};
