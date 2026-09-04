"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/lib/actions";
import { Button, cn } from "@/components/ui";
import { Money } from "@/components/currency/currency-toggle";
import type { ProductStatus } from "@prisma/client";

const STATUS_LABELS: Record<ProductStatus, string> = {
  AVAILABLE: "Disponible",
  SOLD: "Vendido",
  RESERVED: "Reservado",
  ARCHIVED: "Archivado",
};

export function DeleteProductPanel({
  productId,
  name,
  storage,
  internalCode,
  cost,
  status,
}: {
  productId: string;
  name: string;
  storage: string;
  internalCode: string;
  cost: number;
  status: ProductStatus;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  function close() {
    if (pending) return;
    setOpen(false);
  }

  function handleDelete() {
    setFeedback(null);
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (result.ok) {
        setFeedback({ type: "success", message: result.message });
        setOpen(false);
        router.push("/inventario");
        router.refresh();
        return;
      }
      setFeedback({ type: "error", message: result.message });
    });
  }

  return (
    <div className="mt-8 border-t border-red-500/20 pt-6">
      <p className="text-sm font-semibold text-red-400">Zona de peligro</p>
      <p className="mt-1 text-sm text-muted">
        Eliminá este equipo solo si es un duplicado o se cargó por error. Esta
        acción no se puede deshacer.
      </p>

      {feedback ? (
        <p
          className={cn(
            "mt-3 rounded-xl border px-3 py-2 text-sm",
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-400",
          )}
          role="status"
        >
          {feedback.message}
        </p>
      ) : null}

      <Button
        type="button"
        variant="danger"
        className="mt-4 w-full sm:w-auto"
        onClick={() => {
          setFeedback(null);
          setOpen(true);
        }}
        disabled={pending}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
        Eliminar equipo
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-card-border bg-card p-5 shadow-2xl">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                ¿Eliminar este equipo?
              </h3>
              <p className="mt-1 text-sm text-muted">
                Esta acción eliminará definitivamente este equipo del inventario
                y no podrá recuperarse.
              </p>
            </div>

            <dl className="space-y-2 rounded-xl border border-card-border bg-input/50 px-4 py-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Modelo</dt>
                <dd className="text-right font-medium text-foreground">{name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Capacidad</dt>
                <dd className="text-right font-medium text-foreground">
                  {storage}
                </dd>
              </div>
              {internalCode ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Código interno</dt>
                  <dd className="text-right font-medium text-foreground">
                    {internalCode}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Precio de costo</dt>
                <dd className="text-right font-medium text-foreground">
                  <Money amount={cost} />
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Estado actual</dt>
                <dd className="text-right font-medium text-foreground">
                  {STATUS_LABELS[status]}
                </dd>
              </div>
            </dl>

            {feedback?.type === "error" ? (
              <p
                className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
                role="status"
              >
                {feedback.message}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={close}
                disabled={pending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                className="flex-1"
                onClick={handleDelete}
                disabled={pending}
              >
                {pending ? "Eliminando…" : "Eliminar definitivamente"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
