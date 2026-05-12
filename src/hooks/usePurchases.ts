import useSWR from "swr";

import { getPurchases } from "@/queries/purchase";

export function usePurchases() {
  const swr = useSWR("/purchase", getPurchases);

  return {
    purchases: Array.isArray(swr.data) ? swr.data : [],
    isLoading: swr.isLoading,
    error: swr.error,
    mutate: swr.mutate,
  };
}
