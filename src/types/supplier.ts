export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSupplierPayload {
  name: string;
  phone: string;
  address: string;
}

export interface UpdateSupplierPayload {
  name: string;
  phone: string;
  address: string;
}
