import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  CalendarDays,
  MoreHorizontal,
  Plus,
  Search,
  ShoppingCart,
  TrendingUp,
  XIcon,
} from "lucide-react";

import { NumberDisplay } from "@/components/number-display";
import { usePurchases } from "@/hooks/use-purchases";
import { extractError } from "@/lib/error";
import {
  deletePurchase,
  getPurchases,
  updatePurchaseStatus,
} from "@/queries/purchase";
import type { PurchaseListItem, PurchaseStatus } from "@/types/purchases";
import { formatNumber } from "@/utils/number-format";
import useSWR from "swr";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "Draft", value: "Draft" },
  { label: "Done", value: "Done" },
  { label: "Cancelled", value: "Cancelled" },
  { label: "Pending", value: "Pending" },
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

const PURCHASE_STATUS_STYLES: Record<PurchaseStatus, string> = {
  Draft: "bg-gray-100 text-gray-600",
  Done: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-500",
  Pending: "bg-yellow-100 text-yellow-700",
};

type StockInCompletion = "Complete" | "Incomplete" | "None";

const STOCK_IN_BADGE: Record<StockInCompletion, string> = {
  Complete: "bg-green-50 text-green-700 border border-green-200",
  Incomplete: "bg-orange-50 text-orange-600 border border-orange-200",
  None: "bg-gray-50 text-gray-400 border border-gray-200",
};

/**
 * Mirrors the sidebar's "Unassigned" count:
 *   unassigned = ordered - received - pending_stock_in_quantities
 * Complete   = unassigned === 0 for every item
 * Incomplete = at least one item still has unassigned units
 * None       = purchase has no items (edge case)
 */
function deriveStockInCompletion(
  purchase: PurchaseListItem,
): StockInCompletion {
  const items = purchase.items ?? [];
  if (items.length === 0) return "None";

  // Build a map of pending quantities per purchasedItem from pending stock-ins
  const pendingQtyById = new Map<string, number>();
  for (const stockIn of purchase.stockIns ?? []) {
    if (stockIn.status !== "Pending") continue;
    for (const p of stockIn.products ?? []) {
      pendingQtyById.set(
        p.purchasedItemId,
        (pendingQtyById.get(p.purchasedItemId) ?? 0) + p.quantity,
      );
    }
  }

  const allAssigned = items.every((i) => {
    const received = i.received ?? 0;
    const pending = pendingQtyById.get(i.id) ?? 0;
    return received + pending >= i.quantity;
  });

  return allAssigned ? "Complete" : "Incomplete";
}

// ── Stats derivation ──────────────────────────────────────────────────────────

interface PurchaseStats {
  totalCount: number;
  totalSpent: number;
  thisMonthCount: number;
  thisMonthSpent: number;
}

