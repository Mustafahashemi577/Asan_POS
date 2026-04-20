import { useState, useRef } from "react";
import { Calendar } from "lucide-react";

interface Props {
    value: string; // format: YYYY-MM-DD
    onChange: (val: string) => void;
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export default function DateInput({ value, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Parse current value
    const parsed = value ? new Date(value) : null;
    const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? new Date().getMonth());

    // Close on outside click
    const handleBlur = (e: React.FocusEvent) => {
        if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
    };

    // Days in month
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();

    const selectDay = (day: number) => {
        const mm = String(viewMonth + 1).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        onChange(`${viewYear}-${mm}-${dd}`);
        setOpen(false);
    };

    const displayValue = parsed
        ? parsed.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
        : "";

    const selectedDay = parsed?.getDate();
    const selectedMonth = parsed?.getMonth();
    const selectedYear = parsed?.getFullYear();

    return (
        <div ref={ref} className="relative" onBlur={handleBlur}>
            {/* Trigger — matches Input style */}
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className="w-full h-12 border border-gray-200 rounded-xl px-4 text-sm text-left bg-white flex items-center justify-between hover:border-gray-300 transition-colors"
            >
                <span className={displayValue ? "text-gray-700" : "text-gray-400"}>
                    {displayValue || "Select date"}
                </span>
                <Calendar size={15} className="text-gray-400 shrink-0" />
            </button>

            {/* Calendar popup — rounded, styled */}
            {open && (
                <div className="absolute bottom-full left-0 mb-1.5 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 p-4 w-72">

                    {/* Month/Year navigation */}
                    <div className="flex items-center justify-between mb-3">
                        <button type="button"
                            onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-500">
                            ‹
                        </button>
                        <span className="text-sm font-semibold text-gray-800">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button type="button"
                            onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-500">
                            ›
                        </button>
                    </div>

                    {/* Year quick-change */}
                    <div className="flex items-center gap-2 mb-3">
                        <button type="button" onClick={() => setViewYear(y => y - 1)}
                            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition">
                            ← {viewYear - 1}
                        </button>
                        <span className="flex-1 text-center text-xs font-medium text-gray-600">{viewYear}</span>
                        <button type="button" onClick={() => setViewYear(y => y + 1)}
                            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition">
                            {viewYear + 1} →
                        </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-1">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                            <div key={d} className="text-center text-[10px] text-gray-400 font-medium py-1">{d}</div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-y-1">
                        {/* Empty cells for first day offset */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const isSelected = day === selectedDay && viewMonth === selectedMonth && viewYear === selectedYear;
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => selectDay(day)}
                                    className={`w-8 h-8 mx-auto flex items-center justify-center text-xs rounded-lg transition-colors
                    ${isSelected
                                            ? "bg-gray-900 text-white font-semibold"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Clear button */}
                    {value && (
                        <button type="button" onClick={() => { onChange(""); setOpen(false); }}
                            className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 py-1.5 rounded-lg transition">
                            Clear date
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}