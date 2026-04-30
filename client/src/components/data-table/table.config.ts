export const TABLE_CONFIG = {
  STALE_TIME: 1 * 60 * 1000, // 1 minute
  GC_TIME: 5 * 60 * 1000, // 5 minutes
  RETRY_COUNT: 2,
  CURRENCY_FORMAT: {
    style: 'currency',
    currency: 'USD',
  },
  DATE_FORMAT: 'MMM dd, yyyy',
} as const; 