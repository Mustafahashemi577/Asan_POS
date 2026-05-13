import { createCategory, getCategories } from "@/queries/category";
import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  updateProduct,
  uploadProductImages,
} from "@/queries/products";
import type { Category } from "@/types";
import type { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ── Domain types ──────────────────────────────────────────────────────────────

export interface ImagePreview {
  preview: string;
  imageId?: string; // present = existing backend attachment
  file?: File; // present = newly selected (not yet uploaded)
}

export interface ProductImage {
  id: string;
  url: string;
}

export interface ProductFormData {
  id?: string;
  name?: string;
  price?: number | string;
  categoryId?: string;
  categoryName?: string;
  inStock?: boolean;
  image?: string;
  imageId?: string;
  images?: ProductImage[];
}

interface ApiErrorResponse {
  message?: string;
}

export interface SavedProduct {
  id: string;
  name: string;
  price: number;
  categoryId?: string;
  categoryName?: string;
  inStock?: boolean;
  image?: string;
  images?: ProductImage[];
}

/** Shape returned by createProduct / updateProduct endpoints */
interface ApiMessageResponse {
  message: string;
}

interface UploadResult {
  ids: string[];
}

interface UseProductFormProps {
  open: boolean;
  product?: ProductFormData;
  onSave?: (data: SavedProduct) => void;
  onDelete?: () => void;
  onOpenChange: (open: boolean) => void;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function getAxiosErrorMessage(err: unknown, fallback: string): string {
  const axiosErr = err as AxiosError<ApiErrorResponse>;
  return axiosErr?.response?.data?.message ?? fallback;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useProductForm({
  open,
  product,
  onSave,
  onDelete,
  onOpenChange,
}: UseProductFormProps) {
  // ── Form fields ──
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState<number | string>(product?.price ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [categories, setCategories] = useState<Category[]>([]);

  // ── Image state ──
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
          .filter((img) => img.url && img.url !== "/placeholder.png")
          .map((img) => ({ preview: img.url, imageId: img.id }));
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
      .then((data: unknown) => {
        const list = Array.isArray(data) ? (data as Category[]) : [];
        setCategories(list);
      })
      .catch(() => setCategories([]));
  }, [open]);

  // ── Image upload handler ──
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const newPreviews: ImagePreview[] = files.map((file) => ({
      preview: URL.createObjectURL(file),
      file,
    }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) fileInputRef.current.value = "";

    setImageUploading(true);
    try {
      const result: UploadResult = await uploadProductImages(files);
      setAttachmentIds((prev) => [...prev, ...result.ids]);
      toast.success(
        files.length > 1 ? `${files.length} images uploaded` : "Image uploaded",
      );
    } catch {
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
  const handleRemovePreview = async (index: number) => {
    const item = imagePreviews[index];

    if (item.imageId) {
      try {
        await deleteProductImage(item.imageId);
        toast.success("Image removed");
      } catch {
        toast.error("Failed to remove image");
        return;
      }
    }

    if (item.file) {
      const newFileIndexBefore = imagePreviews
        .slice(0, index)
        .filter((p) => p.file).length;
      setAttachmentIds((prev) =>
        prev.filter((_, i) => i !== newFileIndexBefore),
      );
      URL.revokeObjectURL(item.preview);
    }

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Form submit ──
  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Product name is required");
    if (!price) return toast.error("Price is required");

    const selectedCategory = categories.find((c) => c.id === categoryId);
    if (!selectedCategory) return toast.error("Please select a category");
    if (imageUploading)
      return toast.error("Please wait for images to finish uploading");

    setSubmitting(true);
    try {
      // The API returns { message } only — reconstruct SavedProduct from local state.
      const payload = {
        name: name.trim(),
        price: Number(price),
        categoryName: selectedCategory.name,
        categoryId,
        inStock,
        ...(attachmentIds.length > 0 ? { attachmentIds } : {}),
      };

      let saved: SavedProduct;

      if (product?.id) {
        // updateProduct returns ApiMessageResponse — we don't need its value.
        await (updateProduct(
          product.id,
          payload,
        ) as Promise<ApiMessageResponse>);
        saved = {
          id: product.id,
          name: payload.name,
          price: payload.price,
          categoryId: payload.categoryId,
          categoryName: payload.categoryName,
          inStock: payload.inStock,
          image: product.image,
          images: product.images,
        };
      } else {
        // createProduct returns ApiMessageResponse — parent refetches to get the real id.
        await (createProduct(
          payload,
        ) as unknown as Promise<ApiMessageResponse>);
        saved = {
          id: "",
          name: payload.name,
          price: payload.price,
          categoryId: payload.categoryId,
          categoryName: payload.categoryName,
          inStock: payload.inStock,
        };
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
      setImagePreviews((prev) => {
        revokeObjectUrls(prev);
        return [];
      });
      setAttachmentIds([]);
    } catch (err: unknown) {
      toast.error(
        getAxiosErrorMessage(
          err,
          product?.id ? "Failed to update product" : "Failed to add product",
        ),
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
    } catch (err: unknown) {
      toast.error(getAxiosErrorMessage(err, "Failed to delete product"));
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
      const updated: unknown = await getCategories();
      const list = Array.isArray(updated) ? (updated as Category[]) : [];
      setCategories(list);
      const created = list.find(
        (c) => c.name.toLowerCase() === newCategoryName.trim().toLowerCase(),
      );
      if (created) setCategoryId(created.id);
      toast.success("Category added");
      setCategoryDialogOpen(false);
      setNewCategoryName("");
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      setCategoryError(
        axiosErr?.response?.status === 409
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
