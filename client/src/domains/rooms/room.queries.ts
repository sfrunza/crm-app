import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getRooms } from "./room.api";
import { roomKeys } from "./room.keys";
import type { Room } from "./room.types";

export function useGetRooms(options?: Omit<UseQueryOptions<Room[]>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: roomKeys.all,
    queryFn: getRooms,
    ...options,
  });
}
