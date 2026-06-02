import { usePagination } from "@/hooks/use-pagination";
import { useSearch } from "@/hooks/use-search";
import { getUsers, usersKey } from "@/queries/user";
import type { User } from "@/types/user";
import { useState } from "react";
import useSWR from "swr";

const PAGE_SIZE = 15;

export interface UseUsersReturn {
  users: User[];
  total: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  page: number;
  setPage: (page: number) => void;
  search: string;
  handleSearch: (value: string) => void;
  clearSearch: () => void;
  role: string;
  setRole: (role: string) => void;
  mutate: () => void;
  isLoading: boolean;
  PAGE_SIZE: number;
}

export function useUsers(): UseUsersReturn {
  const { page, setPage, resetToPage1 } = usePagination({
    initialPage: 1,
    initialItemsPerPage: PAGE_SIZE,
  });

  const { search, debouncedSearch, handleSearch, clearSearch } = useSearch({
    onSearch: resetToPage1,
  });

  const [role, setRole] = useState<string>("ALL");

  const swrKey = usersKey({
    search: debouncedSearch,
    page,
    itemsPerPage: PAGE_SIZE,
    role: role !== "ALL" ? role : undefined,
  });

  const { data, mutate, isLoading } = useSWR(swrKey, () =>
    getUsers({
      search: debouncedSearch,
      page,
      itemsPerPage: PAGE_SIZE,
      role: role !== "ALL" ? role : undefined,
    }),
  );

  const totalItems = data?.meta?.totalItems ?? 0;
  const itemsPerPage = data?.meta?.itemsPerPage ?? PAGE_SIZE;

  return {
    users: data?.data ?? [],
    total: totalItems,
    totalItems,
    totalPages: data?.meta?.totalPages ?? 1,
    itemsPerPage,
    page,
    setPage,
    search,
    handleSearch,
    clearSearch,
    role,
    setRole,
    mutate,
    isLoading,
    PAGE_SIZE,
  };
}
