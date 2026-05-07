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

// ── Queries ───────────────────────────────────────────────────────────────────

/** GET /inventory — returns all inventories for the current store */
export const getInventories = (): Promise<Inventory[]> =>
  api.get("/inventory").then((r) => {
    const raw: any[] = Array.isArray(r.data)
      ? r.data
      : (r.data.data ?? r.data.inventories ?? []);

    return raw.map(
      (inv): Inventory => ({
        id: inv.id,
        name: inv.name,
        address: inv.address ?? "",
        items: (inv.items ?? []).map(
          (item: any): InventoryItem => ({
            id: item.id,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price,
            status: item.status,
            lastUpdated: item.lastUpdated ?? item.updatedAt ?? item.createdAt,
          }),
        ),
      }),
    );
  });

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
