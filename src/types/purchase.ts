export interface PurchaseItemPayload {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchasePayload {
  supplierId: string;
  purchaseDate: string;
  items: PurchaseItemPayload[];
}
