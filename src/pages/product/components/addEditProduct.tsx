import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { createCategory, getCategories } from "@/queries/category";
import {
  claimProductImages,
  createProduct,
  deleteProduct,
  deleteProductImage,
  updateProduct,
  uploadProductImages,
} from "@/queries/products";
import { ImageIcon, ImagePlus, Loader2, Plus, X } from "lucide-react";
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
  const [categories, setCategories] = useState<any[]>([]);

  // { preview: string, imageId?: string, file?: File }
  // imageId present = existing backend image, file present = newly uploaded
  const [imagePreviews, setImagePreviews] = useState<
    { preview: string; imageId?: string; file?: File }[]
  >([]);
  const [attachmentIds, setAttachmentIds] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Add category dialog state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when product prop changes
  useEffect(() => {
    setName(product?.name ?? "");
    setPrice(product?.price ?? "");
    setCategoryId(product?.categoryId ?? "");
    setInStock(product?.inStock ?? true);
    setAttachmentIds([]);

    // Pre-populate all existing images with their imageId
    if (product?.images && product.images.length > 0) {
      setImagePreviews(
        product.images
          .filter((img: any) => {
            const url = typeof img === "string" ? img : img.url;
            return url && url !== "/placeholder.png";
          })
          .map((img: any) =>
            typeof img === "string"
              ? { preview: img }
              : { preview: img.url, imageId: img.id },
          ),
      );
    } else if (product?.image && product.image !== "/placeholder.png") {
      setImagePreviews([{ preview: product.image, imageId: product.imageId }]);
    } else {
      setImagePreviews([]);
    }
  }, [product]);

  // Fetch categories once on open, then match by name for edit mode
  useEffect(() => {
    if (!open) return;
    getCategories()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setCategories(list);
        // If categoryId not already set (product has category name but no categoryId)
        // match by name so the Select shows the correct value
        if (!product?.categoryId && product?.category) {
          const match = list.find(
            (c) => c.name.toLowerCase() === product.category.toLowerCase(),
          );
          if (match) setCategoryId(match.id);
        }
      })
      .catch(() => setCategories([]));
  }, [open]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const newPreviews = files.map((file) => ({
      preview: URL.createObjectURL(file),
      file,
    }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) fileInputRef.current.value = "";

    setImageUploading(true);
    try {
      const result = await uploadProductImages(files);
      setAttachmentIds((prev) => [...prev, ...result.ids]);
      toast.success(
        files.length > 1 ? `${files.length} images uploaded` : "Image uploaded",
      );
    } catch {
      toast.error("Image upload failed. Please try again.");
      setImagePreviews((prev) => prev.slice(0, prev.length - files.length));
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemovePreview = async (index: number) => {
    const item = imagePreviews[index];

    // If it's an existing backend image, delete it immediately via API
    if (item.imageId) {
      try {
        await deleteProductImage(item.imageId);
        toast.success("Image removed");
      } catch {
        toast.error("Failed to remove image");
        return; // don't remove from UI if API failed
      }
    }

    // If it's a newly uploaded (not yet claimed) image, remove its attachmentId
    if (item.file) {
      const newFileIndexBefore = imagePreviews
        .slice(0, index)
        .filter((p) => p.file).length;
      setAttachmentIds((prev) =>
        prev.filter((_, i) => i !== newFileIndexBefore),
      );
    }

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCategory = async () => {
    setCategoryError("");
    if (!newCategoryName.trim()) {
      setCategoryError("Category name is required");
      return;
    }
    const exists = categories.some(
      (c) => c.name.toLowerCase() === newCategoryName.trim().toLowerCase(),
    );
    if (exists) {
      setCategoryError("Category already exists");
      return;
    }
    setCategorySubmitting(true);
    try {
      await createCategory({ name: newCategoryName.trim() });
      // Refresh categories list and auto-select the new one
      const updated = await getCategories();
      const list = Array.isArray(updated) ? updated : [];
      setCategories(list);
      const created = list.find(
        (c: any) =>
          c.name.toLowerCase() === newCategoryName.trim().toLowerCase(),
      );
      if (created) setCategoryId(created.id);
      toast.success("Category added");
      setCategoryDialogOpen(false);
      setNewCategoryName("");
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setCategoryError("Category already exists");
      } else {
        setCategoryError("Something went wrong");
      }
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Product name is required");
    if (!price) return toast.error("Price is required");

    const selectedCategory = categories.find((c) => c.id === categoryId);
    if (!selectedCategory) return toast.error("Please select a category");

    if (imageUploading)
      return toast.error("Please wait for images to finish uploading");

    setSubmitting(true);
    try {
      let saved: any;

      if (product?.id) {
        saved = await updateProduct(product.id, {
          name: name.trim(),
          price: Number(price),
          categoryName: selectedCategory.name,
          inStock,
        });
        saved = { ...saved, id: product.id };
      } else {
        saved = await createProduct({
          name: name.trim(),
          price: Number(price),
          categoryName: selectedCategory.name,
          inStock,
        });
      }

      if (attachmentIds.length > 0) {
        await claimProductImages(attachmentIds, saved.id);
      }

      toast.success(
        product?.id
          ? "Product updated successfully"
          : "Product added successfully",
      );
      onSave?.(saved);
      onOpenChange(false);

      setName("");
      setPrice("");
      setCategoryId("");
      setInStock(true);
      setImagePreviews([]);
      setAttachmentIds([]);
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

  const hasSingleImage = imagePreviews.length === 1;
  const hasMultipleImages = imagePreviews.length > 1;
  const hasNoImages = imagePreviews.length === 0;

  return (
    <>
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
            {/* ── IMAGE SECTION ── */}

            {/* CASE 1: No images — full tall upload box (original design) */}
            {hasNoImages && (
              <label className="block w-full cursor-pointer">
                <div className="w-full h-44 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden hover:bg-gray-50 transition-colors relative">
                  {imageUploading ? (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-xs">Click to upload images</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isLoading}
                />
              </label>
            )}

            {/* CASE 2: Single image — full tall box + add more icon below */}
            {hasSingleImage && (
              <div className="space-y-2">
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={imagePreviews[0].preview}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemovePreview(0)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {/* Upload spinner overlay */}
                  {imageUploading && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Add more photos icon — between image and In Stock */}
                <label className="flex items-center gap-2 cursor-pointer w-fit text-gray-400 hover:text-gray-600 transition-colors">
                  {imageUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ImagePlus className="w-4 h-4" />
                  )}
                  <span className="text-xs">Add more photos</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isLoading}
                  />
                </label>
              </div>
            )}

            {/* CASE 3: Multiple images — grid of thumbnails + add more tile */}
            {hasMultipleImages && (
              <div className="flex flex-wrap gap-2">
                {imagePreviews.map((item, index) => (
                  <div
                    key={index}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0"
                  >
                    <img
                      src={item.preview}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePreview(index)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}

                {/* Add more tile */}
                <label className="w-20 h-20 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors shrink-0 gap-1">
                  {imageUploading ? (
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  ) : (
                    <>
                      <ImagePlus className="w-5 h-5 text-gray-400" />
                      <span className="text-[10px] text-gray-400">Add</span>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isLoading}
                  />
                </label>
              </div>
            )}

            {/* Stock toggle */}
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium text-gray-700">
                In Stock
              </span>
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
                  setNewCategoryName("");
                  setCategoryError("");
                  setCategoryDialogOpen(true);
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

      {/* Add Category Dialog */}
      <Dialog
        open={categoryDialogOpen}
        onOpenChange={(o) => {
          setCategoryDialogOpen(o);
          if (!o) {
            setNewCategoryName("");
            setCategoryError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              disabled={categorySubmitting}
            />
            {categoryError && (
              <p className="text-xs text-red-500">{categoryError}</p>
            )}
            <Button
              onClick={handleAddCategory}
              disabled={categorySubmitting}
              className="w-full"
            >
              {categorySubmitting && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
