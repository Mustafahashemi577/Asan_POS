import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { useCategories } from "@/hooks/use-categories";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/queries/category";
import type { Category } from "@/types";
import { Loader2, Plus, Search, Tag, XIcon } from "lucide-react";
import { useState } from "react";

export default function Category() {
  const {
    categories,
    loading,
    search,
    handleSearch,
    clearSearch,
    mutate,
    page,
    goToPage,
    totalPages,
    totalItems,
  } = useCategories();

  const [searchOpen, setSearchOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = totalItems === 0 ? 0 : (page - 1) * 10 + 1;
  const to = Math.min(page * 10, totalItems);

  const openAdd = () => {
    setEditing(null);
    setName("");
    setOpen(true);
    setError("");
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setOpen(true);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    const exists = categories?.some(
      (c: Category) =>
        c.name.toLowerCase() === name.trim().toLowerCase() &&
        c.id !== editing?.id,
    );

    if (exists) {
      setError("Category already exists");
      return;
    }

    try {
      setSubmitting(true);
      if (editing) {
        await updateCategory(editing.id, { name });
      } else {
        await createCategory({ name });
      }
      mutate();
      setOpen(false);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setError("Category already exists");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      mutate();
    } catch {
      alert("Cannot delete: category is linked to products");
    }
  };

  return (
    <div className="overflow-y-auto">
      <div className="max-w-[1401px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Categories
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Manage your product categories
            </p>
          </div>

          <Button onClick={openAdd} size="sm" className="rounded-xl gap-1.5">
            <Plus size={14} />
            Add Category
          </Button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">
              All Categories
              {totalItems > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({totalItems})
                </span>
              )}
            </p>

            <div className="flex items-center gap-2">
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
                    placeholder="Search categories…"
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
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : !categories || categories.length === 0 ? (
            <div className="flex flex-col items-center text-center justify-center w-full min-h-[40vh] px-4 gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Tag size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {search ? "No categories found" : "No categories yet"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {search
                    ? "Try a different search term"
                    : "Create your first category to get started"}
                </p>
              </div>
              {!search && (
                <Button
                  onClick={openAdd}
                  size="sm"
                  className="rounded-xl gap-1.5 mt-1"
                >
                  <Plus size={14} />
                  Add Category
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
              {categories.map((cat: Category) => (
                <div
                  key={cat.id}
                  className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 shrink-0">
                        <Tag size={14} className="text-gray-500" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {cat.name}
                      </h3>
                    </div>
                    <hr className="border-gray-100" />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg"
                      onClick={() => openEdit(cat)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1 rounded-lg"
                      disabled={(cat as any).productCount > 0}
                      onClick={() => handleDelete(cat.id)}
                    >
                      Delete
                    </Button>
                  </div>

                  {(cat as any).productCount > 0 && (
                    <p className="text-[10px] text-gray-400 text-center mt-2">
                      Cannot delete — linked to products
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {totalItems === 0
                ? "No results"
                : `Showing ${from}–${to} of ${totalItems} categor${totalItems !== 1 ? "ies" : "y"}`}
            </span>
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            )}
          </div>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="rounded-xl"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button
              onClick={handleSubmit}
              className="w-full rounded-xl"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editing ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
