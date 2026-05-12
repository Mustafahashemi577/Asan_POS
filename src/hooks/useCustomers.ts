import { getCustomers } from "@/queries/customer";
import type { Customer } from "@/types/customer";
import useSWR from "swr";

export function useCustomers() {
  const { data, error, isLoading, mutate } = useSWR("/customer", getCustomers);

  const customers: Customer[] = Array.isArray(data) ? data : [];

  return {
    customers,
    isLoading,
    error,
    mutate,
  };
}
