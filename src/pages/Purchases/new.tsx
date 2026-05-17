import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import CustomerDialog from "@/components/AddCustomerDialog";
import DateInput from "@/components/ui/DateInput";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Archive,
  DollarSign,
  Hash,
  Package,
  Plus,
  Trash2,
  User,
  UserPlus,
} from "lucide-react";
import InventoryCombobox from "./components/inventory-combobox";

import { createCustomer, getCustomers } from "@/queries/customer";
import { getProducts } from "@/queries/products";
import { createPurchase } from "@/queries/purchase";
import type { CreateCustomerPayload } from "@/types/customer";

// ── API response shapes ───────────────────────────────────────────────────────

interface CustomerRow {
  id: string;
  name: string;
  phone?: string;
}

interface ProductRow {
  id: string;
  name: string;
  price?: string | number;
}

interface ApiListResponse<T> {
  data?: T[];
}

// ── Schema ────────────────────────────────────────────────────────────────────

const itemSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  productName: z.string().min(1),
  quantity: z.coerce.number().int().positive("Must be > 0"),
  unitPrice: z.coerce.number().positive("Must be > 0"),
});

const schema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  purchaseDate: z.string().min(1, "Select a date"),
  inventoryId: z.string().min(1, "Select an inventory"),
  items: z.array(itemSchema).min(1, "Add at least one item"),
});

// Explicit type so z.coerce fields resolve to `number` not `unknown`,
// fixing the Resolver<> assignability error from react-hook-form.
type FormValues = {
  customerId: string;
  purchaseDate: string;
  inventoryId: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
};

// ── Suggestion type ───────────────────────────────────────────────────────────

interface Suggestion {
  id: string;
  label: string;
  sub?: string;
}

// ── useDebounce ───────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ── InlineCombobox (customer / product autocomplete) ─────────────────────────

interface InlineComboboxProps {
  displayValue: string;
  placeholder: string;
  icon: React.ReactNode;
  suggestions: Suggestion[];
  loading: boolean;
  onFocus: () => void;
  onInputChange: (v: string) => void;
  onSelect: (id: string, label: string) => void;
  error?: string;
}

function InlineCombobox({
  displayValue,
  placeholder,
  icon,
  suggestions,
  loading,
  onFocus,
  onInputChange,
  onSelect,
  error,
}: InlineComboboxProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </span>
        <Input
          value={displayValue}
          placeholder={placeholder}
          className={`h-11 pl-9 pr-3 rounded-xl border-gray-200 text-sm ${error ? "border-red-400" : ""}`}
          onFocus={() => {
            onFocus();
            setOpen(true);
          }}
          onChange={(e) => {
            onInputChange(e.target.value);
            setOpen(true);
          }}
        />
      </div>

      {open && (displayValue.length > 0 || loading) && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <p className="px-4 py-3 text-xs text-gray-400">Searching…</p>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-3 text-xs text-gray-400">No results</p>
          ) : (
            suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(s.id, s.label);
                  setOpen(false);
                }}
              >
                <p className="text-sm text-gray-800">{s.label}</p>
                {s.sub && <p className="text-xs text-gray-400">{s.sub}</p>}
              </button>
            ))
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ── useCustomerSearch ─────────────────────────────────────────────────────────

