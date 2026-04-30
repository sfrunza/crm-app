import { useGetRequestById } from "@/domains/requests/request.queries";
import { formatDate } from "@/lib/format-date";
import { useParklotStore } from "@/stores/use-parklot-store";
import { useRequestStore } from "@/stores/use-request-store";
import { useCallback, useEffect, useMemo } from "react";
import type { Request } from "@/domains/requests/request.types";


export function useRequest(requestId?: number) {
  // Request Store
  const storedRequestId = useRequestStore((state) => state.requestId);
  const unsaved = useRequestStore((state) => state.unsaved);
  const isDirty = useRequestStore((state) => state.isDirty);
  const calculatedRequest = useRequestStore((state) => state.calculatedRequest);
  const isCalculating = useRequestStore((state) => state.isCalculating);
  const setRequestId = useRequestStore((state) => state.setRequestId);
  const setFieldStore = useRequestStore((state) => state.setField);
  const clear = useRequestStore((state) => state.clear);

  // Parklot Grid Store
  const setSelectedDate = useParklotStore((state) => state.setSelectedDate);
  const setSelectedRequestId = useParklotStore((state) => state.setSelectedRequestId);
  const setParklotContext = useParklotStore((state) => state.setParklotContext);

  // Memoize to ensure stable reference when requestId is provided
  const queryRequestId = useMemo(() => {
    return requestId ?? storedRequestId;
  }, [requestId, storedRequestId]);

  // Store requestId in Zustand when provided
  useEffect(() => {
    if (requestId && requestId !== storedRequestId) {
      setRequestId(requestId);
      setSelectedRequestId(requestId);
    }
  }, [requestId, storedRequestId, setRequestId, setSelectedRequestId]);

  // Fetch from React Query
  const { data: request, isPending, isError, error } = useGetRequestById(queryRequestId!, {
    enabled: !!queryRequestId,
    retry: false,
  });

  // Compute draft: use calculatedRequest if available, otherwise merge request + unsaved
  const draft = useMemo(() => {
    if (!request) return null;

    // If we have a calculated response, use it merged with unsaved
    if (calculatedRequest) {
      return { ...calculatedRequest, ...unsaved };
    }

    return { ...request, ...unsaved };
  }, [request, unsaved, calculatedRequest]);

  // Wrapper for setField that passes calculator enabled status
  const setField = useCallback(
    <K extends keyof Request>(key: K, value: Request[K]) => {
      // If we're setting is_calculator_enabled, use the new value
      // Otherwise check the current state
      let isCalculatorEnabled: boolean;
      if (key === "is_calculator_enabled") {
        isCalculatorEnabled = value as boolean;
      } else {
        isCalculatorEnabled = unsaved.is_calculator_enabled ?? request?.is_calculator_enabled ?? false;
      }
      setFieldStore(key, value, isCalculatorEnabled);
    },
    [setFieldStore, unsaved.is_calculator_enabled, request?.is_calculator_enabled]
  );

  useEffect(() => {
    if (draft?.moving_date) {
      setSelectedDate(draft.moving_date);
    } else {
      setSelectedDate(formatDate(new Date(), "yyyy-MM-dd"));
    }
    setParklotContext("pickup");
  }, [draft?.id, draft?.moving_date, setSelectedDate, setParklotContext]);

  return {
    draft,
    request,
    setField,
    clear,
    isDirty,
    isPending,
    isError,
    error,
    unsaved,
    isCalculating,
  };
}


