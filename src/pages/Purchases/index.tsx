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

import { getCategories } from "@/queries/category";

import { MoreHorizontal, Plus, Search } from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PurchaseItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string;
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

// ── Mock Data ─────────────────────────────────────────────────────────────────

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
];

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Purchase() {
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState<PurchaseItem[]>(MOCK_PURCHASES);

  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );

  // Fetch categories
  useEffect(() => {
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  // Filtered data
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

  const totalSpent = filtered.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleDelete = (id: string) => {
    setPurchases((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="overflow-y-auto">
      <div className="max-w-[1401px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        {/* ── STATS ───────────────────────────────────────────── */}
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

        {/* ── TABLE SECTION ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Purchase Records
              </h2>

              <p className="text-xs text-gray-400 mt-0.5">
                {filtered.length} record
                {filtered.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:shrink-0">
              {/* Category Filter */}
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10 sm:w-40 rounded-xl border-gray-200 text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>

                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Categories</SelectItem>

                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
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
                onClick={() => navigate("/purchases/new")}
                className="h-10 rounded-xl bg-black text-white hover:bg-black/90 text-sm gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Purchase
              </Button>
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  {[
                    "Purchase ID",
                    "Name",
                    "Category",
                    "Quantity",
                    "Unit Price",
                    "Total Price",
                    "Date",
                    "Actions",
                  ].map((head) => (
                    <th
                      key={head}
                      className="text-sm font-medium py-4 text-left text-black px-6 whitespace-nowrap"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-400 text-sm"
                    >
                      No purchases found
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="text-xs text-gray-600 font-mono px-6 py-4 whitespace-nowrap">
                        {item.id}
                      </td>

                      <td className="text-xs text-gray-800 font-medium px-6 py-4 whitespace-nowrap">
                        {item.name}
                      </td>

                      <td className="text-xs text-gray-600 px-6 py-4 whitespace-nowrap">
                        {item.category}
                      </td>

                      <td className="text-xs text-gray-800 px-6 py-4 whitespace-nowrap">
                        {item.quantity.toLocaleString()}
                      </td>

                      <td className="text-xs text-gray-800 px-6 py-4 whitespace-nowrap">
                        {fmtCurrency(item.unitPrice)}
                      </td>

                      <td className="text-xs text-gray-900 font-semibold px-6 py-4 whitespace-nowrap">
                        {fmtCurrency(item.totalPrice)}
                      </td>

                      <td className="text-xs text-gray-600 px-6 py-4 whitespace-nowrap">
                        {fmtDate(item.date)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
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
                              onClick={() => handleDelete(item.id)}
                              className="text-xs cursor-pointer text-red-500 focus:text-red-500"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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

                    <div className="flex gap-2">
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

          {/* Footer */}
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
    </div>
  );
}
