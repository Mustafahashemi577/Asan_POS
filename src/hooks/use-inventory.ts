import { usePagination } from "@/hooks/use-pagination";
import { useSearch } from "@/hooks/use-search";
import type {
    Inventory,
    InventoryItem,
    PaginationMeta,
    StockStatus,
} from "@/queries/inventory";
import { getInventories } from "@/queries/inventory";
import { useEffect, useMemo, useRef, useState } from "react";

export type { Inventory, InventoryItem, StockStatus };

// ── Hook return type ──────────────────────────────────────────────────────────

export interface UseInventoryReturn {
  // data
  inventories: Inventory[];
  paginationMeta: PaginationMeta;
  selectedInventory: Inventory | null;
  stats: Array<{ label: string; value: string; date: string; sub: string }>;
  filtered: InventoryItem[];
  categories: string[];
  loading: boolean;
  error: string | null;
  // pagination
  page: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  goToPage: (page: number) => void;
  // list search (server-side, debounced)
  listSearch: string;
  setListSearch: (value: string) => void;
  clearListSearch: () => void;
  listSearchOpen: boolean;
  setListSearchOpen: (open: boolean) => void;
  // inventory dialog (unified add / edit)
  inventoryDialogOpen: boolean;
  inventoryDialogTarget: Inventory | null;
  openAddInventoryDialog: () => void;
  openEditInventoryDialog: (inv: Inventory) => void;
  closeInventoryDialog: () => void;
  // item dialog
  itemDialogOpen: boolean;
  setItemDialogOpen: (open: boolean) => void;
  // detail-view filter state (client-side)
  category: string;
  setCategory: (category: string) => void;
  status: string;
  setStatus: (status: string) => void;
  search: string;
  setSearch: (value: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  selectedRow: string | null;
  setSelectedRow: (id: string | null) => void;
  // callbacks
  handleInventoryAdded: (newId: string) => void;
  handleInventoryUpdated: (id: string) => void;
  handleInventoryDeleted: () => void;
  handleItemAdded: () => void;
  switchInventory: (id: string | null) => void;
  // raw id so index.tsx can check list vs detail mode
  selectedInventoryId: string | null;
}

const ITEMS_PER_PAGE = 10;

export function useInventory(): UseInventoryReturn {
  // ── Remote state ──────────────────────────────────────────────────────────
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    currentPage: 1,
    itemsPerPage: ITEMS_PER_PAGE,
    totalItems: 0,
    totalPages: 1,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Pagination (list view, server-side) ───────────────────────────────────
  const { page, setPage, resetToPage1, goToPage } = usePagination({
    initialPage: 1,
    initialItemsPerPage: ITEMS_PER_PAGE,
  });

  // ── List search (server-side, debounced) ──────────────────────────────────
  // useSearch handles debounce internally; we pass resetToPage1 so that
  // typing always sends the user back to page 1 — no stale paginated results.
  const {
    search: listSearch,
    debouncedSearch: listSearchDebounced,
    handleSearch: setListSearch,
    clearSearch: clearListSearch,
  } = useSearch({ debounceMs: 400, onSearch: resetToPage1 });
  const [listSearchOpen, setListSearchOpen] = useState(false);

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [inventoryDialogTarget, setInventoryDialogTarget] =
    useState<Inventory | null>(null);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);

  // ── Selection & detail-view filter state ──────────────────────────────────
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(
    null,
  );
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  // This search is client-side (filters already-loaded items in the detail
  // view). No debounce needed — it never hits the network.
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  // Use a ref so fetchInventories can always read the latest debounced value
  // without being listed as a dependency (avoids stale-closure re-render loops
  // that cause the input to lose focus on every keystroke).
  const listSearchDebouncedRef = useRef(listSearchDebounced);
  useEffect(() => {
    listSearchDebouncedRef.current = listSearchDebounced;
  }, [listSearchDebounced]);

  const fetchInventories = (opts?: {
    page?: number;
    nextId?: string | null;
  }) => {
    setLoading(true);
    setError(null);

    const targetPage = opts?.page ?? page;

    getInventories({
      page: targetPage,
      itemsPerPage: ITEMS_PER_PAGE,
      search: listSearchDebouncedRef.current || undefined,
    })
      .then(({ data, meta }) => {
        setInventories(data);
        setPaginationMeta(meta);

        if (opts?.nextId === null) {
          setSelectedInventoryId(null);
        } else if (opts?.nextId !== undefined) {
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

  // Re-fetch whenever page or debounced search changes.
  // Because fetchInventories reads the debounced value via a ref, this effect
  // does NOT re-run on every raw keystroke — only after the 400 ms debounce
  // settles, which means the input never loses focus mid-typing.
  useEffect(() => {
    fetchInventories({ page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, listSearchDebounced]);

  // ── Dialog helpers ────────────────────────────────────────────────────────
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

  // ── Callbacks ─────────────────────────────────────────────────────────────
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
    setPage(1);
    fetchInventories({ page: 1, nextId: null });
  };

  const handleItemAdded = () => {
    setItemDialogOpen(false);
    fetchInventories();
  };

  // null → back to list; string → drill into inventory detail
  const switchInventory = (id: string | null) => {
    setSelectedInventoryId(id);
    setCategory("all");
    setStatus("all");
    setSearch("");
    setSelectedRow(null);
  };

  // ── Derived: selected inventory ───────────────────────────────────────────
  const selectedInventory = useMemo(
    () =>
      selectedInventoryId
        ? (inventories.find((inv) => inv.id === selectedInventoryId) ?? null)
        : null,
    [inventories, selectedInventoryId],
  );

  // ── Derived: stats (detail view) ──────────────────────────────────────────
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

  // ── Derived: filtered items (client-side, detail view only) ───────────────
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

  // ── Derived: unique categories (detail view) ──────────────────────────────
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
    itemsPerPage: ITEMS_PER_PAGE,
    totalPages: paginationMeta.totalPages,
    totalItems: paginationMeta.totalItems,
    goToPage,
    // list search
    listSearch,
    setListSearch,
    clearListSearch,
    listSearchOpen,
    setListSearchOpen,
    // inventory dialog
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
    // raw id
    selectedInventoryId,
  };
}
