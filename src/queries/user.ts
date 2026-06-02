import api from "@/lib/axios";

import type {
    CreateUserPayload,
    UpdateUserPayload,
    User,
    UsersMeta,
} from "@/types/user";

// ── List ──────────────────────────────────────────────────────────────────────

export interface UsersQuery {
  page?: number;
  itemsPerPage?: number;
  search?: string;
  role?: string;
}

export function usersKey(params: UsersQuery = {}) {
  const { search = "", page = 1, itemsPerPage = 15, role = "" } = params;
  return `/users?search=${search}&page=${page}&itemsPerPage=${itemsPerPage}&role=${role}`;
}

export const getUsers = (
  query: UsersQuery = {},
): Promise<{ data: User[]; meta: UsersMeta }> =>
  api.get("/users", { params: query }).then((r) => {
    const raw = r.data;
    const items: User[] = Array.isArray(raw)
      ? raw
      : (raw.data ?? raw.users ?? []);
    const meta: UsersMeta = raw.meta ?? {
      currentPage: 1,
      itemsPerPage: items.length,
      totalItems: items.length,
      totalPages: 1,
    };
    return { data: items, meta };
  });

// ── Single ────────────────────────────────────────────────────────────────────

export const getUser = (id: string): Promise<User> =>
  api.get(`/users/${id}`).then((r) => r.data as User);

// ── Create ────────────────────────────────────────────────────────────────────

export const createUser = (
  payload: CreateUserPayload,
): Promise<{ message: string }> =>
  api.post("/users", payload).then((r) => r.data);

// ── Update ────────────────────────────────────────────────────────────────────

export const updateUser = (
  id: string,
  payload: UpdateUserPayload,
): Promise<{ message: string }> =>
  api.put(`/users/${id}`, payload).then((r) => r.data);

// ── Delete ────────────────────────────────────────────────────────────────────

export const deleteUser = (id: string): Promise<{ message: string }> =>
  api.delete(`/users/${id}`).then((r) => r.data);
