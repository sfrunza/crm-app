export type MoveSizeRoomKind = 0 | 1;

export type MoveSizeRoomItems = Record<string, number>;

export type CreateMoveSizeRoomPayload = {
  room_id: number;
  kind: MoveSizeRoomKind;
  position?: number;
  items?: MoveSizeRoomItems;
};

export type UpdateMoveSizeRoomPayload = Partial<CreateMoveSizeRoomPayload>;


export type MoveSizeRoom = {
  id: number;
  room_id: number;
  room_name: string;
  items: MoveSizeRoomItems;
  total_items: number;
  total_boxes?: number;
  total_volume: number;
  total_weight?: number;
  position?: number;
};

export type MoveSizeRoomItem = {
  item_id: number;
  name: string;
  quantity: number;
  volume: number;
  weight: number;
  is_box: boolean;
  is_furniture: boolean;
  is_special_handling: boolean;
};
