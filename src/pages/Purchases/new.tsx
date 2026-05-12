import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import DateInput from "@/components/ui/DateInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import { useCustomers } from "@/hooks/useCustomers";
import { createCustomer } from "@/queries/customer";
import type { Inventory } from "@/queries/inventory";
import { getInventories } from "@/queries/inventory";
import { getProducts } from "@/queries/products";
import { createPurchase } from "@/queries/purchase";
import type { Customer } from "@/types/customer";
import { useNavigate } from "react-router-dom";

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

type FormValues = z.infer<typeof schema>;

interface ComboboxProps {
  value: string;
  displayValue: string;
  placeholder: string;
  icon: React.ReactNode;
  suggestions: { id: string; label: string; sub?: string }[];
  loading: boolean;
  onFocus: () => void;
  onInputChange: (v: string) => void;
  onSelect: (id: string, label: string) => void;
  error?: string;
}

function Combobox({
  displayValue,
  placeholder,
  icon,
  suggestions,
  loading,
  onFocus,
  onInputChange,
  onSelect,
  error,
}: ComboboxProps) {
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

export default function NewPurchasePage() {
  const { customers, mutate: mutateCustomers } = useCustomers();
  const [customersFetched, setCustomersFetched] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerDisplay, setCustomerDisplay] = useState("");

  const handleCustomerFocus = () => {
    if (customersFetched) return;
    setCustomerLoading(true);
    mutateCustomers().finally(() => {
      setCustomersFetched(true);
      setCustomerLoading(false);
    });
  };

  const filteredCustomers: { id: string; label: string; sub?: string }[] = (
    Array.isArray(customers) ? (customers as Customer[]) : []
  )
    .filter((c) =>
      customerSearch
        ? c.name.toLowerCase().startsWith(customerSearch.toLowerCase())
        : true,
    )
    .slice(0, 8)
    .map((c) => ({ id: c.id, label: c.name, sub: c.phone }));

  const [productSearch, setProductSearch] = useState<string[]>([""]);
  const [productSuggestions, setProductSuggestions] = useState<
    Record<number, { id: string; label: string; sub?: string }[]>
  >({});
  const [productLoading, setProductLoading] = useState<Record<number, boolean>>(
    {},
  );

  const fetchProductSuggestions = async (index: number, search: string) => {
    if (!search.trim()) return;
    setProductLoading((p) => ({ ...p, [index]: true }));
    try {
      const result = await getProducts({ search, itemsPerPage: 8, page: 1 });
      const data = result.data ?? result;
      setProductSuggestions((p) => ({
        ...p,
        [index]: (Array.isArray(data) ? data : []).map((pr: any) => ({
          id: pr.id,
          label: pr.name,
          sub: pr.price
            ? `AFN ${Number(pr.price).toLocaleString()}`
            : undefined,
        })),
      }));
    } catch {
      setProductSuggestions((p) => ({ ...p, [index]: [] }));
    } finally {
      setProductLoading((p) => ({ ...p, [index]: false }));
    }
  };

  const [inventories, setInventories] = useState<Inventory[]>([]);
  useEffect(() => {
    getInventories()
      .then(setInventories)
      .catch(() => setInventories([]));
  }, []);

  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const navigate = useNavigate();

  const handleCreateCustomer = async () => {
    if (!newName || !newPhone || !newAddress) return;
    await createCustomer({
      name: newName,
      phone: newPhone,
      address: newAddress,
    });
    await mutateCustomers();
    setCustomerDialogOpen(false);
    setNewName("");
    setNewPhone("");
    setNewAddress("");
  };

  // ── Form ───────────────────────────────────────────────────────────────────
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
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
  const onSubmit = async (values: FormValues) => {
    try {
      await createPurchase({
        customerId: values.customerId,
        purchaseDate: values.purchaseDate,
        inventoryId: values.inventoryId,
        items: values.items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      });

      form.reset();

      navigate("/purchases");
    } catch (error) {
      console.error("Failed to create purchase:", error);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const addItem = () => {
    append({ productId: "", productName: "", quantity: 1, unitPrice: 0 });
    setProductSearch((p) => [...p, ""]);
  };

  const removeItem = (index: number) => {
    remove(index);
    setProductSearch((p) => p.filter((_, i) => i !== index));
    setProductSuggestions((p) => {
      const next = { ...p };
      delete next[index];
      return next;
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-xl font-semibold text-gray-900">New Purchase</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* ── Row 1: Customer + Date ──────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer */}
            <FormField
              control={form.control}
              name="customerId"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <div className="flex-1">
                        <Combobox
                          value={field.value}
                          displayValue={customerDisplay}
                          placeholder="Search customer…"
                          icon={<User className="w-4 h-4" />}
                          suggestions={filteredCustomers}
                          loading={customerLoading}
                          onFocus={handleCustomerFocus}
                          onInputChange={(v) => {
                            setCustomerDisplay(v);
                            setCustomerSearch(v);
                          }}
                          onSelect={(id, label) => {
                            field.onChange(id);
                            setCustomerDisplay(label);
                            setCustomerSearch(label);
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

            {/* Date */}
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
                <div className="relative">
                  <Archive className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 pl-9 rounded-xl border-gray-200 text-sm">
                        <SelectValue placeholder="Assign to inventory…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {inventories.map((inv) => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.name}
                          {inv.address && (
                            <span className="text-gray-400 ml-1 text-xs">
                              — {inv.address}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                {/* Product search */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Product</Label>
                  <Controller
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field: f, fieldState }) => (
                      <Combobox
                        value={f.value}
                        displayValue={productSearch[index] ?? ""}
                        placeholder="Search product…"
                        icon={<Package className="w-4 h-4" />}
                        suggestions={productSuggestions[index] ?? []}
                        loading={productLoading[index] ?? false}
                        onFocus={() => {
                          // Only fetch on first focus if input already has a value
                          if (productSearch[index]?.trim()) {
                            fetchProductSuggestions(
                              index,
                              productSearch[index],
                            );
                          }
                        }}
                        onInputChange={(v) => {
                          setProductSearch((p) => {
                            const next = [...p];
                            next[index] = v;
                            return next;
                          });
                          if (v.trim()) fetchProductSuggestions(index, v);
                        }}
                        onSelect={(id, label) => {
                          f.onChange(id);
                          form.setValue(`items.${index}.productName`, label);
                          const match = (productSuggestions[index] ?? []).find(
                            (s) => s.id === id,
                          );
                          if (match?.sub) {
                            const price = Number(
                              match.sub.replace(/[^0-9]/g, ""),
                            );
                            if (!isNaN(price))
                              form.setValue(`items.${index}.unitPrice`, price);
                          }
                          setProductSearch((p) => {
                            const next = [...p];
                            next[index] = label;
                            return next;
                          });
                        }}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                {/* Qty + Unit price */}
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

                {/* Row total + remove */}
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
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
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
              <Plus className="w-4 h-4 mr-2" />
              Add Item
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

      {/* ── Add customer dialog ──────────────────────────────────────────── */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Add Customer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-11 pl-9 rounded-xl border-gray-200 text-sm"
              />
            </div>
            <Input
              placeholder="Phone"
              value={newPhone}
              onChange={(e) =>
                setNewPhone(e.target.value.replace(/[^0-9]/g, ""))
              }
              className="h-11 rounded-xl border-gray-200 text-sm"
            />
            <Input
              placeholder="Address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="h-11 rounded-xl border-gray-200 text-sm"
            />
            <Button
              onClick={handleCreateCustomer}
              className="w-full h-11 rounded-xl bg-black text-white hover:bg-black/90"
            >
              Save Customer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
