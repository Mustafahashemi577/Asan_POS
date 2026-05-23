import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { JournalEntry } from "@/types/journal";
import { BookOpen, Loader2 } from "lucide-react";

interface JournalDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: JournalEntry | null;
  loading: boolean;
}

function statusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-orange-100 text-orange-700";
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

export function JournalDetailDialog({
  open,
  onOpenChange,
  entry,
  loading,
}: JournalDetailDialogProps) {
  if (!entry) return null;

  const ref = `${entry.sequence.prefix}-${String(entry.sequence.lastIndex).padStart(4, "0")}`;
  const drItem = entry.items.find((i) => i.debit != null);
  const crItem = entry.items.find((i) => i.credit != null);
  const amount = drItem?.debit ?? crItem?.credit ?? 0;

  const purchase = entry.items[0]?.purchase;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg rounded-xl p-0 overflow-hidden
  [&>button.absolute]:text-white
  [&>button.absolute:hover]:text-black
  [&>button.absolute:hover]:bg-white
  [&>button.absolute]:opacity-100"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Journal Entry Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Header band */}
            {/* Header band */}
            <div className="px-5 py-5 bg-gradient-to-t from-bg-dark via-bg-dark to-bg-dark/90">
              {" "}
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={15} className="text-gray-400" />
                <span className="text-gray-400 text-xs font-medium">{ref}</span>
              </div>
              <p className="text-white text-xl font-semibold">
                AFN {amount.toLocaleString()}
              </p>
              <div className="flex items-center justify-between gap-3">
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(entry.createdAt).toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <span
                  className={`text-xs px-2.5 py-2 rounded-full font-medium ${statusBadge(entry.status)}`}
                >
                  {entry.status}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Double-entry ledger */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-3">
                  Ledger entries
                </p>
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-xs text-gray-500">
                        <th className="px-4 py-2.5 text-left font-medium">
                          Account
                        </th>
                        <th className="px-4 py-2.5 text-left font-medium">
                          Type
                        </th>
                        <th className="px-4 py-2.5 text-right font-medium">
                          Debit
                        </th>
                        <th className="px-4 py-2.5 text-right font-medium">
                          Credit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {entry.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-xs text-gray-800 max-w-[140px]">
                            <span className="line-clamp-2">
                              {item.account.name}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${item.account.type}`}
                            >
                              {item.account.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-xs font-medium text-red-600">
                            {item.debit != null ? (
                              `AFN ${item.debit.toLocaleString()}`
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-xs font-medium text-green-600">
                            {item.credit != null ? (
                              `AFN ${item.credit.toLocaleString()}`
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* Totals row */}
                    <tfoot>
                      <tr className="bg-gray-50 border-t border-gray-200">
                        <td
                          colSpan={2}
                          className="px-4 py-2.5 text-xs font-medium text-gray-500"
                        >
                          Total
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs font-semibold text-red-600">
                          AFN{" "}
                          {entry.items
                            .reduce((s, i) => s + (i.debit ?? 0), 0)
                            .toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs font-semibold text-green-600">
                          AFN{" "}
                          {entry.items
                            .reduce((s, i) => s + (i.credit ?? 0), 0)
                            .toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Purchase info */}
              {purchase && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-3">
                    Linked purchase
                  </p>
                  <div className="rounded-xl border border-gray-100 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Purchase ID</span>
                      <span className="text-xs font-mono text-gray-700 truncate max-w-[180px]">
                        {purchase.id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Due date</span>
                      <span className="text-xs text-gray-700">
                        {new Date(purchase.customDate).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Purchase status
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(purchase.status)}`}
                      >
                        {purchase.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Created</span>
                      <span className="text-xs text-gray-700">
                        {new Date(purchase.createdAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
