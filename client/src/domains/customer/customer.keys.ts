export const customerKeys = {
  id: ({ id }: { id: number }) => ['customer', id] as const,
} as const;