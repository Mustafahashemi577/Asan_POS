import { Plus, Search, XIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { UserFormValues } from "@/components/AddUserDialog";
import AddUserDialog from "@/components/AddUserDialog";
import { useUsers } from "@/hooks/use-users";
import { createUser } from "@/queries/user";
import type { UserRole } from "@/types/user";

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  Admin: "text-purple-600 bg-purple-50 border-purple-100",
  Cashier: "text-blue-600 bg-blue-50 border-blue-100",
  Accountant: "text-green-600 bg-green-50 border-green-100",
};

const USER_ROLES: UserRole[] = ["Admin", "Cashier", "Accountant"];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const {
    users,
    totalItems,
    totalPages,
    page,
    setPage,
    search,
    handleSearch,
    clearSearch,
    role,
    setRole,
    mutate,
    isLoading,
    PAGE_SIZE,
  } = useUsers();

  const [searchOpen, setSearchOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ── Submit handler ──────────────────────────────────────────────────────────

  const handleAddUser = async (values: UserFormValues) => {
    await createUser(values);
    mutate();
  };

  // ── Pagination helpers ──────────────────────────────────────────────────────

  const from = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalItems);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="overflow-y-auto max-w-[1401px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Table card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">User List</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {totalItems} user{totalItems !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
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
                    placeholder="Search users..."
                    className="h-10 pl-9 pr-8 rounded-xl border-gray-200 text-sm bg-white"
                  />
                  <XIcon
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={() => {
                      clearSearch();
                      setSearchOpen(false);
                    }}
                  />
                </div>
              )}

              <Select value={role} onValueChange={(v) => setRole(v)}>
                <SelectTrigger className="h-10 rounded-xl border-gray-200 text-sm w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  {USER_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={() => setDialogOpen(true)}
                className="h-10 rounded-xl bg-black text-white hover:bg-black/90 text-sm gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add User
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-white">
                  {[
                    "#",
                    "First Name",
                    "Last Name",
                    "Username",
                    "Phone",
                    "Role",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap text-left"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-16 text-center text-sm text-gray-400"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-16 text-center text-sm text-gray-400"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user, idx) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                        {String(idx + 1 + (page - 1) * PAGE_SIZE).padStart(
                          3,
                          "0",
                        )}
                      </td>

                      {/* First name */}
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {user.firstName}
                      </td>

                      {/* Last name */}
                      <td className="px-4 py-3 text-gray-600">
                        {user.lastName}
                      </td>

                      {/* Username */}
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                        @{user.username}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 text-gray-600">{user.phone}</td>

                      {/* Role badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium border rounded-full px-2 py-0.5 ${
                            ROLE_COLORS[user.role] ??
                            "text-gray-600 bg-gray-50 border-gray-100"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {totalItems === 0
                ? "No users"
                : `Showing ${from}–${to} of ${totalItems} users`}
            </span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        </div>
      </div>

      {/* Add User Dialog */}
      <AddUserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddUser}
      />
    </div>
  );
}
