// ── Enums ─────────────────────────────────────────────────────────────────────

export type UserRole = "Admin" | "Cashier";

// ── Shapes ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

// ── Create payload ────────────────────────────────────────────────────────────

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  email: string;
  role: UserRole;
  password: string;
  confirmPassword: string;
}

// ── Update payload ────────────────────────────────────────────────────────────

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  email?: string;
  role?: UserRole;
  password: string;
}

// ── Pagination meta ───────────────────────────────────────────────────────────

export interface UsersMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}
