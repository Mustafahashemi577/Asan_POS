import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ── Shared types ──────────────────────────────────────────────────────────────

export type TransactionStatus = "Completed" | "Pending" | "Declined";

export interface Transaction {
  id: string;
  customer: string;
  date: string; // ISO yyyy-mm-dd
  typeService: string;
  total: number;
  status: TransactionStatus;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TransactionTableProps {
  rows: Transaction[];
  title?: string;
  showStatus?: boolean;
}

// ── Status badge helper ───────────────────────────────────────────────────────

const STATUS_STYLES: Record<TransactionStatus, string> = {
  Completed: "bg-green-100 text-green-700",
  Pending: "bg-orange-100 text-orange-600",
  Declined: "bg-red-100 text-red-600",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function TransactionTable({
  rows,
  title = "Recent Transaction",
  showStatus = true,
}: TransactionTableProps) {
  const headers = [
    "Transaction ID",
    "Customer",
    "Date",
    "Type Services",
    "Total (AFN)",
    ...(showStatus ? ["Status"] : []),
  ];

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 rounded-md">
                {headers.map((h) => (
                  <TableHead
                    key={h}
                    className="text-sm font-medium py-4 text-left text-black bg-gray-100 first:rounded-tl-md first:pl-6 last:rounded-tr-md last:pr-6 whitespace-nowrap"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={headers.length}
                    className="px-6 py-12 text-center text-gray-400 text-sm"
                  >
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, i) => (
                  <TableRow
                    key={i}
                    className="hover:bg-gray-50 h-10 transition-colors"
                  >
                    <TableCell className="text-xs text-gray-600 font-mono pl-6 whitespace-nowrap">
                      {row.id}
                    </TableCell>
                    <TableCell className="text-xs text-gray-800 whitespace-nowrap">
                      {row.customer}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                      {row.date
                        ? new Date(row.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                      {row.typeService}
                    </TableCell>
                    <TableCell className="text-xs text-gray-800 font-medium whitespace-nowrap">
                      {row.total.toLocaleString("id-ID")}
                    </TableCell>
                    {showStatus && (
                      <TableCell className="whitespace-nowrap">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[row.status]}`}
                        >
                          {row.status}
                        </span>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* MOBILE CARDS */}
        <div className="sm:hidden divide-y divide-gray-100">
          {rows.length === 0 ? (
            <p className="px-5 py-12 text-center text-gray-400 text-sm">
              No transactions found
            </p>
          ) : (
            rows.map((row, i) => (
              <div key={i} className="px-4 py-4">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500 font-mono">
                    {row.id}
                  </span>
                  {showStatus && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[row.status]}`}
                    >
                      {row.status}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-800">
                  {row.customer}
                </p>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{row.typeService}</span>
                  <span>AFN {row.total.toLocaleString("id-ID")}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
