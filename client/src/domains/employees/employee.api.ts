import { api } from '@/lib/axios';
import type { Employee } from './employee.types';

const ENDPOINT = '/employees';

export async function getEmployees(): Promise<Employee[]> {
  const res = await api.get(ENDPOINT);
  return res.data;
}

export async function getEmployeeById(id: number): Promise<Employee> {
  const res = await api.get(`${ENDPOINT}/${id}`);
  return res.data;
}

export async function createEmployee(employee: Partial<Employee>): Promise<Employee> {
  const res = await api.post(ENDPOINT, { employee: employee });
  return res.data;
}

export async function updateEmployee(id: number, data: Partial<Employee>): Promise<Employee> {
  const res = await api.patch(`${ENDPOINT}/${id}`, { employee: data });
  return res.data;
}

export async function deleteEmployee(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}