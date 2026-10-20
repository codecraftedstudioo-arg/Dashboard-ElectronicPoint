import type { CSSProperties } from "react";
import { colorMap } from "@/components/cotizador/colors";

const EXTRA: Record<string, string> = {
  "space gray": "#8e8e93",
  "gris espacial": "#8e8e93",
  graphite: "#54524f",
  grafito: "#54524f",
  midnight: "#1c1c1e",
  medianoche: "#1c1c1e",
  natural: "#c8b8a4",
  starlight: "#f2eadf",
  purple: "#5e4b8b",
  lila: "#b4a7d6",
  morado: "#5e4b8b",
  gold: "#d4af6a",
  dorado: "#d4af6a",
  red: "#c41e3a",
  rojo: "#c41e3a",
  "(product)red": "#c41e3a",
  "product red": "#c41e3a",
  "sierra blue": "#9bb5ce",
  "alpine green": "#576856",
  "pacific blue": "#2d4e6b",
  "deep purple": "#5a4a78",
  desert: "#c4a882",
  "desert titanium": "#c4a882",
  "natural titanium": "#c2b8a8",
  "black titanium": "#3a3a3c",
  "white titanium": "#f2f1ed",
  "blue titanium": "#3d4f66",
  azul: "#5b7dbf",
  negro: "#1c1c1e",
  blanco: "#f5f5f0",
  rosa: "#ffb6c1",
  amarillo: "#ffd700",
  verde: "#3d8c40",
  plateado: "#c9cdd3",
  naranja: "#d97a32",
  celeste: "#87ceeb",
};

function resolveHex(name: string): string | null {
  const key = name.trim().toLowerCase();
  if (!key) return null;
  if (EXTRA[key]) return EXTRA[key];
  const match = Object.entries(colorMap).find(
    ([label]) => label.toLowerCase() === key,
  );
  return match ? match[1] : null;
}

function isLight(hex: string): boolean {
  const value = hex.replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return (0.299 * red + 0.587 * green + 0.114 * blue) / 255 > 0.72;
}

export function deviceColorBadgeStyle(name: string): CSSProperties | undefined {
  const hex = resolveHex(name);
  if (!hex) return undefined;
  const light = isLight(hex);
  return {
    backgroundColor: hex,
    color: light ? "#1d1d1f" : "#ffffff",
    borderColor: light ? "rgba(0,0,0,0.14)" : hex,
  };
}
