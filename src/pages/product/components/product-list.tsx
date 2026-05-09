import ProductCard from "./product-card";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: { id: string; url: string }[];
  category?: string;
  categoryId?: string;
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
      <div className="items-center">
        <img
          src="../../../public/photos/NotFound.jpeg"
          alt="Not Found!"
          className="max-h-100 max-w-150 absolute right-200 items-center text-center mt-20"
        />
      </div>
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
