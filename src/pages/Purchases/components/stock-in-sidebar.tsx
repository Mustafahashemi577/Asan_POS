import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package } from "lucide-react";

import InventoryCombobox from "@/pages/Purchases/components/inventory-combobox";
import { createStockIn } from "@/queries/stock-in";
import type {
  CreateStockInPayload,
  PurchaseDetail,
  PurchasedItemResponse,
} from "@/types/purchases";

// ── Types ─────────────────────────────────────────────────────────────────────

interface RowState {
  purchaseItemId: string;
  productName: string;
  ordered: number;
  received: number;
  receivingNow: number;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface StockInSidebarProps {
  purchase: PurchaseDetail;
  onSuccess?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function StockInSidebar({ purchase, onSuccess }: StockInSidebarProps) {
  const [rows, setRows] = useState<RowState[]>([]);
  const [inventoryId, setInventoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Build rows from purchase items
  useEffect(() => {
    setRows(
      purchase.items.map(
        (item: PurchasedItemResponse & { received?: number }) => {
          const received = item.received ?? 0;
          const remaining = item.quantity - received;
          return {
            purchaseItemId: item.id,
            productName: item.product.name,
            ordered: item.quantity,
            received,
            receivingNow: remaining > 0 ? remaining : 0,
          };
        },
      ),
    );
  }, [purchase]);

  const updateReceivingNow = (index: number, value: number) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const remaining = row.ordered - row.received;
        return {
          ...row,
          receivingNow: Math.min(Math.max(0, value || 0), remaining),
        };
      }),
    );
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    if (!inventoryId) {
      setError("Please select an inventory.");
      return;
    }
    const items = rows
      .filter((r) => r.receivingNow > 0)
      .map((r) => ({
        purchaseItemId: r.purchaseItemId,
        quantity: r.receivingNow,
      }));
    if (items.length === 0) {
      setError("Enter a quantity for at least one item.");
      return;
    }

    const payload: CreateStockInPayload = {
      purchaseId: purchase.id,
      inventoryId,
      items,
    };

    try {
      setSubmitting(true);
      await createStockIn(payload);
      setSuccess(true);
      // Optimistically update received counts in rows
      setRows((prev) =>
        prev.map((row) => {
          const matched = items.find(
            (i) => i.purchaseItemId === row.purchaseItemId,
          );
          if (!matched) return row;
          const newReceived = row.received + matched.quantity;
          const newRemaining = row.ordered - newReceived;
          return {
            ...row,
            received: newReceived,
            receivingNow: newRemaining > 0 ? newRemaining : 0,
          };
        }),
      );
      setInventoryId("");
      onSuccess?.();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to create stock-in.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived stats ─────────────────────────────────────────────────────────

  const totalAssigned = rows.reduce((sum, r) => sum + r.received, 0);
  const totalOrdered = rows.reduce((sum, r) => sum + r.ordered, 0);
  const totalUnassigned = totalOrdered - totalAssigned;
  const allFulfilled = totalUnassigned === 0;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">Stock In</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Assign received items to an inventory
        </p>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-2 gap-2 px-4 pt-3 pb-2">
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-0.5">
            Unassigned
          </p>
          <p
            className={`text-lg font-bold leading-none ${
              totalUnassigned > 0 ? "text-orange-500" : "text-green-600"
            }`}
          >
            {totalUnassigned}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">units pending</p>
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-0.5">
            Assigned
          </p>
          <p className="text-lg font-bold leading-none text-gray-800">
            {totalAssigned}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            of {totalOrdered} units
          </p>
        </div>
      </div>

      {/* Fully fulfilled state */}
      {allFulfilled ? (
        <div className="flex flex-col items-center justify-center flex-1 px-4 py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
            <Package className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            All items assigned
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Every unit has been stocked in.
          </p>
        </div>
      ) : (
        <>
          {/* Inventory picker */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-[11px] text-gray-500 font-medium mb-1.5">
              Assign to inventory
            </p>
            <InventoryCombobox value={inventoryId} onChange={setInventoryId} />
          </div>

          {/* Item rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {rows.map((row, index) => {
              const remaining = row.ordered - row.received;
              const isFullyReceived = remaining === 0;

              return (
                <div
                  key={row.purchaseItemId}
                  className={`px-4 py-3 ${isFullyReceived ? "opacity-40" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Package className="w-3 h-3 text-gray-400 shrink-0" />
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {row.productName}
                      </p>
                    </div>
                    {isFullyReceived && (
                      <span className="shrink-0 text-[10px] font-medium text-green-600 bg-green-50 border border-green-100 rounded-full px-2 py-0.5">
                        Done
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mini progress bar */}
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gray-800 transition-all"
                          style={{
                            width: `${Math.round((row.received / row.ordered) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                        {row.received}/{row.ordered}
                      </span>
                    </div>

                    {/* Receiving now input */}
                    <Input
                      type="number"
                      min={0}
                      max={remaining}
                      disabled={isFullyReceived}
                      value={row.receivingNow}
                      onChange={(e) =>
                        updateReceivingNow(index, e.target.valueAsNumber)
                      }
                      className="h-7 w-16 rounded-lg border-gray-200 text-xs text-center disabled:opacity-40 shrink-0"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-4 mb-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          )}

          {/* Success banner */}
          {success && (
            <div className="mx-4 mb-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              Stock-in recorded successfully.
            </div>
          )}

          {/* Footer / submit */}
          <div className="px-4 py-3 border-t border-gray-100">
            <Button
              onClick={handleSubmit}
              disabled={submitting || !inventoryId}
              className="w-full h-9 rounded-xl bg-gray-900 text-white hover:bg-gray-700 text-xs font-medium"
            >
              {submitting ? "Processing…" : "Confirm Stock In"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
