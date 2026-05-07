import { createCategory, getCategories } from "@/queries/category";
import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  updateProduct,
  uploadProductImages,
} from "@/queries/products";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface ImagePreview {
  preview: string;
  imageId?: string; // present = existing backend attachment
  file?: File; // present = newly selected (not yet uploaded)
}

interface UseProductFormProps {
  open: boolean;
  product?: any;
  onSave?: (data: any) => void;
  onDelete?: () => void;
  onOpenChange: (open: boolean) => void;
}

export function useProductForm({
  open,
  product,
  onSave,
  onDelete,
  onOpenChange,
}: UseProductFormProps) {
  // ── Form fields ──
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [categories, setCategories] = useState<any[]>([]);

  // ── Image state ──
  // imagePreviews: what is shown in the UI (existing + newly picked)
  // attachmentIds: IDs returned from /attachments/upload, to be claimed after product create/update
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [attachmentIds, setAttachmentIds] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Submit / delete state ──
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Add-category dialog state ──
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  // ── Helper: revoke all object URLs to avoid memory leaks ──
  const revokeObjectUrls = (previews: ImagePreview[]) => {
    previews.forEach((p) => {
      if (p.file) URL.revokeObjectURL(p.preview);
    });
  };

  // ── Reset form whenever the product prop changes (open/edit) ──
  useEffect(() => {
    setName(product?.name ?? "");
    setPrice(product?.price ?? "");
    setCategoryId(product?.categoryId ?? "");
    setInStock(product?.inStock ?? true);
    setAttachmentIds([]);

    setImagePreviews((prev) => {
      revokeObjectUrls(prev);
      if (product?.images && product.images.length > 0) {
        return product.images
          .filter((img: any) => {
            const url = typeof img === "string" ? img : img.url;
            return url && url !== "/placeholder.png";
          })
          .map((img: any) =>
            typeof img === "string"
              ? { preview: img }
              : { preview: img.url, imageId: img.id },
          );
      }
      if (product?.image && product.image !== "/placeholder.png") {
        return [{ preview: product.image, imageId: product.imageId }];
      }
      return [];
    });
  }, [product]);

  // ── Fetch categories whenever the sheet/dialog opens ──
  useEffect(() => {
    if (!open) return;
    getCategories()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setCategories(list);
      })
      .catch(() => setCategories([]));
  }, [open]);

  // ── Image upload handler ──
  // Flow: user picks files → show previews immediately → POST /attachments/upload
  // → store returned attachment IDs → on form submit, claim them to the product
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // Show local previews right away so the UI feels instant
    const newPreviews: ImagePreview[] = files.map((file) => ({
      preview: URL.createObjectURL(file),
      file,
    }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    // Clear the input so the same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Upload to MinIO via /attachments/upload (entityType = "product")
    setImageUploading(true);
    try {
      const result = await uploadProductImages(files);
      // result.ids are the attachment UUIDs to claim later
      setAttachmentIds((prev) => [...prev, ...result.ids]);
      toast.success(
        files.length > 1 ? `${files.length} images uploaded` : "Image uploaded",
      );
    } catch {
      // Roll back the optimistic previews on failure
      toast.error("Image upload failed. Please try again.");
      setImagePreviews((prev) => {
        const rolled = prev.slice(0, prev.length - files.length);
        newPreviews.forEach((p) => URL.revokeObjectURL(p.preview));
        return rolled;
      });
    } finally {
      setImageUploading(false);
    }
  };

  // ── Remove preview handler ──
  // Existing images (imageId present) → DELETE /products/images/:id on the backend
  // Newly uploaded images (file present) → remove from attachmentIds so they won't be claimed
  const handleRemovePreview = async (index: number) => {
    const item = imagePreviews[index];

    if (item.imageId) {
      // Already persisted on the backend — delete it
      try {
        await deleteProductImage(item.imageId);
        toast.success("Image removed");
      } catch {
        toast.error("Failed to remove image");
        return;
      }
    }

    if (item.file) {
      // Count how many newly-uploaded (file-based) previews come before this index
      // so we can remove the correct attachmentId slot
      const newFileIndexBefore = imagePreviews
        .slice(0, index)
        .filter((p) => p.file).length;
      setAttachmentIds((prev) =>
        prev.filter((_, i) => i !== newFileIndexBefore),
      );
      // Revoke object URL to free memory
      URL.revokeObjectURL(item.preview);
    }

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Form submit ──
  // 1. Validate fields
  // 2. createProduct or updateProduct
  // 3. If there are pending attachmentIds, claim them to the product
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
        // Edit mode — update product fields
        saved = await updateProduct(product.id, {
          name: name.trim(),
          price: Number(price),
          categoryName: selectedCategory.name,
          inStock,
        });
        saved = { ...saved, id: product.id };
      } else {
        // Create mode — create the product first, then claim images
        saved = await createProduct({
          name: name.trim(),
          price: Number(price),
          categoryName: selectedCategory.name,
          inStock,
        });
      }

      // Claim any pending attachment IDs to this product
      // if (attachmentIds.length > 0) {
      //   await claimProductImages(attachmentIds, saved.id);
      // }

      toast.success(
        product?.id
          ? "Product updated successfully"
          : "Product added successfully",
      );

      onSave?.(saved);
      onOpenChange(false);

      // Reset form state
      setName("");
      setPrice("");
      setCategoryId("");
      setInStock(true);
      setImagePreviews((prev) => {
        revokeObjectUrls(prev);
        return [];
      });
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

  // ── Delete product ──
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

  // ── Category dialog ──
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
      setCategoryError(
        err?.response?.status === 409
          ? "Category already exists"
          : "Something went wrong",
      );
    } finally {
      setCategorySubmitting(false);
    }
  };

  const openCategoryDialog = () => {
    setNewCategoryName("");
    setCategoryError("");
    setCategoryDialogOpen(true);
  };

  const closeCategoryDialog = () => {
    setCategoryDialogOpen(false);
    setNewCategoryName("");
    setCategoryError("");
  };

  const isLoading = imageUploading || submitting || deleting;

  return {
    // Form fields
    name,
    setName,
    price,
    setPrice,
    categoryId,
    setCategoryId,
    inStock,
    setInStock,
    categories,
    // Image
    imagePreviews,
    imageUploading,
    fileInputRef,
    handleImageChange,
    handleRemovePreview,
    // Submit / delete
    submitting,
    deleting,
    isLoading,
    handleSubmit,
    handleDelete,
    // Category dialog
    categoryDialogOpen,
    newCategoryName,
    setNewCategoryName,
    categoryError,
    categorySubmitting,
    openCategoryDialog,
    closeCategoryDialog,
    handleAddCategory,
  };
}
