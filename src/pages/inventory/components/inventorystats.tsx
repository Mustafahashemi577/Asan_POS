import { Button } from "@/components/ui/button";
import type { Inventory } from "@/queries/inventory";
import { Plus } from "lucide-react";

interface InventoryStatsProps {
  inventories: Inventory[];
  selectedInventory: Inventory | null;
  stats: { label: string; value: string; date: string; sub: string }[];
  switchInventory: (id: string) => void;
  openAddInventoryDialog: () => void;
  openEditInventoryDialog: (inv: Inventory) => void;
  /** When true, hides the "Add Inventory" button (used on the detail page) */
  hideAddButton?: boolean;
}

export default function InventoryStats({
  selectedInventory,
  stats,
  openAddInventoryDialog,
  hideAddButton = false,
}: InventoryStatsProps) {
  return (
    <div className="bg-gradient-to-t from-bg-dark via-bg-dark to-bg-dark/90 w-full rounded-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-white text-xl sm:text-2xl font-semibold">
            {selectedInventory?.name ?? "Inventory Overview"}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            {selectedInventory?.address
              ? selectedInventory.address
              : "Track stock levels and manage your inventory efficiently"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!hideAddButton && (
            <Button
              onClick={openAddInventoryDialog}
              size="sm"
              variant="ghost-dark"
              className="rounded-xl gap-1.5 text-xs"
            >
              <Plus size={13} />
              Add Inventory
            </Button>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/10 border border-white/10 rounded-xl p-4"
          >
            <p className="text-gray-300 text-xs mb-2">{stat.label}</p>
            <div className="flex items-end justify-between mb-3">
              <p className="text-white text-lg sm:text-xl font-semibold leading-tight">
                {stat.value}
              </p>
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
  );
}
