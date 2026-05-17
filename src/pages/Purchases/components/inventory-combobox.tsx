import { useEffect, useState } from "react";

import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import type { Inventory } from "@/queries/inventory";
import { getInventories } from "@/queries/inventory";

// ── useDebounce ───────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface InventoryComboboxProps {
  value: string;
  onChange: (id: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function InventoryCombobox({
  value,
  onChange,
}: InventoryComboboxProps) {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getInventories({
      page: 1,
      itemsPerPage: 20,
      search: debouncedSearch.trim() || undefined,
    })
      .then(({ data }) => {
        if (!cancelled) setInventories(data);
      })
      .catch(() => {
        if (!cancelled) setInventories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  const selected = inventories.find((inv) => inv.id === value);

  return (
    <Combobox
      value={value}
      onValueChange={(val: string) => {
        onChange(val);
        setSearch("");
      }}
    >
      <ComboboxInput
        className="h-11 pl-9 rounded-xl border-gray-200 text-sm w-full"
        placeholder={selected ? selected.name : "Assign to inventory…"}
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearch(e.target.value)
        }
        showClear={!!value}
      />
      <ComboboxContent>
        <ComboboxList>
          {loading ? (
            <p className="px-4 py-3 text-xs text-muted-foreground">
              Searching…
            </p>
          ) : (
            <ComboboxEmpty>No inventories found</ComboboxEmpty>
          )}
          {inventories.map((inv) => (
            <ComboboxItem key={inv.id} value={inv.id}>
              <span>{inv.name}</span>
              {inv.address && (
                <span className="text-xs text-muted-foreground ml-1">
                  — {inv.address}
                </span>
              )}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
