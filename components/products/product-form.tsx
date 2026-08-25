"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ImagePlus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import {
  Button,
  Input,
  Label,
  Select,
  Textarea,
  Card,
  cn,
} from "@/components/ui";
import { STORAGE_OPTIONS, PHYSICAL_CONDITION_LABELS, CHIP_TYPE_LABELS } from "@/lib/constants";
import { calcProfit, formatMargin } from "@/lib/calculations";
import { formatUSD } from "@/lib/currency";
import {
  createProduct,
  updateProduct,
  deleteProductImage,
  setPrimaryProductImage,
  reorderProductImages,
  uploadSingleProductImage,
} from "@/lib/actions";
import { compressImageFile } from "@/lib/compress-image";
import type { ChipType, PhysicalCondition, ProductType } from "@prisma/client";

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: string }).digest === "string" &&
    (error as { digest: string }).digest.includes("NEXT_REDIRECT")
  );
}

type ExistingImage = {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
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
  chip?: ChipType | null;
  cost: number;
  salePrice: number;
  description: string | null;
  isPublished?: boolean;
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
  const [images, setImages] = useState<ExistingImage[]>(
    () =>
      [...(initial?.images ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder,
      ),
  );
  const [pending, startTransition] = useTransition();
  const [busyImageId, setBusyImageId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newPrimaryIndex, setNewPrimaryIndex] = useState(0);
  const [newPrimaryAmongNew, setNewPrimaryAmongNew] = useState<number | null>(null);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
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

  useEffect(() => {
    if (newPrimaryIndex >= selectedFiles.length) {
      setNewPrimaryIndex(Math.max(0, selectedFiles.length - 1));
    }
  }, [newPrimaryIndex, selectedFiles.length]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? []);
    if (!incoming.length) return;
    setSelectedFiles((prev) => [...prev, ...incoming]);
    e.target.value = "";
  }

  function removeSelectedFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (newPrimaryIndex === index) {
      setNewPrimaryIndex(0);
    } else if (newPrimaryIndex > index) {
      setNewPrimaryIndex((prev) => prev - 1);
    }
    if (newPrimaryAmongNew === index) {
      setNewPrimaryAmongNew(null);
    } else if (newPrimaryAmongNew !== null && newPrimaryAmongNew > index) {
      setNewPrimaryAmongNew((prev) => (prev === null ? null : prev - 1));
    }
  }

  function moveSelectedFile(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= selectedFiles.length) return;
    setSelectedFiles((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setNewPrimaryIndex((prev) => {
      if (prev === index) return target;
      if (prev === target) return index;
      return prev;
    });
    setNewPrimaryAmongNew((prev) => {
      if (prev === null) return null;
      if (prev === index) return target;
      if (prev === target) return index;
      return prev;
    });
  }

  const action =
    mode === "edit" && initial?.id
      ? updateProduct.bind(null, initial.id)
      : createProduct;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    setUploadProgress(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.delete("images");

    startTransition(async () => {
      try {
        if (selectedFiles.length > 0) {
          const uploadedUrls: string[] = [];

          for (let index = 0; index < selectedFiles.length; index++) {
            const original = selectedFiles[index];
            setUploadProgress(
              `Subiendo imagen ${index + 1} de ${selectedFiles.length}...`,
            );

            const compressed = await compressImageFile(original);
            if (process.env.NODE_ENV === "development") {
              console.log(
                `[form] Image ${index + 1}: ${original.name} ${original.size} → ${compressed.size} bytes`,
              );
            }

            const single = new FormData();
            single.append("image", compressed, compressed.name);
            const url = await uploadSingleProductImage(single);
            uploadedUrls.push(url);
          }

          uploadedUrls.forEach((url) => {
            formData.append("uploadedImageUrls", url);
          });
        }

        setUploadProgress(
          selectedFiles.length > 0 ? "Guardando producto..." : "Guardando...",
        );
        await action(formData);
        setSubmitSuccess(true);
        setSelectedFiles([]);
      } catch (error) {
        if (isNextRedirect(error)) throw error;
        const raw =
          error instanceof Error
            ? error.message
            : "No se pudo guardar el producto.";
        const message =
          /unexpected response/i.test(raw)
            ? "No se pudieron subir las imágenes. Probá de a pocas (máx. 3–4 por vez) o con fotos más livianas."
            : raw;
        setSubmitError(message);
        if (process.env.NODE_ENV === "development") {
          console.error("[form] Submit failed:", error);
        }
      } finally {
        setUploadProgress(null);
      }
    });
  }

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

  function moveExistingImage(index: number, direction: -1 | 1) {
    if (!initial?.id) return;
    const target = index + direction;
    if (target < 0 || target >= images.length) return;

    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((img, i) => ({ ...img, sortOrder: i }));
    setImages(reordered);

    setBusyImageId(reordered[index].id);
    startTransition(async () => {
      try {
        await reorderProductImages(
          initial.id!,
          reordered.map((img) => img.id),
        );
      } finally {
        setBusyImageId(null);
      }
    });
  }

  const primaryImageIndex =
    mode === "create" && selectedFiles.length > 0 && images.length === 0
      ? newPrimaryIndex
      : images.findIndex((img) => img.isPrimary);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input
        type="hidden"
        name="primaryImageIndex"
        value={Math.max(0, primaryImageIndex)}
      />
      <input
        type="hidden"
        name="newPrimaryAmongNew"
        value={newPrimaryAmongNew ?? ""}
      />

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
          {type === "IPHONE" ? (
            <div>
              <Label>Chip</Label>
              <Select name="chip" defaultValue={initial?.chip ?? "SIM"} required>
                {Object.entries(CHIP_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          ) : (
            <input type="hidden" name="chip" value="" />
          )}
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

        <div className="rounded-xl border border-card-border bg-input p-4">
          <Label>Mostrar en catálogo público</Label>
          <p className="mb-3 text-xs text-muted">
            Solo iPhones disponibles y publicados aparecen en /usados. Por
            defecto queda oculto.
          </p>
          <input type="hidden" name="isPublished" value={isPublished ? "true" : "false"} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsPublished(true)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                isPublished
                  ? "border-accent/40 bg-accent-dim text-foreground"
                  : "border-card-border bg-card text-muted hover:bg-hover",
              )}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Publicado
            </button>
            <button
              type="button"
              onClick={() => setIsPublished(false)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                !isPublished
                  ? "border-accent/40 bg-accent-dim text-foreground"
                  : "border-card-border bg-card text-muted hover:bg-hover",
              )}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
              Oculto
            </button>
          </div>
        </div>

        <div>
          <Label>Imágenes del equipo</Label>
          <p className="mb-3 text-xs text-muted">
            Seleccioná varias fotos a la vez desde la galería del celular o desde
            la computadora. La primera queda como principal; podés cambiarla antes
            de guardar.
          </p>

          {images.length > 0 ? (
            <div className="mb-3 space-y-2">
              <p className="text-xs font-medium text-muted">
                Imágenes guardadas ({images.length})
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {images.map((img, index) => {
                  const busy = pending && busyImageId === img.id;
                  return (
                    <div
                      key={img.id}
                      className={cn(
                        "group relative aspect-square overflow-hidden rounded-xl border border-card-border bg-input",
                        img.isPrimary && "ring-2 ring-accent/50",
                        busy && "opacity-50",
                      )}
                    >
                      <Image
                        src={img.url}
                        alt="Imagen del equipo"
                        fill
                        sizes="(max-width: 640px) 50vw, 160px"
                        className="object-cover"
                      />
                      {img.isPrimary ? (
                        <span className="absolute left-2 top-2 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-contrast">
                          Principal
                        </span>
                      ) : null}
                      <div className="absolute left-2 top-2 flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                        <button
                          type="button"
                          disabled={index === 0 || busy || pending}
                          onClick={() => moveExistingImage(index, -1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-foreground hover:bg-black/80 disabled:opacity-30"
                          title="Mover antes"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === images.length - 1 || busy || pending}
                          onClick={() => moveExistingImage(index, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-foreground hover:bg-black/80 disabled:opacity-30"
                          title="Mover después"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
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
            </div>
          ) : mode === "edit" ? (
            <p className="mb-3 text-sm text-muted">Este equipo todavía no tiene imágenes.</p>
          ) : null}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-card-border bg-input px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-hover sm:w-auto"
          >
            <ImagePlus className="h-4 w-4 text-accent" />
            {selectedFiles.length > 0 ? "Agregar más imágenes" : "Seleccionar imágenes"}
          </button>

          {selectedFiles.length > 0 ? (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-muted">
                {selectedFiles.length} foto
                {selectedFiles.length === 1 ? "" : "s"} nueva
                {selectedFiles.length === 1 ? "" : "s"} para subir
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {selectedFiles.map((file, index) => {
                  const isPrimaryAmongNew =
                    mode === "edit" && newPrimaryAmongNew === index;
                  const isPrimary =
                    mode === "create" &&
                    images.length === 0 &&
                    newPrimaryIndex === index;
                  return (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                      className={cn(
                        "relative overflow-hidden rounded-xl border bg-input",
                        isPrimary || isPrimaryAmongNew
                          ? "border-accent ring-2 ring-accent/40"
                          : "border-card-border",
                      )}
                    >
                      <div className="relative aspect-square">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrls[index]}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                        <span className="truncate text-[11px] text-muted">{file.name}</span>
                        {isPrimary || isPrimaryAmongNew ? (
                          <span className="shrink-0 text-[10px] font-semibold text-accent">
                            Principal
                          </span>
                        ) : null}
                      </div>
                      <div className="absolute left-1.5 top-1.5 flex flex-col gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveSelectedFile(index, -1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-foreground hover:bg-black/90 disabled:opacity-30"
                          title="Mover antes"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === selectedFiles.length - 1}
                          onClick={() => moveSelectedFile(index, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-foreground hover:bg-black/90 disabled:opacity-30"
                          title="Mover después"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="absolute right-1.5 top-1.5 flex flex-col gap-1">
                        {(mode === "create" && images.length === 0 && !isPrimary) ||
                        (mode === "edit" && !isPrimaryAmongNew) ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (mode === "create") {
                                setNewPrimaryIndex(index);
                              } else {
                                setNewPrimaryAmongNew(index);
                              }
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-foreground hover:bg-accent"
                            title="Marcar como principal"
                          >
                            <Star className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(index)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-foreground hover:bg-red-500/80"
                          title="Quitar de la selección"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      {submitError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {submitError}
        </div>
      ) : null}

      {submitSuccess ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Guardado correctamente
        </div>
      ) : null}

      <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
        {pending
          ? uploadProgress || "Guardando..."
          : mode === "edit"
            ? "Guardar cambios"
            : "Agregar equipo"}
      </Button>
    </form>
  );
}
