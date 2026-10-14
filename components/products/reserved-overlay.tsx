import { cn } from "@/components/ui";

export function ReservedOverlay({
  active,
  compact = false,
  className,
}: {
  active: boolean;
  compact?: boolean;
  className?: string;
}) {
  if (!active) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/50",
        className,
      )}
    >
      <span
        className={cn(
          "rounded-md border border-white/25 bg-black/80 font-semibold text-white shadow-lg",
          compact
            ? "px-1 py-0.5 text-[8px] tracking-[0.08em]"
            : "px-2.5 py-1 text-[11px] tracking-[0.16em] sm:text-xs",
        )}
      >
        RESERVADO
      </span>
    </div>
  );
}
