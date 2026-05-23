import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/pages/product/components/product-list";
import type { InventoryProduct } from "@/types/inventory";
import { Loader2, Package, Scale, Tag } from "lucide-react";

interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: InventoryProduct | null;
  productDetail: Product | null;
  loading: boolean;
}

function stockStatus(quantity: number): {
  label: string;
  className: string;
} {
  if (quantity === 0)
    return { label: "Out of Stock", className: "bg-red-100 text-red-600" };
  if (quantity <= 10)
    return { label: "Low Stock", className: "bg-orange-100 text-orange-600" };
  return { label: "In Stock", className: "bg-green-100 text-green-700" };
}

export function ProductDetailDialog({
  open,
  onOpenChange,
  product,
  productDetail,
  loading,
}: ProductDetailDialogProps) {
  if (!product) return null;

  const { label: statusLabel, className: statusClass } = stockStatus(
    product.quantity,
  );

  // Use productDetail image if available (with signed URL), fallback to product.image
  const imageUrl = productDetail?.images?.[0]?.url ?? product.image ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          {/* Product Image */}
          <div className="relative h-52 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center overflow-hidden">
            {loading ? (
              <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.png";
                }}
              />
            ) : (
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gray-200 text-gray-600 text-2xl font-bold">
                {product.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6 space-y-5">
            {/* Name and Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  {loading ? (
                    <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    product.name
                  )}
                </h2>
              </div>
              <Badge className={statusClass}>{statusLabel}</Badge>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-gray-500">
                  <Package size={16} />
                  <span className="text-xs font-medium">Quantity</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {product.quantity.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">units in stock</p>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-gray-500">
                  <Tag size={16} />
                  <span className="text-xs font-medium">Unit Price</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {loading ? (
                    <div className="h-6 w-20 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    product.price.toLocaleString("id-ID")
                  )}
                </p>
                <p className="text-xs text-gray-400">AFN per unit</p>
              </div>
            </div>

            {/* Total Value */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-600">
                  <Scale size={16} />
                  <span className="text-xs font-medium">Total Value</span>
                </div>
                {loading ? (
                  <div className="h-6 w-24 bg-blue-200 animate-pulse rounded" />
                ) : (
                  <p className="text-lg font-bold text-blue-700">
                    {(product.price * product.quantity).toLocaleString("id-ID")}{" "}
                    AFN
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
