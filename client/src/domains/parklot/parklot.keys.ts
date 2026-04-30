import type { Status } from "../requests/request.types";

export const parklotKeys = {
  all: (date: string, status?: Status) => ['parklot', date, status] as const,
}