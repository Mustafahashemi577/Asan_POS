import { useMemo, useState } from "react";

import useSWR from "swr";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
}

async function getSuppliers() {
  const { data } = await api.get<Supplier[]>("/suppliers");

  return data;
}

export default function ContactsPage() {
  const {
    data: suppliers = [],
    mutate,
    isLoading,
  } = useSWR("/suppliers", getSuppliers);

  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const filtered = useMemo(() => {
    return suppliers.filter((supplier) => {
      return (
        supplier.name.toLowerCase().includes(search.toLowerCase()) ||
        supplier.phone.includes(search) ||
        supplier.address.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [search, suppliers]);

  const reset = () => {
    setName("");
    setPhone("");
    setAddress("");
    setEditingSupplier(null);
  };

  const handleOpenCreate = () => {
    reset();
    setDialogOpen(true);
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);

    setName(supplier.name);
    setPhone(supplier.phone);
    setAddress(supplier.address);

    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !phone || !address.trim()) {
      return;
    }

    const payload = {
      name,
      phone,
      address,
    };

    if (editingSupplier) {
      await api.patch(`/suppliers/${editingSupplier.id}`, payload);
    } else {
      await api.post("/suppliers", payload);
    }

    await mutate();

    setDialogOpen(false);

    reset();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/suppliers/${id}`);

    mutate();
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>

            <p className="text-sm text-gray-500 mt-1">
              Manage supplier contacts
            </p>
          </div>

          <Button
            onClick={handleOpenCreate}
            className="h-11 rounded-xl bg-black hover:bg-black/90"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Supplier
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-sm">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search suppliers"
                className="pl-9 h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {isLoading ? (
              <div className="p-10 text-center text-sm text-gray-400">
                Loading suppliers...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-400">
                No suppliers found
              </div>
            ) : (
              filtered.map((supplier) => (
                <div
                  key={supplier.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      {supplier.name}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      {supplier.phone}
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      {supplier.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(supplier)}
                      className="text-gray-500 hover:text-black"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(supplier.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? "Edit Supplier" : "Add Supplier"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Supplier Name</label>

              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Supplier name"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone Number</label>

              <Input
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");

                  setPhone(value);
                }}
                placeholder="0700000000"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Address</label>

              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Supplier address"
                className="h-11 rounded-xl"
              />
            </div>

            <Button
              onClick={handleSave}
              className="w-full h-11 rounded-xl bg-black hover:bg-black/90"
            >
              {editingSupplier ? "Save Changes" : "Add Supplier"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
