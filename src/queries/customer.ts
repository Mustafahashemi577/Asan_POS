import api from "@/lib/axios";

import type {
  CreateCustomerPayload,
  Customer,
  UpdateCustomerPayload,
} from "@/types/customer";

export async function getCustomers() {
  const { data } = await api.get<Customer[]>("/customer");

  return data;
}

export async function createCustomer(payload: CreateCustomerPayload) {
  const { data } = await api.post("/customer", payload);

  return data;
}

export async function updateCustomer(
  id: string,
  payload: UpdateCustomerPayload,
) {
  const { data } = await api.patch(`/customer/${id}`, payload);

  return data;
}

export async function deleteCustomer(id: string) {
  const { data } = await api.delete(`/customer/${id}`);

  return data;
}
