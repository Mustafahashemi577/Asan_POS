import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Package, PackagePlus } from "lucide-react";

import InventoryCombobox from "@/pages/Purchases/components/inventory-combobox";
import { getPurchase } from "@/queries/purchase";
import { createStockIn } from "@/queries/stock-in";
import type {
  CreateStockInPayload,
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  return "AFN " + Number(n).toLocaleString("id-ID");
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StockInPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [rows, setRows] = useState<RowState[]>([]);
  const [inventoryId, setInventoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: purchase, isLoading } = useSWR(
    id ? `purchase-${id}` : null,
    () => getPurchase(id!),
    { revalidateOnFocus: false },
  );

  useEffect(() => {
    if (!purchase) return;
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
      purchaseId: id!,
      inventoryId,
      items,
      status: "Pending",
    };
    try {
      setSubmitting(true);
      await createStockIn(payload);
      navigate("/Purchases");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to create stock-in.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">
        Loading purchase...
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-red-400">
        Purchase not found.
      </div>
    );
  }

  const totalUnits = rows.reduce((sum, r) => sum + r.receivingNow, 0);
  const itemsReceiving = rows.filter((r) => r.receivingNow > 0).length;

  return (
    <div className="overflow-y-auto">
      <div className="max-w-[1401px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        {/* Stats header */}
        <div className="bg-gradient-to-t from-bg-dark via-bg-dark to-bg-dark/90 w-full rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost-dark"
              size="icon"
              className="rounded-xl text-white hover:bg-white/10 shrink-0"
              onClick={() => navigate("/Purchases")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-white text-xl sm:text-2xl font-semibold flex items-center gap-2">
                <PackagePlus className="w-5 h-5" />
                Stock In
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                Purchase #{purchase.sequenceId} &mdash;{" "}
                {purchase.customer?.name}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: "Purchase Total",
                value: fmtCurrency(purchase.totalPrice),
                sub: `${purchase.items.length} product${purchase.items.length !== 1 ? "s" : ""}`,
              },
              {
                label: "Items Receiving",
                value: String(itemsReceiving),
                sub: `of ${rows.length} items`,
              },
              {
                label: "Total Units",
                value: String(totalUnits),
                sub: "units to stock in",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 border border-white/10 rounded-xl p-4"
              >
                <p className="text-gray-300 text-xs mb-2">{stat.label}</p>
                <p className="text-white text-lg sm:text-xl font-semibold leading-tight mb-3">
                  {stat.value}
                </p>
                <hr className="border-white/10 mb-2" />
                <p className="text-gray-400 text-xs">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
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

        {/* Main card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Items to Receive
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Adjust quantities if receiving partially
              </p>
            </div>
            <div className="w-full sm:max-w-xs">
              <InventoryCombobox
                value={inventoryId}
                onChange={setInventoryId}
              />
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  {[
                    "Product",
                    "Ordered",
                    "Received",
                    "Remaining",
                    "Receiving Now",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-sm font-medium py-4 text-left text-black px-6 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const remaining = row.ordered - row.received;
                  return (
                    <tr
                      key={row.purchaseItemId}
                      className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="text-xs font-medium text-gray-800">
                            {row.productName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {row.ordered}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {row.received}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span
                          className={`font-medium ${
                            remaining === 0
                              ? "text-green-600"
                              : remaining < row.ordered
                                ? "text-orange-500"
                                : "text-gray-800"
                          }`}
                        >
                          {remaining}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="number"
                          min={0}
                          max={remaining}
                          disabled={remaining === 0}
                          value={row.receivingNow}
                          onChange={(e) =>
                            updateReceivingNow(index, e.target.valueAsNumber)
                          }
                          className="h-8 w-24 rounded-lg border-gray-200 text-xs text-center disabled:opacity-40"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-gray-100">
            {rows.map((row, index) => {
              const remaining = row.ordered - row.received;
              return (
                <div key={row.purchaseItemId} className="px-4 py-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400 shrink-0" />
                    <p className="text-sm font-medium text-gray-800">
                      {row.productName}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-400 mb-0.5">Ordered</p>
                      <p className="font-medium text-gray-700">{row.ordered}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Received</p>
                      <p className="font-medium text-gray-700">
                        {row.received}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Remaining</p>
                      <p
                        className={`font-medium ${
                          remaining === 0
                            ? "text-green-600"
                            : remaining < row.ordered
                              ? "text-orange-500"
                              : "text-gray-700"
                        }`}
                      >
                        {remaining}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Receiving Now</p>
                    <Input
                      type="number"
                      min={0}
                      max={remaining}
                      disabled={remaining === 0}
                      value={row.receivingNow}
                      onChange={(e) =>
                        updateReceivingNow(index, e.target.valueAsNumber)
                      }
                      className="h-9 w-full rounded-xl border-gray-200 text-sm text-center disabled:opacity-40"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer — summary + submit */}
          <div className="border-t border-gray-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500">
              <span>
                Items receiving:{" "}
                <span className="font-semibold text-gray-800">
                  {itemsReceiving}
                </span>
              </span>
              <span>
                Total units:{" "}
                <span className="font-semibold text-gray-800">
                  {totalUnits}
                </span>
              </span>
              <span>
                Purchase total:{" "}
                <span className="font-semibold text-gray-800">
                  {fmtCurrency(purchase.totalPrice)}
                </span>
              </span>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !inventoryId}
              className="h-10 px-8 rounded-xl bg-black text-white hover:bg-black/90 font-medium text-sm w-full sm:w-auto"
            >
              {submitting ? "Processing..." : "Confirm Stock In"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
