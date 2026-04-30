import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { createEmployee, updateEmployee } from "./employee.api";
import type { Employee } from "./employee.types";
import { extractError } from "@/lib/axios";
import { toast } from "sonner";
import { queryClient } from "@/lib/query-client";
import { employeeKeys } from "./employee.keys";

export function useCreateEmployee(mutationOptions?: Omit<UseMutationOptions<Employee, Error, Partial<Employee>>, "mutationFn">) {
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error));
      mutationOptions?.onError?.(error, variables, onMutateResult, context);
    },
    ...mutationOptions,
  });
}

export function useUpdateEmployee(mutationOptions?: Omit<UseMutationOptions<Employee, Error, { id: number, data: Partial<Employee> }>, "mutationFn">) {
  return useMutation({
    mutationFn: ({ id, data }) => updateEmployee(id, data),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error));
      mutationOptions?.onError?.(error, variables, onMutateResult, context);
    },
    ...mutationOptions,
  });
}
