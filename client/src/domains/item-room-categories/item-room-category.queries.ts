import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getItemRoomCategories } from "./item-room-category.api";
import { itemRoomCategoryKeys } from "./item-room-category.keys";
import type { ItemRoomCategory } from "./item-room-category.types";

export function useGetItemRoomCategories(
  options?: Omit<UseQueryOptions<ItemRoomCategory[]>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: itemRoomCategoryKeys.all,
    queryFn: getItemRoomCategories,
    ...options,
  });
}
