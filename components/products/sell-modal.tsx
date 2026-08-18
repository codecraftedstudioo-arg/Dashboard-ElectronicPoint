"use client";

import { useState } from "react";
import { markAsSold } from "@/lib/actions";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";

export function SellModal({
  productId,
  defaultPrice,
}: {
  productId: string;
  defaultPrice: number;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
        Marcar como vendido
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-card-border bg-card p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Registrar venta</h3>
            <p className="text-sm text-muted">
              El equipo no se elimina; pasa a estado vendido.
            </p>
          </div>
          <button
            type="button"
            className="text-muted hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        <form action={markAsSold} className="space-y-4">
          <input type="hidden" name="productId" value={productId} />
          <div>
            <Label>Precio final de venta (USD)</Label>
            <Input
              name="soldPrice"
              type="number"
              step="0.01"
              min={0}
              required
              defaultValue={defaultPrice}
            />
          </div>
          <div>
            <Label>Canal</Label>
            <Select name="channel" defaultValue="INSTAGRAM" required>
              <option value="CLIENTE">Cliente</option>
              <option value="FACEBOOK_MARKETPLACE">Facebook Marketplace</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="REFERIDO">Referido</option>
              <option value="OTRO">Otro</option>
            </Select>
          </div>
          <div>
            <Label>Observaciones</Label>
            <Textarea name="notes" rows={3} placeholder="Opcional" />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Confirmar venta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
