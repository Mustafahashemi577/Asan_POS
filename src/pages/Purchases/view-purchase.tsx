import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { ArrowLeft, Calendar, Hash, User } from "lucide-react";

import { getPurchase } from "@/queries/purchase";
import type { PurchaseDetail, PurchaseStatus } from "@/types/purchases";

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

function normalizeStatus(s: string): PurchaseStatus {
  return s.toUpperCase() as PurchaseStatus;
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
    dot: "bg-yellow-500",
  },
};

// ── Purchase detail card ──────────────────────────────────────────────────────

function PurchaseDetailCard({ purchase }: { purchase: PurchaseDetail }) {
  const status = normalizeStatus(purchase.status);
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.Draft;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Dark header strip */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-6 py-5 flex items-center justify-between">
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

      {/* Meta grid — 4 tiles separated by 1px gray lines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-100">
        {[
          {
            icon: <User className="w-3.5 h-3.5" />,
            label: "Customer",
            value: purchase.customer?.name ?? "—",
          },
          {
            icon: <Hash className="w-3.5 h-3.5" />,
            label: "Total",
            value: fmtCurrency(purchase.totalPrice),
          },
          {
            icon: <Calendar className="w-3.5 h-3.5" />,
            label: "Date",
            value: fmtDate(purchase.customDate),
          },
        ].map(({ icon, label, value }) => (
          <div key={label} className="bg-white px-5 py-4">
            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
              {icon}
              <p className="text-[13px] uppercase tracking-wide font-medium">
                {label}
              </p>
            </div>
            <p className="text-sm mt-2 pt-2 font-semibold text-gray-800 truncate">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Items table */}
      <div className="px-6 py-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Purchased Items
        </p>
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                {["Product", "Unit Price", "Qty", "Line Total"].map((h) => (
                  <th
                    key={h}
                    className={`py-2.5 px-4 font-medium text-gray-600 ${h === "Product" ? "text-left" : "text-right"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {purchase.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-800 font-medium">
                    {item.product?.name}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {fmtCurrency(item.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 font-semibold">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {fmtCurrency(item.unitPrice * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-3">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              Grand Total
            </p>
            <p className="text-base font-bold text-gray-900">
              {fmtCurrency(purchase.totalPrice)}
            </p>
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

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getPurchase(id)
      .then((data) => {
        if (!cancelled) setPurchase(data);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load purchase.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400 text-sm">
        Loading purchase…
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Top bar: back link + conditional delete */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/Purchases")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Purchases
        </button>
      </div>

      {/* Purchase details */}
      <PurchaseDetailCard purchase={purchase} />
    </div>
  );
}
