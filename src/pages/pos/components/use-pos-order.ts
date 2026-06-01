import type { PosProduct } from "@/queries/pos-inventory";
import { completeStockOut, createSale, createStockOut } from "@/queries/sale";
import { useState } from "react";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PosCartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

// ── localStorage keys ─────────────────────────────────────────────────────────

const LS_INVENTORY_ID = "pos:inventoryId";
const LS_INVENTORY_LABEL = "pos:inventoryLabel";

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UsePosOrderOptions {
  /** Called after a successful pay so the page can re-fetch inventory products */
  onSaleSuccess?: () => void;
}

export function usePosOrder({ onSaleSuccess }: UsePosOrderOptions = {}) {
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // ── Inventory — initialised from localStorage so it survives refresh ──
  const [inventoryId, setInventoryIdState] = useState<string>(
    () => localStorage.getItem(LS_INVENTORY_ID) ?? "",
  );
  const [inventoryLabel, setInventoryLabelState] = useState<string>(
    () => localStorage.getItem(LS_INVENTORY_LABEL) ?? "",
  );

  // Keep localStorage in sync whenever the selection changes
  const setInventoryId = (id: string) => {
    setInventoryIdState(id);
    if (id) {
      localStorage.setItem(LS_INVENTORY_ID, id);
    } else {
      localStorage.removeItem(LS_INVENTORY_ID);
    }
  };

  const setInventoryLabel = (label: string) => {
    setInventoryLabelState(label);
    if (label) {
      localStorage.setItem(LS_INVENTORY_LABEL, label);
    } else {
      localStorage.removeItem(LS_INVENTORY_LABEL);
    }
  };

  // ── Cart helpers ──

  const addToCart = (product: PosProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          toast.warning(`Only ${product.quantity} in stock`);
          return prev;
        }
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      if (product.quantity === 0) {
        toast.warning("This product is out of stock");
        return prev;
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.primaryImage,
          quantity: 1,
          stock: product.quantity,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id !== productId) return i;
          const next = i.quantity + delta;
          if (next > i.stock) {
            toast.warning(`Only ${i.stock} in stock`);
            return i;
          }
          return { ...i, quantity: Math.max(0, next) };
        })
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

  // ── Pay: create sale → create stock-out → mark stock-out done ──

  const handlePay = async () => {
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (!inventoryId) {
      toast.error("Please select an inventory");
      return;
    }
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setSubmitting(true);
    try {
      // Step 1 — create sale
      const sale = await createSale({
        customerId,
        items: cart.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
      });

      // Build productId → saleItemId map
      const saleItemMap = new Map(
        sale.items.map((si) => [si.productId, si.id]),
      );

      // Step 2 — create stock-out
      const stockOut = await createStockOut({
        saleId: sale.id,
        inventoryId,
        items: cart.map((i) => ({
          saleItemId: saleItemMap.get(i.id)!,
          quantity: i.quantity,
        })),
      });

      // Step 3 — mark stock-out done (deducts from inventory)
      await completeStockOut(stockOut.id);

      toast.success("Sale completed and stock updated");
      clearCart();

      // Notify the page to re-fetch inventory so stock quantities are fresh
      onSaleSuccess?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to complete sale. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
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
    clearCart,
    subtotal,
    tax,
    total,
    submitting,
    handlePay,
  };
}
