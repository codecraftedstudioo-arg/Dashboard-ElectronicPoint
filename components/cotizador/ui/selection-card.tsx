import type { ReactNode } from "react";
import { formatCapacity } from "@/components/cotizador/format";

export function SelectionCard({
  selected,
  onClick,
  icon,
  label,
  description,
  disabled = false,
  size = "md",
}: {
  selected: boolean;
  onClick: () => void;
  icon?: ReactNode;
  label: string;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = { sm: "p-3", md: "p-4", lg: "p-5" };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full rounded-xl border-2 text-left transition-all duration-200
        ${sizeClasses[size]}
        ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
        ${
          selected
            ? "border-accent bg-accent/10 shadow-lg shadow-accent/20"
            : "border-line bg-surface hover:border-line-strong hover:bg-bg-subtle dark:bg-white/5 dark:hover:bg-white/10"
        }
      `}
    >
      <div className="flex items-center gap-3">
        {icon ? (
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
              selected ? "bg-accent/20 text-accent" : "bg-fg/5 text-fg-subtle"
            }`}
          >
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className={`truncate font-medium ${selected ? "text-fg" : "text-fg-muted"}`}>
            {label}
          </p>
          {description ? <p className="truncate text-sm text-fg-subtle">{description}</p> : null}
        </div>
        {selected ? (
          <svg className="h-5 w-5 flex-shrink-0 text-accent" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : null}
      </div>
    </button>
  );
}

export function StoragePill({
  value,
  selected,
  onClick,
  disabled,
}: {
  value: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200
        ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
        ${
          selected
            ? "border-transparent bg-accent text-accent-contrast shadow-lg shadow-accent/30"
            : "border-line bg-fg/5 text-fg-muted hover:border-line-strong hover:bg-fg/10 dark:border-transparent dark:hover:border-transparent"
        }
      `}
    >
      {formatCapacity(value)}
    </button>
  );
}

export function ConditionCard({
  selected,
  onClick,
  icon,
  label,
  variant = "good",
}: {
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  variant?: "good" | "warning" | "bad";
}) {
  const variantStyles = {
    good: selected
      ? "border-green-500 bg-green-500/10"
      : "border-line bg-surface hover:border-green-500/50 dark:bg-white/5",
    warning: selected
      ? "border-yellow-500 bg-yellow-500/10"
      : "border-line bg-surface hover:border-yellow-500/50 dark:bg-white/5",
    bad: selected
      ? "border-red-500 bg-red-500/10"
      : "border-line bg-surface hover:border-red-500/50 dark:bg-white/5",
  };
  const iconColor = {
    good: selected ? "text-green-600 dark:text-green-400" : "text-fg-subtle",
    warning: selected ? "text-yellow-600 dark:text-yellow-400" : "text-fg-subtle",
    bad: selected ? "text-red-600 dark:text-red-400" : "text-fg-subtle",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${variantStyles[variant]}`}
    >
      <div className={`h-8 w-8 ${iconColor[variant]}`}>{icon}</div>
      <span className={`text-center text-sm font-medium ${selected ? "text-fg" : "text-fg-muted"}`}>
        {label}
      </span>
    </button>
  );
}

export function ToggleCard({
  selected,
  onClick,
  icon,
  label,
  isPositive = true,
  neutral = false,
}: {
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  isPositive?: boolean;
  neutral?: boolean;
}) {
  const selectedColor = neutral
    ? "border-fg/40 bg-fg/10"
    : isPositive
      ? "border-green-500 bg-green-500/10"
      : "border-red-500 bg-red-500/10";
  const iconSelected = neutral
    ? "text-fg"
    : isPositive
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all duration-200 ${
        selected ? selectedColor : "border-line bg-surface hover:border-line-strong dark:bg-white/5"
      }`}
    >
      <div className={`h-10 w-10 ${selected ? iconSelected : "text-fg-subtle"}`}>{icon}</div>
      <span
        className={`text-center text-sm font-medium leading-tight sm:text-base ${
          selected ? "text-fg" : "text-fg-muted"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
