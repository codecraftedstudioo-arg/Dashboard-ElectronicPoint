"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/components/ui";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative h-8 w-[52px] shrink-0 rounded-full border border-card-border bg-input transition-colors",
        className,
      )}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      title={isDark ? "Modo oscuro" : "Modo claro"}
    >
      <span
        className={cn(
          "absolute top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-card text-foreground shadow-sm transition-transform duration-200",
          isDark ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      >
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}
