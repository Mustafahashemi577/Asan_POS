import type { Customer } from "@/types/customer";
import { create } from "zustand";

interface CustomerStore {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
}

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: [],

  setCustomers: (customers) => set({ customers }),

  addCustomer: (customer) =>
    set((state) => ({
      customers: [customer, ...state.customers],
    })),

  deleteCustomer: (id) =>
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
    })),

  updateCustomer: (id, data) =>
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id ? { ...c, ...data } : c,
      ),
    })),
}));
