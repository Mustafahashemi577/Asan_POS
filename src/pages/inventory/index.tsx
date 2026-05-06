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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Search } from "lucide-react";
import { useMemo, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  status: StockStatus;
  lastUpdated: string; // ISO yyyy-mm-dd
}

// ── Stats ─────────────────────────────────────────────────────────────────────

const inventoryStats = [
  {
    label: "Total Items",
    value: "248",
    pct: "3.2%",
    pctColor: "text-green-400",
    date: "Wednesday, 06 May 2026",
    sub: "12 added this week",
  },
  {
    label: "Low Stock Alerts",
    value: "17",
    pct: "2.1%",
    pctColor: "text-orange-400",
    date: "Wednesday, 06 May 2026",
    sub: "Needs restocking",
  },
  {
    label: "Out of Stock",
    value: "5",
    pct: "",
    pctColor: "",
    date: "Wednesday, 06 May 2026",
    sub: "Urgent action needed",
  },
];

// ── Mock data (replace with API call) ────────────────────────────────────────

const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: "INV-001",
    name: "Arabica Coffee Beans",
    category: "Beverages",
    quantity: 120,
    unit: "kg",
    price: 85000,
    status: "In Stock",
    lastUpdated: "2026-05-01",
  },
  {
    id: "INV-002",
    name: "Whole Milk",
    category: "Dairy",
    quantity: 8,
    unit: "litre",
    price: 18000,
    status: "Low Stock",
    lastUpdated: "2026-05-03",
  },
  {
    id: "INV-003",
    name: "Vanilla Syrup",
    category: "Flavoring",
    quantity: 0,
    unit: "bottle",
    price: 45000,
    status: "Out of Stock",
    lastUpdated: "2026-04-28",
  },
  {
    id: "INV-004",
    name: "Paper Cups (12oz)",
    category: "Packaging",
    quantity: 500,
    unit: "pcs",
    price: 1200,
    status: "In Stock",
    lastUpdated: "2026-05-05",
  },
  {
    id: "INV-005",
    name: "Chocolate Powder",
    category: "Beverages",
    quantity: 6,
    unit: "kg",
    price: 95000,
    status: "Low Stock",
    lastUpdated: "2026-05-04",
  },
  {
    id: "INV-006",
    name: "Oat Milk",
    category: "Dairy",
    quantity: 24,
    unit: "litre",
    price: 32000,
    status: "In Stock",
    lastUpdated: "2026-05-02",
  },
  {
    id: "INV-007",
    name: "Caramel Sauce",
    category: "Flavoring",
    quantity: 0,
    unit: "bottle",
    price: 38000,
    status: "Out of Stock",
    lastUpdated: "2026-04-25",
  },
  {
    id: "INV-008",
    name: "Plastic Straws",
    category: "Packaging",
    quantity: 1000,
    unit: "pcs",
    price: 500,
    status: "In Stock",
    lastUpdated: "2026-05-06",
  },
  {
    id: "INV-009",
    name: "Robusta Coffee Beans",
    category: "Beverages",
    quantity: 45,
    unit: "kg",
    price: 65000,
    status: "In Stock",
    lastUpdated: "2026-05-01",
  },
  {
    id: "INV-010",
    name: "Heavy Cream",
    category: "Dairy",
    quantity: 3,
    unit: "litre",
    price: 55000,
    status: "Low Stock",
    lastUpdated: "2026-05-03",
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

const STATUS_STYLES: Record<StockStatus, string> = {
  "In Stock": "bg-green-100 text-green-700",
  "Low Stock": "bg-orange-100 text-orange-600",
  "Out of Stock": "bg-red-100 text-red-500",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Inventory() {
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return MOCK_INVENTORY.filter((item) => {
      const matchesCategory =
        category === "all" ||
        item.category.toLowerCase() === category.toLowerCase();
      const matchesStatus =
        status === "all" || item.status.toLowerCase() === status.toLowerCase();
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [category, status, search]);

  const handleView = (item: InventoryItem) => {
    console.log("View:", item);
    // TODO: open view drawer/modal
  };

  const handleEdit = (item: InventoryItem) => {
    console.log("Edit:", item);
    // TODO: open edit form
  };

  const handleDelete = (item: InventoryItem) => {
    console.log("Delete:", item);
    // TODO: confirm and delete
  };

  return (
    <div className="min-h-screen bg-white rounded-b-xl overflow-y-auto">
      <div className="max-w-[1401px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        {/* ── STATS CARDS ─────────────────────────────────────────────── */}
        <div className="bg-gradient-to-t from-bg-dark via-bg-dark to-bg-dark/90 w-full rounded-2xl p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-white text-xl sm:text-2xl font-semibold">
              Inventory Overview
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Track stock levels and manage your inventory efficiently
            </p>
          </div>

          {/* 3-column stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {inventoryStats.map((stat) => (
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
          {/* Table header + filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Inventory Items
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:shrink-0">
              {/* Category filter */}
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10 sm:w-40 rounded-xl border-gray-200 text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Beverages">Beverages</SelectItem>
                  <SelectItem value="Dairy">Dairy</SelectItem>
                  <SelectItem value="Flavoring">Flavoring</SelectItem>
                  <SelectItem value="Packaging">Packaging</SelectItem>
                </SelectContent>
              </Select>

              {/* Status filter */}
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-10 sm:w-40 rounded-xl border-gray-200 text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
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
                  placeholder="Search inventory..."
                  className="h-10 pl-9 rounded-xl border-gray-200 text-sm bg-white"
                />
              </div>
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  {[
                    "Item ID",
                    "Name",
                    "Category",
                    "Quantity",
                    "Unit Price",
                    "Status",
                    "Last Updated",
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
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => (
                    <TableRow
                      key={item.id}
                      onClick={() =>
                        setSelectedRow(selectedRow === item.id ? null : item.id)
                      }
                      className={`cursor-pointer transition-colors ${
                        selectedRow === item.id
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
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
                        {item.quantity.toLocaleString()} {item.unit}
                      </TableCell>
                      <TableCell className="text-xs text-gray-800 whitespace-nowrap">
                        {item.price.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                        {fmtDate(item.lastUpdated)}
                      </TableCell>

                      {/* Actions dropdown — stop row-click propagation */}
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
                            <DropdownMenuItem
                              className="text-xs cursor-pointer"
                              onClick={() => handleView(item)}
                            >
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-xs cursor-pointer"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-xs cursor-pointer text-red-500 focus:text-red-500"
                              onClick={() => handleDelete(item)}
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
                No inventory items found
              </p>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    setSelectedRow(selectedRow === item.id ? null : item.id)
                  }
                  className={`px-4 py-4 cursor-pointer transition-colors ${
                    selectedRow === item.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-mono text-gray-500">
                      {item.id}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    {item.name}
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{item.category}</span>
                    <span>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      Rp. {item.price.toLocaleString("id-ID")}
                    </span>
                    {/* Mobile actions */}
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleView(item)}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
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
              Showing {filtered.length} of {MOCK_INVENTORY.length} items
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-xs rounded-xl h-8"
            >
              + Add Item
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
