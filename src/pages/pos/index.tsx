import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useSearch } from "@/hooks/use-search";
import type { PosProduct } from "@/queries/pos-inventory";
import { getPosInventory } from "@/queries/pos-inventory";
import type { Category } from "@/types";
import { ShoppingCart, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PosCategoryFilter } from "./components/pos-category-filter";
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

  // ── Load inventory products ──────────────────────────────────────────────────

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

  // ── Cart / order ─────────────────────────────────────────────────────────────
  // inventoryId + inventoryLabel live in the hook (persisted to localStorage)

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
    subtotal,
    tax,
    total,
    submitting,
    handlePay,
  } = usePosOrder({
    // After a successful sale, re-fetch the inventory to get fresh stock quantities
    onSaleSuccess: () => loadInventory(inventoryId),
  });

  // On mount (including refresh) restore the inventory if one was previously selected
  useEffect(() => {
    if (inventoryId) loadInventory(inventoryId);
  }, []); // intentionally runs once on mount only

  const cartQuantities = useMemo(
    () =>
      cart.reduce(
        (acc, i) => ({ ...acc, [i.id]: i.quantity }),
        {} as Record<string, number>,
      ),
    [cart],
  );

  const totalCartItems = cart.reduce((s, i) => s + i.quantity, 0);

  // ── Client-side filter + paginate ─────────────────────────────────────────────

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

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row">
      {/* ── Product list ── */}
      <div className="bg-white flex-1 rounded-xl min-w-0 overflow-y-auto p-4 space-y-3 pb-24 lg:pb-4">
        <PosCategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={handleCategorySelect}
          searchQuery={search}
          onSearchChange={handleSearch}
        />

        {!inventoryId ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
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
                Tap the cart button below to select an inventory
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
          <span className="text-sm font-semibold">Order</span>
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
            <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
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
