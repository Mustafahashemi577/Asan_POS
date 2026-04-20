import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const GENDER_OPTIONS = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
];

interface Props {
    value: string;
    onChange: (val: string) => void;
}

export default function GenderDropdown({ value, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const selected = GENDER_OPTIONS.find((o) => o.value === value);

    return (
        <div ref={ref} className="relative">
            {/* Trigger button — same style as Input */}
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className="w-full h-10 border border-gray-200 rounded-xl px-4 text-sm text-left bg-white flex items-center justify-between hover:border-gray-300 transition-colors"
            >
                <span className={selected ? "text-gray-900" : "text-gray-400"}>
                    {selected ? selected.label : "Select gender"}
                </span>
                <ChevronDown size={15} className="text-gray-400 shrink-0" />
            </button>

            {/* Dropdown list — fully styled with rounded corners */}
            {open && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {GENDER_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => { onChange(option.value); setOpen(false); }}
                            className={`w-full text-left px-4 h-10 flex items-center text-sm transition-colors hover:bg-gray-50
                                ${value === option.value ? "text-gray-900 font-medium bg-gray-50" : "text-gray-600"}
                            `}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
