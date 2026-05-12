import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Building2, Loader2, MapPin, Plus } from "lucide-react";
import AddInventoryForm from "./components/addinventoryform";
import InventoryStats from "./components/inventorystats";
import InventoryTable from "./components/inventorytable";
import { useInventory } from "./hooks/useinventory";

export default function Inventory() {
  const inv = useInventory();

  const isEdit = !!inv.inventoryDialogTarget;

  // ── Single inventory dialog — handles Add and Edit (+ Delete when editing)
  const inventoryDialog = (
    <Dialog
      open={inv.inventoryDialogOpen}
      onOpenChange={(open) => {
        if (!open) inv.closeInventoryDialog();
      }}
    >
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Inventory" : "Add Inventory"}
          </DialogTitle>
        </DialogHeader>
        <AddInventoryForm
          inventory={inv.inventoryDialogTarget ?? undefined}
          onSuccess={
            isEdit ? inv.handleInventoryUpdated : inv.handleInventoryAdded
          }
          onDeleted={inv.handleInventoryDeleted}
          onCancel={inv.closeInventoryDialog}
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

  // ── Detail view: an inventory has been selected/clicked
  if (inv.selectedInventoryId && inv.selectedInventory) {
    return (
      <>
        {inventoryDialog}
        {itemDialog}

        <div className="overflow-y-auto">
          <div className="max-w-[1401px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
            {/* Back button */}
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-gray-500 hover:text-gray-900 -ml-2"
                onClick={() => inv.switchInventory(null as unknown as string)}
              >
                <ArrowLeft size={15} />
                All Inventories
              </Button>
            </div>

            {/* Stats + items — no "Add Inventory" button here */}
            <InventoryStats
              inventories={inv.inventories}
              selectedInventory={inv.selectedInventory}
              stats={inv.stats}
              switchInventory={inv.switchInventory}
              openAddInventoryDialog={inv.openAddInventoryDialog}
              openEditInventoryDialog={inv.openEditInventoryDialog}
              hideAddButton
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

  // ── List view: show all inventories as a table
  return (
    <>
      {inventoryDialog}
      {itemDialog}

      <div className="overflow-y-auto">
        <div className="max-w-[1401px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Inventories
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Select an inventory to view its items and stock levels
              </p>
            </div>

            <Button
              onClick={inv.openAddInventoryDialog}
              size="sm"
              className="rounded-xl gap-1.5"
            >
              <Plus size={14} />
              Add Inventory
            </Button>
          </div>

          {/* Inventory list as card-table */}
          {inv.inventories.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 gap-3">
              <Building2 size={32} className="text-gray-300" />
              <p className="text-sm text-gray-400">No inventories found.</p>
              <Button
                onClick={inv.openAddInventoryDialog}
                size="sm"
                className="rounded-xl gap-1.5 mt-1"
              >
                <Plus size={14} />
                Add Inventory
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* DESKTOP TABLE */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      {[
                        "Name",
                        "Address",
                        "Total Items",
                        "Low Stock",
                        "Out of Stock",
                        "",
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
                    {inv.inventories.map((inventory) => {
                      const total = inventory.items.length;
                      const lowStock = inventory.items.filter(
                        (i) => i.status === "Low Stock",
                      ).length;
                      const outOfStock = inventory.items.filter(
                        (i) => i.status === "Out of Stock",
                      ).length;

                      return (
                        <TableRow
                          key={inventory.id}
                          onClick={() => inv.switchInventory(inventory.id)}
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="pl-6 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 shrink-0">
                                <Building2
                                  size={14}
                                  className="text-gray-500"
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {inventory.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <MapPin size={12} className="shrink-0" />
                              {inventory.address || "—"}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-700 whitespace-nowrap">
                            {total.toLocaleString()}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {lowStock > 0 ? (
                              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-orange-100 text-orange-600">
                                {lowStock}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {outOfStock > 0 ? (
                              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-red-100 text-red-500">
                                {outOfStock}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell
                            className="pr-6 text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-gray-400 hover:text-gray-600 rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                inv.openEditInventoryDialog(inventory);
                              }}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* MOBILE CARDS */}
              <div className="sm:hidden divide-y divide-gray-100">
                {inv.inventories.map((inventory) => {
                  const total = inventory.items.length;
                  const lowStock = inventory.items.filter(
                    (i) => i.status === "Low Stock",
                  ).length;
                  const outOfStock = inventory.items.filter(
                    (i) => i.status === "Out of Stock",
                  ).length;

                  return (
                    <div
                      key={inventory.id}
                      onClick={() => inv.switchInventory(inventory.id)}
                      className="px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 shrink-0">
                            <Building2 size={14} className="text-gray-500" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {inventory.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-gray-400 hover:text-gray-600 rounded-lg h-7 px-2 -mr-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            inv.openEditInventoryDialog(inventory);
                          }}
                        >
                          Edit
                        </Button>
                      </div>

                      {inventory.address && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 ml-10">
                          <MapPin size={11} className="shrink-0" />
                          {inventory.address}
                        </div>
                      )}

                      <div className="flex items-center gap-3 ml-10">
                        <span className="text-xs text-gray-500">
                          {total} items
                        </span>
                        {lowStock > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-600">
                            {lowStock} low
                          </span>
                        )}
                        {outOfStock > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-500">
                            {outOfStock} out
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {inv.inventories.length} inventor
                  {inv.inventories.length !== 1 ? "ies" : "y"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
