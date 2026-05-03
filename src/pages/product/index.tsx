import { useEffect, useState } from "react";
import type { Product } from "./components/product-list";
import { AddEditProduct } from "./components/addEditProduct";
import { CategoryFilter } from "./components/CategoryFilter";
import { OrderDetails, type CartItemType } from "./components/order-details";
import { ProductList } from "./components/product-list";
import { getCategories } from "@/queries/category";
import { getProducts } from "@/queries/products";

export default function Product() {
  const [allProducts, setAllProducts] = useState<Product[]>([]); // ← async now
  const [quantities, setQuantities] = useState<Record<string, number>>({}); // ← string keys
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const products = allProducts.filter((p) => {
    const matchesCat =
      selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

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
    // ← was number
    setCart((prev) => prev.filter((i) => i.id !== itemId));
    setQuantities((prev) => ({ ...prev, [itemId]: 0 }));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <>
      <div className="bg-gray-200 h-[calc(100vh-57px)]">
        <div className="flex h-full bg-white rounded-b-xl overflow-hidden">
          <div className="flex-1 min-w-0 overflow-y-auto px-4 pt-4 pb-4 space-y-3">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
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
        <AddEditProduct
          open={addProductOpen}
          onOpenChange={setAddProductOpen}
          onSave={(data) => console.log("Saved product:", data)}
        />
      </div>
    </>
  );
}
