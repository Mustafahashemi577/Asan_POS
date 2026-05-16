import { useState } from "react";
import { useDebounce } from "use-debounce";

interface UseSearchOptions {
  debounceMs?: number;
  onSearch?: () => void; // called after debounce clears — e.g. resetToPage1
}

export function useSearch({
  debounceMs = 2000,
  onSearch,
}: UseSearchOptions = {}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, debounceMs);

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch?.();
  };

  const clearSearch = () => {
    setSearch("");
    onSearch?.();
  };

  return {
    search, // raw value — bind to <Input value={search} />
    debouncedSearch, // use this in SWR keys and API calls
    handleSearch, // onChange handler
    clearSearch, // for the X button
  };
}
