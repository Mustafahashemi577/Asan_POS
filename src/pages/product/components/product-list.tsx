import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import ProductCard from "./product-card";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface ProductListProps {
  products: Product[];
  quantities: Record<number, number>;
  onUpdateQuantity: (productId: number, delta: number) => void;
}

const categories = ["All", "Drinks", "Food"];

export function ProductList({
  products,
  quantities,
  onUpdateQuantity,
}: ProductListProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search order product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-background"
          />
          <Button className="absolute right-1 top-1/2 -translate-y-1/2 px-6">
            Search
          </Button>
        </div>
      </div>

      {/* Categories and Add Product */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "outline" : "ghost"}
              className={cn(
                "min-w-25.5 border border-gray-200",
                activeCategory === category
                  ? "border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-600"
                  : "text-muted-foreground hover:text-foreground ",
              )}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            product={product}
            quantities={quantities}
            onUpdateQuantity={onUpdateQuantity}
          />
        ))}
      </div>
    </div>
  );
}
