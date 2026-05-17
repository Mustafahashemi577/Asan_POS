import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { MoreHorizontal, Plus, Search, XIcon } from "lucide-react";

import { usePurchases } from "@/hooks/use-purchases";
import {
  deletePurchase,
  getPurchase,
  updatePurchaseStatus,
} from "@/queries/purchase";
import type { PurchaseDetail, PurchaseStatus } from "@/types/purchases";

// ── Stats ─────────────────────────────────────────────────────────────────────

const PURCHASE_STATS = [
  {
    label: "Total Purchases",
    value: "134",
    pct: "4.1%",
    pctColor: "text-green-400",
    date: "Wednesday, 06 May 2026",
    sub: "8 this week",
  },
  {
    label: "Total Spent",
    value: "AFN 2.4M",
    pct: "1.8%",
    pctColor: "text-orange-400",
    date: "Wednesday, 06 May 2026",
    sub: "AFN 380K this month",
  },
  {
    label: "This Month",
    value: "23",
    pct: "",
    pctColor: "",
    date: "Wednesday, 06 May 2026",
    sub: "AFN 380,000",
  },
];

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

// Normalize to uppercase so comparisons always work regardless of what
// the backend serializes the enum as (e.g. "DRAFT" vs "DRAFT")
function normalizeStatus(status: string): PurchaseStatus {
  return status.toUpperCase() as PurchaseStatus;
}

const STATUS_STYLES: Record<PurchaseStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  DONE: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-500",
};

const STATUS_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "DRAFT", value: "DRAFT" },
  { label: "DONE", value: "DONE" },
  { label: "CANCELLED", value: "CANCELLED" },
];

// ── Purchase detail sheet ─────────────────────────────────────────────────────

interface PurchaseDetailSheetProps {
  id: string | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: PurchaseStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  actionLoading: boolean;
}

