import { useEffect, useMemo, useRef, useState } from "react";

import DateInput from "@/components/ui/DateInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Plus, UserPlus } from "lucide-react";

import { useCustomers } from "@/hooks/useCustomers";

import { createCustomer } from "@/queries/customer";
import { createPurchase } from "@/queries/purchase";

import type { Customer } from "@/types/customer";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
}

interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  quantity: string;
  unitPrice: string;
}

// ─────────────────────────────────────────────

export default function NewPurchasePage() {
  // ── Customers (SWR hook) ───────────────────
  const { customers, mutate: mutateCustomers } = useCustomers();

  // ── Products (you already had backend hook assumed)
  const [products] = useState<Product[]>([]);

  // ── UI STATE ────────────────────────────────
  const [purchaseDate, setPurchaseDate] = useState("");

  const [customer, setCustomer] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [items, setItems] = useState<PurchaseItem[]>([
    {
      id: crypto.randomUUID(),
      productId: "",
      productName: "",
      quantity: "",
      unitPrice: "",
    },
  ]);

  const customerRef = useRef<HTMLDivElement>(null);

  // ── Close dropdown ─────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        customerRef.current &&
        !customerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── FILTER CUSTOMERS ───────────────────────
  const filteredCustomers = useMemo(() => {
    const safe: Customer[] = Array.isArray(customers) ? customers : [];

    if (!customer.trim()) return [];

    return safe.filter((c) =>
      c.name.toLowerCase().includes(customer.toLowerCase()),
    );
  }, [customers, customer]);

  // ── ITEM HANDLERS ──────────────────────────
  const updateItem = (id: string, field: keyof PurchaseItem, value: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        productId: "",
        productName: "",
        quantity: "",
        unitPrice: "",
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // ── CREATE CUSTOMER ────────────────────────
  const handleCreateCustomer = async () => {
    if (!customerName || !customerPhone || !customerAddress) return;

    await createCustomer({
      name: customerName,
      phone: customerPhone,
      address: customerAddress,
    });

    await mutateCustomers();

    setCustomerDialogOpen(false);

    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
  };

  // ── CREATE PURCHASE ────────────────────────
  const handleSubmit = async () => {
    await createPurchase({
      customerId: selectedCustomerId,
      purchaseDate,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
    });
  };

  // ── TOTAL ──────────────────────────────────
  const total = items.reduce((sum, i) => {
    return sum + Number(i.quantity || 0) * Number(i.unitPrice || 0);
  }, 0);

  // ───────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold">New Purchase</h1>

      {/* CUSTOMER */}
      <div ref={customerRef} className="space-y-2 relative">
        <label className="text-sm">Customer</label>

        <div className="relative">
          <Input
            value={customer}
            onChange={(e) => {
              setCustomer(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder="Search customer..."
          />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCustomerDialogOpen(true)}
                  className="absolute right-2 top-2"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Add customer</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {showSuggestions && filteredCustomers.length > 0 && (
          <div className="absolute bg-white border w-full rounded-md mt-1 z-50">
            {filteredCustomers.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setCustomer(c.name);
                  setSelectedCustomerId(c.id);
                  setShowSuggestions(false);
                }}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {c.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DATE */}
      <DateInput value={purchaseDate} onChange={setPurchaseDate} />

      {/* ITEMS */}
      {items.map((item) => (
        <div key={item.id} className="border p-3 rounded space-y-2">
          <Input
            placeholder="Product name"
            value={item.productName}
            onChange={(e) => updateItem(item.id, "productName", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
            />

            <Input
              type="number"
              placeholder="Price"
              value={item.unitPrice}
              onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
            />
          </div>

          <Button variant="ghost" onClick={() => removeItem(item.id)}>
            Remove
          </Button>
        </div>
      ))}

      <Button onClick={addItem} variant="outline">
        <Plus className="w-4 h-4 mr-2" />
        Add Item
      </Button>

      <div className="flex justify-between items-center border-t pt-4">
        <p className="font-semibold">Total: {total}</p>

        <Button onClick={handleSubmit}>Save Purchase</Button>
      </div>

      {/* CUSTOMER DIALOG */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Input
              placeholder="Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <Input
              placeholder="Phone"
              value={customerPhone}
              onChange={(e) =>
                setCustomerPhone(e.target.value.replace(/[^0-9]/g, ""))
              }
            />

            <Input
              placeholder="Address"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
            />

            <Button onClick={handleCreateCustomer} className="w-full">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
