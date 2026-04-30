import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { attachSignature, calculateRequest, cloneRequest, createRequest, pairRequests, unpairRequests, updateRequest } from "./request.api";
import type { Request, RequestUpdatePayload } from "./request.types";
import { requestKeys } from "./request.keys";
import { queryClient } from "@/lib/query-client";

type UseUpdateRequestOptions = {
  forceCalculate?: boolean;
};

export function useUpdateRequest(
  mutationOptions?: Omit<
    UseMutationOptions<Request, Error, { id: number; data: RequestUpdatePayload }>,
    "mutationFn"
  >,
  options?: UseUpdateRequestOptions,
) {
  const { forceCalculate = false } = options ?? {};

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const updatedRequest = await updateRequest(id, data);

      const shouldCalculate = forceCalculate || updatedRequest.is_calculator_enabled;

      if (shouldCalculate) {
        try {
          const calculatedRequest = await calculateRequest(id);
          queryClient.setQueryData(requestKeys.detail(id), calculatedRequest);
          return calculatedRequest;
        } catch {
          return updatedRequest;
        }
      }

      return updatedRequest;
    },
    ...mutationOptions,
  });
}

export function useCreateRequest(
  mutationOptions?: Omit<
    UseMutationOptions<Request, Error, Partial<Request>>,
    "mutationFn"
  >,
) {
  return useMutation({
    mutationFn: (data) => createRequest(data),
    ...mutationOptions,
  });
}

export function useCloneRequest(
  mutationOptions?: Omit<UseMutationOptions<Request, Error, { id: number }>, "mutationFn">,
) {
  return useMutation({
    mutationFn: ({ id }) => cloneRequest(id),
    ...mutationOptions,
  });
}

export function usePairRequests(
  mutationOptions?: Omit<
    UseMutationOptions<Request, Error, { requestId: number, pairedRequestId: number }>,
    "mutationFn"
  >,
) {
  return useMutation({
    mutationFn: ({ requestId, pairedRequestId }) => pairRequests(requestId, pairedRequestId),
    ...mutationOptions,
  });
}

export function useUnpairRequests(
  mutationOptions?: Omit<UseMutationOptions<Request, Error, { requestId: number, pairedRequestId: number }>, "mutationFn">,
) {
  return useMutation({
    mutationFn: ({ requestId, pairedRequestId }) => unpairRequests(requestId, pairedRequestId),
    ...mutationOptions,
  });
}

export function useAttachSignature(
  mutationOptions?: Omit<
    UseMutationOptions<Request, Error, { requestId: number; signatureDataUrl: string }>,
    "mutationFn"
  >,
) {
  return useMutation({
    mutationFn: ({ requestId, signatureDataUrl }) => attachSignature(requestId, signatureDataUrl),
    ...mutationOptions,
  });
}

export function useCalculateRequest(
  mutationOptions?: Omit<
    UseMutationOptions<Request, Error, { id: number }>,
    "mutationFn"
  >,
) {
  return useMutation({
    mutationFn: ({ id }) => calculateRequest(id),
    ...mutationOptions,
  });
}
