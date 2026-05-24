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

import { extractError } from "@/lib/error";
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

// ── Purchase detail card ──────────────────────────────────────────────────────

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

  const isStockInAllowed = status === "Done" || status === "Pending";

  // Global inventory selection
  const [inventoryId, setInventoryId] = useState("");
  // Per-item quantities  (itemId → qty, 0 = not being stocked in)
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset quantities when purchase changes
  useEffect(() => {
    const initial: Record<string, number> = {};
    purchase.items.forEach((item) => {
      initial[item.id] = 0;
    });
    setQuantities(initial);
  }, [purchase]);

  // ── Derived helpers ─────────────────────────────────────────────────────────

  const getPendingQtyForItem = (itemId: string): number =>
    (purchase.stockIns ?? [])
      .filter((s) => s.status === "Pending")
      .flatMap((s) => s.products ?? [])
      .filter((p) => p?.purchasedItemId === itemId)
      .reduce((sum, p) => sum + p.quantity, 0);

  const getRemaining = (item: PurchasedItemResponse): number =>
    Math.max(0, item.quantity - (item.received ?? 0));

  // A row is locked only when received >= ordered (confirmed done)
  const isRowLocked = (item: PurchasedItemResponse): boolean =>
    (item.received ?? 0) >= item.quantity;

  const itemsWithQty = purchase.items.filter(
    (i) => (quantities[i.id] ?? 0) > 0,
  );
  const canSubmit = itemsWithQty.length > 0 && !!inventoryId;

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleConfirmStockIn = async () => {
    setError(null);
    setSuccess(false);

    if (!inventoryId) {
      setError("Please select an inventory.");
      return;
    }
    if (itemsWithQty.length === 0) {
      setError("Set a quantity greater than 0 for at least one item.");
      return;
    }

    const payload: CreateStockInPayload = {
      purchaseId: purchase.id,
      inventoryId,
      items: itemsWithQty.map((i) => ({
        purchaseItemId: i.id,
        quantity: quantities[i.id],
      })),
    };

    try {
      setSubmitting(true);
      await createStockIn(payload);
      setSuccess(true);
      // Reset quantities to 0
      setQuantities((prev) =>
        Object.fromEntries(Object.keys(prev).map((k) => [k, 0])),
      );
      setInventoryId("");
      onStockInConfirmed();
    } catch (err: unknown) {
      setError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Dark header */}
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

      {/* Items section */}
      <div className="px-3 py-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Purchased Items
        </p>

        {/* Global inventory picker — shown only when stock-in is allowed */}
        {isStockInAllowed && (
          <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <PackagePlus className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <p className="text-[11px] text-gray-500 font-medium shrink-0">
              Assign to inventory
            </p>
            <div className="flex-1 max-w-xs">
              <InventoryCombobox
                value={inventoryId}
                onChange={setInventoryId}
              />
            </div>
          </div>
        )}

        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                {[
                  "Product",
                  "Unit Price",
                  "Qty",
                  "Line Total",
                  ...(isStockInAllowed ? ["Received", "Stock In Qty"] : []),
                ].map((h) => (
                  <th
                    key={h}
                    className={`py-2.5 px-4 font-medium text-gray-500 ${h === "Product" ? "text-left" : "text-center"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {purchase.items.map((item) => {
                const remaining = getRemaining(item);
                const locked = isRowLocked(item);
                const qty = quantities[item.id] ?? 0;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50/50 transition-colors ${locked ? "opacity-50" : ""}`}
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
                      <>
                        {/* Received progress */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-gray-600 font-medium">
                              {item.received ?? 0}/{item.quantity}
                            </span>
                            <div className="w-16 h-1 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gray-700 transition-all"
                                style={{
                                  width: `${Math.round(((item.received ?? 0) / item.quantity) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Qty input */}
                        <td className="px-4 py-3 text-center">
                          {locked ? (
                            <span className="inline-flex items-center text-[10px] font-medium text-green-600 bg-green-50 border border-green-100 rounded-full px-2 py-0.5">
                              Done
                            </span>
                          ) : (
                            <div className="flex flex-col items-center gap-0.5">
                              <Input
                                type="number"
                                min={0}
                                max={remaining}
                                value={qty}
                                onChange={(e) => {
                                  const val = Math.min(
                                    Math.max(0, e.target.valueAsNumber || 0),
                                    remaining,
                                  );
                                  setQuantities((prev) => ({
                                    ...prev,
                                    [item.id]: val,
                                  }));
                                }}
                                className="h-7 w-16 rounded-lg border-gray-200 text-xs text-center"
                              />
                              <span className="text-[9px] text-gray-400">
                                {remaining} left
                              </span>
                            </div>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 gap-3">
          <div>
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
            {success && (
              <div className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                Stock-in created successfully.
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {isStockInAllowed && (
              <Button
                onClick={handleConfirmStockIn}
                disabled={submitting || !canSubmit}
                size="sm"
                className="h-9 rounded-xl text-xs gap-1.5"
              >
                <PackagePlus className="w-3.5 h-3.5" />
                {submitting
                  ? "Processing…"
                  : `Create Stock In${itemsWithQty.length > 0 ? ` (${itemsWithQty.length} item${itemsWithQty.length > 1 ? "s" : ""})` : ""}`}
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

  // ── Load / refresh ──────────────────────────────────────────────────────────

  const loadPurchase = (silently = false) => {
    if (!id) return;
    if (!silently) setLoading(true);
    getPurchase(id)
      .then((data) => setPurchase(data))
      .catch((err: unknown) => setError(extractError(err)))
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
      setError(extractError(err));
    } finally {
      setCancelling(false);
    }
  };

  // ── Callbacks ───────────────────────────────────────────────────────────────

  const handlePaymentSuccess = () =>
    setPurchase((prev) => (prev ? { ...prev, status: "Done" } : prev));
  const handleStockInConfirmed = () => loadPurchase(true);

  const handleStockInDone = (_stockInId: string) => loadPurchase(true);

  const handleStockInCancelled = (_stockInId: string) => loadPurchase(true);

  // ── Loading / error states ──────────────────────────────────────────────────

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
          onClick={() => navigate("/Purchases")}
        >
          Back to Purchases
        </Button>
      </div>
    );
  }

  const status = purchase.status;
  const showSidebar = status === "Done" || status === "Pending";

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/Purchases")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Purchases
        </button>

        {status === "Draft" && (
          <div className="flex items-center gap-2">
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

            <PaymentDialog
              purchase={purchase}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        )}
      </div>

      {/* Error banner */}
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

      {/* Layout */}
      <div
        className={
          showSidebar ? "flex flex-col lg:flex-row gap-6 items-start" : ""
        }
      >
        <div className="w-full sm:flex-1">
          <PurchaseDetailCard
            purchase={purchase}
            onStockInConfirmed={handleStockInConfirmed}
          />
        </div>

        {showSidebar && (
          <div className="w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-6">
            <StockInSidebar
              purchase={purchase}
              onStockInDone={handleStockInDone}
              onStockInCancelled={handleStockInCancelled}
            />
          </div>
        )}
      </div>
    </div>
  );
}
