import { Navbar } from "@/components/navbar";
import { useProfile } from "@/hooks/useprofile";
import { getProducts } from '@/queries/products';
import { useState } from "react";
import { OrderDetails, type CartItemType } from "./components/order-details";
import { ProductList } from "./components/product-list";

export default function Product() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [cart, setCart] = useState<CartItemType[]>([
    {
      id: 1,
      name: "French Vanilla Fantasy",
      price: 15,
      quantity: 1,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-DGO1zNcfZDbIiAJWbB1sNmsvw6bqOJ.jpeg",
    },
    {
      id: 2,
      name: "French Vanilla Fantasy",
      price: 17,
      quantity: 1,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-DGO1zNcfZDbIiAJWbB1sNmsvw6bqOJ.jpeg",
    },
  ]);

  const updateQuantity = (productId: number, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + delta),
    }));
  };

  const removeFromCart = (itemId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const { profile } = useProfile();
  const products = getProducts();

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="m-2.5 bg-white relative">
        {/* Navbar */}
        {profile && (
          <Navbar
            profile={profile}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
          />
        )}
        <div className="m-2.5 bg-white grid grid-cols-8 gap-4">
          <div className="col-span-6">
            <ProductList
              products={products}
              quantities={quantities}
              onUpdateQuantity={updateQuantity}
            />
          </div>
          <div className="col-span-2 sticky right-0 top-22.5 self-start">
            <OrderDetails
              cart={cart}
              onRemoveItem={removeFromCart}
              subtotal={subtotal}
              tax={tax}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
