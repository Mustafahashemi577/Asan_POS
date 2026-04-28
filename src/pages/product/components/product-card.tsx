import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import type { Product } from "./product-list";

interface ProductCardProps {
  product: Product;
  quantities: Record<number, number>;
  onUpdateQuantity: (productId: number, delta: number) => void;
}

const ProductCard = ({
  product,
  quantities,
  onUpdateQuantity,
}: ProductCardProps) => {
  return (
    <div
      key={product.id}
      className="overflow-hidden rounded-xl bg-background border border-gray-200"
    >
      <div className="aspect-square ">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover px-2 pt-2 rounded-xl"
        />
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
