import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { customerKeys } from "./customer.keys";
import { getCustomerById } from "./customer.api";
import type { Customer } from "../requests/request.types";


export function useGetCustomerById(id: number | null, options?: Omit<UseQueryOptions<Customer>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: customerKeys.id({ id: id! }),
    queryFn: () => getCustomerById(id!),
    ...options,
  });
}