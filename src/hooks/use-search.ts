import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";

interface UseSearchOptions {
  debounceMs?: number;
  onSearch?: () => void;
}

export function useSearch({
  debounceMs = 400,
  onSearch,
}: UseSearchOptions = {}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, debounceMs);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // skip on mount — don't call onSearch on initial load
    }
    onSearch?.(); // fires only after the 400ms debounce settles
  }, [debouncedSearch]);

  const handleSearch = (value: string) => {
    setSearch(value); // just update raw value
  };

  const clearSearch = () => {
    setSearch(""); // onSearch fires via useEffect when debouncedSearch clears
  };

  return { search, debouncedSearch, handleSearch, clearSearch };
}
