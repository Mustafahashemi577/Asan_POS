// src/pages/Purchases/index.tsx

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { deletePurchase } from "@/queries/purchase";

import { MoreHorizontal, Plus, Search } from "lucide-react";

import { useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import { usePurchases } from "@/hooks/usePurchases";

import type { Purchase } from "@/types/purchase";

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtCurrency(value: number) {
  return `AFN ${Number(value || 0).toLocaleString("id-ID")}`;
}

export default function PurchasePage() {
  const navigate = useNavigate();

  const { purchases, mutate, isLoading } = usePurchases();

  const [search, setSearch] = useState("");

  // ───────────────────────────────────────────────────────────────────
  // Filter
  // ───────────────────────────────────────────────────────────────────

  const filteredPurchases = useMemo(() => {
    return purchases.filter((purchase: Purchase) => {
      const purchaseId = purchase.id?.toLowerCase() ?? "";

      const inventoryName = purchase.inventory?.name?.toLowerCase() ?? "";

      const customerName = purchase.customer?.name?.toLowerCase() ?? "";

      return (
        purchaseId.includes(search.toLowerCase()) ||
        inventoryName.includes(search.toLowerCase()) ||
        customerName.includes(search.toLowerCase())
      );
    });
  }, [purchases, search]);

  // ───────────────────────────────────────────────────────────────────
  // Stats
  // ───────────────────────────────────────────────────────────────────

  const totalSpent = filteredPurchases.reduce(
    (sum, purchase) => sum + Number(purchase.totalPrice || 0),
    0,
  );

  const thisMonthPurchases = filteredPurchases.filter((purchase) => {
    const date = new Date(purchase.purchaseDate);

    const now = new Date();

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  });

  // ───────────────────────────────────────────────────────────────────
  // Delete
  // ───────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    try {
      await deletePurchase(id);

      await mutate();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-gray-500">Loading purchases...</div>
    );
  }

  return (
    <div className="overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        {/* ── STATS ───────────────────────────────────────────── */}
        <div className="bg-gradient-to-t from-bg-dark via-bg-dark to-bg-dark/90 w-full rounded-2xl p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-white text-xl sm:text-2xl font-semibold">
              Purchase Overview
            </h1>

            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Track all inventory purchases
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Total Purchases */}
            <div className="bg-white/10 border border-white/10 rounded-xl p-4">
              <p className="text-gray-300 text-xs mb-2">Total Purchases</p>

              <p className="text-white text-xl font-semibold">
                {filteredPurchases.length}
              </p>

              <p className="text-gray-400 text-xs mt-3">
                Total purchase records
              </p>
            </div>

            {/* Total Spent */}
            <div className="bg-white/10 border border-white/10 rounded-xl p-4">
              <p className="text-gray-300 text-xs mb-2">Total Spent</p>

              <p className="text-white text-xl font-semibold">
                {fmtCurrency(totalSpent)}
              </p>

              <p className="text-gray-400 text-xs mt-3">Across all purchases</p>
            </div>

            {/* This Month */}
            <div className="bg-white/10 border border-white/10 rounded-xl p-4">
              <p className="text-gray-300 text-xs mb-2">This Month</p>

              <p className="text-white text-xl font-semibold">
                {thisMonthPurchases.length}
              </p>

              <p className="text-gray-400 text-xs mt-3">Purchases this month</p>
            </div>
          </div>
        </div>

        {/* ── TABLE ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Purchase Records
              </h2>

              <p className="text-xs text-gray-400 mt-0.5">
                {filteredPurchases.length} record
                {filteredPurchases.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Search */}
              <div className="relative sm:w-64">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />

                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search purchases..."
                  className="h-10 pl-9 rounded-xl border-gray-200 text-sm"
                />
              </div>

              {/* Add */}
              <Button
                onClick={() => navigate("/purchases/new")}
                className="h-10 rounded-xl bg-black text-white hover:bg-black/90 text-sm gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Purchase
              </Button>
            </div>
          </div>

          {/* ── DESKTOP TABLE ─────────────────────────────── */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  {[
                    "Purchase ID",
                    "Inventory",
                    "Customer",
                    "Total Price",
                    "Date",
                    "Actions",
                  ].map((head) => (
                    <th
                      key={head}
                      className="text-sm font-medium py-4 text-left text-black px-6 whitespace-nowrap"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-400 text-sm"
                    >
                      No purchases found
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {/* Purchase ID */}
                      <td className="text-xs text-gray-600 font-mono px-6 py-4 whitespace-nowrap">
                        {purchase.id}
                      </td>

                      {/* Inventory */}
                      <td className="text-sm text-gray-800 font-medium px-6 py-4 whitespace-nowrap">
                        {purchase.inventory?.name ?? "-"}
                      </td>

                      {/* Customer */}
                      <td className="text-sm text-gray-600 px-6 py-4 whitespace-nowrap">
                        {purchase.customer?.name ?? "-"}
                      </td>

                      {/* Total */}
                      <td className="text-sm font-semibold text-gray-900 px-6 py-4 whitespace-nowrap">
                        {fmtCurrency(purchase.totalPrice)}
                      </td>

                      {/* Date */}
                      <td className="text-sm text-gray-600 px-6 py-4 whitespace-nowrap">
                        {fmtDate(purchase.purchaseDate)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
                            >
                              <MoreHorizontal
                                size={16}
                                className="text-gray-500"
                              />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            className="rounded-xl w-36"
                          >
                            <DropdownMenuItem className="text-xs cursor-pointer">
                              View
                            </DropdownMenuItem>

                            <DropdownMenuItem className="text-xs cursor-pointer">
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDelete(purchase.id)}
                              className="text-xs cursor-pointer text-red-500 focus:text-red-500"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE ─────────────────────────────────────── */}
          <div className="sm:hidden divide-y divide-gray-100">
            {filteredPurchases.length === 0 ? (
              <p className="px-5 py-12 text-center text-gray-400 text-sm">
                No purchases found
              </p>
            ) : (
              filteredPurchases.map((purchase) => (
                <div key={purchase.id} className="px-4 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-gray-500">
                      {purchase.id}
                    </span>

                    <span className="text-xs text-gray-400">
                      {fmtDate(purchase.purchaseDate)}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-gray-900">
                    {purchase.inventory?.name ?? "-"}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Customer: {purchase.customer?.name ?? "-"}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-sm font-bold text-gray-900">
                      {fmtCurrency(purchase.totalPrice)}
                    </p>

                    <div className="flex gap-3">
                      <button className="text-xs text-blue-500 hover:underline">
                        View
                      </button>

                      <button className="text-xs text-gray-500 hover:underline">
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(purchase.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing {filteredPurchases.length} of {purchases.length} records
            </span>

            <span className="text-sm font-semibold text-gray-900">
              Total: {fmtCurrency(totalSpent)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
