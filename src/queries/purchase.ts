import api from "@/lib/axios";

import type {
  CreatePurchasePayload,
  Purchase,
  UpdatePurchasePayload,
} from "@/types/purchase";

export async function getPurchases() {
  const { data } = await api.get<Purchase[]>("/purchase");

  return data;
}

export async function getPurchase(id: string) {
  const { data } = await api.get<Purchase>(`/purchase/${id}`);

  return data;
}

export async function createPurchase(payload: CreatePurchasePayload) {
  const { data } = await api.post<Purchase>("/purchase", payload);

  return data;
}

export async function updatePurchase(
  id: string,
  payload: UpdatePurchasePayload,
) {
  const { data } = await api.patch<Purchase>(`/purchase/${id}`, payload);

  return data;
}

export async function deletePurchase(id: string) {
  const { data } = await api.delete(`/purchase/${id}`);

  return data;
}
