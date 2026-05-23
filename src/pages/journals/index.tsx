import { getJournalEntries } from "@/queries/journal";
import type { JournalEntry } from "@/types/journal";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Journals() {
  const JOURNAL_STATS = [
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
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [journalsLoading, setJournalsLoading] = useState(true);

  // 2. Fetch on mount
  useEffect(() => {
    getJournalEntries()
      .then(({ data }) => setJournals(data))
      .catch(() => setJournals([]))
      .finally(() => setJournalsLoading(false));
  }, []);

  return (
    <div className="max-w-[1401px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      {/* Stats */}
      <div className="bg-gradient-to-t from-bg-dark via-bg-dark to-bg-dark/90 w-full rounded-2xl p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-white text-xl sm:text-2xl font-semibold">
            Journal Overview
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Track journals for your business
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {JOURNAL_STATS.map((stat) => (
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
      {/* Journal entries table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">
            Journal entries
            {journals.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({journals.length})
              </span>
            )}
          </p>
        </div>

        {journalsLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                {journals.map((je) => {
                  const dr =
                    je.items.find((i) => i.debit != null) ?? je.items[0];
                  const cr =
                    je.items.find((i) => i.credit != null) ?? je.items[1];
                  const amount = dr?.debit ?? cr?.credit;
                  const ref = `${je.sequence.prefix}-${String(je.sequence.lastIndex).padStart(4, "0")}`;
                  return (
                    <tr
                      key={je.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">
                        {ref}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(je.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-800 max-w-[160px] truncate">
                        {dr?.account?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-800 max-w-[160px] truncate">
                        {cr?.account?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-xs font-medium text-right whitespace-nowrap text-red-600">
                        AFN {amount?.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-orange-700">
                          {je.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
