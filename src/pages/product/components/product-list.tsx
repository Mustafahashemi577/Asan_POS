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
      <div className="flex flex-col items-center text-center justify-center w-full min-h-[60vh] px-4">
        <img
          src="/photos/NotFound2.avif"
          alt="No Products"
          className="
              max-w-50
              max-h-50
              object-contain
            "
        />
        <div>
          <p className="text-lg font-medium text-gray-700">No Products yet!</p>

          <p className="text-sm text-gray-500 mt-2">
            Create your first product to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5">
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
