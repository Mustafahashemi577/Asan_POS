// TODO: Replace mock data with real API call using SWR when transactions endpoint is ready
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

// ── Data ──────────────────────────────────────────────────────────────────────

export const TRANSACTIONS: Transaction[] = [
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
    id: "21239172AKS235",
    customer: "Vikinaki",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 224,
    status: "Declined",
  },
  {
    id: "21239172AKS236",
    customer: "Purwa Adi Wicaksana",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 20,
    status: "Completed",
  },
  {
    id: "21239172AKS237",
    customer: "Wade Warren",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 54,
    status: "Completed",
  },
  {
    id: "21239172AKS238",
    customer: "Esther Howard",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 54,
    status: "Completed",
  },
  {
    id: "21239172AKS239",
    customer: "Ronald Richards",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 98,
    status: "Completed",
  },
  {
    id: "21239172AKS240",
    customer: "Purwa Adi Wicaksana",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 90,
    status: "Completed",
  },
  {
    id: "21239172AKS241",
    customer: "Floyd",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 15,
    status: "Completed",
  },
  {
    id: "21239172AKS242",
    customer: "Bruce",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 123,
    status: "Completed",
  },
  {
    id: "21239172AKS243",
    customer: "Cameron",
    date: "2024-04-27",
    typeService: "Take Away",
    total: 111,
    status: "Completed",
  },
  {
    id: "21239172AKS244",
    customer: "Nathan",
    date: "2024-04-27",
    typeService: "Dine In",
    total: 120,
    status: "Completed",
  },
  {
    id: "21239172AKS245",
    customer: "Jacob",
    date: "2024-04-27",
    typeService: "Delivery",
    total: 28,
    status: "Completed",
  },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface TransactionTableProps {
  /** Filtered rows to display. Defaults to all TRANSACTIONS (used by dashboard). */
  rows?: Transaction[];
  /** Table section title. */
  title?: string;
  /** Show the Status column and badge. Default true. */
  showStatus?: boolean;
  /** Show the Action / View column. Default true. */
  showAction?: boolean;
  /** Show the Total Payment footer row. Default false. */
  showTotal?: boolean;
}

// ── Status badge helper ───────────────────────────────────────────────────────

const STATUS_STYLES: Record<TransactionStatus, string> = {
  Completed: "bg-green-100 text-green-700",
  Pending: "bg-orange-100 text-orange-600",
  Declined: "bg-red-100 text-red-600",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function TransactionTable({
  rows = TRANSACTIONS,
  title = "Recent Transaction",
  showStatus = true,
  showAction = true,
  showTotal = false,
}: TransactionTableProps) {
  const totalPayment = rows.reduce((s, t) => s + t.total, 0);

  // Build desktop column headers dynamically
  const headers = [
    "Transaction ID",
    "Customer",
    "Date",
    "Type Services",
    "Total Balance",
    ...(showStatus ? ["Status"] : []),
    ...(showAction ? ["Action"] : []),
  ];

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {showAction && (
            <button className="text-xs text-blue-500 hover:underline">
              View all
            </button>
          )}
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
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="text-xs text-gray-600 font-mono pl-6 whitespace-nowrap">
                      {row.id}
                    </TableCell>
                    <TableCell className="text-xs text-gray-800 whitespace-nowrap">
                      {row.customer}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                      {new Date(row.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                      {row.typeService}
                    </TableCell>
                    <TableCell className="text-xs text-gray-800 font-medium whitespace-nowrap">
                      AFN {(row.total * 1000).toLocaleString("id-ID")},00
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
                    {showAction && (
                      <TableCell className="pr-6 whitespace-nowrap">
                        <button className="text-xs text-blue-500 hover:underline">
                          View
                        </button>
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
              <div
                key={i}
                className="border border-gray-100 rounded-xl p-3 shadow-sm mx-4 my-3"
              >
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
                  <span>
                    AFN {(row.total * 1000).toLocaleString("id-ID")},00
                  </span>
                </div>
                {showAction && (
                  <button className="text-xs text-blue-500 mt-2 hover:underline">
                    View Receipt
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      {/* Total Payment footer */}
      {showTotal && (
        <div className="mb-auto px-5 py-4 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">
            Total Payment
          </span>
          <span className="text-base font-bold text-gray-900">
            {totalPayment.toLocaleString("id-ID", { minimumFractionDigits: 2 })}
            AFN
          </span>
        </div>
      )}
    </>
  );
}
