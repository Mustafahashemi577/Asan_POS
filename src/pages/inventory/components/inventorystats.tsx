import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import type { useInventory } from "../hooks/useinventory";

type Props = ReturnType<typeof useInventory>;

export default function InventoryStats({
  inventories,
  selectedInventory,
  stats,
  switchInventory,
  setInventoryDialogOpen,
  confirmDelete,
}: Pick<
  Props,
  | "inventories"
  | "selectedInventory"
  | "stats"
  | "switchInventory"
  | "setInventoryDialogOpen"
  | "confirmDelete"
>) {
  return (
    <div className="bg-gradient-to-t from-bg-dark via-bg-dark to-bg-dark/90 w-full rounded-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-white text-xl sm:text-2xl font-semibold">
            Inventory Overview
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Track stock levels and manage your inventory efficiently
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Inventory selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost-dark"
                size="sm"
                className="rounded-xl gap-1.5 text-xs border"
              >
                {selectedInventory?.name ?? "Select Inventory"}
                <ChevronDown size={13} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl min-w-44">
              {inventories.map((inv) => (
                <DropdownMenuItem
                  key={inv.id}
                  className="text-xs cursor-pointer flex items-center justify-between gap-2 pr-1"
                  onClick={() => switchInventory(inv.id)}
                >
                  <span className="truncate">{inv.name}</span>
                  <button
                    className="shrink-0 text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent switchInventory from firing
                      confirmDelete(inv);
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setInventoryDialogOpen(true)}
            size="sm"
            className="rounded-xl gap-1.5 text-xs"
          >
            <Plus size={13} />
            Add Inventory
          </Button>
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
