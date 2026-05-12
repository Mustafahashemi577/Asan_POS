export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  address: string;
}

export interface UpdateCustomerPayload {
  name: string;
  phone: string;
  address: string;
}
