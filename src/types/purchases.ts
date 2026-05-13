// ── Enums ─────────────────────────────────────────────────────────────────────

export type PurchaseStatus = "DRAFT" | "DONE" | "CANCELLED";

// ── Shared sub-shapes ─────────────────────────────────────────────────────────

export interface PurchaseCustomer {
  id: string;
  name: string;
}

export interface PurchaseInventory {
  id: string;
  name: string;
}

export interface PurchasedProduct {
  id: string;
  name: string;
  price: number;
}

// ── Item shapes ───────────────────────────────────────────────────────────────

/** Used when sending items in a create payload */
export interface PurchaseItemPayload {
  productId: string;
  quantity: number;
  unitPrice: number;
}

/** Item shape returned by the API (list + detail) */
export interface PurchasedItemResponse {
  id: string;
  quantity: number;
  unitPrice: number;
  product: PurchasedProduct;
}

// ── List item (returned by GET /purchase) ─────────────────────────────────────

export interface PurchaseListItem {
  id: string;
  sequenceId: string;
  status: PurchaseStatus;
  /** ISO date string, e.g. "2026-05-06T00:00:00.000Z" */
  customDate: string;
  totalPrice: number;
  customer: PurchaseCustomer;
  inventory: PurchaseInventory;
  items: PurchasedItemResponse[];
}

// ── Detail (returned by GET /purchase/:id) ────────────────────────────────────

export type PurchaseDetail = PurchaseListItem;

// ── Create payload (sent to POST /purchase) ───────────────────────────────────

export interface CreatePurchasePayload {
  customerId: string;
  inventoryId: string;
  /** ISO date string from the date picker */
  purchaseDate: string;
  items: PurchaseItemPayload[];
}

// ── Update status payload (sent to PATCH /purchase/:id) ─────────────────────

export interface UpdatePurchaseStatusPayload {
  status: PurchaseStatus;
}
