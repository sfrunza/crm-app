export const employeeKeys = {
  all: ['employees'] as const,
  detail: (id: number) => [employeeKeys.all, id] as const,
}
