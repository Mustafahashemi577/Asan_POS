import { Calendar, ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function DateInput({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const parsed = value ? new Date(value) : null;
  const [viewYear, setViewYear] = useState(
    parsed?.getFullYear() ?? new Date().getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    parsed?.getMonth() ?? new Date().getMonth(),
  );

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const selectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const displayValue = parsed
    ? parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "";

  const selectedDay = parsed?.getDate();
  const selectedMonth = parsed?.getMonth();
  const selectedYear = parsed?.getFullYear();

  return (
    <div className="relative">
      {/* Trigger */}
      <Button
        type="button"
        onClick={() => setOpen((p) => !p)}
        variant="outline"
        className="w-full h-12 border border-gray-200 rounded-xl px-4 text-sm text-left bg-white flex items-center justify-between hover:border-gray-300"
      >
        <span className={displayValue ? "text-gray-700" : "text-gray-400"}>
          {displayValue || "Select date"}
        </span>
        <Calendar size={15} className="text-gray-400" />
      </Button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 p-4 w-72">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            {/* Month Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 justify-between text-xs h-8 rounded-xl"
                >
                  {MONTHS[viewMonth]}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0 w-40 rounded-xl">
                <Command>
                  <CommandGroup>
                    {MONTHS.map((m, i) => (
                      <CommandItem key={m} onSelect={() => setViewMonth(i)}>
                        {m}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Year Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 justify-between text-xs h-8 rounded-xl"
                >
                  {viewYear}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-1 w-32 rounded-xl">
                <div className="max-h-60 overflow-y-auto">
                  {Array.from({ length: 120 }).map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <Button
                        key={year}
                        type="button"
                        variant="outline"
                        onClick={() => setViewYear(year)}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-md hover:bg-gray-100

            ${year === viewYear ? "bg-gray-100 font-medium" : ""}`}
                      >
                        {year}
                      </Button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div
                key={d}
                className="text-center text-[10px] text-gray-400 py-1"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={i} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                day === selectedDay &&
                viewMonth === selectedMonth &&
                viewYear === selectedYear;

              return (
                <Button
                  key={day}
                  onClick={() => selectDay(day)}
                  variant="outline"
                  className={`w-8 h-8 mx-auto text-xs rounded-lg flex items-center justify-center
                    ${
                      isSelected
                        ? "bg-gray-900 text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  {day}
                </Button>
              );
            })}
          </div>

          {/* Clear */}
          {value && (
            <Button
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600"
              variant="outline"
            >
              Clear date
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
