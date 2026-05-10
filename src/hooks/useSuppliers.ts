import useSWR from "swr";

import { getSuppliers } from "@/queries/supplier";

export function useSuppliers() {
  const swr = useSWR("/suppliers", getSuppliers);

  return {
    suppliers: swr.data ?? [],
    isLoading: swr.isLoading,
    error: swr.error,
    mutate: swr.mutate,
  };
}
