"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ImagePlus, Star, Trash2, X } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Select,
  Textarea,
  Card,
  cn,
} from "@/components/ui";
import { STORAGE_OPTIONS, PHYSICAL_CONDITION_LABELS } from "@/lib/constants";
import { calcProfit, formatMargin } from "@/lib/calculations";
import { formatUSD } from "@/lib/currency";
import {
  createProduct,
  updateProduct,
  deleteProductImage,
  setPrimaryProductImage,
} from "@/lib/actions";
import type { PhysicalCondition, ProductType } from "@prisma/client";

type ExistingImage = {
  id: string;
  url: string;
  isPrimary: boolean;
};

type ProductFormValues = {
  id?: string;
  type: ProductType;
  name: string;
  storage: string;
  color: string;
  imei?: string | null;
  batteryCondition: number | null;
  physicalCondition: PhysicalCondition;
  cost: number;
  salePrice: number;
  description: string | null;
  images?: ExistingImage[];
};

export function ProductForm({
  initial,
  mode = "create",
}: {
  initial?: ProductFormValues;
  mode?: "create" | "edit";
}) {
  const [type, setType] = useState<ProductType>(initial?.type ?? "IPHONE");
  const [cost, setCost] = useState(initial?.cost ?? 0);
  const [salePrice, setSalePrice] = useState(initial?.salePrice ?? 0);
  const [images, setImages] = useState<ExistingImage[]>(initial?.images ?? []);
  const [pending, startTransition] = useTransition();
  const [busyImageId, setBusyImageId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profit = useMemo(() => calcProfit(salePrice, cost), [salePrice, cost]);
  const margin = useMemo(() => formatMargin(salePrice, cost), [salePrice, cost]);

  const previewUrls = useMemo(
    () => selectedFiles.map((file) => URL.createObjectURL(file)),
    [selectedFiles],
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  function syncFileInput(files: File[]) {
    const input = fileInputRef.current;
    if (!input) return;
    const dt = new DataTransfer();
    files.forEach((file) => dt.items.add(file));
    input.files = dt.files;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setSelectedFiles(files);
  }

  function removeSelectedFile(index: number) {
    const next = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(next);
    syncFileInput(next);
  }

  const action =
    mode === "edit" && initial?.id
      ? updateProduct.bind(null, initial.id)
      : createProduct;

  function handleDeleteImage(imageId: string) {
    if (!initial?.id) return;
    if (!confirm("¿Eliminar esta imagen?")) return;

    setBusyImageId(imageId);
    startTransition(async () => {
      try {
        await deleteProductImage(imageId, initial.id!);
        setImages((prev) => {
          const next = prev.filter((img) => img.id !== imageId);
          if (next.length && !next.some((img) => img.isPrimary)) {
            return next.map((img, i) => ({ ...img, isPrimary: i === 0 }));
          }
          return next;
        });
      } finally {
        setBusyImageId(null);
      }
    });
  }

  function handleSetPrimary(imageId: string) {
    if (!initial?.id) return;

    setBusyImageId(imageId);
    startTransition(async () => {
      try {
        await setPrimaryProductImage(imageId, initial.id!);
        setImages((prev) =>
          prev.map((img) => ({ ...img, isPrimary: img.id === imageId })),
        );
      } finally {
        setBusyImageId(null);
      }
    });
  }

  return (
    <form action={action} className="space-y-5">
      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Tipo</Label>
            <Select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value as ProductType)}
            >
              <option value="IPHONE">iPhone</option>
              <option value="MACBOOK">MacBook</option>
            </Select>
          </div>
          <div>
            <Label>Modelo</Label>
            <Input
              name="name"
              required
              defaultValue={initial?.name}
              placeholder="iPhone 16 Pro Max"
            />
          </div>
          <div>
            <Label>Capacidad</Label>
            <Select name="storage" defaultValue={initial?.storage ?? "128GB"} required>
              {STORAGE_OPTIONS.map((opt) => {
                const value = opt.replace(" ", "");
                return (
                  <option key={value} value={value}>
                    {opt}
                  </option>
                );
              })}
            </Select>
          </div>
          <div>
            <Label>Color</Label>
            <Input
              name="color"
              required
              defaultValue={initial?.color}
              placeholder="Natural"
            />
          </div>
          <div>
            <Label>IMEI</Label>
            <Input
              name="imei"
              defaultValue={initial?.imei ?? ""}
              placeholder="356938035643809"
              inputMode="numeric"
              maxLength={17}
            />
          </div>
          {type === "IPHONE" ? (
            <div>
              <Label>Batería (%)</Label>
              <Input
                name="batteryCondition"
                type="number"
                min={0}
                max={100}
                defaultValue={initial?.batteryCondition ?? 90}
                required
              />
            </div>
          ) : (
            <input type="hidden" name="batteryCondition" value="" />
          )}
          <div>
            <Label>Estado físico</Label>
            <Select
              name="physicalCondition"
              defaultValue={initial?.physicalCondition ?? "EXCELENTE"}
            >
              {Object.entries(PHYSICAL_CONDITION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Costo (USD)</Label>
            <Input
              name="cost"
              type="number"
              step="0.01"
              min={0}
              required
              value={cost || ""}
              onChange={(e) => setCost(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Precio de venta (USD)</Label>
            <Input
              name="salePrice"
              type="number"
              step="0.01"
              min={0}
              required
              value={salePrice || ""}
              onChange={(e) => setSalePrice(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid gap-3 rounded-xl border border-card-border bg-input p-4 sm:grid-cols-2">
          <div>
            <div className="text-xs text-muted">Ganancia (auto)</div>
            <div className="mt-1 text-lg font-semibold text-accent">
              {formatUSD(profit)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted">Margen (auto)</div>
            <div className="mt-1 text-lg font-semibold text-foreground">{margin}</div>
          </div>
        </div>

        <div>
          <Label>Descripción</Label>
          <Textarea
            name="description"
            rows={3}
            defaultValue={initial?.description ?? ""}
            placeholder="Pequeña marca en el marco inferior."
          />
        </div>

        <div>
          <Label>Imágenes</Label>

          {images.length > 0 ? (
            <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {images.map((img) => {
                const busy = pending && busyImageId === img.id;
                return (
                  <div
                    key={img.id}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-xl border border-card-border bg-input",
                      busy && "opacity-50",
                    )}
                  >
                    <Image
                      src={img.url}
                      alt="Imagen del equipo"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {img.isPrimary ? (
                      <span className="absolute left-2 top-2 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-contrast">
                        Principal
                      </span>
                    ) : null}
                    <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                      {!img.isPrimary ? (
                        <button
                          type="button"
                          disabled={busy || pending}
                          onClick={() => handleSetPrimary(img.id)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/10 px-2 py-1.5 text-[11px] font-medium text-foreground hover:bg-white/20 disabled:opacity-50"
                          title="Marcar como principal"
                        >
                          <Star className="h-3.5 w-3.5" />
                          Principal
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={busy || pending}
                        onClick={() => handleDeleteImage(img.id)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-500/20 px-2 py-1.5 text-[11px] font-medium text-red-300 hover:bg-red-500/30 disabled:opacity-50"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : mode === "edit" ? (
            <p className="mb-3 text-sm text-muted">Este equipo todavía no tiene imágenes.</p>
          ) : null}

          <input
            ref={fileInputRef}
            name="images"
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-card-border bg-input px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-hover sm:w-auto"
          >
            <ImagePlus className="h-4 w-4 text-accent" />
            Agregar Imagen
          </button>

          {selectedFiles.length > 0 ? (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-muted">
                {selectedFiles.length} archivo
                {selectedFiles.length === 1 ? "" : "s"} listo
                {selectedFiles.length === 1 ? "" : "s"} para subir
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="relative overflow-hidden rounded-xl border border-accent/30 bg-input"
                  >
                    <div className="relative aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrls[index]}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="truncate px-2 py-1.5 text-[11px] text-muted">
                      {file.name}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(index)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 text-foreground hover:bg-red-500/80"
                      title="Quitar de la selección"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
        {mode === "edit" ? "Guardar cambios" : "Agregar equipo"}
      </Button>
    </form>
  );
}
