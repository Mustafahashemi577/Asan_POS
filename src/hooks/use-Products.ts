import useSWR from "swr";

import { getProducts } from "@/queries/products";

export function useProducts() {
  const swr = useSWR("/products", getProducts);

  return {
    products: swr.data ?? [],
    isLoading: swr.isLoading,
    error: swr.error,
  };
}