function deriveStats(purchases: PurchaseListItem[]): PurchaseStats {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  return purchases.reduce<PurchaseStats>(
    (acc, p) => {
      const date = new Date(p.customDate);
      const isThisMonth =
        date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      return {
        totalCount: acc.totalCount + 1,
        totalSpent: acc.totalSpent + p.totalPrice,
        thisMonthCount: acc.thisMonthCount + (isThisMonth ? 1 : 0),
        thisMonthSpent: acc.thisMonthSpent + (isThisMonth ? p.totalPrice : 0),
      };
    },
    { totalCount: 0, totalSpent: 0, thisMonthCount: 0, thisMonthSpent: 0 },
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  loading?: boolean;
}

function StatCard({ icon, label, value, sub, loading }: StatCardProps) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 text-gray-300 text-xs mb-3">
        {icon}
        <span>{label}</span>
      </div>
      {loading ? (
        <div className="h-7 w-24 rounded-md bg-white/10 animate-pulse mb-3" />
      ) : (
        <p className="text-white text-lg sm:text-xl font-semibold leading-tight mb-3">
          {value}
        </p>
      )}
      <hr className="border-white/10 mb-2" />
      <p className="text-gray-400 text-xs">{sub}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PurchasesPage() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Paginated list (for the table) ─────────────────────────────────────────
  const {
    purchases,
    totalItems,
    totalPages,
    itemsPerPage,
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

  // ── All purchases (unpaginated) for stats only ────────────────────────────
  const { data: allData, isLoading: statsLoading } = useSWR(
    "/purchase/all-for-stats",
    () => getPurchases({ itemsPerPage: 9999, page: 1 }),
    { revalidateOnFocus: false },
  );
  const stats = deriveStats(allData?.data ?? []);

  const from = totalItems === 0 ? 0 : (page - 1) * itemsPerPage + 1;
  const to = Math.min(page * itemsPerPage, totalItems);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    setError(null);
    try {
      await deletePurchase(id);
      await mutate();
    } catch (err: unknown) {
      setError(extractError(err));
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
      setError(extractError(err));
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

        {/* Stats header */}
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
            <StatCard
              icon={<ShoppingCart className="w-3.5 h-3.5" />}
              label="Total Purchases"
              value={stats.totalCount.toLocaleString()}
              sub={`AFN ${formatNumber(stats.totalSpent, 0)} total spent`}
              loading={statsLoading}
            />
            <StatCard
              icon={<CalendarDays className="w-3.5 h-3.5" />}
              label="This Month"
              value={stats.thisMonthCount.toLocaleString()}
              sub={`AFN ${formatNumber(stats.thisMonthSpent, 0)} spent this month`}
              loading={statsLoading}
            />
            <StatCard
              icon={<TrendingUp className="w-3.5 h-3.5" />}
              label="Average Order"
              value={
                stats.totalCount > 0
                  ? `AFN ${formatNumber(Math.round(stats.totalSpent / stats.totalCount), 0)}`
                  : "AFN 0"
              }
              sub={`across ${stats.totalCount} purchase${stats.totalCount !== 1 ? "s" : ""}`}
              loading={statsLoading}
            />
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
                {totalItems} record{totalItems !== 1 ? "s" : ""} found
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
                onClick={() => navigate("/Purchases/new")}
                className="h-10 rounded-xl bg-black text-white hover:bg-black/90 text-sm gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Purchase
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="divide-y divide-gray-100">
            {/* Desktop header */}
            <div className="hidden sm:grid grid-cols-7 justify-items-center bg-gray-50 py-3 px-4">
              {[
                "Purchase #",
                "Customer",
                "Total Price",
                "Date",
                "Status",
                "Stock In",
                "Actions",
              ].map((h) => (
                <span
                  key={h}
                  className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  {h}
                </span>
              ))}
            </div>

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
                const itemStatus = item.status;
                const stockInStatus = deriveStockInCompletion(item);

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/Purchases/${item.id}`)}
                    className="grid grid-cols-2 sm:grid-cols-7 sm:justify-items-center items-center text-center gap-x-1 py-4 px-4 sm:px-2 hover:bg-gray-50/80 transition-colors cursor-pointer"
                  >
                    {/* Purchase # */}
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-gray-500">
                        #{item.sequenceId}
                      </p>
                      {/* Customer stacked on mobile */}
                      <p className="text-sm font-medium text-gray-800 truncate sm:hidden">
                        {item.customer?.name}
                      </p>
                    </div>

                    {/* Customer — desktop */}
                    <p className="hidden sm:block text-xs font-medium text-gray-800 truncate max-w-[120px]">
                      {item.customer?.name}
                    </p>

                    {/* Total price — desktop */}
                    <p className="hidden sm:block text-xs font-semibold text-gray-900 whitespace-nowrap">
                      AFN <NumberDisplay value={item.totalPrice} decimals={0} />
                    </p>

                    {/* Date — desktop */}
                    <p className="hidden sm:block text-xs text-gray-600 whitespace-nowrap">
                      {fmtDate(item.customDate)}
                    </p>

                    {/* Purchase status — desktop */}
                    <div className="hidden sm:flex">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${PURCHASE_STATUS_STYLES[itemStatus] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {itemStatus}
                      </span>
                    </div>

                    {/* Stock-in status — desktop */}
                    <div className="hidden sm:flex">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${STOCK_IN_BADGE[stockInStatus]}`}
                      >
                        {stockInStatus}
                      </span>
                    </div>

                    {/* Actions + mobile meta */}
                    <div className="flex flex-col items-end gap-1.5">
                      {/* Mobile: status badges + price + date */}
                      <div className="flex items-center gap-2 sm:hidden">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${PURCHASE_STATUS_STYLES[itemStatus] ?? ""}`}
                        >
                          {itemStatus}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${STOCK_IN_BADGE[stockInStatus]}`}
                        >
                          {stockInStatus}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-900 sm:hidden">
                        AFN{" "}
                        <NumberDisplay value={item.totalPrice} decimals={0} />
                      </p>
                      <p className="text-[11px] text-gray-400 sm:hidden">
                        {fmtDate(item.customDate)}
                      </p>

                      {/* Actions dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={loadingId === item.id}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                            onClick={(e) => e.stopPropagation()}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/Purchases/${item.id}`);
                            }}
                          >
                            View
                          </DropdownMenuItem>
                          {itemStatus !== "Cancelled" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-xs cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/Purchases/${item.id}/stock-in`);
                                }}
                              >
                                Stock In
                              </DropdownMenuItem>
                              {itemStatus !== "Done" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-xs cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(item.id, "Cancelled");
                                    }}
                                  >
                                    Cancel Purchase
                                  </DropdownMenuItem>
                                </>
                              )}
                            </>
                          )}
                          {itemStatus === "Draft" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-xs cursor-pointer text-red-500 focus:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item.id);
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination footer */}
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {totalItems === 0
                ? "No records"
                : `Showing ${from}–${to} of ${totalItems} records`}
            </span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
