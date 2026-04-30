import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getItems } from "./item.api";
import { itemKeys } from "./item.keys";
import type { Item } from "./item.types";

export function useGetItems(options?: Omit<UseQueryOptions<Item[]>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: itemKeys.all,
    queryFn: getItems,
    ...options,
  });
}
