import type {
  Inventory,
  InventoryItem,
  StockStatus,
} from "@/queries/inventory";
import { getInventories } from "@/queries/inventory";
import { useEffect, useMemo, useState } from "react";

export type { Inventory, InventoryItem, StockStatus };

export function useInventory() {
  // ── Remote state
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Inventory dialog: unified for add + edit
  // inventoryDialogTarget = null     → add mode
  // inventoryDialogTarget = Inventory → edit mode
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [inventoryDialogTarget, setInventoryDialogTarget] =
    useState<Inventory | null>(null);

  // ── Item dialog state
  const [itemDialogOpen, setItemDialogOpen] = useState(false);

  // ── Selection & filter state
  // null = list view (no inventory selected), string = detail view
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(
    null,
  );
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  // ── Fetch
  const fetchInventories = (nextId?: string | null) => {
    setLoading(true);
    setError(null);
    getInventories()
      .then((data) => {
        setInventories(data);
        // nextId explicitly null → stay on list view
        if (nextId === null) {
          setSelectedInventoryId(null);
        } else if (nextId) {
          setSelectedInventoryId(nextId);
        }
        // no nextId arg → keep current selection (or null = list view on first load)
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
    fetchInventories(newId);
  };

  const handleInventoryUpdated = (id: string) => {
    closeInventoryDialog();
    fetchInventories(id);
  };

  const handleInventoryDeleted = () => {
    closeInventoryDialog();
    // Go back to list view after deletion
    fetchInventories(null);
  };

  const handleItemAdded = () => {
    setItemDialogOpen(false);
    fetchInventories(selectedInventoryId ?? undefined);
  };

  // null → go back to list view; string → drill into that inventory
  const switchInventory = (id: string | null) => {
    setSelectedInventoryId(id);
    setCategory("all");
    setStatus("all");
    setSearch("");
    setSelectedRow(null);
  };

  // ── Derived: selected inventory
  const selectedInventory = useMemo(
    () =>
      selectedInventoryId
        ? (inventories.find((inv) => inv.id === selectedInventoryId) ?? null)
        : null,
    [inventories, selectedInventoryId],
  );

  // ── Derived: stats
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

  // ── Derived: filtered items
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

  // ── Derived: unique categories
  const categories = useMemo(() => {
    const all = (selectedInventory?.items ?? []).map((i) => i.category);
    return [...new Set(all)].sort();
  }, [selectedInventory]);

  return {
    // data
    inventories,
    selectedInventory,
    stats,
    filtered,
    categories,
    loading,
    error,
    // inventory dialog (unified add / edit)
    inventoryDialogOpen,
    inventoryDialogTarget, // null = add mode, Inventory = edit mode
    openAddInventoryDialog,
    openEditInventoryDialog,
    closeInventoryDialog,
    // item dialog
    itemDialogOpen,
    setItemDialogOpen,
    // filter state
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
    // expose raw id so index.tsx can check list vs detail
    selectedInventoryId,
  };
}
