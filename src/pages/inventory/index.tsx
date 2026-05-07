import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type {
  Inventory,
  InventoryItem,
  StockStatus,
} from "@/queries/inventory";
import { getInventories } from "@/queries/inventory";
import {
  ChevronDown,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AddInventoryForm from "./components/addinventoryform";

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
  // ── Remote state
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);

  // ── Selection & filter state
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(
    null,
  );
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  // ── Fetch inventories — called on mount and after a successful add
  const fetchInventories = (preserveSelection = false) => {
    setLoading(true);
    setError(null);

    getInventories()
      .then((data) => {
        setInventories(data);
        if (!preserveSelection && data.length > 0) {
          setSelectedInventoryId(data[0].id);
        }
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message ??
            err.message ??
            "Failed to load inventories",
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Called by AddInventoryForm after a successful POST
  const handleInventoryAdded = (newId: string) => {
    setDialogOpen(false);
    // Refetch then auto-select the newly created inventory
    setLoading(true);
    getInventories()
      .then((data) => {
        setInventories(data);
        setSelectedInventoryId(newId);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message ??
            err.message ??
            "Failed to load inventories",
        );
      })
      .finally(() => setLoading(false));
  };

  // ── Derived: currently selected inventory
  const selectedInventory = useMemo(
    () => inventories.find((inv) => inv.id === selectedInventoryId) ?? null,
    [inventories, selectedInventoryId],
  );

  // ── Derived: stats cards for selected inventory
  const stats = useMemo(() => {
    const items = selectedInventory?.items ?? [];
    const total = items.length;
    const lowStock = items.filter((i) => i.status === "Low Stock").length;
    const outOfStock = items.filter((i) => i.status === "Out of Stock").length;
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    return [
      {
        label: "Total Items",
        value: String(total),
        date: today,
        sub: `${total} item${total !== 1 ? "s" : ""} tracked`,
      },
      {
        label: "Low Stock Alerts",
        value: String(lowStock),
        date: today,
        sub: "Needs restocking",
      },
      {
        label: "Out of Stock",
        value: String(outOfStock),
        date: today,
        sub: "Urgent action needed",
      },
    ];
  }, [selectedInventory]);

  // ── Derived: filtered items for the table
  const filtered = useMemo(() => {
    const items = selectedInventory?.items ?? [];
    return items.filter((item) => {
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
  }, [selectedInventory, category, status, search]);

  // ── Derived: unique categories from the selected inventory
  const categories = useMemo(() => {
    const all = (selectedInventory?.items ?? []).map((i) => i.category);
    return [...new Set(all)].sort();
  }, [selectedInventory]);

  // ── Row action handlers
  const handleView = (item: InventoryItem) => console.log("View:", item);
  const handleEdit = (item: InventoryItem) => console.log("Edit:", item);
  const handleDelete = (item: InventoryItem) => console.log("Delete:", item);

  const switchInventory = (id: string) => {
    setSelectedInventoryId(id);
    setCategory("all");
    setStatus("all");
    setSearch("");
  };

  // ── The dialog is shared across all states so it's defined once here
  const addDialog = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add Inventory</DialogTitle>
        </DialogHeader>
        <AddInventoryForm onSuccess={handleInventoryAdded} />
      </DialogContent>
    </Dialog>
  );

  // ── Loading
  if (loading) {
    return (
      <>
        {addDialog}
        <div className="flex items-center justify-center h-64 text-gray-400 gap-2">
          <Loader2 className="animate-spin size-5" />
          <span className="text-sm">Loading inventories…</span>
        </div>
      </>
    );
  }

  // ── Error
  if (error) {
    return (
      <>
        {addDialog}
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </>
    );
  }

  // ── Empty — API returned nothing; only show the add button
  if (inventories.length === 0) {
    return (
      <>
        {addDialog}
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-sm text-gray-400">No inventories found.</p>
          <Button
            onClick={() => setDialogOpen(true)}
            size="sm"
            className="rounded-xl gap-1.5"
          >
            <Plus size={14} />
            Add Inventory
          </Button>
        </div>
      </>
    );
  }

  // ── Main render
  return (
    <>
      {addDialog}

      <div className="overflow-y-auto">
        <div className="max-w-[1401px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
          {/* ── STATS CARDS ─────────────────────────────────────────────── */}
          <div className="bg-gradient-to-t from-bg-dark via-bg-dark to-bg-dark/90 w-full rounded-2xl p-4 sm:p-6">
            {/* Header: title + inventory selector + add button */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
              <div>
                <h1 className="text-white text-xl sm:text-2xl font-semibold">
                  Inventory Overview
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                  Track stock levels and manage your inventory efficiently
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Inventory selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost-dark"
                      size="sm"
                      className="rounded-xl gap-1.5 text-xs border"
                    >
                      {selectedInventory?.name ?? "Select Inventory"}
                      <ChevronDown size={13} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl min-w-44"
                  >
                    {inventories.map((inv) => (
                      <DropdownMenuItem
                        key={inv.id}
                        className="text-xs cursor-pointer"
                        onClick={() => switchInventory(inv.id)}
                      >
                        {inv.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Add inventory — opens dialog */}
                <Button
                  onClick={() => setDialogOpen(true)}
                  size="sm"
                  className="rounded-xl gap-1.5 text-xs"
                >
                  <Plus size={13} />
                  Add Inventory
                </Button>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 border border-white/10 rounded-xl p-4"
                >
                  <p className="text-gray-300 text-xs mb-2">{stat.label}</p>
                  <div className="flex items-end justify-between mb-3">
                    <p className="text-white text-lg sm:text-xl font-semibold leading-tight">
                      {stat.value}
                    </p>
                  </div>
                  <hr className="border-white/10 mb-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-[10px]">
                      {stat.date}
                    </span>
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
                  {selectedInventory?.name} — Items
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:shrink-0">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-10 sm:w-40 rounded-xl border-gray-200 text-sm">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

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
                          setSelectedRow(
                            selectedRow === item.id ? null : item.id,
                          )
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
                                variant="destructive"
                                className="text-xs cursor-pointer"
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
                        {item.price.toLocaleString("id-ID")}
                      </span>
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
                Showing {filtered.length} of{" "}
                {selectedInventory?.items.length ?? 0} items
              </span>
              <Button
                variant="outline"
                size="sm"
                className="text-xs rounded-xl h-8 gap-1.5"
                onClick={() => setDialogOpen(true)}
              >
                <Plus size={13} />
                Add Item
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
