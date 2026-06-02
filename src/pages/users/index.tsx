import { Plus, Search, XIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { PhoneNumberInput } from "@/components/ui/phoneinput";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/hooks/use-users";
import { createUser } from "@/queries/user";
import type { CreateUserPayload, UserRole } from "@/types/user";

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  Admin: "text-purple-600 bg-purple-50 border-purple-100",
  Cashier: "text-blue-600 bg-blue-50 border-blue-100",
  Accountant: "text-green-600 bg-green-50 border-green-100",
};

const USER_ROLES: UserRole[] = ["Admin", "Cashier", "Accountant"];

// ── Empty form state ──────────────────────────────────────────────────────────

const emptyForm = (): CreateUserPayload => ({
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phone: "",
  role: "Cashier",
  password: "",
});

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

  // ── Add user dialog ─────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateUserPayload>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateUserPayload, string>>
  >({});

  const handleField = (field: keyof CreateUserPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof CreateUserPayload, string>> = {};
    if (!form.firstName.trim()) next.firstName = "First name is required";
    if (!form.lastName.trim()) next.lastName = "Last name is required";
    if (!form.username.trim()) next.username = "Username is required";
    if (!form.phone.trim()) next.phone = "Phone is required";
    if (!form.password.trim()) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await createUser(form);
      setDialogOpen(false);
      setForm(emptyForm());
      setErrors({});
      mutate();
    } catch {
      // handle silently — extend with toast if needed
    } finally {
      setSaving(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setForm(emptyForm());
      setErrors({});
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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-5 py-4 border-b border-gray-100">
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
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">
              Add New User
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* First name + Last name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">
                  First Name
                </Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => handleField("firstName", e.target.value)}
                  placeholder="John"
                  className={`h-9 rounded-lg text-sm ${errors.firstName ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">
                  Last Name
                </Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => handleField("lastName", e.target.value)}
                  placeholder="Doe"
                  className={`h-9 rounded-lg text-sm ${errors.lastName ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">
                Username
              </Label>
              <Input
                value={form.username}
                placeholder="johndoe"
                className={`h-9 rounded-lg text-sm ${errors.username ? "border-red-400" : "border-gray-200"}`}
              />
              {errors.username && (
                <p className="text-xs text-red-500">{errors.username}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">Phone</Label>
              <PhoneNumberInput
                value={form.phone}
                placeholder="700 000 000"
                error={!!errors.phone}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone}</p>
              )}
            </div>
            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">Email</Label>
              <Input
                className="bg-white"
                type="email"
                value={form.email}
                placeholder="john.doe@example.com"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => handleField("role", v)}
              >
                <SelectTrigger className="h-9 rounded-lg border-gray-200 text-sm">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">
                Password
              </Label>
              <Input
                type="password"
                value={form.password}
                placeholder="******"
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg text-sm border-gray-200"
                onClick={() => handleDialogOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-9 rounded-lg bg-black text-white hover:bg-black/90 text-sm"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? "Saving…" : "Add User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
