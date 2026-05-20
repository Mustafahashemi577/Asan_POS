import TransactionTable, { TRANSACTIONS } from "@/components/transactiontable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TransactionDateInput from "@/pages/transaction/components/transactionDateInput";
import { Search, SearchIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";

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

export default function Report() {
  const [startDate, setStartDate] = useState("2024-03-27");
  const endDate = addOneMonth(startDate);
  const [exports, setExport] = useState("pdf");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const filtered = useMemo(
    () =>
      TRANSACTIONS.filter((t) => {
        const matchesSearch =
          !search ||
          t.customer.toLowerCase().includes(search.toLowerCase()) ||
          t.id.toLowerCase().includes(search.toLowerCase());
        const matchesDate = t.date >= startDate && t.date <= endDate;
        return matchesSearch && matchesDate;
      }),
    [search, startDate, endDate],
  );

  const dateRangeLabel = `${fmtDate(startDate)} - ${fmtDate(endDate)}`;

  return (
    <div className="max-h-screen overflow-y-auto">
      <div className=" p-2.5 lg:p-2.5 space-y-5">
        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Report Your Finance
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Be a good and honest employee for everyone's happiness
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:shrink-0">
            <div className="flex justify-between gap-2">
              {!searchOpen && (
                <Button className="" onClick={() => setSearchOpen(true)}>
                  <SearchIcon size={20} />
                </Button>
              )}
              {searchOpen && (
                <div className="relative sm:w-64">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Recent Transaction..."
                    className="h-9 pl-9 rounded-sm border-gray-200 text-sm bg-white"
                  />
                  <XIcon
                    size={15}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
            <div className="h-9 sm:w-74">
              <TransactionDateInput
                value={startDate}
                onChange={(val) => {
                  if (val) setStartDate(val);
                }}
                displayValue={dateRangeLabel}
              />
            </div>

            <Select value={exports} onValueChange={setExport}>
              <SelectTrigger className="h-9 sm:w-41 rounded-sm border-gray-200 text-sm">
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent className="rounded-sm">
                <SelectItem value="pdf">Export as PDF</SelectItem>
                <SelectItem value="docx">Export as DOCX</SelectItem>
                <SelectItem value="jpg">Export as JPG</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── TABLE — reused from TransactionTable, no Status or Action ── */}
        <TransactionTable
          rows={filtered}
          title="Sales Result Report"
          showStatus={false}
          showAction={false}
          showTotal
        />
      </div>
    </div>
  );
}
