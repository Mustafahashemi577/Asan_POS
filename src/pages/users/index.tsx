import { Pencil, Plus, Search, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useUsers } from "@/hooks/use-users";
import { createUser, deleteUser, updateUser } from "@/queries/user";
import type { User, UserRole } from "@/types/user";
import type { UserFormValues } from "./components/AddUserDialog";
import AddUserDialog from "./components/AddUserDialog";
import type { EditUserFormValues } from "./components/EditUserDialog";
import EditUserDialog from "./components/EditUserDialog";

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  Admin: "text-purple-600 bg-purple-50 border-purple-100",
  Cashier: "text-blue-600 bg-blue-50 border-blue-100",
};

const USER_ROLES: UserRole[] = ["Cashier"];

// ── Delete confirmation dialog ────────────────────────────────────────────────

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onConfirm: () => Promise<void>;
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Delete User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-1">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete{" "}
            <span className="font-medium text-gray-800">
              {user?.name} {user?.lastName}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-10 rounded-xl border-gray-200"
              onClick={() => onOpenChange(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white"
              onClick={handleConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
    optimisticAdd,
    optimisticUpdate,
    optimisticDelete,
    isLoading,
    PAGE_SIZE,
  } = useUsers();

  const [searchOpen, setSearchOpen] = useState(false);

  // ── Add dialog ──────────────────────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);

  // ── Edit dialog ─────────────────────────────────────────────────────────────
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // ── Delete confirm dialog ───────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAddUser = async (values: UserFormValues) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...payload } = values;
    const newUser: User = {
      id: crypto.randomUUID(),
      name: values.name,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      role: "Cashier",
    };
    optimisticAdd(newUser);
    try {
      await createUser(payload);
      toast.success("User added successfully");
      mutate();
    } catch {
      toast.error("Failed to add user");
      mutate(); // revert optimistic update
    }
  };

  const handleEditUser = async (id: string, values: EditUserFormValues) => {
    optimisticUpdate(id, {
      name: values.name,
      lastName: values.lastName,
      phone: values.phone,
    });
    try {
      await updateUser(id, {
        name: values.name,
        lastName: values.lastName,
        phone: values.phone,
        gender: values.gender,
        dob: values.dob,
        ...(values.oldPassword
          ? { oldPassword: values.oldPassword, password: values.newPassword }
          : {}),
      });
      toast.success("User updated successfully");
      mutate();
    } catch {
      toast.error("Failed to update user");
      mutate();
    }
  };

  const handleDeleteUser = async (id: string) => {
    optimisticDelete(id);
    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
      setSelectedUserId(null);
      mutate();
    } catch {
      toast.error("Failed to delete user");
      mutate();
    }
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
                      onClick={() => setSelectedUserId(user.id)}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                        {String(idx + 1 + (page - 1) * PAGE_SIZE).padStart(
                          3,
                          "0",
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {user.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {user.phone ?? "—"}
                      </td>
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
                      <td
                        className="px-4 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedUserId(user.id)}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
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
        open={!!selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
        userId={selectedUserId}
        onSubmit={handleEditUser}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        user={deleteTarget}
        onConfirm={() => handleDeleteUser(deleteTarget!.id)}
      />
    </div>
  );
}
