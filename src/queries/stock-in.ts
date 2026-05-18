import api from "@/lib/axios";
import type { CreateStockInPayload } from "@/types/purchases";

export const createStockIn = (
  payload: CreateStockInPayload,
): Promise<{ message: string }> =>
  api.post("/stock-in", payload).then((r) => r.data);

export const getStockIn = (id: string) =>
  api.get(`/stock-in/${id}`).then((r) => r.data);
