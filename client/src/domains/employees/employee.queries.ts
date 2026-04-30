import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getEmployeeById, getEmployees } from "./employee.api";
import type { Employee } from "./employee.types";
import { employeeKeys } from "./employee.keys";

export function useGetEmployees(options?: Omit<UseQueryOptions<Employee[]>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: employeeKeys.all,
    queryFn: getEmployees,
    ...options,
  });
}

export function useGetEmployeeById(id: number | null, options?: Omit<UseQueryOptions<Employee>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: employeeKeys.detail(id!),
    queryFn: () => getEmployeeById(id!),
    ...options,
  });
}