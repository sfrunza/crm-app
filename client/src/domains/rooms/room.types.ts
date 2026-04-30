export type Room = {
  id: number;
  name: string;
  position: number;
  active: boolean;
  image_url: string | null;
};

export type RoomUpsertPayload = {
  name: string;
  position?: number;
  active?: boolean;
  image?: File | null;
  remove_image?: boolean;
};
