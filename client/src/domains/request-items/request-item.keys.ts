import { requestKeys } from "@/domains/requests/request.keys";

export const requestItemKeys = {
  all: (requestId: number, requestRoomId: number) =>
    [
      ...requestKeys.detail(requestId),
      "request_rooms",
      requestRoomId,
      "request_items",
    ] as const,
};