function useCustomerSearch() {
  const [display, setDisplay] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const debounced = useDebounce(display, 300);

  useEffect(() => {
    if (!enabled || !debounced.trim()) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getCustomers({ search: debounced, itemsPerPage: 8, page: 1 })
      .then((result: ApiListResponse<CustomerRow> | CustomerRow[]) => {
        if (cancelled) return;
        const rows = Array.isArray(result) ? result : (result.data ?? []);
        setSuggestions(
          rows.map((c) => ({ id: c.id, label: c.name, sub: c.phone })),
        );
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, enabled]);

  return {
    display,
    setDisplay,
    suggestions,
    setSuggestions,
    loading,
    setEnabled,
  };
}

// ── useProductSearch ──────────────────────────────────────────────────────────

function useProductSearch() {
  const [displays, setDisplays] = useState<string[]>([""]);
  const [suggestions, setSuggestions] = useState<Record<number, Suggestion[]>>(
    {},
  );
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeSearch =
    activeIndex !== null ? (displays[activeIndex] ?? "") : "";
  const debounced = useDebounce(activeSearch, 300);

  useEffect(() => {
    if (activeIndex === null || !debounced.trim()) {
      if (activeIndex !== null)
        setSuggestions((p) => ({ ...p, [activeIndex]: [] }));
      return;
    }
    const index = activeIndex;
    let cancelled = false;
    setLoadingMap((p) => ({ ...p, [index]: true }));
    getProducts({ search: debounced, itemsPerPage: 8, page: 1 })
      .then((result: ApiListResponse<ProductRow> | ProductRow[]) => {
        if (cancelled) return;
        const data = Array.isArray(result) ? result : (result.data ?? []);
        setSuggestions((p) => ({
          ...p,
          [index]: data.map((pr) => ({
            id: pr.id,
            label: pr.name,
            sub: pr.price
              ? `AFN ${Number(pr.price).toLocaleString()}`
              : undefined,
          })),
        }));
      })
      .catch(() => {
        if (!cancelled) setSuggestions((p) => ({ ...p, [index]: [] }));
      })
      .finally(() => {
        if (!cancelled) setLoadingMap((p) => ({ ...p, [index]: false }));
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, activeIndex]);

  const addRow = () => setDisplays((p) => [...p, ""]);

  const removeRow = (index: number) => {
    setDisplays((p) => p.filter((_, i) => i !== index));
    setSuggestions((p) => {
      const n = { ...p };
      delete n[index];
      return n;
    });
    if (activeIndex === index) setActiveIndex(null);
  };

  return {
    displays,
    setDisplays,
    suggestions,
    setSuggestions,
    loadingMap,
    activeIndex,
    setActiveIndex,
    addRow,
    removeRow,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewPurchasePage() {
  const navigate = useNavigate();
  const customer = useCustomerSearch();
  const product = useProductSearch();
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as ReturnType<
      typeof zodResolver<typeof schema, FormValues>
    >,
    defaultValues: {
      customerId: "",
      purchaseDate: "",
      inventoryId: "",
      items: [{ productId: "", productName: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  const watchedItems = form.watch("items");
  const total = watchedItems.reduce(
    (sum, i) => sum + Number(i.quantity || 0) * Number(i.unitPrice || 0),
    0,
  );

  const handleCreateCustomer = async (values: CreateCustomerPayload) => {
    await createCustomer({
      name: values.name,
      phone: values.phone,
      address: values.address,
    });
    customer.setDisplay(values.name);
    customer.setEnabled(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await createPurchase({
        customerId: values.customerId,
        inventoryId: values.inventoryId,
        purchaseDate: values.purchaseDate,
        items: values.items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      });
      form.reset();
      navigate("/purchases");
    } catch (err) {
      console.error("Failed to create purchase:", err);
    }
  };

  const addItem = () => {
    append({ productId: "", productName: "", quantity: 1, unitPrice: 0 });
    product.addRow();
  };

  const removeItem = (index: number) => {
    remove(index);
    product.removeRow(index);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-xl font-semibold text-gray-900">New Purchase</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* ── Customer + Date ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <div className="flex-1">
                        <InlineCombobox
                          displayValue={customer.display}
                          placeholder="Search customer…"
                          icon={<User className="w-4 h-4" />}
                          suggestions={customer.suggestions}
                          loading={customer.loading}
                          onFocus={() => customer.setEnabled(true)}
                          onInputChange={(v) => {
                            customer.setDisplay(v);
                            field.onChange("");
                          }}
                          onSelect={(id, label) => {
                            field.onChange(id);
                            customer.setDisplay(label);
                            customer.setSuggestions([]);
                          }}
                          error={fieldState.error?.message}
                        />
                      </div>
                    </FormControl>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 rounded-xl border-gray-200 shrink-0"
                            onClick={() => setCustomerDialogOpen(true)}
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add new customer</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Purchase Date</FormLabel>
                  <FormControl>
                    <DateInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage>{fieldState.error.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />
          </div>

          {/* ── Inventory ───────────────────────────────────────────────── */}
          <FormField
            control={form.control}
            name="inventoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inventory</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Archive className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                    <InventoryCombobox
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ── Items ───────────────────────────────────────────────────── */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Items</Label>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50"
              >
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Product</Label>
                  <Controller
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field: f, fieldState }) => (
                      <InlineCombobox
                        displayValue={product.displays[index] ?? ""}
                        placeholder="Search product…"
                        icon={<Package className="w-4 h-4" />}
                        suggestions={product.suggestions[index] ?? []}
                        loading={product.loadingMap[index] ?? false}
                        onFocus={() => product.setActiveIndex(index)}
                        onInputChange={(v) => {
                          product.setDisplays((p) => {
                            const n = [...p];
                            n[index] = v;
                            return n;
                          });
                          f.onChange("");
                          product.setActiveIndex(index);
                        }}
                        onSelect={(id, label) => {
                          f.onChange(id);
                          form.setValue(`items.${index}.productName`, label);
                          const match = (product.suggestions[index] ?? []).find(
                            (s) => s.id === id,
                          );
                          if (match?.sub) {
                            const price = Number(
                              match.sub.replace(/[^0-9]/g, ""),
                            );
                            if (!isNaN(price))
                              form.setValue(`items.${index}.unitPrice`, price);
                          }
                          product.setDisplays((p) => {
                            const n = [...p];
                            n[index] = label;
                            return n;
                          });
                          product.setSuggestions((p) => ({
                            ...p,
                            [index]: [],
                          }));
                          product.setActiveIndex(null);
                        }}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field: f }) => (
                      <FormItem>
                        <Label className="text-xs text-gray-500">
                          Quantity
                        </Label>
                        <FormControl>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <Input
                              type="number"
                              min={1}
                              placeholder="0"
                              className="h-11 pl-9 rounded-xl border-gray-200 text-sm"
                              {...f}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field: f }) => (
                      <FormItem>
                        <Label className="text-xs text-gray-500">
                          Unit Price
                        </Label>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <Input
                              type="number"
                              min={0}
                              placeholder="0"
                              className="h-11 pl-9 rounded-xl border-gray-200 text-sm"
                              {...f}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-400">
                    Line total:{" "}
                    <span className="font-medium text-gray-700">
                      AFN{" "}
                      {(
                        Number(watchedItems[index]?.quantity || 0) *
                        Number(watchedItems[index]?.unitPrice || 0)
                      ).toLocaleString("id-ID")}
                    </span>
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl border-dashed border-gray-300 text-gray-500 hover:text-gray-800 h-11"
              onClick={addItem}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>

            {form.formState.errors.items?.root && (
              <p className="text-xs text-red-500">
                {form.formState.errors.items.root.message}
              </p>
            )}
          </div>

          {/* ── Total + submit ───────────────────────────────────────────── */}
          <div className="border-t border-gray-200 pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-lg font-bold text-gray-900">
                AFN {total.toLocaleString("id-ID")}
              </p>
            </div>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-11 px-8 rounded-xl bg-black text-white hover:bg-black/90 font-medium"
            >
              {form.formState.isSubmitting ? "Saving…" : "Save Purchase"}
            </Button>
          </div>
        </form>
      </Form>

      <CustomerDialog
        open={customerDialogOpen}
        onOpenChange={setCustomerDialogOpen}
        onSubmit={handleCreateCustomer}
      />
    </div>
  );
}
