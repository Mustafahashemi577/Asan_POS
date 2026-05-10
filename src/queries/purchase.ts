import api from "@/lib/axios";

import type { CreatePurchasePayload } from "@/types/purchase";

export async function createPurchase(payload: CreatePurchasePayload) {
  const { data } = await api.post("/purchases", payload);

  return data;
}
