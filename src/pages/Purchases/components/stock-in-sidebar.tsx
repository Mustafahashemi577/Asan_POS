import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Package } from "lucide-react";

import { updateStockIn } from "@/queries/stock-in";
import type { PurchaseDetail, StockInResponse } from "@/types/purchases";

// ── Props ─────────────────────────────────────────────────────────────────────

interface StockInSidebarProps {
  purchase: PurchaseDetail;
  onStockInDone?: (stockInId: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function StockInSidebar({
  purchase,
  onStockInDone,
}: StockInSidebarProps) {
  const [markingDone, setMarkingDone] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stockIns: StockInResponse[] = purchase.stockIns ?? [];
  const pendingStockIns = stockIns.filter((s) => s.status === "Pending");

  // ── Derived counts ────────────────────────────────────────────────────────

  const totalOrdered = purchase.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAssigned = purchase.items.reduce(
    (sum, i) => sum + (i.received ?? 0),
    0,
  );

  // Pending = sum of quantities across all pending stock-ins
  const totalPending = pendingStockIns.reduce(
    (sum, s) => sum + (s.products ?? []).reduce((s2, p) => s2 + p.quantity, 0),
    0,
  );

  const totalUnassigned = Math.max(
    0,
    totalOrdered - totalAssigned - totalPending,
  );

  // ── Mark Done ─────────────────────────────────────────────────────────────

  const handleMarkDone = async (stockIn: StockInResponse) => {
    setMarkingDone((prev) => ({ ...prev, [stockIn.stockInId]: true }));
    setErrors((prev) => ({ ...prev, [stockIn.stockInId]: "" }));
    try {
      await updateStockIn(stockIn.stockInId, { status: "Done" });
      onStockInDone?.(stockIn.stockInId);
    } catch (err: unknown) {
      setErrors((prev) => ({
        ...prev,
        [stockIn.stockInId]:
          err instanceof Error ? err.message : "Failed to mark as done.",
      }));
    } finally {
      setMarkingDone((prev) => ({ ...prev, [stockIn.stockInId]: false }));
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-radial from-bg-dark2 to-bg-dark2/90 px-4 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-white">Stock In Status</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Track assignment and fulfilment
        </p>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-3 gap-2 px-4 pt-3 pb-2">
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-0.5">
            Unassigned
          </p>
          <p
            className={`text-lg font-bold leading-none ${totalUnassigned > 0 ? "text-orange-500" : "text-green-600"}`}
          >
            {totalUnassigned}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">units</p>
        </div>

        <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-0.5">
            Pending
          </p>
          <p
            className={`text-lg font-bold leading-none ${totalPending > 0 ? "text-yellow-500" : "text-gray-400"}`}
          >
            {totalPending}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">units</p>
        </div>

        <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-0.5">
            Assigned
          </p>
          <p className="text-lg font-bold leading-none text-gray-800">
            {totalAssigned}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">of {totalOrdered}</p>
        </div>
      </div>

      {/* Pending stock-ins list */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50 px-1">
        {pendingStockIns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              No pending stock-ins
            </p>
            <p className="text-xs text-gray-400 mt-1">
              All recorded stock-ins have been completed.
            </p>
          </div>
        ) : (
          pendingStockIns.map((stockIn) => (
            <div key={stockIn.stockInId} className="px-3 py-3">
              {/* Stock-in header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-yellow-500 shrink-0" />
                  <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">
                    {stockIn.inventoryName}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-yellow-600 bg-yellow-50 border border-yellow-100 rounded-full px-2 py-0.5">
                  {stockIn.sequenceId}
                </span>
              </div>

              {/* Products */}
              <div className="space-y-1 mb-3">
                {(stockIn.products ?? []).map((product) => (
                  <div
                    key={product.purchasedItemId}
                    className="flex items-center justify-between text-[11px] text-gray-600"
                  >
                    <div className="flex items-center gap-1 min-w-0">
                      <Package className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                      <span className="truncate">{product.productName}</span>
                    </div>
                    <span className="font-semibold text-gray-800 shrink-0 ml-2">
                      ×{product.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Error */}
              {errors[stockIn.stockInId] && (
                <p className="text-[10px] text-red-500 mb-2">
                  {errors[stockIn.stockInId]}
                </p>
              )}

              {/* Mark Done */}
              <Button
                size="sm"
                variant="outline"
                disabled={markingDone[stockIn.stockInId]}
                onClick={() => handleMarkDone(stockIn)}
                className="w-full h-7 rounded-lg text-[11px] border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
              >
                {markingDone[stockIn.stockInId]
                  ? "Processing…"
                  : "Mark as Done"}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
