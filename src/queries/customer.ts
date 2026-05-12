import api from "@/lib/axios";

import type {
  CreateCustomerPayload,
  Customer,
  UpdateCustomerPayload,
} from "@/types/customer";

// Normalize backend response safely
function normalize(res: any): Customer[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.customers)) return res.customers;
  return [];
}

export async function getCustomers(): Promise<Customer[]> {
  const res = await api.get("/customer");
  return normalize(res.data);
}

export async function createCustomer(
  payload: CreateCustomerPayload,
): Promise<Customer> {
  const res = await api.post("/customer", payload);
  return res.data;
}

export async function updateCustomer(
  id: string,
  payload: UpdateCustomerPayload,
): Promise<Customer> {
  const res = await api.put(`/customer/${id}`, payload);
  return res.data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await api.delete(`/customer/${id}`);
}
