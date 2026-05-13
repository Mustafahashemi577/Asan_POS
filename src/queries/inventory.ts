import api from "@/lib/axios";

// ── Types ─────────────────────────────────────────────────────────────────────

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  status: StockStatus;
  lastUpdated: string; // ISO yyyy-mm-dd
}

export interface Inventory {
  id: string;
  name: string;
  address: string;
  items: InventoryItem[];
}

export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  totalCount: number;
  search?: string;
  filters?: Record<string, string | string[]>;
  sorts?: Record<string, "asc" | "desc">;
}

export interface PaginatedInventories {
  data: Inventory[];
  meta: PaginationMeta;
}

// ── Queries ───────────────────────────────────────────────────────────────────

export interface GetInventoriesParams {
  page?: number;
  itemsPerPage?: number;
  search?: string;
  totalPages?: number;
}

/** GET /inventory — returns paginated inventories for the current store */
export const getInventories = (
  params: GetInventoriesParams = {},
): Promise<PaginatedInventories> => {
  const { page = 1, itemsPerPage = 10, search } = params;

  const query: Record<string, string | number> = { page, itemsPerPage };
  if (search) query.search = search;

  return api.get("/inventory", { params: query }).then((r) => {
    // Handle both paginated { data, meta } and legacy plain-array responses
    if (Array.isArray(r.data)) {
      const mapped = mapInventories(r.data);
      return {
        data: mapped,
        meta: {
          currentPage: 1,
          itemsPerPage: mapped.length,
          totalItems: mapped.length,
          totalPages: 1,
          totalCount: mapped.length,
        },
      };
    }

    const raw: any[] = r.data.data ?? r.data.inventories ?? [];
    const serverMeta = r.data.meta ?? {};
    const totalItems: number =
      serverMeta.totalItems ?? serverMeta.total ?? raw.length;
    const meta: PaginationMeta = {
      currentPage: serverMeta.currentPage ?? serverMeta.page ?? 1,
      itemsPerPage: serverMeta.itemsPerPage ?? itemsPerPage,
      totalItems,
      totalPages:
        serverMeta.totalPages ?? Math.ceil(totalItems / itemsPerPage) ?? 1,
      totalCount: serverMeta.totalCount ?? serverMeta.total ?? raw.length,
      search: serverMeta.search,
      filters: serverMeta.filters,
      sorts: serverMeta.sorts,
    };

    return { data: mapInventories(raw), meta };
  });
};

function mapInventories(raw: any[]): Inventory[] {
  return raw.map(
    (inv): Inventory => ({
      id: inv.id,
      name: inv.name,
      address: inv.address ?? "",
      items: (inv.items ?? inv.products ?? []).map(
        (item: any): InventoryItem => ({
          id: item.id,
          name: item.name,
          category: item.category ?? "",
          quantity: item.quantity ?? 0,
          unit: item.unit ?? "",
          price: item.price ?? 0,
          status: item.status ?? "In Stock",
          lastUpdated:
            item.lastUpdated ?? item.updatedAt ?? item.createdAt ?? "",
        }),
      ),
    }),
  );
}

/** GET /inventory/:id — returns a single inventory with its items */
export const getInventory = (id: string): Promise<Inventory> =>
  api.get(`/inventory/${id}`).then((r) => r.data);

/** POST /inventory — create a new inventory */
export const createInventory = (data: {
  name: string;
  address: string;
}): Promise<{ id: string }> => api.post("/inventory", data).then((r) => r.data);

/** PUT /inventory/:id — update an inventory */
export const updateInventory = (
  id: string,
  data: { name: string; address: string },
): Promise<{ message: string }> =>
  api.put(`/inventory/${id}`, data).then((r) => r.data);

/** DELETE /inventory/:id — delete an inventory */
export const deleteInventory = (id: string): Promise<{ message: string }> =>
  api.delete(`/inventory/${id}`).then((r) => r.data);
