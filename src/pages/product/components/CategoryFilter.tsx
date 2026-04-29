import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
}

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const all = [{ id: "all", name: "All" }, ...categories];
  const selectedName = all.find((c) => c.id === selected)?.name ?? "All";

  return (
    <>
      {/* ── Desktop: scrollable pill row ──────────────────────── */}
      <div className="hidden lg:flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {all.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={[
              "shrink-0 h-8 px-4 rounded-full text-sm font-medium border transition-colors",
              selected === cat.id
                ? "bg-white border-blue-500 text-blue-600"
                : "bg-transparent border-gray-200 text-gray-500 hover:text-blue-500 hover:border-blue-300",
            ].join(" ")}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ── Mobile: sheet trigger ──────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700">
            <SlidersHorizontal size={14} className="text-gray-500" />
            <span>{selectedName}</span>
            <ChevronDown size={13} className="text-gray-400 ml-0.5" />
          </button>
        </SheetTrigger>

        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="mb-5">
            <SheetTitle className="text-base">Select Category</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-2 pb-6">
            {all.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelect(cat.id);
                  setSheetOpen(false);
                }}
                className={[
                  "h-11 rounded-xl text-sm font-medium border transition-colors",
                  selected === cat.id
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-400",
                ].join(" ")}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
