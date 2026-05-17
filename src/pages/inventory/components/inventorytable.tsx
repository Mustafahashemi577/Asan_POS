import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Search, XIcon } from "lucide-react";
import type {
  InventoryItem,
  StockStatus,
  useInventory,
} from "../../../hooks/use-inventory";

const STATUS_STYLES: Record<StockStatus, string> = {
  "In Stock": "bg-green-100 text-green-700",
  "Low Stock": "bg-orange-100 text-orange-600",
  "Out of Stock": "bg-red-100 text-red-500",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type Props = ReturnType<typeof useInventory>;

export default function InventoryTable({
  selectedInventory,
  filtered,
  status,
  setStatus,
  search,
  setSearch,
  searchOpen,
  setSearchOpen,
  selectedRow,
  setSelectedRow,
  //setItemDialogOpen,
}: Pick<
  Props,
  | "selectedInventory"
  | "filtered"
  | "status"
  | "setStatus"
  | "search"
  | "setSearch"
  | "searchOpen"
  | "setSearchOpen"
  | "selectedRow"
  | "setSelectedRow"
  | "setItemDialogOpen"
>) {
  // Row action handlers — wire up your own modals here
  const handleView = (item: InventoryItem) => console.log("View:", item);
  const handleEdit = (item: InventoryItem) => console.log("Edit:", item);
  const handleDelete = (item: InventoryItem) => console.log("Delete:", item);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Header + filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            {selectedInventory?.name} — Items
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:shrink-0">
          {/* Status filter */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-10 sm:w-40 rounded-xl border-gray-200 text-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="In Stock">In Stock</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          {/* Search toggle */}
          <div className="flex items-center gap-2">
            {!searchOpen ? (
              <Button
                variant="default"
                size="sm"
                className="h-10 w-10 p-0 rounded-xl border-gray-200"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={15} className="text-white-500" />
              </Button>
            ) : (
              <div className="relative sm:w-56">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <Input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search items"
                  className="h-10 pl-9 pr-8 rounded-xl border-gray-200 text-sm bg-white"
                />
                <XIcon
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                  onClick={() => {
                    setSearch("");
                    setSearchOpen(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden sm:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              {[
                "Name",
                "Quantity",
                "Unit Price",
                "Status",
                "Last Updated",
                "Actions",
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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="px-6 py-12 text-center text-gray-400 text-sm"
                >
                  No inventory items found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() =>
                    setSelectedRow(selectedRow === item.id ? null : item.id)
                  }
                  className={`cursor-pointer transition-colors ${
                    selectedRow === item.id ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <TableCell className="text-xs text-gray-800 font-medium whitespace-nowrap">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-xs text-gray-800 whitespace-nowrap">
                    {item.quantity.toLocaleString()} {item.unit}
                  </TableCell>
                  <TableCell className="text-xs text-gray-800 whitespace-nowrap">
                    {item.price.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                    {fmtDate(item.lastUpdated)}
                  </TableCell>
                  <TableCell
                    className="pr-6 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
                        >
                          <MoreHorizontal size={16} className="text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-xl w-36"
                      >
                        <DropdownMenuItem
                          className="text-xs cursor-pointer"
                          onClick={() => handleView(item)}
                        >
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-xs cursor-pointer"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          className="text-xs cursor-pointer"
                          onClick={() => handleDelete(item)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* MOBILE CARDS */}
      <div className="sm:hidden divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <p className="px-5 py-12 text-center text-gray-400 text-sm">
            No inventory items found
          </p>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() =>
                setSelectedRow(selectedRow === item.id ? null : item.id)
              }
              className={`px-4 py-4 cursor-pointer transition-colors ${
                selectedRow === item.id ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex justify-between mb-1">
                <span className="text-xs font-mono text-gray-500">
                  {item.id}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[item.status]}`}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-800 mb-1">
                {item.name}
              </p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  {item.quantity} {item.unit}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {item.price.toLocaleString("id-ID")}
                </span>
                <div
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleView(item)}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
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
      <div className="px-5 py-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Showing {filtered.length} of {selectedInventory?.items.length ?? 0}{" "}
          items
        </span>
      </div>
    </div>
  );
}
