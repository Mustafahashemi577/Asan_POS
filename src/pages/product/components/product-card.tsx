import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Minus, Pencil, Plus } from "lucide-react";
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
  const [currentIndex, setCurrentIndex] = useState(0);

  // Support multiple images — fall back to single image array
  const images: string[] =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.url)
      : [product.image];

  const hasMultiple = images.length > 1;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i + 1) % images.length);
  };

  return (
    <div
      key={product.id}
      className="overflow-hidden rounded-xl border border-gray-200"
    >
      {/* Image wrapper */}
      <div
        className="aspect-square relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src={images[currentIndex]}
          alt={product.name}
          className="h-full w-full object-cover px-2 pt-2 rounded-xl"
        />

        {/* Hover overlay */}
        {hovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Left chevron */}
            {hasMultiple && (
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}

            {/* Edit button — slightly bigger than before */}
            <button
              onClick={() => onEditProduct?.(product)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/50 text-white text-sm font-medium backdrop-blur-sm hover:bg-black/65 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>

            {/* Right chevron */}
            {hasMultiple && (
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Dot indicators — only when multiple images */}
        {hasMultiple && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all ${
                  i === currentIndex
                    ? "w-2 h-2 bg-white"
                    : "w-1.5 h-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">
            {product.name}
          </h3>
          <span className="text-sm font-semibold text-foreground">
            {product.price} AFN
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
