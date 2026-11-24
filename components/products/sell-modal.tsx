"use client";

import { useState } from "react";
import { markAsSold } from "@/lib/actions";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import {
  SELLER_NAME_LABELS,
  SELLER_NAME_ORDER,
} from "@/lib/constants";

export function SellModal({
  productId,
  defaultPrice,
}: {
  productId: string;
  defaultPrice: number;
}) {
  const [open, setOpen] = useState(false);
  const [commission, setCommission] = useState("");
  const [seller, setSeller] = useState("");

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
        Marcar como vendido
      </Button>
    );
  }

  const hasCommission = Number(commission) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="flex max-h-[min(92vh,40rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-card-border bg-card shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-card-border px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Registrar venta
            </h3>
            <p className="text-sm text-muted">
              El equipo no se elimina; pasa a estado vendido.
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

        <form
          action={markAsSold}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="space-y-4 overflow-y-auto px-5 py-4">
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
                <option value="FACEBOOK_MARKETPLACE">
                  Facebook Marketplace
                </option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="REFERIDO">Referido</option>
                <option value="GREMIO">Gremio</option>
                <option value="ALE_KIVI">Ale Kivi</option>
                <option value="OTRO">Otro</option>
              </Select>
            </div>

            <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="text-sm font-semibold text-foreground">
                Comisión
              </p>
              <div>
                <Label>Monto (USD)</Label>
                <Input
                  name="commission"
                  type="number"
                  step="0.01"
                  min={0}
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-muted">
                  Se descuenta de la ganancia de esta venta.
                </p>
              </div>
              <div>
                <Label>Vendedor {hasCommission ? "" : "(opcional)"}</Label>
                <Select
                  name="seller"
                  value={seller}
                  onChange={(e) => setSeller(e.target.value)}
                  required={hasCommission}
                >
                  <option value="">Sin comisión</option>
                  {SELLER_NAME_ORDER.map((name) => (
                    <option key={name} value={name}>
                      {SELLER_NAME_LABELS[name]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label>Observaciones</Label>
              <Textarea name="notes" rows={3} placeholder="Opcional" />
            </div>
          </div>

          <div className="flex shrink-0 gap-2 border-t border-card-border px-5 py-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
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
