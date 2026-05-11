import useSWR from "swr";

import { getCustomers } from "@/queries/customer";

export function useCustomers() {
  const swr = useSWR("/customer", getCustomers);

  return {
    customers: swr.data ?? [],
    isLoading: swr.isLoading,
    error: swr.error,
    mutate: swr.mutate,
  };
}
