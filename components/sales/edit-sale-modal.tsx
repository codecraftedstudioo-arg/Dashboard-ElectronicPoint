"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { updateSalePrice } from "@/lib/actions";
import { Button, Input, Label } from "@/components/ui";

export function EditSaleModal({
  saleId,
  soldPrice,
}: {
  saleId: string;
  soldPrice: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(String(soldPrice));
  const [pending, startTransition] = useTransition();

  function openModal() {
    setPrice(String(soldPrice));
    setOpen(true);
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateSalePrice(formData);
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="secondary"
        className="shrink-0 !px-3 !py-2 text-xs sm:text-sm"
        onClick={openModal}
      >
        <Pencil className="h-4 w-4" aria-hidden />
        Editar venta
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-card-border bg-card p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Editar venta
            </h3>
            <p className="text-sm text-muted">
              Actualizá el precio final al que se vendió el equipo.
            </p>
          </div>
          <button
            type="button"
            className="text-muted hover:text-foreground"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="saleId" value={saleId} />
          <div>
            <Label>Precio final de venta (USD)</Label>
            <Input
              name="soldPrice"
              type="number"
              step="0.01"
              min={0}
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
