"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button, cn } from "@/components/ui";
import { extractImei, isValidImei } from "@/lib/imei";

type ScanStatus =
  | "starting"
  | "scanning"
  | "invalid"
  | "denied"
  | "unavailable"
  | "error";

type Html5Scanner = {
  isScanning: boolean;
  stop: () => Promise<void>;
  clear: () => void | Promise<void>;
};

export function ImeiScanner({
  onDetected,
  onClose,
}: {
  onDetected: (imei: string) => void;
  onClose: () => void;
}) {
  const reactId = useId().replace(/:/g, "");
  const elementId = `imei-scanner-${reactId}`;
  const scannerRef = useRef<Html5Scanner | null>(null);
  const handledRef = useRef(false);
  const onDetectedRef = useRef(onDetected);
  const onCloseRef = useRef(onClose);
  const [status, setStatus] = useState<ScanStatus>("starting");
  const [message, setMessage] = useState<string | null>(null);

  onDetectedRef.current = onDetected;
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function stopScanner() {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (!scanner) return;
      try {
        if (scanner.isScanning) await scanner.stop();
      } catch {
        // already stopped
      }
      try {
        await scanner.clear();
      } catch {
        // element may be gone
      }
    }

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("unavailable");
        setMessage("Cámara no disponible. Podés ingresar el IMEI manualmente.");
        return;
      }

      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import(
          "html5-qrcode"
        );

        if (cancelled) return;

        const scanner = new Html5Qrcode(elementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.CODABAR,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ],
          verbose: false,
        });
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const width = Math.min(Math.floor(viewfinderWidth * 0.88), 360);
              const height = Math.min(Math.floor(viewfinderHeight * 0.28), 140);
              return { width, height };
            },
            aspectRatio: 1.777778,
          },
          async (decodedText) => {
            if (handledRef.current || cancelled) return;
            const imei = extractImei(decodedText);
            if (!imei || !isValidImei(imei)) {
              setStatus("invalid");
              setMessage(
                "El código escaneado no parece ser un IMEI válido.",
              );
              return;
            }

            handledRef.current = true;
            await stopScanner();
            if (!cancelled) onDetectedRef.current(imei);
          },
          () => {
            // Expected while aiming.
          },
        );

        if (cancelled) {
          await stopScanner();
          return;
        }
        setStatus("scanning");
        setMessage(null);
      } catch (error) {
        if (cancelled) return;
        const name =
          error && typeof error === "object" && "name" in error
            ? String((error as { name: string }).name)
            : "";
        const text =
          error instanceof Error ? error.message.toLowerCase() : "";

        if (
          name === "NotAllowedError" ||
          text.includes("permission") ||
          text.includes("notallowed")
        ) {
          setStatus("denied");
          setMessage(
            "No podemos acceder a la cámara. Podés ingresar el IMEI manualmente.",
          );
          return;
        }

        if (
          name === "NotFoundError" ||
          text.includes("requested device not found") ||
          text.includes("no cameras")
        ) {
          setStatus("unavailable");
          setMessage(
            "Cámara no disponible. Podés ingresar el IMEI manualmente.",
          );
          return;
        }

        setStatus("error");
        setMessage(
          "No se pudo iniciar el escáner. Podés ingresar el IMEI manualmente.",
        );
      }
    }

    void start();

    return () => {
      cancelled = true;
      void stopScanner();
    };
  }, [elementId]);

  async function handleClose() {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      try {
        if (scanner.isScanning) await scanner.stop();
      } catch {
        // ignore
      }
      try {
        await scanner.clear();
      } catch {
        // ignore
      }
    }
    onCloseRef.current();
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 p-3 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${elementId}-title`}
    >
      <div className="flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-card-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-card-border px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2
              id={`${elementId}-title`}
              className="text-lg font-semibold text-foreground"
            >
              Escanear IMEI
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              Apuntá la cámara al código de barras del IMEI
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleClose()}
            className="rounded-xl p-2 text-muted hover:bg-hover hover:text-foreground"
            aria-label="Cerrar escáner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <div
            className={cn(
              "relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-card-border bg-black",
              (status === "denied" ||
                status === "unavailable" ||
                status === "error") &&
                "flex items-center justify-center",
            )}
          >
            <div
              id={elementId}
              className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
            />
            {status === "starting" ||
            status === "scanning" ||
            status === "invalid" ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[28%] w-[88%] max-w-[360px] rounded-xl border-2 border-accent/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
              </div>
            ) : null}
            {status === "starting" ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
                <p className="text-sm text-white">Iniciando cámara…</p>
              </div>
            ) : null}
          </div>

          {message ? (
            <p
              className={cn(
                "mt-3 text-center text-sm",
                status === "invalid" ? "text-amber-300" : "text-red-300",
              )}
              role="status"
            >
              {message}
            </p>
          ) : (
            <p className="mt-3 text-center text-sm text-muted">
              Centrá el código de barras dentro de la guía.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-card-border p-4 sm:flex-row sm:justify-end">
          {status === "invalid" ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full min-h-11 sm:w-auto"
              onClick={() => {
                setStatus("scanning");
                setMessage(null);
              }}
            >
              Volver a escanear
            </Button>
          ) : null}
          {status === "denied" ||
          status === "unavailable" ||
          status === "error" ? (
            <Button
              type="button"
              className="w-full min-h-11 sm:w-auto"
              onClick={() => void handleClose()}
            >
              Ingresar manualmente
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            className="w-full min-h-11 sm:w-auto"
            onClick={() => void handleClose()}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
