"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, RotateCcw } from "lucide-react";
import { republishSoldProduct, updateSalePrice } from "@/lib/actions";
import { Button, Input, Label, cn } from "@/components/ui";

type ModalView = "edit" | "confirm-republish";

export function EditSaleModal({
  saleId,
  soldPrice,
  productLabel,
}: {
  saleId: string;
  soldPrice: number;
  productLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ModalView>("edit");
  const [price, setPrice] = useState(String(soldPrice));
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  function resetModal() {
    setView("edit");
    setFeedback(null);
    setPrice(String(soldPrice));
  }

  function openModal() {
    resetModal();
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    resetModal();
  }

  function handleSubmit(formData: FormData) {
    setFeedback(null);
    startTransition(async () => {
      try {
        await updateSalePrice(formData);
        closeModal();
        router.refresh();
      } catch {
        setFeedback({
          type: "error",
          message:
            "No se pudo actualizar el precio de venta. No se realizaron cambios.",
        });
      }
    });
  }

  function handleRepublish() {
    setFeedback(null);
    startTransition(async () => {
      const result = await republishSoldProduct(saleId);
      if (result.ok) {
        closeModal();
        router.refresh();
        return;
      }
      setFeedback({ type: "error", message: result.message });
      setView("edit");
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
              {view === "edit" ? "Editar venta" : "¿Volver a publicar este equipo?"}
            </h3>
            <p className="text-sm text-muted">
              {view === "edit" ? (
                <>
                  Actualizá el precio final al que se vendió{" "}
                  <span className="font-medium text-foreground">{productLabel}</span>.
                </>
              ) : (
                <>
                  El equipo volverá a estar disponible en el inventario y podrá
                  aparecer nuevamente en el catálogo público.
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            className="text-muted hover:text-foreground"
            onClick={closeModal}
            aria-label="Cerrar"
            disabled={pending}
          >
            ✕
          </button>
        </div>

        {feedback ? (
          <p
            className={cn(
              "mb-4 rounded-xl border px-3 py-2 text-sm",
              feedback.type === "success"
                ? "border-accent/30 bg-accent-dim text-accent"
                : "border-red-500/30 bg-red-500/10 text-red-400",
            )}
            role="status"
          >
            {feedback.message}
          </p>
        ) : null}

        {view === "edit" ? (
          <>
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
                  disabled={pending}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={closeModal}
                  disabled={pending}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={pending}>
                  {pending ? "Guardando…" : "Guardar"}
                </Button>
              </div>
            </form>

            <div className="mt-6 border-t border-card-border pt-5">
              <p className="mb-3 text-xs text-muted">
                Si la venta fue un error, podés devolver el equipo al inventario
                sin crear un producto nuevo.
              </p>
              <Button
                type="button"
                variant="ghost"
                className="w-full border border-accent/35 bg-accent-dim/40 text-accent hover:bg-accent-dim"
                onClick={() => {
                  setFeedback(null);
                  setView("confirm-republish");
                }}
                disabled={pending}
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Volver a publicar equipo
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="rounded-xl border border-card-border bg-input/40 px-3 py-2.5 text-sm text-foreground">
              {productLabel}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setView("edit")}
                disabled={pending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handleRepublish}
                disabled={pending}
              >
                {pending ? "Publicando…" : "Sí, volver a publicar"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
