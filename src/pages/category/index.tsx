import { useEffect, useState } from "react";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/queries/category";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function Category() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: categories, mutate } = useSWR(
    ["categories", debouncedSearch],
    () => getCategories(debouncedSearch),
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400); // 400ms delay

    return () => clearTimeout(timer);
  }, [search]);

  const openAdd = () => {
    setEditing(null);
    setName("");
    setOpen(true);
    setError("");
  };

  const openEdit = (cat: any) => {
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
      (c: any) =>
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col sm:flex-row ml-2 sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Category</h1>
      </div>

      <div className="flex flex-col sm:flex-row ml-3 sm:items-center sm:justify-between gap-3 mb-3">
        <Input
          placeholder="Search category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80"
        />

        <Button onClick={openAdd} className="w-full sm:w-auto">
          + Add Category
        </Button>
      </div>

      {/* CONTENT */}
      {!categories ? (
        <p className="text-sm text-gray-500">No Categories found</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-500">No categories yet</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-1">
          {categories.map((cat: any) => (
            <div
              key={cat.id}
              className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between"
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
