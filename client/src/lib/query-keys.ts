import type { UsersFilter } from '@/types/index';

export const queryKeys = {
  users: {
    all: ['users'] as const,
    list: (filters?: UsersFilter) => ['users', 'list', filters] as const,
    detail: (id: number) => ['users', 'detail', id] as const,
  },
  settings: { all: ['settings'] as const },
  services: { all: ['services'] as const },
  extraServices: { all: ['extra-services'] as const },
  packingTypes: { all: ['packing-types'] as const },
  packingItems: { all: ['packing-items'] as const },
  trucks: { all: ['trucks'] as const },
  valuations: { all: ['valuations'] as const },
  rates: { all: ['rates'] as const },
  calendarRates: { all: ['calendar-rates'] as const },
  moveSizes: { all: ['move-sizes'] as const },
  entranceTypes: { all: ['entrance-types'] as const },
  folders: { all: ['folders'] as const },
  emailTemplates: { all: ['email-templates'] as const },
  messages: {
    all: ["messages"] as const,
    byRequest: (requestId: number) => ["messages", requestId] as const,
    unreadCount: (requestId: number) => ["messages", requestId, "unread_count"] as const,
    totalUnread: ["messages", "total_unread"] as const,
  },
  conversations: {
    all: ["conversations"] as const,
    list: () => ["conversations", "list"] as const,
  },
};
