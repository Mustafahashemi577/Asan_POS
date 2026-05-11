import { create } from "zustand";

import type { Customer } from "@/types/customer";

interface CustomerStore {
  customers: Customer[];

  addCustomer: (customer: Customer) => void;

  deleteCustomer: (id: string) => void;
}

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: [
    {
      id: crypto.randomUUID(),
      name: "Kabul Coffee Import",
      phone: "+93 700 000 001",
      address: "Kart-e-Seh, Kabul, Afghanistan",
    },
    {
      id: crypto.randomUUID(),
      name: "Fresh Dairy Ltd",
      phone: "+93 700 000 002",
      address: "Shahr-e-Naw, Kabul, Afghanistan",
    },
  ],

  addCustomer: (customer) =>
    set((state) => ({
      customers: [customer, ...state.customers],
    })),

  deleteCustomer: (id) =>
    set((state) => ({
      customers: state.customers.filter((s) => s.id !== id),
    })),
}));
