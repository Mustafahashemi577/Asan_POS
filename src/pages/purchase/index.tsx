import DateInput from "@/components/ui/DateInput";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PurchaseItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string; // ISO yyyy-mm-dd
}

// ── Stats ─────────────────────────────────────────────────────────────────────

const PURCHASE_STATS = [
  {
    label: "Total Purchases",
    value: "134",
    pct: "4.1%",
    pctColor: "text-green-400",
    date: "Wednesday, 06 May 2026",
    sub: "8 this week",
  },
  {
    label: "Total Spent",
    value: "AFN 2.4M",
    pct: "1.8%",
    pctColor: "text-orange-400",
    date: "Wednesday, 06 May 2026",
    sub: "AFN 380K this month",
  },
  {
    label: "This Month",
    value: "23",
    pct: "",
    pctColor: "",
    date: "Wednesday, 06 May 2026",
    sub: "AFN 380,000",
  },
];

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_PURCHASES: PurchaseItem[] = [
  {
    id: "PUR-001",
    name: "Arabica Coffee Beans",
    category: "Beverages",
    quantity: 50,
    unitPrice: 85000,
    totalPrice: 4250000,
    date: "2026-05-01",
  },
  {
    id: "PUR-002",
    name: "Whole Milk",
    category: "Dairy",
    quantity: 30,
    unitPrice: 18000,
    totalPrice: 540000,
    date: "2026-05-02",
  },
  {
    id: "PUR-003",
    name: "Vanilla Syrup",
    category: "Flavoring",
    quantity: 12,
    unitPrice: 45000,
    totalPrice: 540000,
    date: "2026-05-03",
  },
  {
    id: "PUR-004",
    name: "Paper Cups (12oz)",
    category: "Packaging",
    quantity: 1000,
    unitPrice: 1200,
    totalPrice: 1200000,
    date: "2026-05-03",
  },
  {
    id: "PUR-005",
    name: "Chocolate Powder",
    category: "Beverages",
    quantity: 20,
    unitPrice: 95000,
    totalPrice: 1900000,
    date: "2026-05-04",
  },
  {
    id: "PUR-006",
    name: "Oat Milk",
    category: "Dairy",
    quantity: 24,
    unitPrice: 32000,
    totalPrice: 768000,
    date: "2026-05-04",
  },
  {
    id: "PUR-007",
    name: "Caramel Sauce",
    category: "Flavoring",
    quantity: 8,
    unitPrice: 38000,
    totalPrice: 304000,
    date: "2026-05-05",
  },
  {
    id: "PUR-008",
    name: "Plastic Straws",
    category: "Packaging",
    quantity: 2000,
    unitPrice: 500,
    totalPrice: 1000000,
    date: "2026-05-05",
  },
  {
    id: "PUR-009",
    name: "Robusta Coffee Beans",
    category: "Beverages",
    quantity: 30,
    unitPrice: 65000,
    totalPrice: 1950000,
    date: "2026-05-06",
  },
  {
    id: "PUR-010",
    name: "Heavy Cream",
    category: "Dairy",
    quantity: 10,
    unitPrice: 55000,
    totalPrice: 550000,
    date: "2026-05-06",
  },
];

const CATEGORIES = ["Beverages", "Dairy", "Flavoring", "Packaging"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtCurrency(n: number) {
  return "AFN " + n.toLocaleString("id-ID");
}

function generateId() {
  const n = MOCK_PURCHASES.length + 1;
  return `PUR-${String(n).padStart(3, "0")}`;
}

// ── useIsDesktop ──────────────────────────────────────────────────────────────

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

// ── Add Purchase Form ─────────────────────────────────────────────────────────

interface AddPurchaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: PurchaseItem) => void;
}

