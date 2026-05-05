import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { getCategories } from "@/queries/category";
import {
  claimProductImage,
  createProduct,
  deleteProduct,
  updateProduct,
  uploadProductImage,
} from "@/queries/products";
import { ImageIcon, Loader2, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface AddEditProductProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
  onSave?: (data: any) => void;
  onDelete?: () => void;
}

export function AddEditProduct({
  open,
  onOpenChange,
  product,
  onSave,
  onDelete,
}: AddEditProductProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.imageUrl ?? product?.image ?? null,
  );
  const [categories, setCategories] = useState<any[]>([]);

  // Track upload state separately from form submit
  const [attachmentId, setAttachmentId] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form whenever product prop changes (covers both open-for-edit and open-for-add)
  useEffect(() => {
    setName(product?.name ?? "");
    setPrice(product?.price ?? "");
    setCategoryId(product?.categoryId ?? "");
    setInStock(product?.inStock ?? true);
    setImagePreview(product?.imageUrl ?? product?.image ?? null);
    setAttachmentId(null);
  }, [product]);

  // Fetch categories once on open
  useEffect(() => {
    if (!open) return;
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, [open]);

  // Step 1: upload image immediately on file select
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview instantly
    setImagePreview(URL.createObjectURL(file));
    setAttachmentId(null);
    setImageUploading(true);

    try {
      const result = await uploadProductImage(file);
      setAttachmentId(result.id);
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed. Please try again.");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setImageUploading(false);
    }
  };

  // Steps 2 + 3: create or update product, then claim image
  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Product name is required");
    if (!price) return toast.error("Price is required");

    const selectedCategory = categories.find((c) => c.id === categoryId);
    if (!selectedCategory) return toast.error("Please select a category");

    if (imageUploading)
      return toast.error("Please wait for image to finish uploading");

    setSubmitting(true);
    try {
      let saved: any;

      if (product?.id) {
        // ── EDIT mode ──
        saved = await updateProduct(product.id, {
          name: name.trim(),
          price: Number(price),
          categoryName: selectedCategory.name,
          inStock,
        });
      } else {
        // ── ADD mode ──
        saved = await createProduct({
          name: name.trim(),
          price: Number(price),
          categoryName: selectedCategory.name,
          inStock,
        });
      }

      // Claim new image if one was uploaded during this session
      if (attachmentId) {
        await claimProductImage(attachmentId, saved.id);
      }

      toast.success(
        product?.id
          ? "Product updated successfully"
          : "Product added successfully",
      );
      onSave?.(saved);
      onOpenChange(false);

      // Reset
      setName("");
      setPrice("");
      setCategoryId("");
      setInStock(true);
      setImagePreview(null);
      setAttachmentId(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          (product?.id ? "Failed to update product" : "Failed to add product"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = imageUploading || submitting || deleting;

  const handleDelete = async () => {
    if (!product?.id) return;
    setDeleting(true);
    try {
      await deleteProduct(product.id);
      toast.success("Product deleted successfully");
      onDelete?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full m-2.5 rounded-lg sm:max-w-md flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-gray-100">
          <SheetTitle className="text-left text-base font-semibold">
            {product ? "Edit Product" : "Add Product"}
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Image upload */}
          <label className="block w-full cursor-pointer">
            <div className="w-full h-44 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden hover:bg-gray-50 transition-colors relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs">Click to upload image</span>
                </div>
              )}
              {/* Upload spinner overlay */}
              {imageUploading && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={isLoading}
            />
          </label>

          {/* Stock toggle */}
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-gray-700">In Stock</span>
            <Switch checked={inStock} onCheckedChange={setInStock} />
          </div>

          {/* Category + Add category */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="h-11 w-full rounded-xl border-gray-200 text-sm">
                  <SelectValue placeholder="Choose Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl border-gray-200 shrink-0"
              onClick={() => {
                /* open add-category flow */
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Product name */}
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name"
            className="h-11 rounded-xl bg-white border-gray-200 text-sm"
            disabled={isLoading}
          />

          {/* Price */}
          <div className="relative">
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="h-11 rounded-xl bg-white border-gray-200 text-sm"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Sticky footer */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white space-y-2">
          {/* Delete button — only shown in edit mode */}
          {product?.id && (
            <Button
              onClick={handleDelete}
              disabled={isLoading}
              className="w-full h-11 bg-white text-red-500 hover:bg-red-50 border border-red-200 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete Product
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full h-11 bg-black text-white hover:bg-black/90 rounded-xl text-sm font-medium flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {product ? "Save Changes" : "Add Product"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
