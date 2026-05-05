import { Button } from "@/components/ui/button";
import { Minus, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import type { Product } from "./product-list";

interface ProductCardProps {
  product: Product;
  quantities: Record<string, number>;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onEditProduct?: (product: Product) => void;
}

const ProductCard = ({
  product,
  quantities,
  onUpdateQuantity,
  onEditProduct,
}: ProductCardProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      key={product.id}
      className="overflow-hidden rounded-xl border border-gray-200"
    >
      {/* Image wrapper with hover overlay */}
      <div
        className="aspect-square relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover px-2 pt-2 rounded-xl"
        />

        {/* Edit overlay — only on hover */}
        {hovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => onEditProduct?.(product)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 text-white text-xs font-medium backdrop-blur-sm hover:bg-black/65 transition-colors"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">
            {product.name}
          </h3>
          <span className="text-sm font-semibold text-foreground">
            {product.price} Afn
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 bg-neutral-100 p-1 rounded-lg">
          <Button
            variant="default"
            size="icon"
            onClick={() => onUpdateQuantity(product.id, -1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex-1 rounded-lg py-1.5 text-center text-sm font-medium text-foreground">
            {quantities[product.id] || 0}
          </div>
          <Button
            variant="default"
            size="icon"
            onClick={() => onUpdateQuantity(product.id, 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
