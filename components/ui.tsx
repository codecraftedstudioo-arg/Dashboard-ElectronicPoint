import { type ReactNode } from "react";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-card-border bg-card p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const variants = {
    primary:
      "bg-accent text-black hover:bg-accent-hover font-semibold shadow-[0_4px_14px_rgba(34,197,94,0.25)]",
    secondary:
      "bg-white/5 text-white border border-card-border hover:bg-white/10",
    ghost: "bg-transparent text-muted hover:text-white hover:bg-white/5",
    danger: "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25",
  };

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-colors disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-card-border bg-[#121212] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-accent/50 focus:ring-1 focus:ring-accent/40",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-card-border bg-[#121212] px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/40",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-card-border bg-[#121212] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-accent/50 focus:ring-1 focus:ring-accent/40",
        className,
      )}
      {...props}
    />
  );
}

export function Label({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("mb-1.5 block text-sm font-medium text-zinc-300", className)}>
      {children}
    </label>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted md:text-base">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
