import api from "@/lib/axios";

import type {
  CreatePurchasePayload,
  PurchaseDetail,
  PurchaseListItem,
  UpdatePurchaseStatusPayload,
} from "@/types/purchases";

// ── List ──────────────────────────────────────────────────────────────────────

export interface PurchasesQuery {
  page?: number;
  itemsPerPage?: number;
  search?: string;
  /** Filter by purchase status; omit to return all statuses */
  status?: string;
}

export interface PurchasesMeta {
  total: number;
  page: number;
  totalPages: number;
  itemsPerPage: number;
}

export const getPurchases = (
  query: PurchasesQuery = {},
): Promise<{ data: PurchaseListItem[]; meta: PurchasesMeta }> =>
  api.get("/purchase", { params: query }).then((r) => {
    const raw = r.data;
    const items: PurchaseListItem[] = Array.isArray(raw)
      ? raw
      : (raw.data ?? raw.purchases ?? []);
    const meta: PurchasesMeta = raw.meta ?? {
      total: items.length,
      page: 1,
      totalPages: 1,
      itemsPerPage: items.length,
    };
    return { data: items, meta };
  });

// ── Single ────────────────────────────────────────────────────────────────────

export const getPurchase = (id: string): Promise<PurchaseDetail> =>
  api.get(`/purchase/${id}`).then((r) => r.data);

// ── Create ────────────────────────────────────────────────────────────────────

export const createPurchase = (
  payload: CreatePurchasePayload,
): Promise<{ message: string }> => {
  // The backend DTO field is `customDate`; the form schema uses `purchaseDate`.
  // Remap here so the API contract is honoured without touching the form.
  const { purchaseDate, ...rest } = payload as any;
  return api
    .post("/purchase", { ...rest, customDate: purchaseDate })
    .then((r) => r.data);
};

// ── Update status ─────────────────────────────────────────────────────────────
// The backend exposes PATCH /purchase/:id (UpdatePurchaseDto with a status field).
// There is no separate /status sub-route.

export const updatePurchaseStatus = (
  id: string,
  payload: UpdatePurchaseStatusPayload,
): Promise<{ message: string }> =>
  api.patch(`/purchase/${id}`, payload).then((r) => r.data);

// ── Delete (only valid when status is DRAFT) ──────────────────────────────────

export const deletePurchase = (id: string): Promise<{ message: string }> =>
  api.delete(`/purchase/${id}`).then((r) => r.data);
