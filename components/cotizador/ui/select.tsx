"use client";

import { useEffect, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

export function Select({
  label,
  placeholder = "Seleccionar...",
  options,
  value,
  onChange,
  disabled = false,
}: {
  label?: string;
  placeholder?: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div ref={ref} className="relative">
      {label ? (
        <label className="mb-1.5 block text-sm font-medium text-fg">{label}</label>
      ) : null}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left
          transition-all duration-200
          ${
            disabled
              ? "cursor-not-allowed border-line bg-bg-subtle text-fg-subtle dark:bg-gray-800/50"
              : isOpen
                ? "border-accent bg-surface text-fg dark:bg-gray-800"
                : "border-line bg-surface text-fg hover:border-line-strong dark:border-gray-600 dark:bg-gray-800/80"
          }
        `}
      >
        <span className={selectedOption ? "text-fg" : "text-fg-subtle"}>
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={`h-5 w-5 text-fg-subtle transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-line bg-surface py-2 shadow-xl dark:border-gray-600 dark:bg-gray-800">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full px-4 py-2.5 text-left transition-colors
                ${
                  option.value === value
                    ? "bg-accent/15 font-medium text-fg"
                    : "text-fg hover:bg-fg/5 dark:hover:bg-gray-700"
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
