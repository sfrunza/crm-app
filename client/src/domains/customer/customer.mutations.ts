import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { Customer } from "../requests/request.types";
import { updateCustomer } from "./customer.api";


export function useUpdateCustomer(mutationOptions?: Omit<UseMutationOptions<Customer, Error, { id: number, data: Partial<Customer> }>, "mutationFn">) {
  return useMutation({
    mutationFn: ({ id, data }) => updateCustomer(id, data),
    ...mutationOptions,
  });
}
