import { useEffect, useMemo, useRef, useState } from "react";

import useSWR from "swr";

import api from "@/lib/axios";

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

import { Label } from "@/components/ui/label";
import { Plus, Trash2, UserPlus } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

interface Product {
  id: string;
  name: string;
}

interface PurchaseRow {
  id: string;
  productId: string;
  productName: string;
  quantity: string;
  unitPrice: string;
}

async function getCustomers() {
  const response = await api.get("customer");

  return response.data;
}

async function getProducts() {
  const response = await api.get("/products");

  return response.data;
}

export default function NewPurchasePage() {
  // ─────────────────────────────────────────────
  // Customers
  // ─────────────────────────────────────────────

  const { data: customersData, mutate: mutateCustomers } = useSWR(
    "/customers",
    getCustomers,
  );

  const customers: Customer[] = Array.isArray(customersData)
    ? customersData
    : customersData?.data || [];

  // ─────────────────────────────────────────────
  // Products
  // ─────────────────────────────────────────────

  const { data: productsData } = useSWR("/products", getProducts);

  const products: Product[] = Array.isArray(productsData)
    ? productsData
    : productsData?.data || [];

  // ─────────────────────────────────────────────
  // States
  // ─────────────────────────────────────────────

  const [purchaseDate, setPurchaseDate] = useState("");

  const [customer, setCustomer] = useState("");

  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const [customerPhone, setCustomerPhone] = useState("");

  const [customerAddress, setCustomerAddress] = useState("");

  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");

  const [customerPhoneInput, setCustomerPhoneInput] = useState("");

  const [customerAddressInput, setCustomerAddressInput] = useState("");

  const [items, setItems] = useState<PurchaseRow[]>([
    {
      id: crypto.randomUUID(),
      productId: "",
      productName: "",
      quantity: "",
      unitPrice: "",
    },
  ]);

  const customerRef = useRef<HTMLDivElement | null>(null);

  // ─────────────────────────────────────────────
  // Close suggestions on outside click
  // ─────────────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        customerRef.current &&
        !customerRef.current.contains(event.target as Node)
      ) {
        setShowCustomerSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ─────────────────────────────────────────────Customer
  // Filter customers
  // ─────────────────────────────────────────────

  const matchingCustomers = useMemo(() => {
    if (!customer.trim()) return [];

    return customers.filter((item) =>
      item.name.toLowerCase().includes(customer.toLowerCase()),
    );
  }, [customer, customers]);

  // ─────────────────────────────────────────────
  // Row helpers
  // ─────────────────────────────────────────────

  const updateRow = (
    rowId: string,
    field: keyof PurchaseRow,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === rowId
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const addRow = () => {
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

  const removeRow = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ─────────────────────────────────────────────
  // Grand total
  // ─────────────────────────────────────────────

  const grandTotal = items.reduce((sum, item) => {
    return sum + Number(item.quantity || 0) * Number(item.unitPrice || 0);
  }, 0);

  // ─────────────────────────────────────────────
  // Add customer
  // ─────────────────────────────────────────────

  const handleAddCustomer = async () => {
    if (
      !customerName.trim() ||
      !customerPhoneInput ||
      !customerAddressInput.trim()
    ) {
      return;
    }

    await api.post("/customers", {
      name: customerName,
      phone: customerPhoneInput,
      address: customerAddressInput,
    });

    await mutateCustomers();

    setCustomerDialogOpen(false);

    setCustomerName("");
    setCustomerPhoneInput("");
    setCustomerAddressInput("");
  };

  // ─────────────────────────────────────────────
  // Submit purchase
  // ─────────────────────────────────────────────

  const handleSubmit = async () => {
    const payload = {
      customerId: selectedCustomerId,
      purchaseDate,

      items: items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
    };

    await api.post("/purchases", payload);
  };

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (
    <>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        {/* Header */}

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">New Purchase</h1>

          <p className="text-sm text-gray-500 mt-1">
            Create a new purchase order
          </p>
        </div>

        {/* Main card */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
          {/* Top section */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Customer */}

            <div ref={customerRef} className="space-y-1.5 relative">
              <Label className="text-sm font-medium">Customer</Label>

              <div className="relative">
                <Input
                  value={customer}
                  onChange={(e) => {
                    setCustomer(e.target.value);
                    setShowCustomerSuggestions(true);
                  }}
                  placeholder="Search customer"
                  className="h-11 rounded-xl pr-12"
                />

                {/* Add customer button */}

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setCustomerDialogOpen(true)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>

                    <TooltipContent>Add new customer</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Suggestions */}

                {showCustomerSuggestions && matchingCustomers.length > 0 && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {matchingCustomers.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setCustomer(item.name);

                          setSelectedCustomerId(item.id);

                          setCustomerPhone(item.phone);

                          setCustomerAddress(item.address);

                          setShowCustomerSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {item.name}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {item.phone}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer info */}

              {customerPhone && (
                <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">{customerPhone}</p>

                  <p className="text-xs text-gray-400 mt-1">
                    {customerAddress}
                  </p>
                </div>
              )}
            </div>

            {/* Purchase date */}

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Purchase Date</Label>

              <DateInput value={purchaseDate} onChange={setPurchaseDate} />
            </div>
          </div>

          {/* Purchase rows */}

          <div className="space-y-4">
            {items.map((item) => {
              const matchingProducts = products.filter((product) =>
                product.name
                  .toLowerCase()
                  .includes(item.productName.toLowerCase()),
              );

              return (
                <div
                  key={item.id}
                  className="border border-gray-100 rounded-2xl p-4 space-y-4"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Product */}

                    <div className="relative lg:col-span-2">
                      <Label className="text-sm font-medium mb-1.5 block">
                        Product
                      </Label>

                      <Input
                        value={item.productName}
                        onChange={(e) => {
                          updateRow(item.id, "productName", e.target.value);
                        }}
                        placeholder="Search product"
                        className="h-11 rounded-xl"
                      />

                      {/* Product suggestions */}

                      {item.productName && matchingProducts.length > 0 && (
                        <div className="absolute z-40 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                          {matchingProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => {
                                updateRow(item.id, "productId", product.id);

                                updateRow(item.id, "productName", product.name);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50"
                            >
                              <p className="text-sm font-medium">
                                {product.name}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quantity */}

                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">
                        Quantity
                      </Label>

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

                    {/* Unit price */}

                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">
                        Unit Price
                      </Label>

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
                  </div>

                  {/* Row footer */}

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Total: AFN{" "}
                      {(
                        Number(item.quantity || 0) * Number(item.unitPrice || 0)
                      ).toLocaleString()}
                    </p>

                    {items.length > 1 && (
                      <button
                        onClick={() => removeRow(item.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add item */}

          <Button
            type="button"
            variant="outline"
            onClick={addRow}
            className="h-11 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>

          {/* Footer */}

          <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Grand Total</p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-1">
                AFN {grandTotal.toLocaleString()}
              </h2>
            </div>

            <Button
              onClick={handleSubmit}
              className="h-11 rounded-xl bg-black hover:bg-black/90"
            >
              Save Purchase
            </Button>
          </div>
        </div>
      </div>

      {/* Add customer dialog */}

      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Name */}

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Customer Name</Label>

              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name"
                className="h-11 rounded-xl"
              />
            </div>

            {/* Phone */}

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Phone Number</Label>

              <Input
                value={customerPhoneInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");

                  setCustomerPhoneInput(value);
                }}
                placeholder="0700000000"
                className="h-11 rounded-xl"
              />
            </div>

            {/* Address */}

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Address</Label>

              <Input
                value={customerAddressInput}
                onChange={(e) => setCustomerAddressInput(e.target.value)}
                placeholder="Customer address"
                className="h-11 rounded-xl"
              />
            </div>

            {/* Submit */}

            <Button
              onClick={handleAddCustomer}
              className="w-full h-11 rounded-xl bg-black hover:bg-black/90"
            >
              Add Customer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
