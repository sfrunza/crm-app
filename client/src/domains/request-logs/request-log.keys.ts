export const requestLogKeys = {
  all: ["request-logs"] as const,
  byRequest: (requestId: number) => ["request-logs", requestId] as const,
};
