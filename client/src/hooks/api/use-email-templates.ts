import { createEmailTemplate, deleteEmailTemplate, getEmailTemplates, sendEmails, updateEmailTemplate } from "@/api/endpoints/email-templates";
import { extractError } from "@/lib/axios";
import { STALE_TIME_CATALOG } from "@/lib/constants";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { EmailTemplate, SendEmailsPayload } from '@/types/index';
import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";

export function useEmailTemplates(
  options?: Omit<
    UseQueryOptions<EmailTemplate[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.emailTemplates.all,
    queryFn: getEmailTemplates,
    staleTime: STALE_TIME_CATALOG,
    ...options,
  });
}

export function useUpdateEmailTemplate(mutationOptions?: Omit<
  UseMutationOptions<EmailTemplate, Error, { id: number; data: Partial<EmailTemplate> }>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: ({ id, data }) => updateEmailTemplate(id, data),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailTemplates.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error));
      mutationOptions?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useCreateEmailTemplate(mutationOptions?: Omit<
  UseMutationOptions<EmailTemplate, Error, Partial<EmailTemplate>>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: createEmailTemplate,
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailTemplates.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error));
      mutationOptions?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useDeleteEmailTemplate(mutationOptions?: Omit<
  UseMutationOptions<void, Error, { id: number }>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: ({ id }) => deleteEmailTemplate(id),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailTemplates.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error));
      mutationOptions?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useSendEmails(mutationOptions?: Omit<
  UseMutationOptions<{ message: string }, Error, SendEmailsPayload>,
  "mutationFn" | 'mutationKey'
>) {
  return useMutation({
    mutationFn: sendEmails,
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error));
      mutationOptions?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

