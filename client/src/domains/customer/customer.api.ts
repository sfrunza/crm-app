import { api } from '@/lib/axios';
import type { Customer } from '@/domains/requests/request.types';

const ENDPOINT = '/users';

export async function findCustomerByEmail(email: string): Promise<Customer> {
  const res = await api.get(`${ENDPOINT}/find_by_email?email_address=${email}`);
  return res.data;
}

export async function createCustomer(customer: Partial<Customer>): Promise<Customer> {
  const res = await api.post(ENDPOINT, { user: customer });
  return res.data;
}

export async function updateCustomer(id?: number, data?: Partial<Customer>): Promise<Customer> {
  if (!id) throw new Error('Customer ID is required');
  const res = await api.patch(`${ENDPOINT}/${id}`, { user: data });
  return res.data;
}

export async function getCustomerById(id: number): Promise<Customer> {
  const res = await api.get(`${ENDPOINT}/${id}`);
  return res.data;
}