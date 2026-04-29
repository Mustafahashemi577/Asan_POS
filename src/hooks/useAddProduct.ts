import { useState, useRef } from "react";
import {
  uploadProductImage,
  createProduct,
  claimProductAttachment,
} from "@/queries/products";

export function useAddProduct(onSuccess: () => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attachmentId, setAttachmentId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // Called when user picks a file — uploads immediately
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setIsUploading(true);
    setError("");

    try {
      const id = await uploadProductImage(file);
      setAttachmentId(id);
    } catch {
      setImagePreview(null);
      setAttachmentId(null);
      setError("Image upload failed. Please try again.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploading(false);
    }
  };

  // Called on form submit
  const handleSubmit = async (data: {
    name: string;
    price: number;
    categoryName: string;
  }) => {
    setError("");
    try {
      // Step 1 — create product
      const res = await createProduct(data);
      const productId = res.data.id;

      // Step 2 — claim attachment if image was uploaded
      if (attachmentId && productId) {
        await claimProductAttachment(attachmentId, productId);
      }

      // Step 3 — reset and notify parent
      setImagePreview(null);
      setAttachmentId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg[0] : msg || "Failed to create product.",
      );
      throw err; // let form know submission failed
    }
  };

  return {
    fileInputRef,
    imagePreview,
    attachmentId,
    isUploading,
    error,
    handleImageSelect,
    handleSubmit,
  };
}
