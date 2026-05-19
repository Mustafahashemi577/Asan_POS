import useSWR from "swr";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getPurchase } from "@/queries/purchase";
import type { PurchaseDetail, PurchaseStatus } from "@/types/purchases";

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

function fmtCurrency(n: number): string {
  return "AFN " + Number(n).toLocaleString("id-ID");
}

function normalizeStatus(status: string): PurchaseStatus {
  return status.toUpperCase() as PurchaseStatus;
}

const STATUS_STYLES: Record<PurchaseStatus, string> = {
  Draft: "bg-gray-100 text-gray-600",
  Done: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-500",
  Pending: "bg-yellow-100 text-orange-700",
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface PurchaseDetailSheetProps {
  id: string | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: PurchaseStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  actionLoading: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PurchaseDetailSheet({
  id,
  open,
  onClose,
  onStatusChange,
  onDelete,
  actionLoading,
}: PurchaseDetailSheetProps) {
  const { data, isLoading } = useSWR<PurchaseDetail>(
    open && id ? `purchase-detail-${id}` : null,
    () => getPurchase(id!),
    { revalidateOnFocus: false },
  );

  const status = data ? normalizeStatus(data.status) : null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader className="px-6 pt-2 pb-4 border-b border-gray-100">
          <SheetTitle className="text-base font-semibold">
            Purchase Detail
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {isLoading || !data ? (
            <p className="text-sm text-gray-400 text-center py-12">Loading…</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Purchase #</p>
                  <p className="font-mono text-gray-700 text-xs">
                    #{data.sequenceId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Status</p>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      STATUS_STYLES[status!] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Customer</p>
                  <p className="text-gray-800 font-medium">
                    {data.customer?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Date</p>
                  <p className="text-gray-700">{fmtDate(data.customDate)}</p>
                </div>
              </div>

              {/* Items table */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-3">
                  Items
                </p>
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2.5 font-medium text-gray-600">
                          Product
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium text-gray-600">
                          Qty
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium text-gray-600">
                          Unit Price
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium text-gray-600">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2.5 text-gray-800">
                            {item.product?.name}
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-600">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-600">
                            {fmtCurrency(item.unitPrice)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-medium text-gray-800">
                            {fmtCurrency(item.unitPrice * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                <span className="text-sm text-gray-500 font-medium">Total</span>
                <span className="text-base font-bold text-gray-900">
                  {fmtCurrency(data.totalPrice)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Sticky footer */}
        <SheetFooter className="border-t border-gray-100 px-6 py-4 flex-row flex-wrap gap-2">
          {!data || isLoading || !status ? null : status === "Draft" ? (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={actionLoading}
                className="rounded-xl border-orange-400 text-orange-500 hover:bg-orange-50 hover:text-orange-600 text-xs h-9 px-4"
                onClick={() => onStatusChange(data.id, "Cancelled")}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={actionLoading}
                className="rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 text-xs h-9 px-4 ml-auto"
                onClick={async () => {
                  await onDelete(data.id);
                  onClose();
                }}
              >
                Delete
              </Button>
            </>
          ) : status === "Done" ? (
            <p className="text-xs text-gray-400 self-center">
              Purchase completed — items have been transferred to inventory.
            </p>
          ) : status === "Cancelled" ? (
            <p className="text-xs text-gray-400 self-center">
              This purchase has been CANCELLED and cannot be modified.
            </p>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
