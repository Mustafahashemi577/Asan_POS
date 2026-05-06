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
import { Loader2, Plus } from "lucide-react";
import { AddCategoryDialog } from "./addcategorydialog";
import { ProductImageUpload } from "./productimageupload";
import { useProductForm } from "./useproductform";

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
    fileInputRef,
    handleImageChange,
    handleRemovePreview,
    submitting,
    deleting,
    isLoading,
    handleSubmit,
    handleDelete,
    categoryDialogOpen,
    newCategoryName,
    setNewCategoryName,
    categoryError,
    categorySubmitting,
    openCategoryDialog,
    closeCategoryDialog,
    handleAddCategory,
  } = useProductForm({ open, product, onSave, onDelete, onOpenChange });

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
            <ProductImageUpload
              imagePreviews={imagePreviews}
              imageUploading={imageUploading}
              isLoading={isLoading}
              fileInputRef={fileInputRef}
              onRemove={handleRemovePreview}
              onChange={handleImageChange}
            />

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
                onClick={openCategoryDialog}
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
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="h-11 rounded-xl bg-white border-gray-200 text-sm"
              disabled={isLoading}
            />
          </div>

          {/* Sticky footer */}
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
        </SheetContent>
      </Sheet>

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
