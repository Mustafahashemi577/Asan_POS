// ── Enums ─────────────────────────────────────────────────────────────────────

export type PurchaseStatus = "Draft" | "Done" | "Cancelled" | "Pending";

// ── Shared sub-shapes ─────────────────────────────────────────────────────────

export interface PurchaseCustomer {
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
  items: PurchasedItemResponse[];
}

// ── Detail (returned by GET /purchase/:id) ────────────────────────────────────

export type PurchaseDetail = PurchaseListItem;

// ── Create payload (sent to POST /purchase) ───────────────────────────────────

export interface CreatePurchasePayload {
  customerId: string;
  /** ISO date string from the date picker */
  purchaseDate: string;
  items: PurchaseItemPayload[];
}

// ── UI helpers ────────────────────────────────────────────────────────────────

/** Generic autocomplete suggestion used in search comboboxes */
export interface Suggestion {
  id: string;
  label: string;
  sub?: string;
}

// ── Update status payload (sent to PATCH /purchase/:id) ─────────────────────

export interface UpdatePurchaseStatusPayload {
  status: PurchaseStatus;
}

// ── Stock-In types ────────────────────────────────────────────────────────────

export interface StockInItemPayload {
  purchaseItemId: string;
  quantity: number;
}

export interface CreateStockInPayload {
  purchaseId: string;
  inventoryId: string;
  items: StockInItemPayload[];
}

/** Item shape on the stock-in page — extends PurchasedItemResponse with received */
export interface PurchasedItemWithReceived extends PurchasedItemResponse {
  received: number;
}
