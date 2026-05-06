import { createCategory, getCategories } from "@/queries/category";
import {
  claimProductImages,
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
  imageId?: string; // present = existing backend image
  file?: File; // present = newly uploaded
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

  // ── Reset form when product changes ──
  useEffect(() => {
    setName(product?.name ?? "");
    setPrice(product?.price ?? "");
    setCategoryId(product?.categoryId ?? "");
    setInStock(product?.inStock ?? true);
    setAttachmentIds([]);

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

  // ── Fetch categories on open + match by name for edit mode ──
  useEffect(() => {
    if (!open) return;
    getCategories()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setCategories(list);
        if (!product?.categoryId && product?.category) {
          const match = list.find(
            (c: any) => c.name.toLowerCase() === product.category.toLowerCase(),
          );
          if (match) setCategoryId(match.id);
        }
      })
      .catch(() => setCategories([]));
  }, [open]);

  // ── Image handlers ──
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setImagePreviews((prev) => [
      ...prev,
      ...files.map((file) => ({ preview: URL.createObjectURL(file), file })),
    ]);
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
      const newFilesBefore = imagePreviews
        .slice(0, index)
        .filter((p) => p.file).length;
      setAttachmentIds((prev) => prev.filter((_, i) => i !== newFilesBefore));
    }

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit handler ──
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

  // ── Delete handler ──
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

  // ── Add category handler ──
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
