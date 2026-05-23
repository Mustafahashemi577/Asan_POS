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
import type { InventoryDetail, InventoryProduct } from "@/types/inventory";
import { MoreHorizontal, Search, XIcon } from "lucide-react";

// ── Props ─────────────────────────────────────────────────────────────────────

interface InventoryTableProps {
  selectedInventory: InventoryDetail | null;
  /** Already-filtered products from use-inventory */
  filtered: InventoryProduct[];
  status: string;
  setStatus: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  selectedRow: string | null;
  setSelectedRow: (id: string | null) => void;
  setItemDialogOpen: (open: boolean) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function stockStatus(quantity: number): { label: string; className: string } {
  if (quantity === 0)
    return { label: "Out of Stock", className: "bg-red-100 text-red-500" };
  if (quantity <= 10)
    return { label: "Low Stock", className: "bg-orange-100 text-orange-600" };
  return { label: "In Stock", className: "bg-green-100 text-green-700" };
}

// ── Component ─────────────────────────────────────────────────────────────────

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
}: InventoryTableProps) {
  const handleView = (product: InventoryProduct) =>
    console.log("View:", product);
  const handleEdit = (product: InventoryProduct) =>
    console.log("Edit:", product);
  const handleDelete = (product: InventoryProduct) =>
    console.log("Delete:", product);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Header + filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            {selectedInventory?.name} — Products
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
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

              <SelectItem value="In Stock">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md">
                  In Stock
                </span>
              </SelectItem>

              <SelectItem value="Low Stock">
                <span className="bg-yellow-100 text-orange-600 px-2 py-1 rounded-md">
                  Low Stock
                </span>
              </SelectItem>

              <SelectItem value="Out of Stock">
                <span className="bg-red-100 text-red-500 px-2 py-1 rounded-md">
                  Out of Stock
                </span>
              </SelectItem>
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
                  placeholder="Search products"
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
              {["Name", "Quantity", "Unit Price", "Status", "Actions"].map(
                (h) => (
                  <TableHead
                    key={h}
                    className="text-sm font-medium py-4 text-left text-black bg-gray-100 first:rounded-l-md first:pl-6 last:rounded-r-md last:pr-6 whitespace-nowrap"
                  >
                    {h}
                  </TableHead>
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-400 text-sm"
                >
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => {
                const { label, className } = stockStatus(product.quantity);
                return (
                  <TableRow
                    key={product.id}
                    onClick={() =>
                      setSelectedRow(
                        selectedRow === product.id ? null : product.id,
                      )
                    }
                    className={`cursor-pointer transition-colors ${
                      selectedRow === product.id
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <TableCell className="pl-6 text-xs text-gray-800 font-medium whitespace-nowrap">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-xs text-gray-800 whitespace-nowrap">
                      {product.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-gray-800 whitespace-nowrap">
                      {product.price.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${className}`}
                      >
                        {label}
                      </span>
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
                          <DropdownMenuItem
                            className="text-xs cursor-pointer"
                            onClick={() => handleView(product)}
                          >
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-xs cursor-pointer"
                            onClick={() => handleEdit(product)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            className="text-xs cursor-pointer"
                            onClick={() => handleDelete(product)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* MOBILE CARDS */}
      <div className="sm:hidden divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <p className="px-5 py-12 text-center text-gray-400 text-sm">
            No products found
          </p>
        ) : (
          filtered.map((product) => {
            const { label, className } = stockStatus(product.quantity);
            return (
              <div
                key={product.id}
                onClick={() =>
                  setSelectedRow(selectedRow === product.id ? null : product.id)
                }
                className={`px-4 py-4 cursor-pointer transition-colors ${
                  selectedRow === product.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-mono text-gray-500">
                    {product.id}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${className}`}
                  >
                    {label}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800 mb-1">
                  {product.name}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {product.quantity.toLocaleString()} units
                  </span>
                  <span className="text-xs text-gray-500">
                    {product.price.toLocaleString("id-ID")}
                  </span>
                </div>
                <div
                  className="flex gap-2 mt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleView(product)}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Showing {filtered.length} of {selectedInventory?.products.length ?? 0}{" "}
          products
        </span>
      </div>
    </div>
  );
}
