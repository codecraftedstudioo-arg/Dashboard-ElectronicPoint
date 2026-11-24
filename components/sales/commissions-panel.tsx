"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HandCoins, Plus, Trash2 } from "lucide-react";
import {
  createSellerCommission,
  deleteSellerCommission,
} from "@/lib/actions";
import { Money } from "@/components/currency/currency-toggle";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";
import {
  SELLER_NAME_LABELS,
  SELLER_NAME_ORDER,
} from "@/lib/constants";
import type { SellerName } from "@prisma/client";

type CommissionRow = {
  id: string;
  seller: SellerName;
  amount: number;
  notes: string | null;
  paidAt: Date | string;
};

export function CommissionsPanel({
  commissions,
}: {
  commissions: CommissionRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const totalPaid = useMemo(
    () => commissions.reduce((sum, row) => sum + row.amount, 0),
    [commissions],
  );

  const bySeller = useMemo(() => {
    return SELLER_NAME_ORDER.map((seller) => {
      const rows = commissions.filter((row) => row.seller === seller);
      return {
        seller,
        label: SELLER_NAME_LABELS[seller],
        total: rows.reduce((sum, row) => sum + row.amount, 0),
        count: rows.length,
      };
    });
  }, [commissions]);

  function handleCreate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createSellerCommission(formData);
        setOpen(false);
        router.refresh();
      } catch {
        setError("No se pudo registrar la comisión.");
      }
    });
  }

  function handleDelete(commissionId: string) {
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("commissionId", commissionId);
        await deleteSellerCommission(formData);
        router.refresh();
      } catch {
        setError("No se pudo eliminar la comisión.");
      }
    });
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
            <HandCoins className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Comisiones
            </h2>
            <p className="text-sm text-muted">
              Pagos a Rami, Sabry y Tobi
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="gap-1.5"
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Agregar comisión
        </Button>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-wide text-amber-700/80 light:text-amber-700/80 dark:text-amber-300/80">
          Total pagado en comisiones
        </div>
        <div className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          <Money amount={totalPaid} />
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {bySeller.map((item) => (
            <div
              key={item.seller}
              className="rounded-xl border border-card-border/70 bg-card/70 px-3 py-2"
            >
              <div className="text-xs text-muted">{item.label}</div>
              <div className="mt-0.5 text-sm font-semibold text-foreground">
                <Money amount={item.total} />
              </div>
              <div className="text-[11px] text-muted">
                {item.count} {item.count === 1 ? "pago" : "pagos"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {commissions.length ? (
        <div className="space-y-2">
          {commissions.map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-card-border bg-input/40 px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="font-medium text-foreground">
                  {SELLER_NAME_LABELS[row.seller]}
                </div>
                <div className="text-xs text-muted">
                  {new Date(row.paidAt).toLocaleDateString("es-AR")}
                  {row.notes ? ` · ${row.notes}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-foreground">
                  <Money amount={row.amount} />
                </div>
                <button
                  type="button"
                  aria-label="Eliminar comisión"
                  disabled={pending}
                  onClick={() => handleDelete(row.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-card-border text-muted transition-colors hover:border-red-500/40 hover:text-red-500 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">
          Todavía no hay comisiones registradas.
        </p>
      )}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-card-border bg-card p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Agregar comisión
                </h3>
                <p className="text-sm text-muted">
                  Registrá un pago a un vendedor.
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

            <form action={handleCreate} className="space-y-4">
              <div>
                <Label>Vendedor</Label>
                <Select name="seller" defaultValue="RAMI" required>
                  {SELLER_NAME_ORDER.map((seller) => (
                    <option key={seller} value={seller}>
                      {SELLER_NAME_LABELS[seller]}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Monto (USD)</Label>
                <Input
                  name="amount"
                  type="number"
                  step="0.01"
                  min={0.01}
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Fecha de pago</Label>
                <Input
                  name="paidAt"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  required
                />
              </div>
              <div>
                <Label>Observaciones</Label>
                <Textarea name="notes" rows={2} placeholder="Opcional" />
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
      ) : null}
    </Card>
  );
}
