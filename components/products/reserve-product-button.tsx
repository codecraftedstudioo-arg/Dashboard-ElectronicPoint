"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setProductReservation } from "@/lib/actions";
import { Button, cn } from "@/components/ui";

export function ReserveProductButton({
  productId,
  isReserved,
  className,
}: {
  productId: string;
  isReserved: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    setFeedback(null);
    startTransition(async () => {
      const result = await setProductReservation(productId, !isReserved);
      if (result.ok) {
        setFeedback({ type: "success", message: result.message });
        setOpen(false);
        router.refresh();
        return;
      }
      setFeedback({ type: "error", message: result.message });
    });
  }

  return (
    <div className={className}>
      {feedback && !open ? (
        <p
          className={cn(
            "mb-2 rounded-xl border px-3 py-2 text-sm",
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
        variant="secondary"
        className="w-full sm:w-auto"
        disabled={pending}
        onClick={() => {
          setFeedback(null);
          setOpen(true);
        }}
      >
        {isReserved ? "Quitar reserva" : "Reservar"}
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-card-border bg-card p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground">
              {isReserved ? "Quitar reserva" : "Reservar equipo"}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {isReserved
                ? "El equipo vuelve a mostrarse con su imagen normal. No se modifica el precio ni el stock."
                : "El equipo sigue en el inventario y no se registra como venta. La reserva la van a ver todos los vendedores."}
            </p>
            {feedback?.type === "error" ? (
              <p
                className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
                role="status"
              >
                {feedback.message}
              </p>
            ) : null}
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={pending}
                onClick={confirm}
              >
                {pending ? "Guardando…" : "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
