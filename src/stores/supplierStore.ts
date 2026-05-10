import { create } from "zustand";

import type { Supplier } from "@/types/supplier";

interface SupplierStore {
  suppliers: Supplier[];

  addSupplier: (supplier: Supplier) => void;

  deleteSupplier: (id: string) => void;
}

export const useSupplierStore = create<SupplierStore>((set) => ({
  suppliers: [
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

  addSupplier: (supplier) =>
    set((state) => ({
      suppliers: [supplier, ...state.suppliers],
    })),

  deleteSupplier: (id) =>
    set((state) => ({
      suppliers: state.suppliers.filter((s) => s.id !== id),
    })),
}));
