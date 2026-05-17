import {
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import CustomerDialog from "@/components/AddCustomerDialog";

import { useCustomerDialog } from "@/hooks/use-customer-dialog";
import { useCustomers } from "@/hooks/use-customers";
import { useState } from "react";

function getTodayLabel() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ContactsPage() {
  const [searchOpen, setSearchOpen] = useState(false);

  const {
    customers,
    total,
    totalPages,
    page,
    setPage,
    search,
    handleSearch,
    mutate,
    isLoading,
    PAGE_SIZE,
  } = useCustomers();

  const {
    dialogOpen,
    setDialogOpen,
    editingCustomer,
    handleOpenCreate,
    handleOpenEdit,
    handleSubmit,
    handleDelete,
  } = useCustomerDialog(mutate);

  const today = getTodayLabel();

  const stats = [
    {
      label: "Total Customers",
      value: isLoading ? "—" : String(total),
      date: today,
      sub: "All contacts",
    },
    {
      label: "Current Page",
      value: isLoading ? "—" : String(customers.length),
      date: today,
      sub: `Page ${page} of ${totalPages}`,
    },
    {
      label: "Total Pages",
      value: isLoading ? "—" : String(totalPages),
      date: today,
      sub: `${PAGE_SIZE} per page`,
    },
  ];

  const emptyMessage = search
    ? `No customers matching "${search}"`
    : "No customers found";

  return (
    <>
      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editingCustomer}
        onSubmit={handleSubmit}
      />

      <div className="overflow-y-auto">
        <div className="max-w-[1401px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
          {/* ── DARK OVERVIEW CARD ───────────────────────────────────────── */}
          <div className="bg-gradient-to-t from-bg-dark via-bg-dark to-bg-dark/90 w-full rounded-2xl p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
              <div>
                <h1 className="text-white text-xl sm:text-2xl font-semibold">
                  Customer Overview
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                  Manage and track all your customer contacts
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={handleOpenCreate}
                  size="sm"
                  variant="ghost-dark"
                  className="rounded-xl gap-1.5 text-xs"
                >
                  <Plus size={13} />
                  Add Customer
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
                    <span className="text-gray-500 text-[10px]">
                      {stat.date}
                    </span>
                    <span className="text-gray-400 text-xs">{stat.sub}</span>
                  </div>
                  <button className="text-gray-500 text-[10px] mt-1.5 hover:text-gray-300 transition block">
                    View all &rsaquo;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── TABLE CARD ───────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  All Customers
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {customers.length} customer{customers.length !== 1 ? "s" : ""}{" "}
                  on this page
                </p>
              </div>

              <div className="flex items-center gap-2 lg:shrink-0">
                {!searchOpen ? (
                  <Button
                    variant="default"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-xl"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search size={15} className="text-white" />
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
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search customers..."
                      className="h-10 pl-9 pr-8 rounded-xl border-gray-200 text-sm bg-white"
                    />
                    <XIcon
                      size={14}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                      onClick={() => {
                        handleSearch("");
                        setSearchOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    {["Name", "Phone", "Address", "Actions"].map((h) => (
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="px-6 py-12 text-center text-gray-400 text-sm"
                      >
                        Loading customers…
                      </TableCell>
                    </TableRow>
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="px-6 py-12 text-center text-gray-400 text-sm"
                      >
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-gray-50">
                        <TableCell className="text-xs text-gray-800 font-medium pl-6 whitespace-nowrap">
                          {customer.name}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                          {customer.phone}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {customer.address}
                        </TableCell>
                        <TableCell
                          className="pr-6 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CustomerActionsMenu
                            onEdit={() => handleOpenEdit(customer)}
                            onDelete={() => handleDelete(customer.id)}
                            size="desktop"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* MOBILE CARDS */}
            <div className="sm:hidden divide-y divide-gray-100">
              {isLoading ? (
                <p className="px-5 py-12 text-center text-gray-400 text-sm">
                  Loading customers…
                </p>
              ) : customers.length === 0 ? (
                <p className="px-5 py-12 text-center text-gray-400 text-sm">
                  {emptyMessage}
                </p>
              ) : (
                customers.map((customer) => (
                  <div key={customer.id} className="px-4 py-4">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium text-gray-800">
                        {customer.name}
                      </p>
                      <CustomerActionsMenu
                        onEdit={() => handleOpenEdit(customer)}
                        onDelete={() => handleDelete(customer.id)}
                        size="mobile"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mb-0.5">
                      {customer.phone}
                    </p>
                    <p className="text-xs text-gray-400">{customer.address}</p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Showing {customers.length} of {total} customers
              </span>
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────

function CustomerActionsMenu({
  onEdit,
  onDelete,
  size,
}: {
  onEdit: () => void;
  onDelete: () => void;
  size: "desktop" | "mobile";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={
            size === "desktop"
              ? "h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
              : "h-7 w-7 p-0 rounded-lg -mt-0.5"
          }
        >
          <MoreHorizontal
            size={size === "desktop" ? 16 : 15}
            className={size === "desktop" ? "text-gray-500" : "text-gray-400"}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl w-36">
        <DropdownMenuItem className="text-xs cursor-pointer" onClick={onEdit}>
          <Pencil className="w-3.5 h-3.5 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          className="text-xs cursor-pointer"
          onClick={onDelete}
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
