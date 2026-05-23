import { usePagination } from "@/hooks/use-pagination";
import { useSearch } from "@/hooks/use-search";
import type { Product } from "@/pages/product/components/product-list";
import { getInventories, getInventory } from "@/queries/inventory";
import { getProductById } from "@/queries/products";
import type {
  Inventory,
  InventoryDetail,
  InventoryItem,
  InventoryProduct,
  PaginationMeta,
  StockStatus,
} from "@/types/inventory";
import { useEffect, useMemo, useRef, useState } from "react";

export type {
  Inventory,
  InventoryDetail,
  InventoryItem,
  InventoryProduct,
  StockStatus,
};

// ── Hook return type ──────────────────────────────────────────────────────────

export interface UseInventoryReturn {
  // list data
  inventories: Inventory[];
  paginationMeta: PaginationMeta;
  loading: boolean;
  error: string | null;
  // detail data
  selectedInventory: InventoryDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  stats: Array<{ label: string; value: string; date: string; sub: string }>;
  filtered: InventoryProduct[];
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
  // product detail dialog
  productDialogOpen: boolean;
  selectedProduct: InventoryProduct | null;
  productDetail: Product | null;
  productDetailLoading: boolean;
  openProductDialog: (product: InventoryProduct) => void;
  closeProductDialog: () => void;
  // item dialog
  itemDialogOpen: boolean;
  setItemDialogOpen: (open: boolean) => void;
  // detail-view filter state (client-side)
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
  // ── List state ────────────────────────────────────────────────────────────
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

  // ── Detail state ──────────────────────────────────────────────────────────
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(
    null,
  );
  const [selectedInventory, setSelectedInventory] =
    useState<InventoryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // ── Pagination (list view, server-side) ───────────────────────────────────
  const { page, setPage, resetToPage1, goToPage } = usePagination({
    initialPage: 1,
    initialItemsPerPage: ITEMS_PER_PAGE,
  });

  // ── List search (server-side, debounced) ──────────────────────────────────
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
  // ── Product detail dialog state ────────────────────────────────────────────
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProduct | null>(null);
  const [productDetail, setProductDetail] = useState<Product | null>(null);
  const [productDetailLoading, setProductDetailLoading] = useState(false);

  // ── Detail-view filter state ──────────────────────────────────────────────
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  // ── Fetch list ────────────────────────────────────────────────────────────
  const listSearchDebouncedRef = useRef(listSearchDebounced);
  useEffect(() => {
    listSearchDebouncedRef.current = listSearchDebounced;
  }, [listSearchDebounced]);

  const fetchInventories = (opts?: { page?: number }) => {
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
      })
      .catch(
        (err: {
          response?: { data?: { message?: string } };
          message?: string;
        }) => {
          setError(
            err?.response?.data?.message ??
              err.message ??
              "Failed to load inventories",
          );
        },
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventories({ page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, listSearchDebounced]);

  // ── Fetch detail ──────────────────────────────────────────────────────────
  const fetchInventoryDetail = (id: string) => {
    setDetailLoading(true);
    setDetailError(null);
    setSelectedInventory(null);

    getInventory(id)
      .then((detail) => {
        setSelectedInventory(detail);
      })
      .catch(
        (err: {
          response?: { data?: { message?: string } };
          message?: string;
        }) => {
          setDetailError(
            err?.response?.data?.message ??
              err.message ??
              "Failed to load inventory detail",
          );
        },
      )
      .finally(() => setDetailLoading(false));
  };

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

  // ── Product dialog helpers ────────────────────────────────────────────────
  const openProductDialog = (product: InventoryProduct) => {
    setSelectedProduct(product);
    setProductDialogOpen(true);
    setProductDetail(null);
    setProductDetailLoading(true);

    getProductById(product.id)
      .then((detail: Product | void) => {
        setProductDetail(detail?.id ? detail : null);
      })
      .catch((err: any) => {
        console.error("Failed to load product details:", err);
      })
      .finally(() => {
        setProductDetailLoading(false);
      });
  };

  const closeProductDialog = () => {
    setProductDialogOpen(false);
    setSelectedProduct(null);
    setProductDetail(null);
  };

  // ── Callbacks ─────────────────────────────────────────────────────────────
  const handleInventoryAdded = (_newId: string) => {
    closeInventoryDialog();
    fetchInventories();
  };

  const handleInventoryUpdated = (id: string) => {
    closeInventoryDialog();
    fetchInventories();
    fetchInventoryDetail(id);
  };

  const handleInventoryDeleted = () => {
    closeInventoryDialog();
    setPage(1);
    fetchInventories({ page: 1 });
    switchInventory(null);
  };

  const handleItemAdded = () => {
    setItemDialogOpen(false);
    if (selectedInventoryId !== null) {
      fetchInventoryDetail(selectedInventoryId);
    }
  };

  /** null → back to list; string → drill into inventory detail */
  const switchInventory = (id: string | null) => {
    setSelectedInventoryId(id);
    setStatus("all");
    setSearch("");
    setSelectedRow(null);

    if (id !== null) {
      fetchInventoryDetail(id);
    } else {
      setSelectedInventory(null);
      setDetailError(null);
    }
  };

  // ── Derived: stats (detail view) ──────────────────────────────────────────
  const stats = useMemo(() => {
    const products = selectedInventory?.products ?? [];
    const total = products.length;
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const totalQty = products.reduce((sum, p) => sum + p.quantity, 0);
    const outOfStock = products.filter((p) => p.quantity === 0).length;
    const lowStock = products.filter(
      (p) => p.quantity > 0 && p.quantity <= 10,
    ).length;

    return [
      {
        label: "Total Products",
        value: String(total),
        date: today,
        sub: `${totalQty} units in stock`,
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

  // ── Derived: filtered products (client-side, detail view only) ────────────
  const filtered = useMemo((): InventoryProduct[] => {
    const products = selectedInventory?.products ?? [];
    return products.filter((product) => {
      const matchesStatus =
        status === "all" ||
        (status === "In Stock" && product.quantity > 10) ||
        (status === "Low Stock" &&
          product.quantity > 0 &&
          product.quantity <= 10) ||
        (status === "Out of Stock" && product.quantity === 0);

      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.id.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [selectedInventory, status, search]);

  return {
    // list data
    inventories,
    paginationMeta,
    loading,
    error,
    // detail data
    selectedInventory,
    detailLoading,
    detailError,
    stats,
    filtered,
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
    // product detail dialog
    productDialogOpen,
    selectedProduct,
    productDetail,
    productDetailLoading,
    openProductDialog,
    closeProductDialog,
    // item dialog
    itemDialogOpen,
    setItemDialogOpen,
    // detail-view filter state
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
