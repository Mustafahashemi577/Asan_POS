import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import AddInventoryForm from "./components/addinventoryform";
import InventoryStats from "./components/inventorystats";
import InventoryTable from "./components/inventorytable";
import { useInventory } from "./hooks/useinventory";

export default function Inventory() {
  const inv = useInventory();

  // ── Dialogs defined once, shared across all render branches
  const inventoryDialog = (
    <Dialog
      open={inv.inventoryDialogOpen}
      onOpenChange={inv.setInventoryDialogOpen}
    >
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add Inventory</DialogTitle>
        </DialogHeader>
        <AddInventoryForm
          onSuccess={inv.handleInventoryAdded}
          onCancel={() => inv.setInventoryDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );

  // Swap <div>Placeholder</div> with your AddItemForm component when ready
  const itemDialog = (
    <Dialog open={inv.itemDialogOpen} onOpenChange={inv.setItemDialogOpen}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
        </DialogHeader>
        {/* TODO: replace with <AddItemForm onSuccess={inv.handleItemAdded} onCancel={() => inv.setItemDialogOpen(false)} /> */}
        <div className="py-8 text-center text-sm text-gray-400">
          Add Item form coming soon
        </div>
      </DialogContent>
    </Dialog>
  );

  // ── Loading
  if (inv.loading) {
    return (
      <>
        {inventoryDialog}
        {itemDialog}
        <div className="flex items-center justify-center h-64 text-gray-400 gap-2">
          <Loader2 className="animate-spin size-5" />
          <span className="text-sm">Loading inventories…</span>
        </div>
      </>
    );
  }

  // ── Error
  if (inv.error) {
    return (
      <>
        {inventoryDialog}
        {itemDialog}
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-red-500">{inv.error}</p>
        </div>
      </>
    );
  }

  // ── Empty
  if (inv.inventories.length === 0) {
    return (
      <>
        {inventoryDialog}
        {itemDialog}
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-sm text-gray-400">No inventories found.</p>
          <Button
            onClick={() => inv.setInventoryDialogOpen(true)}
            size="sm"
            className="rounded-xl gap-1.5"
          >
            <Plus size={14} />
            Add Inventory
          </Button>
        </div>
      </>
    );
  }

  // ── Main
  return (
    <>
      {inventoryDialog}
      {itemDialog}

      <div className="overflow-y-auto">
        <div className="max-w-[1401px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
          <InventoryStats
            inventories={inv.inventories}
            selectedInventory={inv.selectedInventory}
            stats={inv.stats}
            switchInventory={inv.switchInventory}
            setInventoryDialogOpen={inv.setInventoryDialogOpen}
          />
          <InventoryTable
            selectedInventory={inv.selectedInventory}
            filtered={inv.filtered}
            category={inv.category}
            setCategory={inv.setCategory}
            status={inv.status}
            setStatus={inv.setStatus}
            search={inv.search}
            setSearch={inv.setSearch}
            searchOpen={inv.searchOpen}
            setSearchOpen={inv.setSearchOpen}
            selectedRow={inv.selectedRow}
            setSelectedRow={inv.setSelectedRow}
            setItemDialogOpen={inv.setItemDialogOpen}
          />
        </div>
      </div>
    </>
  );
}
