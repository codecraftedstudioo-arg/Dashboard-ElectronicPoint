"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  generateEquipmentList,
  type ListProduct,
} from "@/lib/list-generator";
import type { ListFieldKey, ListSortOption, ListSelectOption } from "@/lib/constants";
import { Button, Card, Input, Label, Select, cn } from "@/components/ui";

const defaultFields: Record<ListFieldKey, boolean> = {
  modelStorage: true,
  color: true,
  battery: true,
  price: true,
  condition: false,
};

function renderPreviewLine(line: string) {
  const parts = line.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(1, -1)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function ListGenerator({
  products,
  compact = false,
}: {
  products: ListProduct[];
  compact?: boolean;
}) {
  const [title, setTitle] = useState("LISTA IPHONE USADOS 📱");
  const [subtitle, setSubtitle] = useState("(30 días de Garantía)");
  const [select, setSelect] = useState<ListSelectOption>("available");
  const [sort, setSort] = useState<ListSortOption>("newest");
  const [modelFilter, setModelFilter] = useState("");
  const [fields, setFields] = useState(defaultFields);
  const [preview, setPreview] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);

  const options = useMemo(
    () => ({
      title,
      subtitle,
      fields,
      sort,
      select,
      modelFilter,
      selectedIds,
    }),
    [title, subtitle, fields, sort, select, modelFilter, selectedIds],
  );

  const livePreview = preview || generateEquipmentList(products, options);

  function handleGenerate() {
    setPreview(generateEquipmentList(products, options));
    setGenerated(true);
    setCopied(false);
  }

  async function handleCopy() {
    const text = preview || generateEquipmentList(products, options);
    if (!preview) setPreview(text);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleField(key: ListFieldKey) {
    setFields((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <Card className={cn("flex h-full flex-col", compact && "p-4")}>
      <div>
        <h2 className="text-base font-semibold text-white md:text-lg">
          Generar lista de equipos
        </h2>
        <p className="mt-1 text-sm text-muted">
          Crea una lista para copiar y compartir.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Subtítulo</Label>
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Seleccionar equipos</Label>
          <Select
            value={select}
            onChange={(e) => setSelect(e.target.value as ListSelectOption)}
          >
            <option value="available">Todos los disponibles</option>
            <option value="all">Todos</option>
            <option value="manual">Seleccionar manualmente</option>
            <option value="iphone">Solo iPhone</option>
            <option value="macbook">Solo MacBook</option>
            <option value="model">Filtrar por modelo</option>
          </Select>
        </div>

        {select === "model" ? (
          <div>
            <Label>Modelo</Label>
            <Input
              placeholder="Ej: iPhone 15"
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
            />
          </div>
        ) : null}

        {select === "manual" ? (
          <div className="max-h-36 space-y-2 overflow-y-auto rounded-xl border border-card-border p-3">
            {products.map((p) => {
              const checked = selectedIds.includes(p.id);
              return (
                <label key={p.id} className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setSelectedIds((prev) =>
                        checked
                          ? prev.filter((id) => id !== p.id)
                          : [...prev, p.id],
                      )
                    }
                    className="accent-accent"
                  />
                  {p.name} {p.storage} {p.color}
                </label>
              );
            })}
          </div>
        ) : null}

        <div>
          <Label>Ordenar por</Label>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as ListSortOption)}
          >
            <option value="model-asc">Modelo (A - Z)</option>
            <option value="model-desc">Modelo (Z - A)</option>
            <option value="price-asc">Precio menor a mayor</option>
            <option value="price-desc">Precio mayor a menor</option>
            <option value="storage">Capacidad</option>
            <option value="battery">Batería</option>
            <option value="newest">Más nuevos</option>
            <option value="oldest">Más antiguos</option>
          </Select>
        </div>

        <div>
          <Label>Campos a incluir</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(
              [
                ["modelStorage", "Modelo y capacidad"],
                ["color", "Color"],
                ["battery", "Batería"],
                ["price", "Precio"],
                ["condition", "Estado físico"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-300"
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border",
                    fields[key]
                      ? "border-accent bg-accent text-black"
                      : "border-card-border bg-transparent",
                  )}
                >
                  {fields[key] ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={fields[key]}
                  onChange={() => toggleField(key)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <Button className="w-full" onClick={handleGenerate}>
          Generar lista
        </Button>
      </div>

      <div className="mt-5 flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium text-zinc-300">Vista previa</div>
          {generated ? (
            <span className="text-[11px] text-accent">Lista actualizada</span>
          ) : null}
        </div>
        <div className="relative flex-1 overflow-hidden rounded-2xl border border-[#1f2a32] bg-[#0b141a] p-3">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 40%, #fff 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="relative max-h-64 overflow-y-auto rounded-2xl bg-whatsapp p-4 text-[13px] leading-relaxed text-zinc-100 shadow-lg">
            {livePreview.split("\n").map((line, i) => (
              <div key={i} className={line === "" ? "h-2" : ""}>
                {renderPreviewLine(line)}
              </div>
            ))}
          </div>
        </div>

        <Button variant="secondary" className="mt-3 w-full" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="h-4 w-4 text-accent" />
              Lista copiada ✓
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copiar lista
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
