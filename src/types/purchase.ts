export interface PurchaseItemPayload {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchasePayload {
  customerId: string;
  purchaseDate: string;
  inventoryId: string;
  items: PurchaseItemPayload[];
}

export interface PurchaseItem {
  id: string;

  productId: string;

  quantity: number;

  unitPrice: number;

  totalPrice: number;

  product?: {
    id: string;
    name: string;
  };
}

export interface Purchase {
  id: string;

  customerId: string;

  inventoryId: string;

  purchaseDate: string;

  totalPrice: number;

  createdAt?: string;

  customer?: {
    id: string;
    name: string;
    phone?: string;
  };

  inventory?: {
    id: string;
    name: string;
    address?: string;
  };

  items: PurchaseItem[];
}

// ── Update payload ──────────────────────────────────────────────────

export interface UpdatePurchasePayload {
  customerId?: string;

  inventoryId?: string;

  purchaseDate?: string;

  items?: PurchaseItemPayload[];
}
