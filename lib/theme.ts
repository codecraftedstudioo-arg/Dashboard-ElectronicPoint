export type Theme = "dark" | "light";

export const THEME_COOKIE = "stock-apple-theme";
export const THEME_STORAGE_KEY = "stock-apple-theme";

export function parseTheme(value: string | null | undefined): Theme {
  return value === "light" ? "light" : "dark";
}
