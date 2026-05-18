import { usePagination } from "@/hooks/use-pagination";
import { useSearch } from "@/hooks/use-search";
import { getPurchases, purchasesKey } from "@/queries/purchase";
import { useState } from "react";
import useSWR from "swr";

const PAGE_SIZE = 15;

export function usePurchases() {
  const { page, setPage, resetToPage1 } = usePagination({
    initialPage: 1,
    initialItemsPerPage: PAGE_SIZE,
  });

  const { search, debouncedSearch, handleSearch, clearSearch } = useSearch({
    onSearch: resetToPage1,
  });

  const [status, setStatus] = useState<string>("ALL");

  const swrKey = purchasesKey({
    search: debouncedSearch,
    page,
    itemsPerPage: PAGE_SIZE,
    status: status !== "ALL" ? status : undefined,
  });

  const { data, mutate, isLoading } = useSWR(swrKey, () =>
    getPurchases({
      search: debouncedSearch,
      page,
      itemsPerPage: PAGE_SIZE,
      status: status !== "ALL" ? status : undefined,
    }),
  );

  return {
    purchases: data?.data ?? [],
    total: data?.meta?.total ?? 0,
    totalPages: data?.meta?.totalPages ?? 1,
    page,
    setPage,
    search,
    handleSearch,
    clearSearch,
    status,
    setStatus,
    mutate,
    isLoading,
    PAGE_SIZE,
  };
}
