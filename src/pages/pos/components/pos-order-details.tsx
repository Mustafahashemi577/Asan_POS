import { Button } from "@/components/ui/button";
import { Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { PosCustomerCombobox } from "./pos-customer-combobox";
import { PosInventoryCombobox } from "./pos-inventory-combobox";
import type { PosCartItem } from "./use-pos-order";

interface PosOrderDetailsProps {
  inventoryId: string;
  inventoryLabel: string;
  onInventoryChange: (id: string, name: string) => void;
  customerId: string;
  customerLabel: string;
  onCustomerChange: (id: string, name: string) => void;
  cart: PosCartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  subtotal: number;
  tax: number;
  total: number;
  submitting: boolean;
  onPay: () => void;
}

export function PosOrderDetails({
  inventoryId,
  inventoryLabel,
  onInventoryChange,
  customerId,
  customerLabel,
  onCustomerChange,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  subtotal,
  tax,
  total,
  submitting,
  onPay,
}: PosOrderDetailsProps) {
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    /**
     * On desktop this fills the fixed-height panel (h-full, flex col).
     * On mobile it's inside a scrollable sheet so we just let it grow naturally.
     */
    <div className="flex flex-col h-full p-4 gap-3">
      {/* Header — desktop only (mobile has its own header in the sheet) */}
      <div className="hidden lg:flex items-center justify-between shrink-0">
        <h2 className="text-base font-semibold text-gray-900">Order Details</h2>
        {totalItems > 0 && (
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {totalItems} items
          </span>
        )}
      </div>

      {/* Inventory combobox */}
      <div className="shrink-0">
        <PosInventoryCombobox
          value={inventoryId}
          label={inventoryLabel}
          onChange={onInventoryChange}
        />
      </div>

      {/* Customer combobox */}
      <div className="shrink-0">
        <PosCustomerCombobox
          value={customerId}
          label={customerLabel}
          onChange={onCustomerChange}
        />
      </div>

      <div className="border-t border-gray-100 shrink-0" />

      {/* Cart items */}
      {/* Desktop: flex-1 + overflow-y-auto to fill remaining panel height */}
      {/* Mobile: no fixed height, just flows naturally inside the sheet scroller */}
      <div className="lg:flex-1 lg:overflow-y-auto lg:min-h-0 space-y-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ShoppingCart className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">No items yet</p>
            <p className="text-xs text-gray-300 mt-1">
              Tap a product to add it
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100/70 transition-colors"
            >
              {/* Image */}
              {item.image ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg shrink-0 bg-gray-200" />
              )}

              {/* Name + price */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.price} AFN × {item.quantity} ={" "}
                  <span className="font-semibold text-gray-700">
                    {(item.price * item.quantity).toFixed(0)} AFN
                  </span>
                </p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  <Minus className="w-3 h-3 text-gray-600" />
                </button>
                <span className="w-6 text-center text-sm font-semibold text-gray-800">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-green-50 hover:border-green-200 transition-colors"
                >
                  <Plus className="w-3 h-3 text-gray-600" />
                </button>
              </div>

              {/* Remove */}
              <button
                onClick={() => onRemoveItem(item.id)}
                className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Totals + Pay — always visible at the bottom */}
      {cart.length > 0 && (
        <div className="shrink-0 space-y-2 border-t border-gray-100 pt-3 mt-auto">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Subtotal</span>
            <span className="font-medium text-gray-700">
              {subtotal.toFixed(2)} AFN
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Tax (10%)</span>
            <span className="font-medium text-gray-700">
              {tax.toFixed(2)} AFN
            </span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">{total.toFixed(2)} AFN</span>
          </div>

          <Button
            onClick={onPay}
            disabled={submitting || !customerId}
            className="w-full h-12 bg-black text-white hover:bg-black/90 rounded-xl text-sm font-semibold mt-1 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Processing…" : `Pay ${total.toFixed(2)} AFN`}
          </Button>
        </div>
      )}
    </div>
  );
}