function AddPurchaseForm({ open, onOpenChange, onSave }: AddPurchaseFormProps) {
  const isDesktop = useIsDesktop();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [date, setDate] = useState("");

  const totalPrice = Number(quantity) * Number(unitPrice);

  const reset = () => {
    setName("");
    setCategory("");
    setQuantity("");
    setUnitPrice("");
    setDate("");
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!name.trim() || !category || !quantity || !unitPrice || !date) return;
    onSave({
      id: generateId(),
      name: name.trim(),
      category,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      totalPrice,
      date,
    });
    handleClose();
  };

  // Shared form content
  const formContent = (
    <>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Item Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Arabica Coffee Beans"
            className="h-11 rounded-xl border-gray-200 text-sm"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-11 w-full rounded-xl border-gray-200 text-sm">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quantity + Unit Price side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Quantity
            </label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="h-11 rounded-xl border-gray-200 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Unit Price
            </label>
            <Input
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="0"
              className="h-11 rounded-xl border-gray-200 text-sm"
            />
          </div>
        </div>

        {/* Total Price — read only, auto-calculated */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Total Price
          </label>
          <div className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 flex items-center text-sm text-gray-500">
            {totalPrice > 0 ? fmtCurrency(totalPrice) : "Auto-calculated"}
          </div>
        </div>

        {/* Date — uses DateInput, single date, dd MMM yyyy display */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Purchase Date
          </label>
          <DateInput value={date} onChange={setDate} />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100 bg-white">
        <Button
          onClick={handleSubmit}
          disabled={
            !name.trim() || !category || !quantity || !unitPrice || !date
          }
          className="w-full h-11 bg-black text-white hover:bg-black/90 rounded-xl text-sm font-medium"
        >
          Add Purchase
        </Button>
      </div>
    </>
  );

  return (
    <>
      {isDesktop ? (
        // Desktop — Sheet from right, 1/3 width
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent
            side="right"
            className="w-1/3 m-2.5 rounded-lg flex flex-col p-0 gap-0"
          >
            <SheetHeader className="px-5 pt-5 pb-3 border-b border-gray-100">
              <SheetTitle className="text-left text-base font-semibold">
                Add Purchase
              </SheetTitle>
            </SheetHeader>
            {formContent}
          </SheetContent>
        </Sheet>
      ) : (
        // Mobile — fixed card below navbar, blurred backdrop
        open && (
          <>
            <div
              className="fixed top-[105px] inset-x-0 bottom-0 z-40 bg-black/20 backdrop-blur-[2px]"
              onClick={handleClose}
            />
            <div className="fixed top-[112px] left-4 right-4 z-50 bg-white rounded-2xl shadow-xl flex flex-col max-h-[calc(100dvh-89px)] overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
                <span className="text-base font-semibold text-gray-900">
                  Add Purchase
                </span>
                <button
                  onClick={handleClose}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {formContent}
            </div>
          </>
        )
      )}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Purchase() {
  const [purchases, setPurchases] = useState<PurchaseItem[]>(MOCK_PURCHASES);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    return purchases.filter((item) => {
      const matchesCategory =
        category === "all" ||
        item.category.toLowerCase() === category.toLowerCase();
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [purchases, category, search]);

  const totalSpent = filtered.reduce((s, i) => s + i.totalPrice, 0);

  const handleSave = (item: PurchaseItem) => {
    setPurchases((prev) => [item, ...prev]);
  };

  const handleDelete = (id: string) => {
    setPurchases((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="overflow-y-auto">
      <div className="max-w-[1401px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        {/* ── STATS CARD ──────────────────────────────────────────────── */}
        <div className="bg-gradient-to-t from-bg-dark via-bg-dark to-bg-dark/90 w-full rounded-2xl p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-white text-xl sm:text-2xl font-semibold">
              Purchase Overview
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Track raw material purchases for your inventory
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PURCHASE_STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 border border-white/10 rounded-xl p-4"
              >
                <p className="text-gray-300 text-xs mb-2">{stat.label}</p>
                <div className="flex items-end justify-between mb-3">
                  <p className="text-white text-lg sm:text-xl font-semibold leading-tight">
                    {stat.value}
                  </p>
                  {stat.pct && (
                    <span
                      className={`text-xs font-medium ${stat.pctColor} bg-white/10 px-1.5 py-0.5 rounded`}
                    >
                      {stat.pct}
                    </span>
                  )}
                </div>
                <hr className="border-white/10 mb-2" />
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[10px]">{stat.date}</span>
                  <span className="text-gray-400 text-xs">{stat.sub}</span>
                </div>
                <button className="text-gray-500 text-[10px] mt-1.5 hover:text-gray-300 transition block">
                  View all &rsaquo;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABLE SECTION ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {/* Header + filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Purchase Records
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {filtered.length} record{filtered.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:shrink-0">
              {/* Category filter */}
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10 sm:w-40 rounded-xl border-gray-200 text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative sm:w-56">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search purchases..."
                  className="h-10 pl-9 rounded-xl border-gray-200 text-sm bg-white"
                />
              </div>

              {/* Add Purchase */}
              <Button
                onClick={() => setFormOpen(true)}
                className="h-10 rounded-xl bg-black text-white hover:bg-black/90 text-sm gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Purchase
              </Button>
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  {[
                    "Purchase ID",
                    "Name",
                    "Category",
                    "Quantity",
                    "Unit Price",
                    "Total Price",
                    "Date",
                    "Actions",
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="text-sm font-medium py-4 text-left text-black bg-gray-100 first:rounded-l-md first:pl-6 last:rounded-r-md last:pr-6 whitespace-nowrap"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-400 text-sm"
                    >
                      No purchases found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="text-xs text-gray-600 font-mono pl-6 whitespace-nowrap">
                        {item.id}
                      </TableCell>
                      <TableCell className="text-xs text-gray-800 font-medium whitespace-nowrap">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                        {item.category}
                      </TableCell>
                      <TableCell className="text-xs text-gray-800 whitespace-nowrap">
                        {item.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-gray-800 whitespace-nowrap">
                        {fmtCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-xs text-gray-800 font-semibold whitespace-nowrap">
                        {fmtCurrency(item.totalPrice)}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                        {fmtDate(item.date)}
                      </TableCell>
                      <TableCell
                        className="pr-6 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
                            >
                              <MoreHorizontal
                                size={16}
                                className="text-gray-500"
                              />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-xl w-36"
                          >
                            <DropdownMenuItem className="text-xs cursor-pointer">
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs cursor-pointer">
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-xs cursor-pointer text-red-500 focus:text-red-500"
                              onClick={() => handleDelete(item.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* MOBILE CARDS */}
          <div className="sm:hidden divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <p className="px-5 py-12 text-center text-gray-400 text-sm">
                No purchases found
              </p>
            ) : (
              filtered.map((item) => (
                <div key={item.id} className="px-4 py-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-mono text-gray-500">
                      {item.id}
                    </span>
                    <span className="text-xs text-gray-400">
                      {fmtDate(item.date)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    {item.name}
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{item.category}</span>
                    <span>Qty: {item.quantity.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="space-y-0.5">
                      <p className="text-xs text-gray-400">
                        Unit: {fmtCurrency(item.unitPrice)}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {fmtCurrency(item.totalPrice)}
                      </p>
                    </div>
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button className="text-xs text-blue-500 hover:underline">
                        View
                      </button>
                      <button className="text-xs text-gray-500 hover:underline">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer — total of filtered rows */}
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing {filtered.length} of {purchases.length} records
            </span>
            <span className="text-sm font-semibold text-gray-900">
              Total: {fmtCurrency(totalSpent)}
            </span>
          </div>
        </div>
      </div>

      {/* Add Purchase form */}
      <AddPurchaseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
      />
    </div>
  );
}
