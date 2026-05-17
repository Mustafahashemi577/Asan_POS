import useSWR from "swr";

import {
  getPurchases,
  type PurchasesMeta,
  type PurchasesQuery,
} from "@/queries/purchase";
import type { PurchaseListItem } from "@/types/purchases";

interface UsePurchasesReturn {
  purchases: PurchaseListItem[];
  meta: PurchasesMeta | undefined;
  isLoading: boolean;
  error: unknown;
  mutate: () => void;
}

export function usePurchases(query: PurchasesQuery = {}): UsePurchasesReturn {
  // Include query params in the SWR key so different searches get separate cache entries
  const swr = useSWR(["purchases", query], () => getPurchases(query));

  return {
    purchases: swr.data?.data ?? [],
    meta: swr.data?.meta,
    isLoading: swr.isLoading,
    error: swr.error,
    mutate: swr.mutate,
  };
}
