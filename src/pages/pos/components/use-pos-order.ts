import type { PosProduct } from "@/queries/pos-inventory";
import { createSale } from "@/queries/sale";
import { useState } from "react";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PosCartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePosOrder() {
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // ── Cart helpers ──

  const addToCart = (product: PosProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.primaryImage,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === productId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerId("");
  };

  // ── Totals ──

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  // ── Submit sale ──

  const handlePay = async () => {
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setSubmitting(true);
    try {
      await createSale({
        customerId,
        items: cart.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
      });
      toast.success("Sale created successfully");
      clearCart();
    } catch {
      toast.error("Failed to create sale. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    cart,
    customerId,
    setCustomerId,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    tax,
    total,
    submitting,
    handlePay,
  };
}
