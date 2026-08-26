"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import { Button, Input, Select } from "@/components/ui";
import { compareIphoneModelsDesc } from "@/lib/iphone-model-sort";
import type { PublicCatalogProduct } from "@/lib/public-catalog";

const STORAGE_FILTERS = ["128GB", "256GB", "512GB", "1TB"] as const;

type SortOption = "newest" | "price-asc" | "price-desc" | "battery";

export function CatalogGrid({
  products,
  models,
}: {
  products: PublicCatalogProduct[];
  models: string[];
}) {
  const [search, setSearch] = useState("");
  const [model, setModel] = useState("ALL");
  const [storage, setStorage] = useState("ALL");
  const [sort, setSort] = useState<SortOption>("newest");

  const hasActiveFilters =
    search.trim() !== "" ||
    model !== "ALL" ||
    storage !== "ALL" ||
    sort !== "newest";

  function clearFilters() {
    setSearch("");
    setModel("ALL");
    setStorage("ALL");
    setSort("newest");
  }

  const filtered = useMemo(() => {
    let list = [...products];
    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.storage.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q),
      );
    }
    if (model !== "ALL") {
      list = list.filter((p) => p.name === model);
    }
    if (storage !== "ALL") {
      list = list.filter(
        (p) => p.storage.replace(/\s/g, "").toUpperCase() === storage,
      );
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case "price-desc":
        list.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case "battery":
        list.sort(
          (a, b) => (b.batteryCondition ?? 0) - (a.batteryCondition ?? 0),
        );
        break;
      default:
        list.sort((a, b) => compareIphoneModelsDesc(a.name, b.name));
        break;
    }

    return list;
  }, [products, search, model, storage, sort]);

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-2xl border border-card-border bg-card p-4 shadow-[var(--shadow)]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            className="pl-9"
            placeholder="Buscar iPhone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="ALL">Modelo: todos</option>
            {models.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
          <Select value={storage} onChange={(e) => setStorage(e.target.value)}>
            <option value="ALL">Capacidad: todas</option>
            {STORAGE_FILTERS.map((opt) => (
              <option key={opt} value={opt}>
                {opt.replace("GB", " GB").replace("TB", " TB")}
              </option>
            ))}
          </Select>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
          >
            <option value="newest">Modelo más nuevo</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
            <option value="battery">Mejor batería</option>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Mostrando {filtered.length} de {products.length} equipo
          {products.length === 1 ? "" : "s"}
        </p>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            className="!px-2 !py-1.5 text-xs"
            onClick={clearFilters}
          >
            <X className="h-3.5 w-3.5" />
            Limpiar filtros
          </Button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-card-border bg-card/50 px-6 py-16 text-center">
          <h3 className="text-lg font-semibold text-foreground">
            No hay equipos publicados en este momento.
          </h3>
          <p className="mt-2 text-sm text-muted">
            Probá ajustar los filtros o volvé más tarde.
          </p>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="secondary"
              className="mt-6"
              onClick={clearFilters}
            >
              Limpiar filtros
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <CatalogProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
