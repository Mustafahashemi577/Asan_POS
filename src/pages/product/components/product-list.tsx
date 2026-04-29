import ProductCard from "./product-card";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category?: string;
}

interface ProductListProps {
  products: Product[];
  quantities: Record<number, number>;
  onUpdateQuantity: (productId: number, delta: number) => void;
}

export function ProductList({
  products,
  quantities,
  onUpdateQuantity,
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
        />
      ))}
    </div>
  );
}
