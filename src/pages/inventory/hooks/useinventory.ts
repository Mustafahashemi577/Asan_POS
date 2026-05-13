import type {
  Inventory,
  InventoryItem,
  PaginationMeta,
  StockStatus,
} from "@/queries/inventory";
import { getInventories } from "@/queries/inventory";
import { useEffect, useMemo, useState } from "react";

export type { Inventory, InventoryItem, StockStatus };

export function useInventory() {
  // ── Remote state
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Pagination state (list view)
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // ── List-level search (server-side, hits the paginated endpoint)
  const [listSearch, setListSearch] = useState("");
  // Debounced value actually sent to the API
  const [listSearchDebounced, setListSearchDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setListSearchDebounced(listSearch), 400);
    return () => clearTimeout(t);
  }, [listSearch]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [listSearchDebounced]);

  // ── Inventory dialog: unified for add + edit
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [inventoryDialogTarget, setInventoryDialogTarget] =
    useState<Inventory | null>(null);

  // ── Item dialog state
  const [itemDialogOpen, setItemDialogOpen] = useState(false);

  // ── Selection & filter state
  // null = list view, string = detail view
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(
    null,
  );
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  // ── Fetch (list view, paginated)
  const fetchInventories = (opts?: {
    page?: number;
    nextId?: string | null;
  }) => {
    setLoading(true);
    setError(null);

    const targetPage = opts?.page ?? page;

    getInventories({
      page: targetPage,
      limit,
      search: listSearchDebounced || undefined,
    })
      .then(({ data, meta }) => {
        setInventories(data);
        setPaginationMeta(meta);

        if (opts?.nextId === null) {
          // Explicit null → return to list view
          setSelectedInventoryId(null);
        } else if (opts?.nextId) {
          setSelectedInventoryId(opts.nextId);
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

  // Re-fetch whenever page or debounced search changes
  useEffect(() => {
    fetchInventories({ page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, listSearchDebounced]);

  // ── Dialog helpers
  const openAddInventoryDialog = () => {
    setInventoryDialogTarget(null);
    setInventoryDialogOpen(true);
  };

  const openEditInventoryDialog = (inv: Inventory) => {
    setInventoryDialogTarget(inv);
    setInventoryDialogOpen(true);
  };

  const closeInventoryDialog = () => {
    setInventoryDialogOpen(false);
    setInventoryDialogTarget(null);
  };

  // ── Callbacks
  const handleInventoryAdded = (newId: string) => {
    closeInventoryDialog();
    fetchInventories({ nextId: newId });
  };

  const handleInventoryUpdated = (id: string) => {
    closeInventoryDialog();
    fetchInventories({ nextId: id });
  };

  const handleInventoryDeleted = () => {
    closeInventoryDialog();
    // Return to list view, re-fetch page 1
    setPage(1);
    fetchInventories({ page: 1, nextId: null });
  };

  const handleItemAdded = () => {
    setItemDialogOpen(false);
    fetchInventories();
  };

  // null → back to list; string → drill into inventory
  const switchInventory = (id: string | null) => {
    setSelectedInventoryId(id);
    setCategory("all");
    setStatus("all");
    setSearch("");
    setSelectedRow(null);
  };

  // ── Pagination helpers
  const goToPage = (p: number) => {
    const clamped = Math.max(1, Math.min(p, paginationMeta.totalPages));
    setPage(clamped);
  };

  // ── Derived: selected inventory
  const selectedInventory = useMemo(
    () =>
      selectedInventoryId
        ? (inventories.find((inv) => inv.id === selectedInventoryId) ?? null)
        : null,
    [inventories, selectedInventoryId],
  );

  // ── Derived: stats (for detail view)
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

  // ── Derived: filtered items (client-side, detail view only)
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

  // ── Derived: unique categories (detail view)
  const categories = useMemo(() => {
    const all = (selectedInventory?.items ?? []).map((i) => i.category);
    return [...new Set(all)].sort();
  }, [selectedInventory]);

  return {
    // data
    inventories,
    paginationMeta,
    selectedInventory,
    stats,
    filtered,
    categories,
    loading,
    error,
    // pagination
    page,
    limit,
    goToPage,
    // list search (server-side)
    listSearch,
    setListSearch,
    // inventory dialog (unified add / edit)
    inventoryDialogOpen,
    inventoryDialogTarget,
    openAddInventoryDialog,
    openEditInventoryDialog,
    closeInventoryDialog,
    // item dialog
    itemDialogOpen,
    setItemDialogOpen,
    // detail-view filter state
    category,
    setCategory,
    status,
    setStatus,
    search,
    setSearch,
    searchOpen,
    setSearchOpen,
    selectedRow,
    setSelectedRow,
    // callbacks
    handleInventoryAdded,
    handleInventoryUpdated,
    handleInventoryDeleted,
    handleItemAdded,
    switchInventory,
    // raw id so index.tsx can check list vs detail mode
    selectedInventoryId,
  };
}
