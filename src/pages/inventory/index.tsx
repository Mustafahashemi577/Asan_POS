import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Plus, Trash2 } from "lucide-react";
import AddInventoryForm from "./components/addinventoryform";
import InventoryStats from "./components/inventorystats";
import InventoryTable from "./components/inventorytable";
import { useInventory } from "./hooks/useinventory";

export default function Inventory() {
  const inv = useInventory();

  // ── Add Inventory dialog
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

  // ── Add Item dialog
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

  // ── Delete Inventory confirmation dialog
  const deleteDialog = (
    <Dialog
      open={inv.deleteDialogOpen}
      onOpenChange={(open) => {
        if (!open) inv.cancelDelete();
      }}
    >
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 size={16} className="text-red-500" />
            Delete Inventory
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-500 mt-1">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-900">
            {inv.inventoryToDelete?.name}
          </span>
          ? This action cannot be undone and all items within it will be lost.
        </p>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="default"
            size="sm"
            className="rounded-xl"
            onClick={inv.cancelDelete}
            disabled={inv.deleteLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="rounded-xl gap-1.5"
            onClick={inv.handleDeleteInventory}
            disabled={inv.deleteLoading}
          >
            {inv.deleteLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={13} />
                Delete
              </>
            )}
          </Button>
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
        {deleteDialog}
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
        {deleteDialog}
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
        {deleteDialog}
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
      {deleteDialog}

      <div className="overflow-y-auto">
        <div className="max-w-[1401px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
          <InventoryStats
            inventories={inv.inventories}
            selectedInventory={inv.selectedInventory}
            stats={inv.stats}
            switchInventory={inv.switchInventory}
            setInventoryDialogOpen={inv.setInventoryDialogOpen}
            confirmDelete={inv.confirmDelete}
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
