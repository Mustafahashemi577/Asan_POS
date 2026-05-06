import TransactionTable, { TRANSACTIONS } from "@/components/transactiontable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function Transaction() {
  const [startDate, setStartDate] = useState("2024-03-27");
  const endDate = addOneMonth(startDate);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      TRANSACTIONS.filter((t) => {
        const matchesStatus =
          status === "all" || t.status.toLowerCase() === status.toLowerCase();
        const matchesSearch =
          !search ||
          t.customer.toLowerCase().includes(search.toLowerCase()) ||
          t.id.toLowerCase().includes(search.toLowerCase());
        const matchesDate = t.date >= startDate && t.date <= endDate;
        return matchesStatus && matchesSearch && matchesDate;
      }),
    [status, search, startDate, endDate],
  );

  const dateRangeLabel = `${fmtDate(startDate)} - ${fmtDate(endDate)}`;

  return (
    <div className="bg-white rounded-b-xl min-h-[calc(100vh-57px)]">
      <div className="p-5 lg:p-7 space-y-5">
        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Recent Transaction
            </h1>
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
              <SelectTrigger className="h-12 sm:w-44 rounded-xl border-gray-200 text-sm">
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
                placeholder="Search Recent Transaction..."
                className="h-12 pl-9 rounded-xl border-gray-200 text-sm bg-white"
              />
            </div>
          </div>
        </div>

        {/* ── TABLE — reused from TransactionTable ─────────────────────── */}
        <TransactionTable
          rows={filtered}
          title="Sales Result Report"
          showStatus
          showAction
          showTotal
        />
      </div>
    </div>
  );
}
