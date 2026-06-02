import { Pencil, Plus, Search, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategories } from "@/queries/category";
import { getProducts } from "@/queries/products";
import type { Category } from "@/types";
import { AddEditProduct } from "./components/addEditProduct";
import type { Product } from "./components/product-list";
import type { ProductFormData } from "./components/useproductform";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return (
    <span className="font-medium ">
      <b>؋ </b>
      {Number(n).toLocaleString("en-US")}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [selected, setSelected] = useState<Set<string>>(new Set());

  // AddEdit sheet
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(
    null,
  );

  const categoriesRef = useRef<Category[]>([]);

  // ── Fetch categories once ───────────────────────────────────────────────────

  useEffect(() => {
    getCategories()
      .then((res: unknown) => {
        const r = res as { data?: Category[] };
        const list: Category[] = Array.isArray(r) ? r : (r?.data ?? []);
        categoriesRef.current = list;
        setCategories(list);
      })
      .catch(() => setCategories([]));
  }, []);

  // ── Debounce search ─────────────────────────────────────────────────────────

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
  };

  // ── Fetch products ──────────────────────────────────────────────────────────

  const fetchProducts = (p: number, s: string, categoryId: string) => {
    setLoading(true);
    const categoryName =
      categoryId !== "all"
        ? categoriesRef.current.find((c) => c.id === categoryId)?.name
        : undefined;
    getProducts({
      page: p,
      itemsPerPage: ITEMS_PER_PAGE,
      search: s || undefined,
      categoryName,
    })
      .then(({ data, meta }) => {
        setProducts(data);
        setTotalPages(meta.totalPages);
        setTotalItems(meta.totalItems);
      })
      .catch(() => {
        setProducts([]);
        setTotalPages(1);
        setTotalItems(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts(page, debouncedSearch, selectedCategory);
  }, [page, debouncedSearch, selectedCategory]);

  const refresh = () => fetchProducts(page, debouncedSearch, selectedCategory);

  // ── Selection ───────────────────────────────────────────────────────────────

  const allSelected =
    products.length > 0 && products.every((p) => selected.has(p.id));

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Add / Edit ──────────────────────────────────────────────────────────────

  const handleAdd = () => {
    setEditingProduct(null);
    setSheetOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product as unknown as ProductFormData);
    setSheetOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);
    if (!open) setEditingProduct(null);
  };

  const handleSaved = () => {
    refresh();
  };

  // ── Category change ─────────────────────────────────────────────────────────

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(1);
  };

  const from = totalItems === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const to = Math.min(page * ITEMS_PER_PAGE, totalItems);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="overflow-y-auto max-w-[1401px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Table card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Product List
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {totalItems} product{totalItems !== 1 ? "s" : ""} found
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
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search products..."
                    className="h-10 pl-9 pr-8 rounded-xl border-gray-200 text-sm bg-white"
                  />
                  <XIcon
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={() => {
                      handleSearchChange("");
                      setSearchOpen(false);
                    }}
                  />
                </div>
              )}

              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="h-10 rounded-xl border-gray-200 text-sm w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleAdd}
                className="h-10 rounded-xl bg-black text-white hover:bg-black/90 text-sm gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-white">
                  <th className="w-10 px-4 py-3 text-left">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                    />
                  </th>
                  {[
                    "SKU",
                    "Product Name",
                    "Category",
                    "Price",
                    "Qty",
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
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-16 text-center text-sm text-gray-400"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-16 text-center text-sm text-gray-400"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product, idx) => (
                    <tr
                      key={product.id}
                      onClick={() => handleEdit(product)}
                      className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer ${
                        selected.has(product.id) ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <td
                        className="w-10 px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selected.has(product.id)}
                          onCheckedChange={() => toggleOne(product.id)}
                        />
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                        PT
                        {String(idx + 1 + (page - 1) * ITEMS_PER_PAGE).padStart(
                          3,
                          "0",
                        )}
                      </td>

                      {/* Name + image */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {product.image &&
                          product.image !== "/placeholder.png" ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-7 h-7 rounded-md object-cover shrink-0 border border-gray-100"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-md bg-gray-100 shrink-0" />
                          )}
                          <span className="font-medium text-gray-800">
                            {product.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {product.category ?? "—"}
                      </td>

                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {fmtPrice(product.price)}
                      </td>

                      <td className="px-4 py-3">
                        {product.inStock === false ? (
                          <span className="text-xs font-medium text-red-500 bg-red-50 border border-red-100 rounded-full px-2 py-0.5">
                            Out of stock
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-green-600 bg-green-50 border border-green-100 rounded-full px-2 py-0.5">
                            In stock
                          </span>
                        )}
                      </td>

                      {/* Actions — edit only */}
                      <td
                        className="px-4 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleEdit(product)}
                          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
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
                ? "No products"
                : `Showing ${from}–${to} of ${totalItems} products`}
            </span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        </div>
      </div>

      {/* Add / Edit sheet */}
      <AddEditProduct
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        product={editingProduct ?? undefined}
        onSave={handleSaved}
        onDelete={handleSaved}
      />
    </div>
  );
}
