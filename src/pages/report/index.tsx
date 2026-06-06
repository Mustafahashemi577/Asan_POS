import { Loading } from "@/components/loading";
import type { Transaction } from "@/components/transactiontable";
import TransactionTable from "@/components/transactiontable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJournals } from "@/hooks/use-journal";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import TransactionDateInput from "./components/transactionDateInput";

function addOneMonth(dateStr: string): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toTransactionStatus(
  status: string | undefined,
): Transaction["status"] {
  switch ((status ?? "").toLowerCase()) {
    case "pending":
      return "Pending";
    case "posted":
    case "approved":
    case "done":
      return "Completed";
    case "rejected":
    case "cancelled":
      return "Declined";
    default:
      return "Completed";
  }
}

function extractCustomerName(accountName: string | undefined): string {
  if (!accountName) return "—";
  return (
    accountName
      .replace(/\s*-\s*Accounts\s*(Payable|Receivable)\s*$/i, "")
      .trim() || "—"
  );
}

export default function Report() {
  const j = useJournals();
  const [startDate, setStartDate] = useState("2024-03-27");
  const endDate = addOneMonth(startDate);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  // Map journal entries → Transaction rows
  const allRows = useMemo<Transaction[]>(() => {
    if (!j.journals?.length) return [];

    return j.journals.map((je) => {
      const dr = je.items.find((i) => i.debit != null);
      const amount = dr?.debit ?? 0;
      const accountName = dr?.account?.name;

      return {
        id: `${je.sequence.prefix}-${String(je.sequence.lastIndex).padStart(4, "0")}`,
        customer: extractCustomerName(accountName),
        date: je.createdAt
          ? new Date(je.createdAt).toISOString().split("T")[0]
          : "",
        typeService: accountName ?? "—",
        total: amount,
        status: toTransactionStatus(je.status),
      };
    });
  }, [j.journals]);

  const filtered = useMemo(
    () =>
      allRows.filter((t) => {
        const matchesStatus =
          status === "all" || t.status.toLowerCase() === status.toLowerCase();
        const matchesSearch =
          !search ||
          t.customer.toLowerCase().includes(search.toLowerCase()) ||
          t.id.toLowerCase().includes(search.toLowerCase());
        const matchesDate = t.date >= startDate && t.date <= endDate;
        return matchesStatus && matchesSearch && matchesDate;
      }),
    [allRows, status, search, startDate, endDate],
  );

  const dateRangeLabel = `${fmtDate(startDate)} - ${fmtDate(endDate)}`;

  if (j.loading) return <Loading message="Loading reports..." />;

  return (
    <div className="overflow-y-auto">
      <div className="p-6 space-y-5">
        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Be a good and honest employee for everyone's happiness
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:shrink-0">
            <div className="sm:w-64">
              <TransactionDateInput
                value={startDate}
                onChange={(val) => {
                  if (val) setStartDate(val);
                }}
                displayValue={dateRangeLabel}
              />
            </div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 sm:w-44 rounded-sm border-gray-200 text-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Declined">Declined</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative sm:w-64">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Recent Reports..."
                className="h-9 pl-9 rounded-sm border-gray-200 text-sm bg-white"
              />
            </div>
          </div>
        </div>

        {/* ── TABLE ───────────────────────────────────────────────────── */}
        {j.error ? (
          <div className="bg-white rounded-2xl border border-gray-150 px-5 py-12 text-center text-sm text-red-500">
            {j.error}
          </div>
        ) : (
          <TransactionTable
            rows={filtered}
            title="Sales Result Report"
            showStatus
          />
        )}
      </div>
    </div>
  );
}
