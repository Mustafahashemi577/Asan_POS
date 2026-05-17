import { useSearch } from "@/hooks/use-search";
import { getCategories } from "@/queries/category";
import useSWR from "swr";

export function useCategories() {
  const { search, debouncedSearch, handleSearch, clearSearch } = useSearch();

  const { data: categories, mutate } = useSWR(
    ["categories", debouncedSearch],
    () => getCategories(debouncedSearch),
  );

  return {
    categories: categories ?? [],
    search,
    handleSearch,
    clearSearch,
    mutate,
  };
}
