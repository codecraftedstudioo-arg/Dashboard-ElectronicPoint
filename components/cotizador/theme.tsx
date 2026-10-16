"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "usados-cotizador-theme";

const ThemeContext = createContext<{ isDark: boolean; toggle: () => void }>({
  isDark: false,
  toggle: () => {},
});

export function useCotizadorTheme() {
  return useContext(ThemeContext);
}

/** Light is the starting theme. A saved choice still wins. */
export function CotizadorTheme({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark") setIsDark(true);
    } catch {
      /* keep the light default */
    }
  }, []);

  function toggle() {
    setIsDark((current) => {
      const next = !current;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      } catch {
        /* the choice still applies for this visit */
      }
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      <div className={isDark ? "cotizador dark" : "cotizador"}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { isDark, toggle } = useCotizadorTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className={[
        "group relative inline-flex h-8 w-[58px] shrink-0 cursor-pointer items-center rounded-full border p-1 backdrop-blur-md transition-colors duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        isDark ? "border-white/15 bg-white/[0.06]" : "border-black/10 bg-black/[0.04]",
        className,
      ].join(" ")}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute top-1 left-1 h-6 w-6 rounded-full blur-md transition-all duration-500 ${
          isDark ? "translate-x-[26px] bg-indigo-400/30" : "translate-x-0 bg-amber-300/45"
        }`}
      />
      <span
        className={[
          "relative z-10 grid h-6 w-6 place-items-center overflow-hidden rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.25)] ring-1",
          "transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
          isDark
            ? "translate-x-[26px] bg-gradient-to-br from-[#363b4f] to-[#1b1e2a] ring-white/20"
            : "translate-x-0 bg-white ring-black/5",
        ].join(" ")}
      >
        <svg
          viewBox="0 0 24 24"
          className={`absolute h-4 w-4 text-[#FFB300] transition-all duration-500 ${
            isDark ? "scale-50 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          }`}
          fill="none"
          aria-hidden
        >
          <circle cx="12" cy="12" r="4.6" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="2.4" x2="12" y2="4.7" />
            <line x1="12" y1="19.3" x2="12" y2="21.6" />
            <line x1="2.4" y1="12" x2="4.7" y2="12" />
            <line x1="19.3" y1="12" x2="21.6" y2="12" />
            <line x1="5.45" y1="5.45" x2="7.05" y2="7.05" />
            <line x1="16.95" y1="16.95" x2="18.55" y2="18.55" />
            <line x1="5.45" y1="18.55" x2="7.05" y2="16.95" />
            <line x1="16.95" y1="7.05" x2="18.55" y2="5.45" />
          </g>
        </svg>
        <svg
          viewBox="0 0 24 24"
          className={`absolute h-[14px] w-[14px] text-[#dfe3f2] transition-all duration-500 ${
            isDark ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0"
          }`}
          fill="none"
          aria-hidden
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
        </svg>
      </span>
    </button>
  );
}
