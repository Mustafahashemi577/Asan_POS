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
import { ImageIcon, Plus } from "lucide-react";
import { useEffect, useState } from "react";
interface AddEditProductProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
  onSave: (data: any) => void;
}

export function AddEditProduct({
  open,
  onOpenChange,
  product,
  onSave,
}: AddEditProductProps) {
  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price || "");
  const [categoryId, setCategoryId] = useState(product?.categoryId || "");
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.imageUrl || null,
  );

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    onSave({ name, price: Number(price), categoryId, inStock, image });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="h-[95vh] rounded-t-2xl px-4 pt-4 pb-0 flex flex-col"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="text-left text-lg font-semibold">
            {product ? "Edit Product" : "Add Product"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pb-28">
          {/* Image Upload */}
          <label className="block w-full cursor-pointer">
            <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>

          {/* Stock Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Stock</span>
            <Switch checked={inStock} onCheckedChange={setInStock} />
          </div>

          {/* Category Dropdown + Add */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500">
                  <SelectValue placeholder="Choose Categories" />
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
              variant="outline"
              size="icon"
              className="rounded-xl border-gray-200 h-12 w-12 shrink-0"
              onClick={() => {
                /* open add category flow */
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Product Name */}
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name Product"
            className="rounded-xl border-gray-200 px-4 py-3 text-sm"
          />

          {/* Price */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              $
            </span>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="rounded-xl border-gray-200 pl-8 pr-4 py-3 text-sm"
            />
          </div>
        </div>

        {/* Sticky Submit Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white">
          <Button
            onClick={handleSubmit}
            className="w-full bg-black text-white hover:bg-black/90 rounded-xl py-4 text-base font-medium"
          >
            {product ? "Save Changes" : "Add Product"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
