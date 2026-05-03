import { getCategories } from "@/queries/category";
import { getProducts, getProductsByCategory } from "@/queries/products";
import { useEffect, useState } from "react";
import { AddEditProduct } from "./components/addEditProduct";
import { CategoryFilter } from "./components/CategoryFilter";
import { OrderDetails, type CartItemType } from "./components/order-details";
import type { Product } from "./components/product-list";
import { ProductList } from "./components/product-list";

export default function Product() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch all products on mount
  useEffect(() => {
    getProducts()
      .then(setAllProducts)
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  // Called when a category pill is clicked
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery("");
    setLoading(true);

    if (categoryId === "all") {
      getProducts()
        .then(setAllProducts)
        .catch(() => setAllProducts([]))
        .finally(() => setLoading(false));
      return;
    }

    const categoryName = categories.find((c) => c.id === categoryId)?.name;
    if (!categoryName) {
      setLoading(false);
      return;
    }

    getProductsByCategory(categoryName)
      .then(setAllProducts)
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  };

  // Client-side search only — category filtering handled by API
  const products = allProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
        const product = allProducts.find((p) => p.id === productId);
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

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <>
      <div className="bg-gray-200 pb-2.5 px-2.5 h-[calc(100vh-57px)] flex flex-col gap-2.5 lg:flex-row">
                {/* ── MOBILE: Order details card — appears at top when cart has items ── */}
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
        
          {/* ── Product list card ────────────────────────────────────────────── */}

        <div className="flex-1 min-w-0 bg-white rounded-b-xl inv-rad-b-r-{8} overflow-y-auto p-4 space-y-3">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={handleCategorySelect}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
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
              />
            )}
          </div>
           {/* ── Order details card (desktop only) ───────────────────────────── */}
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
          onOpenChange={setAddProductOpen}
          onSave={() => {
            handleCategorySelect(selectedCategory);
          }}
        />
      </div>
    </>
  );
}
