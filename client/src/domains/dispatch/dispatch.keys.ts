export const dispatchKeys = {
  all: () => ['dispatch'] as const,
  withParams: (date: string, with_filters?: boolean) => [...dispatchKeys.all(), { date, with_filters }] as const,
  activeDates: (month: string) => [...dispatchKeys.all(), 'active_dates', { month }] as const,
}