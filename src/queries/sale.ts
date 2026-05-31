import api from "@/lib/axios";

export interface SaleItemPayload {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalePayload {
  customerId: string;
  items: SaleItemPayload[];
}

export interface CreateSaleResponse {
  message: string;
  id?: string;
}

export async function createSale(
  payload: CreateSalePayload,
): Promise<CreateSaleResponse> {
  const res = await api.post("/sales", payload);
  return res.data;
}
