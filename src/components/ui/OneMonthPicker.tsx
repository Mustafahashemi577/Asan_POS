import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useMemo } from "react";

import DateInput from "./DateInput";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

function addOneMonth(dateStr: string) {
  const d = new Date(dateStr);
  const result = new Date(d);
  result.setMonth(result.getMonth() + 1);
  return result;
}

export default function OneMonthPicker({ value, onChange }: Props) {
  const start = value ? new Date(value) : null;
  const end = value ? addOneMonth(value) : null;

  const display = useMemo(() => {
    if (!start || !end) return "Select date";
    return `${format(start, "dd MMM yyyy")} - ${format(end, "dd MMM yyyy")}`;
  }, [start, end]);

  return (
    <div className="relative w-fit">
      {/* ✅ Your designed pill */}
      <div className="flex items-center gap-3 transition px- py-3 cursor-pointer">
        <CalendarDays className="w-5 h-5 text-gray-500" />
        <span className="text-sm font-medium text-gray-600">{display}</span>
      </div>

      {/* ✅ REAL DateInput on top (invisible but clickable) */}
      <div className="absolute inset-0 opacity-0">
        <DateInput value={value} onChange={onChange} />
      </div>
    </div>
  );
}