function PurchaseDetailSheet({
  id,
  open,
  onClose,
  onStatusChange,
  onDelete,
  actionLoading,
}: PurchaseDetailSheetProps) {
  const { data, isLoading } = useSWR<PurchaseDetail>(
    open && id ? `purchase-detail-${id}` : null,
    () => getPurchase(id!),
    { revalidateOnFocus: false },
  );

  // Always normalize status so comparisons work regardless of backend casing
  const status = data ? normalizeStatus(data.status) : null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader className="px-6 pt-2 pb-4 border-b border-gray-100">
          <SheetTitle className="text-base font-semibold">
            Purchase Detail
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {isLoading || !data ? (
            <p className="text-sm text-gray-400 text-center py-12">Loading…</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Purchase #</p>
                  <p className="font-mono text-gray-700 text-xs">
                    #{data.sequenceId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Status</p>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      STATUS_STYLES[status!] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Customer</p>
                  <p className="text-gray-800 font-medium">
                    {data.customer?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Inventory</p>
                  <p className="text-gray-800 font-medium">
                    {data.inventory?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Date</p>
                  <p className="text-gray-700">{fmtDate(data.customDate)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-3">
                  Items
                </p>
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2.5 font-medium text-gray-600">
                          Product
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium text-gray-600">
                          Qty
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium text-gray-600">
                          Unit Price
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium text-gray-600">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2.5 text-gray-800">
                            {item.product?.name}
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-600">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-600">
                            {fmtCurrency(item.unitPrice)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-medium text-gray-800">
                            {fmtCurrency(item.unitPrice * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                <span className="text-sm text-gray-500 font-medium">Total</span>
                <span className="text-base font-bold text-gray-900">
                  {fmtCurrency(data.totalPrice)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer — SheetFooter has mt-auto so it always sticks to the bottom */}
        <SheetFooter className="border-t border-gray-100 px-6 py-4 flex-row flex-wrap gap-2">
          {!data || isLoading || !status ? null : status === "DRAFT" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={actionLoading}
                className="rounded-xl bg-white border-green-400 hover:bg-green-100 text-green-700 hover:text-green-800 text-xs h-9 px-4"
                onClick={() => onStatusChange(data.id, "DONE")}
              >
                Mark as DONE
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={actionLoading}
                className="rounded-xl border-orange-400 text-orange-500 hover:bg-orange-50 hover:text-orange-600 text-xs h-9 px-4"
                onClick={() => onStatusChange(data.id, "CANCELLED")}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={actionLoading}
                className="rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 text-xs h-9 px-4 ml-auto"
                onClick={async () => {
                  await onDelete(data.id);
                  onClose();
                }}
              >
                Delete
              </Button>
            </>
          ) : status === "DONE" ? (
            <p className="text-xs text-gray-400 self-center">
              Purchase completed — items have been transferred to inventory.
            </p>
          ) : status === "CANCELLED" ? (
            <p className="text-xs text-gray-400 self-center">
              This purchase has been CANCELLED and cannot be modified.
            </p>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Purchase() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    purchases,
    total,
    totalPages,
    page,
    setPage,
    search,
    handleSearch,
    clearSearch,
    status,
    setStatus,
    isLoading,
    mutate,
  } = usePurchases();

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    setError(null);
    try {
      await deletePurchase(id);
      await mutate();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to delete purchase.",
      );
    } finally {
      setLoadingId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: PurchaseStatus) => {
    setLoadingId(id);
    setError(null);
    try {
      await updatePurchaseStatus(id, { status: newStatus });
      await mutate();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to update status to ${newStatus}.`,
      );
    } finally {
      setLoadingId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="overflow-y-auto">
      <div className="max-w-[1401px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
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

        {/* Stats */}
        <div className="bg-gradient-to-t from-bg-dark via-bg-dark to-bg-dark/90 w-full rounded-2xl p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-white text-xl sm:text-2xl font-semibold">
              Purchase Overview
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Track purchases for your inventory
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PURCHASE_STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 border border-white/10 rounded-xl p-4"
              >
                <p className="text-gray-300 text-xs mb-2">{stat.label}</p>
                <div className="flex items-end justify-between mb-3">
                  <p className="text-white text-lg sm:text-xl font-semibold leading-tight">
                    {stat.value}
                  </p>
                  {stat.pct && (
                    <span
                      className={`text-xs font-medium ${stat.pctColor} bg-white/10 px-1.5 py-0.5 rounded`}
                    >
                      {stat.pct}
                    </span>
                  )}
                </div>
                <hr className="border-white/10 mb-2" />
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[10px]">{stat.date}</span>
                  <span className="text-gray-400 text-xs">{stat.sub}</span>
                </div>
                <button className="text-gray-500 text-[10px] mt-1.5 hover:text-gray-300 transition block">
                  View all &rsaquo;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Purchase Records
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {purchases.length} record{purchases.length !== 1 ? "s" : ""}{" "}
                found
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
              {!searchOpen ? (
                <Button
                  variant="default"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-xl"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search size={15} className="text-white" />
                </Button>
              ) : (
                <div className="relative sm:w-56">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <Input
                    autoFocus
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search purchases..."
                    className="h-10 pl-9 pr-8 rounded-xl border-gray-200 text-sm bg-white"
                  />
                  <XIcon
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={() => {
                      clearSearch();
                      setSearchOpen(false);
                    }}
                  />
                </div>
              )}

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-10 rounded-xl border-gray-200 text-sm w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {STATUS_FILTER_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-sm"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={() => navigate("/purchases/new")}
                className="h-10 rounded-xl bg-black text-white hover:bg-black/90 text-sm gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Purchase
              </Button>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  {[
                    "Purchase #",
                    "Customer",
                    "Inventory",
                    "Total Price",
                    "Date",
                    "Status",
                    "Actions",
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
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-400 text-sm"
                    >
                      Loading purchases…
                    </td>
                  </tr>
                ) : purchases.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-400 text-sm"
                    >
                      {search
                        ? `No purchases matching "${search}"`
                        : "No purchases found"}
                    </td>
                  </tr>
                ) : (
                  purchases.map((item) => {
                    const itemStatus = normalizeStatus(item.status);
                    return (
                      <tr
                        key={item.id}
                        className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="text-xs text-gray-600 font-mono px-6 py-4 whitespace-nowrap">
                          #{item.sequenceId}
                        </td>
                        <td className="text-xs text-gray-800 font-medium px-6 py-4 whitespace-nowrap">
                          {item.customer?.name}
                        </td>
                        <td className="text-xs text-gray-600 px-6 py-4 whitespace-nowrap">
                          {item.inventory?.name}
                        </td>
                        <td className="text-xs text-gray-900 font-semibold px-6 py-4 whitespace-nowrap">
                          {fmtCurrency(item.totalPrice)}
                        </td>
                        <td className="text-xs text-gray-600 px-6 py-4 whitespace-nowrap">
                          {fmtDate(item.customDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              STATUS_STYLES[itemStatus] ??
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {itemStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={loadingId === item.id}
                                className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                              >
                                <MoreHorizontal
                                  size={16}
                                  className="text-gray-500"
                                />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="rounded-xl w-44"
                            >
                              <DropdownMenuItem
                                className="text-xs cursor-pointer"
                                onClick={() => setViewId(item.id)}
                              >
                                View
                              </DropdownMenuItem>

                              {itemStatus === "DRAFT" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-xs cursor-pointer text-green-600 focus:text-green-600"
                                    onClick={() =>
                                      handleStatusChange(item.id, "DONE")
                                    }
                                  >
                                    Mark as DONE
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-xs cursor-pointer text-orange-500 focus:text-orange-500"
                                    onClick={() =>
                                      handleStatusChange(item.id, "CANCELLED")
                                    }
                                  >
                                    Cancel Purchase
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-xs cursor-pointer text-red-500 focus:text-red-500"
                                    onClick={() => handleDelete(item.id)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-gray-100">
            {isLoading ? (
              <p className="px-5 py-12 text-center text-gray-400 text-sm">
                Loading purchases…
              </p>
            ) : purchases.length === 0 ? (
              <p className="px-5 py-12 text-center text-gray-400 text-sm">
                {search
                  ? `No purchases matching "${search}"`
                  : "No purchases found"}
              </p>
            ) : (
              purchases.map((item) => {
                const itemStatus = normalizeStatus(item.status);
                return (
                  <div key={item.id} className="px-4 py-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-mono text-gray-500">
                        #{item.sequenceId}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          STATUS_STYLES[itemStatus] ?? ""
                        }`}
                      >
                        {itemStatus}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-0.5">
                      {item.customer?.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                      {item.inventory?.name}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className="text-xs text-gray-400">
                          {fmtDate(item.customDate)}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {fmtCurrency(item.totalPrice)}
                        </p>
                      </div>
                      <div className="flex gap-3 items-center">
                        <button
                          onClick={() => setViewId(item.id)}
                          className="text-xs text-blue-500 hover:underline"
                        >
                          View
                        </button>
                        {itemStatus === "DRAFT" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusChange(item.id, "DONE")
                              }
                              className="text-xs text-green-600 hover:underline"
                            >
                              DONE
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination footer */}
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing {purchases.length} of {total} records
            </span>
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>
      </div>

      <PurchaseDetailSheet
        id={viewId}
        open={!!viewId}
        onClose={() => setViewId(null)}
        onStatusChange={async (id, newStatus) => {
          await handleStatusChange(id, newStatus);
        }}
        onDelete={handleDelete}
        actionLoading={!!loadingId}
      />
    </div>
  );
}
