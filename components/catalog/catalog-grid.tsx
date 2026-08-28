"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { CatalogModels } from "@/components/catalog/catalog-models";
import { Button, Input, Select } from "@/components/ui";
import { compareIphoneModelsDesc } from "@/lib/iphone-model-sort";
import {
  groupPublishedIphonesByModel,
  type PublicCatalogProduct,
} from "@/lib/public-catalog";

const STORAGE_FILTERS = ["128GB", "256GB", "512GB", "1TB"] as const;

type SortOption = "newest" | "price-asc" | "price-desc" | "battery";

export function CatalogGrid({
  products,
}: {
  products: PublicCatalogProduct[];
}) {
  const [search, setSearch] = useState("");
  const [model, setModel] = useState("ALL");
  const [storage, setStorage] = useState("ALL");
  const [sort, setSort] = useState<SortOption>("newest");

  const models = useMemo(
    () =>
      [...new Set(products.map((product) => product.name))].sort(
        compareIphoneModelsDesc,
      ),
    [products],
  );

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

  const groups = useMemo(
    () => groupPublishedIphonesByModel(filtered, { preserveOrder: true }),
    [filtered],
  );

  return (
    <div className="min-w-0 space-y-5">
      <div className="rounded-2xl border border-card-border bg-card p-3 shadow-[var(--shadow)] sm:p-4">
        <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-9"
              placeholder="Buscar equipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar equipo"
            />
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:w-[min(100%,28rem)] lg:shrink-0">
            <Select
              className="min-w-0 max-w-full"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              aria-label="Filtrar por modelo"
            >
              <option value="ALL">Modelo: todos</option>
              {models.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
            <Select
              className="min-w-0 max-w-full"
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
              aria-label="Filtrar por capacidad"
            >
              <option value="ALL">Capacidad: todas</option>
              {STORAGE_FILTERS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.replace("GB", " GB").replace("TB", " TB")}
                </option>
              ))}
            </Select>
            <Select
              className="col-span-2 min-w-0 max-w-full sm:col-span-1"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              aria-label="Ordenar por"
            >
              <option value="newest">Ordenar: modelo más nuevo</option>
              <option value="price-asc">Ordenar: menor precio</option>
              <option value="price-desc">Ordenar: mayor precio</option>
              <option value="battery">Ordenar: mejor batería</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
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
        <div className="rounded-2xl border border-dashed border-card-border bg-card/50 px-6 py-14 text-center">
          <h3 className="text-lg font-semibold text-foreground">
            No encontramos equipos
          </h3>
          <p className="mt-2 text-sm text-muted">
            Probá cambiar los filtros o realizar otra búsqueda.
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
        <CatalogModels groups={groups} />
      )}
    </div>
  );
}
