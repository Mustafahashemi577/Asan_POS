import api from "@/lib/axios";

import type {
  CreateSupplierPayload,
  Supplier,
  UpdateSupplierPayload,
} from "@/types/supplier";

export async function getSuppliers() {
  const { data } = await api.get<Supplier[]>("/suppliers");

  return data;
}

export async function createSupplier(payload: CreateSupplierPayload) {
  const { data } = await api.post("/suppliers", payload);

  return data;
}

export async function updateSupplier(
  id: string,
  payload: UpdateSupplierPayload,
) {
  const { data } = await api.patch(`/suppliers/${id}`, payload);

  return data;
}

export async function deleteSupplier(id: string) {
  const { data } = await api.delete(`/suppliers/${id}`);

  return data;
}
