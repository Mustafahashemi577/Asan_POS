import { Button } from "@/components/ui/button";
import DateInput from "@/components/ui/DateInput";
import { Input } from "@/components/ui/input";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useSupplierStore } from "@/stores/supplierStore";

import { UserPlus } from "lucide-react";

import AddSupplierDialog from "@/pages/contacts/components/AddSupplierDialog";

import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import { useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

interface PurchaseRow {
  id: string;
  name: string;
  category: string;
  quantity: string;
  unitPrice: string;
}

function createRow(): PurchaseRow {
  return {
    id: crypto.randomUUID(),
    name: "",
    category: "",
    quantity: "",
    unitPrice: "",
  };
}

function fmtCurrency(n: number) {
  return "AFN " + n.toLocaleString("id-ID");
}

export default function NewPurchasePage() {
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  const [items, setItems] = useState<PurchaseRow[]>([createRow()]);

  const addRow = () => {
    setItems((prev) => [...prev, createRow()]);
  };

  const removeRow = (id: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const suppliers = useSupplierStore((s) => s.suppliers);

  const [supplierOpen, setSupplierOpen] = useState(false);
  const [supplierQuery, setSupplierQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const matchingSuppliers = useMemo(() => {
    if (!supplierQuery.trim()) return [];

    return suppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(supplierQuery.toLowerCase()),
    );
  }, [supplierQuery, suppliers]);

  const updateRow = (id: string, field: keyof PurchaseRow, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const grandTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;

      return sum + qty * price;
    }, 0);
  }, [items]);

  const handleSubmit = () => {
    console.log({
      supplier,
      purchaseDate,
      items,
      grandTotal,
    });

    navigate("/Purchases");
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <h1 className="text-2xl font-semibold text-gray-900">
              New Purchase
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Add purchase items for inventory
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            className="rounded-xl h-11 px-5 bg-black hover:bg-black/90"
          >
            Save Purchase
          </Button>
        </div>

        {/* Top Form */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Supplier */}
            <div className="space-y-1.5 relative">
              <label className="text-sm font-medium">Supplier</label>

              <div className="relative">
                <Input
                  value={supplier}
                  onChange={(e) => {
                    setSupplier(e.target.value);
                    setSupplierQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  placeholder="Search supplier"
                  className="h-11 rounded-xl pr-12"
                />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setSupplierOpen(true)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>

                    <TooltipContent>Add new supplier</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {showSuggestions && matchingSuppliers.length > 0 && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {matchingSuppliers.map((supplier) => (
                      <button
                        key={supplier.id}
                        type="button"
                        onClick={() => {
                          setSupplierQuery(supplier.name);
                          setSupplier(supplier.name);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {supplier.name}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {supplier.phone}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Purchase Date</label>

              <DateInput value={purchaseDate} onChange={setPurchaseDate} />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Purchase Items</h2>

              <p className="text-xs text-gray-500 mt-0.5">
                Add all purchased products
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addRow}
              className="rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>

          <div className="divide-y divide-gray-100">
            {items.map((item, index) => {
              const total =
                (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);

              return (
                <div key={item.id} className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-800">
                      Item #{index + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() => removeRow(item.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                    {/* Name */}
                    <div className="lg:col-span-4 space-y-1.5">
                      <label className="text-sm font-medium">Item Name</label>

                      <Input
                        value={item.name}
                        onChange={(e) =>
                          updateRow(item.id, "name", e.target.value)
                        }
                        placeholder="Product name"
                        className="h-11 rounded-xl"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="lg:col-span-2 space-y-1.5">
                      <label className="text-sm font-medium">Quantity</label>

                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateRow(item.id, "quantity", e.target.value)
                        }
                        placeholder="0"
                        className="h-11 rounded-xl"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="lg:col-span-2 space-y-1.5">
                      <label className="text-sm font-medium">Unit Price</label>

                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateRow(item.id, "unitPrice", e.target.value)
                        }
                        placeholder="0"
                        className="h-11 rounded-xl"
                      />
                    </div>

                    {/* Total */}
                    <div className="lg:col-span-1 space-y-1.5">
                      <label className="text-sm font-medium">Total</label>

                      <div className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 flex items-center text-sm">
                        {total > 0 ? fmtCurrency(total) : "-"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {items.length} item
              {items.length !== 1 ? "s" : ""}
            </span>

            <div className="text-right">
              <p className="text-xs text-gray-500">Grand Total</p>

              <p className="text-lg font-semibold text-gray-900">
                {fmtCurrency(grandTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>
      <AddSupplierDialog open={supplierOpen} onOpenChange={setSupplierOpen} />
    </div>
  );
}
