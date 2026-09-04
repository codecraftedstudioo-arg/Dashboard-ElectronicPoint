"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge, Card, Input, Select } from "@/components/ui";
import { Money } from "@/components/currency/currency-toggle";
import { calcProfit, formatMargin } from "@/lib/calculations";
import {
  CONDITION_COLORS,
  PHYSICAL_CONDITION_LABELS,
  PRODUCT_TYPE_LABELS,
} from "@/lib/constants";
import { primaryImageUrl } from "@/lib/images";
import type { PhysicalCondition, ProductType } from "@prisma/client";

type InventoryItem = {
  id: string;
  internalCode: string;
  type: ProductType;
  name: string;
  storage: string;
  color: string;
  imei: string | null;
  batteryCondition: number | null;
  physicalCondition: PhysicalCondition;
  cost: number;
  salePrice: number;
  isPublished: boolean;
  createdAt: Date | string;
  images: { url: string; isPrimary: boolean }[];
};

export function InventoryGrid({ products }: { products: InventoryItem[] }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [condition, setCondition] = useState("ALL");
  const [storage, setStorage] = useState("ALL");
  const [battery, setBattery] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const storageOptions = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.storage))).sort();
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.internalCode.toLowerCase().includes(q) ||
          p.storage.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q) ||
          (p.imei?.toLowerCase().includes(q) ?? false),
      );
    }
    if (type !== "ALL") list = list.filter((p) => p.type === type);
    if (condition !== "ALL")
      list = list.filter((p) => p.physicalCondition === condition);
    if (storage !== "ALL") list = list.filter((p) => p.storage === storage);
    if (battery !== "ALL") {
      list = list.filter((p) => {
        const b = p.batteryCondition;
        if (b == null) return false;
        if (battery === "90+") return b >= 90;
        if (battery === "80-89") return b >= 80 && b < 90;
        if (battery === "<80") return b < 80;
        return true;
      });
    }
    if (minPrice) list = list.filter((p) => p.salePrice >= Number(minPrice));
    if (maxPrice) list = list.filter((p) => p.salePrice <= Number(maxPrice));

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case "price-desc":
        list.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case "model":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "battery":
        list.sort(
          (a, b) => (b.batteryCondition ?? -1) - (a.batteryCondition ?? -1),
        );
        break;
      default:
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
    return list;
  }, [products, search, type, condition, storage, battery, sort, minPrice, maxPrice]);

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            className="pl-9"
            placeholder="Buscar por modelo, código, capacidad o color"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="ALL">Tipo: todos</option>
            <option value="IPHONE">iPhone</option>
            <option value="MACBOOK">MacBook</option>
          </Select>
          <Select value={storage} onChange={(e) => setStorage(e.target.value)}>
            <option value="ALL">Capacidad: todas</option>
            {storageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
          <Select value={battery} onChange={(e) => setBattery(e.target.value)}>
            <option value="ALL">Batería: todas</option>
            <option value="90+">90% o más</option>
            <option value="80-89">80% – 89%</option>
            <option value="<80">Menos de 80%</option>
          </Select>
          <Select value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="ALL">Estado: todos</option>
            {Object.entries(PHYSICAL_CONDITION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Precio mín"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Precio máx"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Más nuevos</option>
            <option value="price-asc">Precio ↑</option>
            <option value="price-desc">Precio ↓</option>
            <option value="model">Modelo</option>
            <option value="battery">Batería</option>
          </Select>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((product) => {
          const img = primaryImageUrl(product.images);
          const profit = calcProfit(product.salePrice, product.cost);
          return (
            <Link key={product.id} href={`/equipos/${product.id}`}>
              <Card className="h-full transition-colors hover:border-accent/30">
                <div className="flex gap-3">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-input">
                    {img ? (
                      <Image src={img} alt={product.name} fill className="object-cover" unoptimized />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted">{product.internalCode}</div>
                    <div className="truncate font-medium text-foreground">
                      {product.name}
                    </div>
                    <div className="mt-1 text-sm text-muted">
                      {product.storage} · {product.color}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge className="border-card-border text-muted">
                        {PRODUCT_TYPE_LABELS[product.type]}
                      </Badge>
                      <Badge className={CONDITION_COLORS[product.physicalCondition]}>
                        {PHYSICAL_CONDITION_LABELS[product.physicalCondition]}
                      </Badge>
                      <Badge
                        className={
                          product.isPublished
                            ? "gap-1.5 border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                            : "gap-1.5 border-zinc-500/30 bg-zinc-500/15 text-zinc-400"
                        }
                      >
                        <span
                          aria-hidden
                          className={
                            product.isPublished
                              ? "h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
                              : "h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"
                          }
                        />
                        {product.isPublished ? "Publicado" : "Oculto"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-card-border pt-3 text-sm">
                  <div>
                    <div className="text-xs text-muted">Venta</div>
                    <div className="font-medium">
                      <Money amount={product.salePrice} />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Ganancia</div>
                    <div className="font-medium text-accent">
                      <Money amount={profit} />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Margen</div>
                    <div className="font-medium">
                      {formatMargin(product.salePrice, product.cost)}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
      {!filtered.length ? (
        <p className="text-sm text-muted">No se encontraron equipos.</p>
      ) : null}
    </div>
  );
}
