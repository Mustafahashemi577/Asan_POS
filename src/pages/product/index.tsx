import { getCategories } from "@/queries/category";
import { getProducts, type PaginationMeta } from "@/queries/products";
import { useCallback, useEffect, useState } from "react";
import { AddEditProduct } from "./components/addEditProduct";
import { CategoryFilter } from "./components/CategoryFilter";
import { OrderDetails, type CartItemType } from "./components/order-details";
import type { Product } from "./components/product-list";
import { ProductList } from "./components/product-list";

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const ITEMS_PER_PAGE = 12;

  // Single fetch function — handles all combinations of page, search, category
  const fetchProducts = useCallback(
    (page: number, search: string, categoryId: string) => {
      setLoading(true);

      const categoryName =
        categoryId !== "all"
          ? categories.find((c) => c.id === categoryId)?.name
          : undefined;

      getProducts({
        page,
        itemsPerPage: ITEMS_PER_PAGE,
        search: search || undefined,
        categoryName,
      })
        .then(({ data, meta }) => {
          setProducts(data);
          setMeta(meta);
        })
        .catch(() => {
          setProducts([]);
          setMeta(null);
        })
        .finally(() => setLoading(false));
    },
    [categories],
  );

  // Fetch categories on mount
  useEffect(() => {
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  // Fetch products whenever page, search, or category changes
  // (also re-runs when categories load since fetchProducts depends on it)
  useEffect(() => {
    fetchProducts(currentPage, searchQuery, selectedCategory);
  }, [currentPage, searchQuery, selectedCategory, fetchProducts]);

  // Category change — reset to page 1
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  // Search change — reset to page 1
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const next = Math.max(0, (quantities[productId] ?? 0) + delta);
    setQuantities((prev) => ({ ...prev, [productId]: next }));

    if (delta > 0) {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === productId);
        if (existing)
          return prev.map((i) =>
            i.id === productId ? { ...i, quantity: i.quantity + 1 } : i,
          );
        const product = products.find((p) => p.id === productId);
        if (!product) return prev;
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
          },
        ];
      });
    } else {
      setCart((prev) =>
        prev
          .map((i) =>
            i.id === productId ? { ...i, quantity: i.quantity - 1 } : i,
          )
          .filter((i) => i.quantity > 0),
      );
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
    setQuantities((prev) => ({ ...prev, [itemId]: 0 }));
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setAddProductOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setAddProductOpen(open);
    if (!open) setSelectedProduct(null);
  };

  const handleSaveOrDelete = () => {
    fetchProducts(currentPage, searchQuery, selectedCategory);
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const totalPages = meta?.totalPages ?? 1;

  return (
    <>
      <div className="bg-gray-200 h-[calc(100vh-57px)] flex flex-col gap-2.5 lg:flex-row">
        {/* ── MOBILE: Order details card ── */}
        {cart.length > 0 && (
          <div className="lg:hidden bg-white rounded-xl max-h-[45vh] overflow-y-auto shrink-0">
            <OrderDetails
              cart={cart}
              onRemoveItem={removeFromCart}
              subtotal={subtotal}
              tax={tax}
              total={total}
            />
          </div>
        )}

        {/* ── Product list card ── */}
        <div className="flex-1 min-w-0 bg-white rounded-b-xl overflow-y-auto p-4 space-y-3">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={handleCategorySelect}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onAddProduct={() => setAddProductOpen(true)}
          />

          {loading ? (
            <p className="text-center text-gray-400 py-16 text-sm">
              Loading products…
            </p>
          ) : (
            <ProductList
              products={products}
              quantities={quantities}
              onUpdateQuantity={updateQuantity}
              onEditProduct={handleEditProduct}
            />
          )}

          {/* ── Pagination bar ── */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-2 pb-1">
              {/* Prev button */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 rounded-lg border border-gray-200 text-sm text-gray-500 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ‹
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  // Always show first, last, current, and neighbors; collapse others to "..."
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1;

                  const showLeftDots = page === 2 && currentPage > 4;
                  const showRightDots =
                    page === totalPages - 1 && currentPage < totalPages - 3;

                  if (!showPage && !showLeftDots && !showRightDots) return null;
                  if (showLeftDots || showRightDots) {
                    return (
                      <span
                        key={`dots-${page}`}
                        className="h-8 w-8 flex items-center justify-center text-gray-400 text-sm"
                      >
                        …
                      </span>
                    );
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={[
                        "h-8 w-8 rounded-lg border text-sm font-medium transition-colors",
                        currentPage === page
                          ? "bg-black text-white border-black"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      {page}
                    </button>
                  );
                },
              )}

              {/* Next button */}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="h-8 w-8 rounded-lg border border-gray-200 text-sm text-gray-500 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* ── Order details card (desktop only) ── */}
        <div className="hidden lg:block mt-2.5 w-[300px] xl:w-[340px] shrink-0 bg-white rounded-xl overflow-y-auto">
          <OrderDetails
            cart={cart}
            onRemoveItem={removeFromCart}
            subtotal={subtotal}
            tax={tax}
            total={total}
          />
        </div>

        <AddEditProduct
          open={addProductOpen}
          onOpenChange={handleSheetOpenChange}
          product={selectedProduct}
          onSave={handleSaveOrDelete}
          onDelete={handleSaveOrDelete}
        />
      </div>
    </>
  );
}
