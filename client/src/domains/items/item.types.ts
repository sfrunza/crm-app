export type Item = {
  id: number;
  name: string;
  description: string | null;
  volume: number | null;
  weight: number | null;
  is_box: boolean;
  is_furniture: boolean;
  is_special_handling: boolean;
  position: number;
  active: boolean;
  image_url: string | null;
  category_ids: number[];
};

export type ItemUpsertPayload = {
  name: string;
  description?: string | null;
  volume?: number | null;
  weight?: number | null;
  is_box?: boolean;
  is_furniture?: boolean;
  is_special_handling?: boolean;
  position?: number;
  active?: boolean;
  image?: File | null;
  remove_image?: boolean;
};
