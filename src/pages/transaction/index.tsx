import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import TransactionDateInput from "./components/transactionDateInput";

// ── Types ─────────────────────────────────────────────────────────────────────

type Status = "Completed" | "Pending" | "Declined";

interface Transaction {
  id: string;
  customer: string;
  date: string; // ISO yyyy-mm-dd
  typeService: string;
  total: number;
  status: Status;
}

// ── Mock data (replace with API call) ────────────────────────────────────────

const MOCK: Transaction[] = [
  {
    id: "21239172AKS231",
    customer: "Deni Setiawan",
    date: "2024-04-27",
    typeService: "Delivery",
    total: 10,
    status: "Pending",
  },
  {
    id: "21239172AKS232",
    customer: "Nemaanestina",
    date: "2024-04-27",
    typeService: "Take Away",
    total: 22,
    status: "Completed",
  },
  {
    id: "21239172AKS233",
    customer: "Dina Septiani",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 22,
    status: "Completed",
  },
  {
    id: "21239172AKS234",
    customer: "Relastini",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 11,
    status: "Completed",
  },
  {
    id: "21239172AKS234",
    customer: "Vikinaki",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 224,
    status: "Declined",
  },
  {
    id: "21239172AKS234",
    customer: "Purwa Adi Wicaksana",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 20,
    status: "Completed",
  },
  {
    id: "21239172AKS234",
    customer: "Wade Warren",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 54,
    status: "Completed",
  },
  {
    id: "21239172AKS234",
    customer: "Esther Howard",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 54,
    status: "Completed",
  },
  {
    id: "21239172AKS234",
    customer: "Ronald Richards",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 98,
    status: "Completed",
  },
  {
    id: "21239172AKS234",
    customer: "Purwa Adi Wicaksana",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 90,
    status: "Completed",
  },
  {
    id: "21239172AKS234",
    customer: "Floyd",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 15,
    status: "Completed",
  },
  {
    id: "21239172AKS234",
    customer: "Bruce",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 123,
    status: "Completed",
  },
  {
    id: "21239172AKS234",
    customer: "Cameron",
    date: "2024-04-27",
    typeService: "Take Away",
    total: 111,
    status: "Completed",
  },
  {
    id: "21239172AKS234",
    customer: "Nathan",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 120,
    status: "Completed",
  },
  {
    id: "21239172AKS234",
    customer: "Jacob",
    date: "2024-04-27",
    typeService: "Delivery",
    total: 28,
    status: "Completed",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function addOneMonth(dateStr: string): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDateShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_STYLES: Record<Status, string> = {
  Completed: "bg-green-100 text-green-700",
  Pending: "bg-orange-100 text-orange-600",
  Declined: "bg-red-100 text-red-500",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Transaction() {
  // Date range: user picks start, end auto = start + 1 month
  const [startDate, setStartDate] = useState("2024-03-27");
  const endDate = addOneMonth(startDate);

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return MOCK.filter((t) => {
      const matchesStatus =
        status === "all" || t.status.toLowerCase() === status.toLowerCase();
      const matchesSearch =
        !search ||
        t.customer.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase());
      const matchesDate = t.date >= startDate && t.date <= endDate;
      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [status, search, startDate, endDate]);

  const totalPayment = filtered.reduce((s, t) => s + t.total, 0);

  const dateRangeLabel = `${fmtDate(startDate)} - ${fmtDate(endDate)}`;

  return (
    <div className="bg-bg-main min-h-[calc(100vh-57px)]">
      <div className="bg-white rounded-b-xl p-5 lg:p-7 space-y-5">
        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Recent Transaction
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Be a good and honest employee for everyone's happiness
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:shrink-0">
            {/* Date range picker — user picks start, end is auto start+1 month */}
            <div className="sm:w-64">
              <TransactionDateInput
                value={startDate}
                onChange={(val) => {
                  if (val) setStartDate(val);
                }}
                displayValue={dateRangeLabel}
              />
            </div>

            {/* Status filter */}
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

            {/* Search */}
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

        {/* ── TABLE ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Sales Result Report
            </h2>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  {[
                    "Transaction ID",
                    "Customer",
                    "Date",
                    "Type Services",
                    "Total Balance",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="text-sm font-medium py-4 text-left text-black bg-gray-100 first:rounded-l-md first:pl-6 last:rounded-r-md last:pr-6 whitespace-nowrap"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-400 text-sm"
                    >
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((t, i) => (
                    <TableRow
                      key={i}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="text-xs text-gray-600 font-mono pl-6 whitespace-nowrap">
                        {t.id}
                      </TableCell>
                      <TableCell className="text-xs text-gray-800 whitespace-nowrap">
                        {t.customer}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                        {fmtDateShort(t.date)}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                        {t.typeService}
                      </TableCell>
                      <TableCell className="text-xs text-gray-800 font-medium whitespace-nowrap">
                        Rp. {(t.total * 1000).toLocaleString("id-ID")},00
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[t.status]}`}
                        >
                          {t.status}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          className="text-xs text-blue-500 hover:underline"
                        >
                          View all
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* MOBILE CARDS */}
          <div className="sm:hidden divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <p className="px-5 py-12 text-center text-gray-400 text-sm">
                No transactions found
              </p>
            ) : (
              filtered.map((t, i) => (
                <div key={i} className="px-4 py-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-mono text-gray-500">
                      {t.id}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[t.status]}`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    {t.customer}
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{t.typeService}</span>
                    <span>
                      Rp. {(t.total * 1000).toLocaleString("id-ID")},00
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="text-xs text-blue-500 mt-2 hover:underline"
                  >
                    View Receipt
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Total Payment footer */}
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-600 font-medium">
              Total Payment
            </span>
            <span className="text-base font-bold text-gray-900">
              $
              {totalPayment.toLocaleString("id-ID", {
                minimumFractionDigits: 2,
              })}
              ,00
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
