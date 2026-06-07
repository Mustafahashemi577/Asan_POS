import { Pencil, Plus, Search, Trash2, XIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";

import { useUsers } from "@/hooks/use-users";
import { createUser, deleteUser, updateUser } from "@/queries/user";
import type { User } from "@/types/user";
import type { UserFormValues } from "./components/AddUserDialog";
import AddUserDialog from "./components/AddUserDialog";
import type { EditUserFormValues } from "./components/EditUserDialog";
import EditUserDialog from "./components/EditUserDialog";

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  Admin: "text-purple-600 bg-purple-50 border-purple-100",
  Cashier: "text-blue-600 bg-blue-50 border-blue-100",
};

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

    mutate,
    isLoading,
    PAGE_SIZE,
  } = useUsers();

  const [searchOpen, setSearchOpen] = useState(false);

  // ── Add dialog ──────────────────────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);

  // ── Edit dialog — use data already in the list, no extra fetch needed ────────
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAddUser = async (values: UserFormValues) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...payload } = values;
    await createUser(payload);
    mutate();
  };

  const handleEditUser = async (id: string, values: EditUserFormValues) => {
    await updateUser(id, values);
    mutate();
  };

  const handleDeleteUser = async (id: string) => {
    await deleteUser(id);
    setSelectedUser(null);
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

              <Button
                onClick={() => setAddOpen(true)}
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
                    "Email",
                    "Phone",
                    "Role",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 font-semibold text-gray-700 whitespace-nowrap ${
                        h === "Actions" ? "text-center" : "text-left"
                      }`}
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
                      colSpan={7}
                      className="px-4 py-16 text-center text-sm text-gray-400"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-16 text-center text-sm text-gray-400"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user, idx) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer"
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
                        {user.name}
                      </td>

                      {/* Last name */}
                      <td className="px-4 py-3 text-gray-600">
                        {user.lastName}
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {user.email}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 text-gray-600">
                        {user.phone ?? "—"}
                      </td>

                      {/* Role badge */}
                      <td className="px-4 py-3">
                        {user.role ? (
                          <span
                            className={`text-xs font-medium border rounded-full px-2 py-0.5 ${
                              ROLE_COLORS[user.role] ??
                              "text-gray-600 bg-gray-50 border-gray-100"
                            }`}
                          >
                            {user.role}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td
                        className="px-4 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={async () => handleDeleteUser(user.id)}
                            className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
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
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAddUser}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        user={selectedUser}
        onSubmit={handleEditUser}
        onDelete={handleDeleteUser}
      />
    </div>
  );
}
