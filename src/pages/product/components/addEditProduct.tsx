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
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AddCategoryDialog } from "./addcategorydialog";
import { ProductImageUpload } from "./productimageupload";
import type { ProductFormData, SavedProduct } from "./useproductform";
import { useProductForm } from "./useproductform";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AddEditProductProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductFormData;
  onSave?: (data: SavedProduct) => void;
  onDelete?: () => void;
}

// ── Detect desktop (lg = 1024px) ──────────────────────────────────────────────

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

// ── Main component ────────────────────────────────────────────────────────────

export function AddEditProduct({
  open,
  onOpenChange,
  product,
  onSave,
  onDelete,
}: AddEditProductProps) {
  const isDesktop = useIsDesktop();
  const title = product ? "Edit Product" : "Add Product";

  const {
    name,
    setName,
    price,
    setPrice,
    categoryId,
    setCategoryId,
    inStock,
    setInStock,
    categories,
    imagePreviews,
    imageUploading,
    isLoading,
    fileInputRef,
    handleImageChange,
    handleRemovePreview,
    submitting,
    deleting,
    handleSubmit,
    handleDelete,
    openCategoryDialog,
    categoryDialogOpen,
    newCategoryName,
    setNewCategoryName,
    categoryError,
    categorySubmitting,
    closeCategoryDialog,
    handleAddCategory,
  } = useProductForm({ open, product, onSave, onDelete, onOpenChange });

  // ── Shared form fields + footer ───────────────────────────────────────────

  const formBody = (
    <>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <ProductImageUpload
          imagePreviews={imagePreviews}
          imageUploading={imageUploading}
          isLoading={isLoading}
          fileInputRef={fileInputRef}
          onRemove={handleRemovePreview}
          onChange={handleImageChange}
        />

        <div className="flex items-center justify-between py-1">
          <span className="text-sm font-medium text-gray-700">Stock</span>
          <Switch checked={inStock} onCheckedChange={setInStock} />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="h-11 w-full rounded-xl border-gray-200 text-sm">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {categories.map((cat) => (
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
            onClick={openCategoryDialog}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product Name"
          className="h-11 rounded-xl bg-white border-gray-200 text-sm"
          disabled={isLoading}
        />

        <div className="relative">
          <span className="absolute left-2 top-12/23 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
            AFN:
          </span>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            className="h-11 rounded-xl bg-white border-gray-200 text-sm pl-12"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="px-5 py-4 border-t border-gray-100 bg-white space-y-2">
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
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {isDesktop ? (
        // Desktop — Sheet from right, unchanged
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent
            side="right"
            className=" m-2.5 rounded-md flex flex-col p-0 gap-0"
          >
            <SheetHeader className="px-5 pt-5 pb-3 border-b border-gray-100">
              <SheetTitle className="text-left text-base font-semibold">
                {title}
              </SheetTitle>
            </SheetHeader>
            {formBody}
          </SheetContent>
        </Sheet>
      ) : (
        // Mobile — plain fixed overlay + card, no Dialog/Sheet at all
        open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed top-[105px] inset-x-0 bottom-0 z-40 bg-black/20 backdrop-blur-[4px]"
              onClick={() => onOpenChange(false)}
            />

            {/* Card */}
            <div className="fixed top-[112px] left-4 right-4 z-50 bg-white rounded-2xl shadow-xl flex flex-col max-h-[calc(100dvh-89px)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
                <span className="text-base font-semibold text-gray-900">
                  {title}
                </span>
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {formBody}
            </div>
          </>
        )
      )}

      <AddCategoryDialog
        open={categoryDialogOpen}
        onOpenChange={(o) => !o && closeCategoryDialog()}
        value={newCategoryName}
        onChange={setNewCategoryName}
        onSubmit={handleAddCategory}
        error={categoryError}
        submitting={categorySubmitting}
      />
    </>
  );
}
