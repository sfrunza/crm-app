import { requestKeys } from "@/domains/requests/request.keys";

export const requestRoomKeys = {
  all: (requestId: number) =>
    [...requestKeys.detail(requestId), "request_rooms"] as const,
};
