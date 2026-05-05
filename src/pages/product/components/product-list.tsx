import ProductCard from "./product-card";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: { id: string; url: string }[]; // full image objects with id for deletion
  category?: string;
  inStock?: boolean;
}

interface ProductListProps {
  products: Product[];
  quantities: Record<string, number>;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onEditProduct?: (product: Product) => void;
}

export function ProductList({
  products,
  quantities,
  onUpdateQuantity,
  onEditProduct,
}: ProductListProps) {
  if (products.length === 0) {
    return (
      <p className="text-center text-gray-400 py-16 text-sm">
        No products found
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          quantities={quantities}
          onUpdateQuantity={onUpdateQuantity}
          onEditProduct={onEditProduct}
        />
      ))}
    </div>
  );
}
