import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { useJournals } from "@/hooks/use-journal";
import { BookOpen, Loader2, Search, XIcon } from "lucide-react";
import { JournalDetailDialog } from "./components/journaldetaildialog";

function statusBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-orange-700";
    case "posted":
    case "approved":
      return "bg-green-100 text-green-700";
    case "rejected":
    case "cancelled":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function Journals() {
  const j = useJournals();

  const from = j.totalItems === 0 ? 0 : (j.page - 1) * j.itemsPerPage + 1;
  const to = Math.min(j.page * j.itemsPerPage, j.totalItems);

  return (
    <div className="overflow-y-auto">
      <div className="max-w-[1401px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        {/* ── Stats banner ── */}
        <div className="bg-gradient-to-t from-bg-dark via-bg-dark to-bg-dark/90 w-full rounded-2xl p-4 sm:p-6">
          <div className="mb-5">
            <h1 className="text-white text-xl sm:text-2xl font-semibold">
              Journal Overview
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Track double-entry journals for your business
            </p>
          </div>

          {j.loading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Total entries */}
              <div className="bg-white/10 border border-white/10 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-2">Total Entries</p>
                <div className="flex items-end justify-between mb-3">
                  <p className="text-white text-xl font-semibold">
                    {j.stats.totalEntries}
                  </p>
                  <span className="text-xs font-medium text-orange-400 bg-white/10 px-1.5 py-0.5 rounded">
                    {j.stats.pendingEntries} pending
                  </span>
                </div>
                <hr className="border-white/10 mb-2" />
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[10px]">All time</span>
                  <span className="text-gray-400 text-xs">
                    {j.stats.thisMonthEntries} this month
                  </span>
                </div>
              </div>

              {/* Total amount */}
              <div className="bg-white/10 border border-white/10 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-2">Total Amount</p>
                <div className="flex items-end justify-between mb-3">
                  <p className="text-white text-xl font-semibold">
                    AFN {j.stats.totalAmount.toLocaleString()}
                  </p>
                </div>
                <hr className="border-white/10 mb-2" />
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[10px]">All time</span>
                  <span className="text-gray-400 text-xs">
                    across {j.stats.totalEntries} entries
                  </span>
                </div>
              </div>

              {/* This month */}
              <div className="bg-white/10 border border-white/10 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-2">This Month</p>
                <div className="flex items-end justify-between mb-3">
                  <p className="text-white text-xl font-semibold">
                    {j.stats.thisMonthEntries}
                  </p>
                </div>
                <hr className="border-white/10 mb-2" />
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[10px]">Entries</span>
                  <span className="text-gray-400 text-xs">
                    AFN {j.stats.thisMonthAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Table card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen size={15} className="text-gray-400" />
              Journal entries
              {j.totalItems > 0 && (
                <span className="text-xs font-normal text-gray-400">
                  ({j.totalItems})
                </span>
              )}
            </p>

            {/* Search */}
            <div className="flex items-center gap-2">
              {!j.searchOpen ? (
                <button
                  className="h-9 w-9 rounded-xl bg-gray-900 flex items-center justify-center hover:bg-gray-700 transition-colors"
                  onClick={() => j.setSearchOpen(true)}
                >
                  <Search size={14} className="text-white" />
                </button>
              ) : (
                <div className="relative sm:w-56">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <Input
                    autoFocus
                    value={j.search}
                    onChange={(e) => j.setSearch(e.target.value)}
                    placeholder="Search entries…"
                    className="h-9 pl-9 pr-8 rounded-xl border-gray-200 text-sm bg-white"
                  />
                  <XIcon
                    size={13}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={() => {
                      j.clearSearch();
                      j.setSearchOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          {j.loading ? (
            <div className="flex items-center justify-center min-h-[240px]">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : j.journals.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[240px] gap-3">
              <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                <BookOpen size={18} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                {j.search
                  ? "No entries match your search"
                  : "No journal entries yet"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      <th className="px-5 py-3 text-left">Ref</th>
                      <th className="px-5 py-3 text-left">Date</th>
                      <th className="px-5 py-3 text-left">Debit account</th>
                      <th className="px-5 py-3 text-left">Credit account</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                      <th className="px-5 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {j.journals.map((je) => {
                      const dr =
                        je.items.find((i) => i.debit != null) ?? je.items[0];
                      const cr =
                        je.items.find((i) => i.credit != null) ?? je.items[1];
                      const amount = dr?.debit ?? cr?.credit;
                      const ref = `${je.sequence.prefix}-${String(je.sequence.lastIndex).padStart(4, "0")}`;
                      return (
                        <tr
                          key={je.id}
                          onClick={() => j.openDetail(je)}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <td className="px-5 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">
                            {ref}
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                            {new Date(je.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "2-digit",
                              },
                            )}
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-800 max-w-[180px] truncate">
                            {dr?.account?.name ?? "—"}
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-800 max-w-[180px] truncate">
                            {cr?.account?.name ?? "—"}
                          </td>
                          <td className="px-5 py-3 text-xs font-medium text-right whitespace-nowrap text-red-600">
                            AFN {amount?.toLocaleString()}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusBadgeClass(je.status)}`}
                            >
                              {je.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gray-100">
                {j.journals.map((je) => {
                  const dr =
                    je.items.find((i) => i.debit != null) ?? je.items[0];
                  const cr =
                    je.items.find((i) => i.credit != null) ?? je.items[1];
                  const amount = dr?.debit ?? cr?.credit;
                  const ref = `${je.sequence.prefix}-${String(je.sequence.lastIndex).padStart(4, "0")}`;
                  return (
                    <div
                      key={je.id}
                      onClick={() => j.openDetail(je)}
                      className="px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            {ref}
                          </p>
                          <p className="text-sm font-semibold text-blue-600 mt-0.5">
                            AFN {amount?.toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusBadgeClass(je.status)}`}
                        >
                          {je.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        Dr: {dr?.account?.name ?? "—"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        Cr: {cr?.account?.name ?? "—"}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1.5">
                        {new Date(je.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {j.totalItems === 0
                ? "No results"
                : `Showing ${from}–${to} of ${j.totalItems} entr${j.totalItems !== 1 ? "ies" : "y"}`}
            </span>
            {j.totalPages > 1 && (
              <Pagination
                currentPage={j.page}
                totalPages={j.totalPages}
                onPageChange={j.goToPage}
              />
            )}
          </div>
        </div>
      </div>

      {/* Detail dialog */}
      <JournalDetailDialog
        open={j.detailOpen}
        onOpenChange={(open) => {
          if (!open) j.closeDetail();
        }}
        entry={j.selectedEntry}
        loading={j.detailLoading}
      />
    </div>
  );
}
