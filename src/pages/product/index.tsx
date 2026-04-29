import { useEffect, useState } from "react";

import { AddEditProduct } from "./components/addEditProduct";
import { CategoryFilter } from "./components/CategoryFilter";
import { OrderDetails, type CartItemType } from "./components/order-details";
import { ProductList } from "./components/product-list";

import { getCategories } from "@/queries/category";
import { getProducts } from "@/queries/products";

export default function Product() {
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [addProductOpen, setAddProductOpen] = useState(false);

  // ── Fetch categories ────────────────────────────────────────────────────
  useEffect(() => {
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  // ── Filter products client-side ─────────────────────────────────────────
  const allProducts = getProducts();
  const products = allProducts.filter((p) => {
    const matchesCat =
      selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // ── Cart handlers ────────────────────────────────────────────────────────
  const updateQuantity = (productId: number, delta: number) => {
    const next = Math.max(0, (quantities[productId] ?? 0) + delta);
    setQuantities((prev) => ({ ...prev, [productId]: next }));

    if (delta > 0) {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === productId);
        if (existing)
          return prev.map((i) =>
            i.id === productId ? { ...i, quantity: i.quantity + 1 } : i,
          );
        const product = allProducts.find((p) => p.id === productId);
        if (!product) return prev;
        return [...prev, { ...product, quantity: 1 }];
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

  const removeFromCart = (itemId: number) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
    setQuantities((prev) => ({ ...prev, [itemId]: 0 }));
  };

  // ── Totals ───────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    // Gray background on all 4 sides — matches the screenshot border
    <>
      <div className="bg-gray-200 h-[calc(100vh-57px)]">
        <div className="flex h-full bg-white rounded-b-xl overflow-hidden">
          {/* ── LEFT ───────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 overflow-y-auto px-4 pt-4 pb-4 space-y-3">
            {/* Search + category pills + Add Product — all one row */}
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAddProduct={() => setAddProductOpen(true)}
            />

            <ProductList
              products={products}
              quantities={quantities}
              onUpdateQuantity={updateQuantity}
            />
          </div>

          {/* ── RIGHT: order sidebar ─────────────────────────────────── */}
          <aside className="hidden lg:block w-[300px] xl:w-[340px] shrink-0 border-gray-200 bg-white overflow-y-auto">
            <OrderDetails
              cart={cart}
              onRemoveItem={removeFromCart}
              subtotal={subtotal}
              tax={tax}
              total={total}
            />
          </aside>
        </div>

        {/* Add / Edit product sheet — page-level so it overlays everything */}
        <AddEditProduct
          open={addProductOpen}
          onOpenChange={setAddProductOpen}
          onSave={(data) => console.log("Saved product:", data)}
        />
      </div>
    </>
  );
}
