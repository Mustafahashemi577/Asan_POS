import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ArrowLeft, Calendar, Hash, PackagePlus, User } from "lucide-react";

import InventoryCombobox from "@/pages/Purchases/components/inventory-combobox";
import { getPurchase, updatePurchaseStatus } from "@/queries/purchase";
import { createStockIn } from "@/queries/stock-in";
import type {
  CreateStockInPayload,
  PurchaseDetail,
  PurchasedItemResponse,
  PurchaseStatus,
} from "@/types/purchases";
import { PaymentDialog } from "./components/payment-dialog";
import { StockInSidebar } from "./components/stock-in-sidebar";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string | undefined | null): string {
  if (!iso) return "—";
  const normalized = iso.includes("T") ? iso : `${iso}T12:00:00Z`;
  return new Date(normalized).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtCurrency(n: number) {
  return "AFN " + Number(n).toLocaleString("id-ID");
}

const STATUS_STYLES: Record<PurchaseStatus, { badge: string; dot: string }> = {
  Draft: {
    badge: "bg-gray-100 text-gray-600 border border-gray-200",
    dot: "bg-gray-400",
  },
  Done: {
    badge: "bg-green-50 text-green-700 border border-green-200",
    dot: "bg-green-500",
  },
  Cancelled: {
    badge: "bg-red-50 text-red-500 border border-red-200",
    dot: "bg-red-400",
  },
  Pending: {
    badge: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    dot: "bg-yellow-400",
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface StockInRowState {
  inventoryId: string;
  quantity: number;
}

// ── Purchase detail card ─────────────────────────────────────────────────────

interface PurchaseDetailCardProps {
  purchase: PurchaseDetail;
  onStockInConfirmed: () => void;
}

function PurchaseDetailCard({
  purchase,
  onStockInConfirmed,
}: PurchaseDetailCardProps) {
  const status = purchase.status;
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.Draft;

  // Map of purchasedItem.id → stock-in row state (only present when row is active)
  const [activeRows, setActiveRows] = useState<Record<string, StockInRowState>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isStockInAllowed = status === "Done" || status === "Pending";

  // Remaining units for an item (not yet received and not in pending stock-ins)
  const getPendingQuantityForItem = (itemId: string): number => {
    const stockIns = purchase.stockIns ?? [];
    return stockIns
      .filter((s) => s.status === "Pending")
      .flatMap((s) => s.products ?? [])
      .filter((p) => p?.purchasedItemId === itemId)
      .reduce((sum, p) => sum + p.quantity, 0);
  };

  const getRemaining = (item: PurchasedItemResponse): number => {
    const received = item.received ?? 0;
    const pendingQty = getPendingQuantityForItem(item.id);
    return Math.max(0, item.quantity - received - pendingQty);
  };

  const toggleRow = (item: PurchasedItemResponse) => {
    const remaining = getRemaining(item);
    if (remaining === 0) return;
    setActiveRows((prev) => {
      if (prev[item.id]) {
        const next = { ...prev };
        delete next[item.id];
        return next;
      }
      return {
        ...prev,
        [item.id]: { inventoryId: "", quantity: remaining },
      };
    });
    setError(null);
    setSuccess(false);
  };

  const updateRow = (itemId: string, patch: Partial<StockInRowState>) => {
    setActiveRows((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], ...patch },
    }));
  };

  const activeCount = Object.keys(activeRows).length;

  const handleConfirmStockIn = async () => {
    setError(null);
    setSuccess(false);

    // Validate all active rows have an inventory
    for (const [itemId, row] of Object.entries(activeRows)) {
      if (!row.inventoryId) {
        const name =
          purchase.items.find((i) => i.id === itemId)?.product.name ?? itemId;
        setError(`Please select an inventory for "${name}".`);
        return;
      }
      if (row.quantity <= 0) {
        const name =
          purchase.items.find((i) => i.id === itemId)?.product.name ?? itemId;
        setError(`Quantity must be at least 1 for "${name}".`);
        return;
      }
    }

    // Group rows by inventoryId so we can batch items going to the same inventory
    const byInventory: Record<
      string,
      { purchaseItemId: string; quantity: number }[]
    > = {};
    for (const [itemId, row] of Object.entries(activeRows)) {
      if (!byInventory[row.inventoryId]) byInventory[row.inventoryId] = [];
      byInventory[row.inventoryId].push({
        purchaseItemId: itemId,
        quantity: row.quantity,
      });
    }

    try {
      setSubmitting(true);
      await Promise.all(
        Object.entries(byInventory).map(([inventoryId, items]) => {
          const payload: CreateStockInPayload = {
            purchaseId: purchase.id,
            inventoryId,
            items,
          };
          return createStockIn(payload);
        }),
      );
      setSuccess(true);
      setActiveRows({});
      onStockInConfirmed();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to create stock-in.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Dark header strip */}
      <div className="bg-radial from-bg-dark2 to-bg-dark2/90 px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-xs mb-0.5">Purchase</p>
          <p className="text-white font-mono text-lg font-semibold">
            #{purchase.sequenceId}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${style.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {status}
        </span>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-100">
        {[
          {
            icon: <User className="w-3.5 h-3.5" />,
            label: "Customer",
            value: purchase.customer?.name ?? "—",
          },
          {
            icon: <Calendar className="w-3.5 h-3.5" />,
            label: "Date",
            value: fmtDate(purchase.customDate),
          },
          {
            icon: <Hash className="w-3.5 h-3.5" />,
            label: "Total",
            value: fmtCurrency(purchase.totalPrice),
          },
        ].map(({ icon, label, value }) => (
          <div key={label} className="bg-white px-5 py-4">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              {icon}
              <p className="text-[10px] uppercase tracking-wide font-medium">
                {label}
              </p>
            </div>
            <p className="text-sm font-semibold text-gray-800 truncate">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Items table */}
      <div className="px-3 py-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Purchased Items
        </p>
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                {[
                  "Product",
                  "Unit Price",
                  "Qty",
                  "Line Total",
                  ...(isStockInAllowed ? ["Stock In"] : []),
                ].map((h) => (
                  <th
                    key={h}
                    className={`py-2.5 px-4 font-medium text-gray-500 ${
                      h === "Product" ? "text-left" : "text-center"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {purchase.items.map((item) => {
                const remaining = getRemaining(item);
                const isActive = !!activeRows[item.id];
                const row = activeRows[item.id];

                return (
                  <>
                    {/* Main item row */}
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50/50 ${isActive ? "bg-blue-50/30" : ""}`}
                    >
                      <td className="px-4 py-3 text-gray-800 font-medium">
                        {item.product?.name}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">
                        {fmtCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700 font-semibold">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-900">
                        {fmtCurrency(item.unitPrice * item.quantity)}
                      </td>
                      {isStockInAllowed && (
                        <td className="px-4 py-3 text-center">
                          <button
                            disabled={remaining === 0}
                            onClick={() => toggleRow(item)}
                            title={
                              remaining === 0
                                ? "All units assigned or pending"
                                : isActive
                                  ? "Cancel stock-in for this item"
                                  : `Stock in (${remaining} remaining)`
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors
                              ${
                                remaining === 0
                                  ? "border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed"
                                  : isActive
                                    ? "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                                    : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300"
                              }`}
                          >
                            <PackagePlus className="w-3 h-3" />
                            {remaining === 0
                              ? "Done"
                              : isActive
                                ? "Cancel"
                                : "Stock In"}
                          </button>
                        </td>
                      )}
                    </tr>

                    {/* Inline stock-in form row */}
                    {isActive && row && (
                      <tr
                        key={`${item.id}-stockin`}
                        className="bg-blue-50/20 border-t-0"
                      >
                        <td
                          colSpan={isStockInAllowed ? 5 : 4}
                          className="px-4 py-3"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="flex items-center gap-1.5 text-[11px] text-blue-600 font-medium shrink-0">
                              <PackagePlus className="w-3 h-3" />
                              Assign to inventory
                            </div>
                            <div className="flex flex-1 flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                              {/* Inventory picker */}
                              <div className="w-full sm:w-56">
                                <InventoryCombobox
                                  value={row.inventoryId}
                                  onChange={(val) =>
                                    updateRow(item.id, { inventoryId: val })
                                  }
                                />
                              </div>

                              {/* Quantity */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[11px] text-gray-500">
                                  Qty
                                </span>
                                <Input
                                  type="number"
                                  min={1}
                                  max={remaining}
                                  value={row.quantity}
                                  onChange={(e) =>
                                    updateRow(item.id, {
                                      quantity: Math.min(
                                        Math.max(
                                          1,
                                          e.target.valueAsNumber || 1,
                                        ),
                                        remaining,
                                      ),
                                    })
                                  }
                                  className="h-7 w-16 rounded-lg border-gray-200 text-xs text-center"
                                />
                                <span className="text-[10px] text-gray-400">
                                  / {remaining} remaining
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Grand total + Confirm Stock In */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 gap-3">
          <div>
            {/* Error */}
            {error && (
              <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-center gap-2">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            )}
            {/* Success */}
            {success && (
              <div className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                Stock-in recorded successfully.
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Confirm Stock In — only visible when at least one row is active */}
            {activeCount > 0 && (
              <Button
                onClick={handleConfirmStockIn}
                disabled={submitting}
                size="sm"
                className="h-9 rounded-xl text-xs gap-1.5"
              >
                <PackagePlus className="w-3.5 h-3.5" />
                {submitting
                  ? "Processing…"
                  : `Confirm Stock In (${activeCount} item${activeCount > 1 ? "s" : ""})`}
              </Button>
            )}

            <div className="text-right">
              <p className="text-[11px] text-gray-600 uppercase tracking-wide">
                Grand Total
              </p>
              <p className="text-base font-bold text-gray-900">
                {fmtCurrency(purchase.totalPrice)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ViewPurchase() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [purchase, setPurchase] = useState<PurchaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // ── Load / refresh purchase ─────────────────────────────────────────────────

  const loadPurchase = (silently = false) => {
    if (!id) return;
    if (!silently) setLoading(true);
    getPurchase(id)
      .then((data) => setPurchase(data))
      .catch((err: unknown) =>
        setError(
          err instanceof Error ? err.message : "Failed to load purchase.",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPurchase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Cancel purchase ─────────────────────────────────────────────────────────

  const handleCancel = async () => {
    if (!purchase) return;
    setCancelling(true);
    setError(null);
    try {
      await updatePurchaseStatus(purchase.id, { status: "Cancelled" });
      setPurchase((prev) => (prev ? { ...prev, status: "Cancelled" } : prev));
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel purchase.",
      );
    } finally {
      setCancelling(false);
    }
  };

  // ── Payment confirmed ───────────────────────────────────────────────────────

  const handlePaymentSuccess = () => {
    setPurchase((prev) => (prev ? { ...prev, status: "Done" } : prev));
  };

  // ── Stock-in confirmed (re-fetch to get fresh stockIns + received counts) ───

  const handleStockInConfirmed = () => loadPurchase(true);

  // ── Stock-in marked Done ────────────────────────────────────────────────────

  const handleStockInDone = (stockInId: string) => {
    setPurchase((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        stockIns: (prev.stockIns ?? []).map((s) =>
          s.stockInId === stockInId ? { ...s, status: "Done" as const } : s,
        ),
      };
    });
    // Also silently refresh to get updated received counts on items
    loadPurchase(true);
  };

  // ── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400 text-sm">
        Loading purchase…
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500 text-sm mb-4">
          {error ?? "Purchase not found."}
        </p>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => navigate("/purchases")}
        >
          Back to Purchases
        </Button>
      </div>
    );
  }

  const status = purchase.status;
  // Show sidebar whenever the purchase is past Draft (can have stock-ins)
  const showSidebar = status === "Done" || status === "Pending";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/purchases")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Purchases
        </button>

        {status === "Draft" && (
          <div className="flex items-center gap-2">
            {/* ── Cancel Purchase ── */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={cancelling}
                  className="h-9 rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 gap-1.5 text-xs"
                >
                  {cancelling ? "Cancelling…" : "Cancel Purchase"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this purchase?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Purchase{" "}
                    <span className="font-mono font-medium">
                      #{purchase.sequenceId}
                    </span>{" "}
                    will be permanently cancelled. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">
                    Go Back
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
                  >
                    Cancel Purchase
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* ── Confirm Purchase ── */}
            <PaymentDialog
              purchase={purchase}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        )}
      </div>

      {/* Post-load error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 ml-4 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Two-column layout when showSidebar, single column otherwise ── */}
      <div
        className={
          showSidebar ? "flex flex-col lg:flex-row gap-6 items-start" : ""
        }
      >
        {/* Main purchase card */}
        <div className="w-full sm:flex-1">
          <PurchaseDetailCard
            purchase={purchase}
            onStockInConfirmed={handleStockInConfirmed}
          />
        </div>

        {/* Stock-in sidebar */}
        {showSidebar && (
          <div className="w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-6">
            <StockInSidebar
              purchase={purchase}
              onStockInDone={handleStockInDone}
            />
          </div>
        )}
      </div>
    </div>
  );
}
