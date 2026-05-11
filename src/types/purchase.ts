export interface PurchaseItemPayload {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchasePayload {
  customerId: string;
  purchaseDate: string;
  items: PurchaseItemPayload[];
}
