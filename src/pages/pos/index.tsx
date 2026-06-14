import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useSearch } from "@/hooks/use-search";
import { getCustomers } from "@/queries/customer";
import type { PosProduct } from "@/queries/pos-inventory";
import { getPosInventory } from "@/queries/pos-inventory";
import type { Category } from "@/types";
import { ShoppingCart, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PosCategoryFilter } from "./components/pos-category-filter";
import { PosInventoryCombobox } from "./components/pos-inventory-combobox";
import { PosOrderDetails } from "./components/pos-order-details";
import { PosProductList } from "./components/pos-product-list";
import { usePosOrder } from "./components/use-pos-order";

const ITEMS_PER_PAGE = 12;

export default function PosPage() {
  const [allProducts, setAllProducts] = useState<PosProduct[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [customerLabel, setCustomerLabel] = useState("");

  const { page, setPage, resetToPage1 } = usePagination();
  const { search, debouncedSearch, handleSearch } = useSearch({
    onSearch: resetToPage1,
  });

  // ── Cart / order — must come before loadInventory so inventoryId is available ──

  const {
    cart,
    customerId,
    setCustomerId,
    inventoryId,
    inventoryLabel,
    setInventoryId,
    setInventoryLabel,
    addToCart,
    updateQuantity,
    removeFromCart,
    setItemQuantity,
    subtotal,
    tax,
    total,
    submitting,
    handlePay,
  } = usePosOrder({
    // use a ref-based callback so it always sees the latest inventoryId
    onSaleSuccess: () => loadInventoryRef.current(inventoryIdRef.current),
  });

  // Refs so the onSaleSuccess closure never goes stale
  const inventoryIdRef = useRef(inventoryId);
  useEffect(() => {
    inventoryIdRef.current = inventoryId;
  }, [inventoryId]);

  // ── Load inventory products ───────────────────────────────────────────────────

  const loadInventory = useCallback((id: string) => {
    if (!id) {
      setAllProducts([]);
      setCategories([]);
      return;
    }
    setLoadingInventory(true);
    getPosInventory(id)
      .then((detail) => {
        setAllProducts(detail.products);
        const seen = new Set<string>();
        const cats: Category[] = [];
        detail.products.forEach((p) => {
          p.categories.forEach((c) => {
            if (!seen.has(c.id)) {
              seen.add(c.id);
              cats.push({ id: c.id, name: c.name });
            }
          });
        });
        setCategories(cats);
        setSelectedCategory("all");
        resetToPage1();
      })
      .catch(() => {
        setAllProducts([]);
        setCategories([]);
      })
      .finally(() => setLoadingInventory(false));
  }, []);

  // Keep loadInventory ref in sync so onSaleSuccess always calls the latest version
  const loadInventoryRef = useRef(loadInventory);
  useEffect(() => {
    loadInventoryRef.current = loadInventory;
  }, [loadInventory]);

  // ── On mount: restore inventory + pre-select walk-in customer ────────────────

  useEffect(() => {
    if (inventoryId) loadInventory(inventoryId);

    if (!customerId) {
      getCustomers({ page: 1, itemsPerPage: 10 })
        .then(({ data }) => {
          if (data.length > 0) {
            setCustomerId(data[0].id);
            setCustomerLabel(data[0].name);
          }
        })
        .catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Barcode scanner ───────────────────────────────────────────────────────────
  // Scanner behaves as a keyboard: types barcode chars then fires Enter.
  // We buffer keystrokes on window and flush on Enter.
  // If a real input/textarea/select is focused we ignore — prevents conflicts
  // with the search box, quantity inputs, and comboboxes.
  // Lookup: backend encodes sequence when available, falls back to product.id.

  const allProductsRef = useRef(allProducts);
  useEffect(() => {
    allProductsRef.current = allProducts;
  }, [allProducts]);

  const inventoryIdForScanRef = useRef(inventoryId);
  useEffect(() => {
    inventoryIdForScanRef.current = inventoryId;
  }, [inventoryId]);

  const addToCartRef = useRef(addToCart);
  useEffect(() => {
    addToCartRef.current = addToCart;
  }, [addToCart]);

  const scanBuffer = useRef("");
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If a real input element is focused, let it handle its own keystrokes
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "Enter") {
        const barcode = scanBuffer.current.trim();
        scanBuffer.current = "";
        if (scanTimer.current) clearTimeout(scanTimer.current);

        if (!barcode) return;

        if (!inventoryIdForScanRef.current) {
          toast.warning("Select an inventory before scanning");
          return;
        }

        // Backend encodes sequence when available, product.id otherwise
        const product = allProductsRef.current.find(
          (p) => (p.sequence ?? p.id) === barcode,
        );

        if (!product) {
          toast.warning(`Product not found: ${barcode}`);
          return;
        }

        addToCartRef.current(product);
        return;
      }

      // Only buffer printable single characters
      if (e.key.length === 1) {
        scanBuffer.current += e.key;

        // Safety reset: if nothing commits within 100ms, clear the buffer.
        // Real scanners fire all chars + Enter in one burst well under 100ms.
        if (scanTimer.current) clearTimeout(scanTimer.current);
        scanTimer.current = setTimeout(() => {
          scanBuffer.current = "";
        }, 100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (scanTimer.current) clearTimeout(scanTimer.current);
    };
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────────

  const cartQuantities = useMemo(
    () =>
      cart.reduce(
        (acc, i) => ({ ...acc, [i.id]: i.quantity }),
        {} as Record<string, number>,
      ),
    [cart],
  );

  const totalCartItems = cart.reduce((s, i) => s + i.quantity, 0);

  const filteredProducts = useMemo(() => {
    let result = allProducts;
    if (selectedCategory !== "all") {
      result = result.filter((p) =>
        p.categories.some((c) => c.id === selectedCategory),
      );
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    return result;
  }, [allProducts, selectedCategory, debouncedSearch]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );
  const pagedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleInventoryChange = (id: string, name: string) => {
    setInventoryId(id);
    setInventoryLabel(name);
    loadInventory(id);
  };

  const handleCustomerChange = (id: string, name: string) => {
    setCustomerId(id);
    setCustomerLabel(name);
  };

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
    resetToPage1();
  };

  const handlePayAndClose = async () => {
    await handlePay();
    setMobileSheetOpen(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row">
      {/* ── Product list ── */}
      <div className="bg-white flex-1 rounded-xl min-w-0 overflow-y-auto p-4 space-y-3 pb-24 lg:pb-4">
        {/* MOBILE: inventory picker always visible so user never needs to open sheet for it */}
        <div className="lg:hidden">
          <PosInventoryCombobox
            value={inventoryId}
            label={inventoryLabel}
            onChange={handleInventoryChange}
          />
        </div>

        <PosCategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={handleCategorySelect}
          searchQuery={search}
          onSearchChange={handleSearch}
        />

        {!inventoryId ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-gray-600">
              No inventory selected
            </p>
            <p className="text-sm text-gray-400 mt-1">
              <span className="lg:hidden">
                Select an inventory above to load products
              </span>
              <span className="hidden lg:inline">
                Choose an inventory on the right to load products
              </span>
            </p>
          </div>
        ) : loadingInventory ? (
          <p className="text-center text-gray-400 py-16 text-sm">
            Loading products…
          </p>
        ) : (
          <PosProductList
            products={pagedProducts}
            cartQuantities={cartQuantities}
            onAdd={addToCart}
          />
        )}

        {!loadingInventory && inventoryId && totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="pt-2 pb-1"
          />
        )}
      </div>

      {/* ── DESKTOP: Order details (right panel) ── */}
      <div className="bg-bg-main rounded-tl-xl hidden lg:block">
        <div className="lg:flex lg:flex-col sm:mt-2.5 ml-2.5 w-[380px] xl:w-[420px] shrink-0 bg-white rounded-xl h-[calc(100vh-90px)]">
          <PosOrderDetails
            inventoryId={inventoryId}
            inventoryLabel={inventoryLabel}
            onInventoryChange={handleInventoryChange}
            customerId={customerId}
            customerLabel={customerLabel}
            onCustomerChange={handleCustomerChange}
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onSetQuantity={setItemQuantity}
            onRemoveItem={removeFromCart}
            subtotal={subtotal}
            tax={tax}
            total={total}
            submitting={submitting}
            onPay={handlePay}
          />
        </div>
      </div>

      {/* ── MOBILE: Floating cart button ── */}
      <div className="lg:hidden fixed bottom-6 right-4 z-40">
        <button
          onClick={() => setMobileSheetOpen(true)}
          className="relative flex items-center gap-2.5 bg-black text-white pl-4 pr-5 py-3 rounded-2xl shadow-xl active:scale-95 transition-transform"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-sm font-semibold">
            {totalCartItems > 0 ? `Order (${totalCartItems})` : "Order"}
          </span>
          {totalCartItems > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-500 text-white text-[11px] font-bold flex items-center justify-center shadow">
              {totalCartItems}
            </span>
          )}
        </button>
      </div>

      {/* ── MOBILE: Bottom sheet ── */}
      {mobileSheetOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setMobileSheetOpen(false)}
          />
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[90dvh]">
            <div className="relative flex items-center justify-between px-5 pt-5 pb-3 shrink-0 border-b border-gray-100">
              <div className="w-10 h-1 rounded-full bg-gray-200 absolute left-1/2 -translate-x-1/2 top-2" />
              <h2 className="text-base font-semibold text-gray-900">
                Order Details
              </h2>
              <button
                onClick={() => setMobileSheetOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PosOrderDetails
                inventoryId={inventoryId}
                inventoryLabel={inventoryLabel}
                onInventoryChange={handleInventoryChange}
                customerId={customerId}
                customerLabel={customerLabel}
                onCustomerChange={handleCustomerChange}
                cart={cart}
                onUpdateQuantity={updateQuantity}
                onSetQuantity={setItemQuantity}
                onRemoveItem={removeFromCart}
                subtotal={subtotal}
                tax={tax}
                total={total}
                submitting={submitting}
                onPay={handlePayAndClose}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
