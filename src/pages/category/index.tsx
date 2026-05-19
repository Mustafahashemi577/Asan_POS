import { Plus, Search, XIcon } from "lucide-react";
import { useState } from "react";

import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/queries/category";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/hooks/use-categories";
import type { Category } from "@/types";

export default function Category() {
  const { categories, search, handleSearch, clearSearch, mutate } =
    useCategories();
  const [searchOpen, setSearchOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

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

    // OPTIONAL: frontend duplicate check (fast UX)
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
      if (editing) {
        await updateCategory(editing.id, { name });
      } else {
        await createCategory({ name });
      }

      mutate();
      setOpen(false);
    } catch (err: any) {
      // backend duplicate error handling
      if (err?.response?.status === 409) {
        setError("Category already exists");
      } else {
        setError("Something went wrong");
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      mutate();
    } catch (err: any) {
      alert("Cannot delete: category is linked to products");
    }
  };

  return (
    <div className="p-2.5 m-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Category</h1>
      </div>

      <div className="flex sm:flex-row items-center sm:justify-end gap-3 mb-3">
        {!searchOpen ? (
          <Button
            variant="default"
            size="sm"
            className="h-10 w-37 sm:w-15 p-0 rounded-xl"
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
              placeholder="Search purchases..."
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

        <Button className="h-10 w-40" onClick={openAdd}>
          <Plus size={15} className="text-white" />
          Add Category
        </Button>
      </div>

      {/* CONTENT */}
      {!categories ? (
        <div className="flex flex-col items-center text-center justify-center w-full min-h-[60vh] px-4">
          <p className="text-sm text-gray-600">No Categories found</p>
          <img src="/photos/NotFound2.avif" alt="Not Found" />
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center text-center justify-center w-full min-h-[60vh] px-4">
          <p className="text-center text-gray-500">
            No categories yet! <br />
          </p>
          <img
            src="/photos/NotFound2.avif"
            alt="Not Found"
            className="max-w-100 max-h-100"
          />
          <p className="text-center text-gray-600">
            {" "}
            Create Your first Category to get Started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat: any) => (
            <div
              key={cat.id}
              className="border  border-gray-200 rounded-xl p-4 bg-white shadow-lg flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {cat.name}
                </h3>
                <hr className="border mt-1" />
              </div>

              <div className="flex gap-2 mt-4">
                <div className="flex flex-row gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => openEdit(cat)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    disabled={cat.productCount > 0}
                    onClick={() => handleDelete(cat.id)}
                  >
                    Delete
                  </Button>

                  {cat.productCount > 0 && (
                    <p className="text-[10px] text-gray-400 text-center">
                      Cannot delete (linked to products)
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
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
            />
            {error && <p className="text-xs text-red-500">{error}</p>}

            <Button onClick={handleSubmit} className="w-full">
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
