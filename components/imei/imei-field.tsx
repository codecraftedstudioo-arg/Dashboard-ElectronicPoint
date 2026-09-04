"use client";

import { useState } from "react";
import { ScanBarcode } from "lucide-react";
import { ImeiScanner } from "@/components/imei/imei-scanner";
import { Button, Input, Label } from "@/components/ui";

export function ImeiField({
  defaultValue = "",
  scanLabel = "Escanear IMEI",
}: {
  defaultValue?: string;
  scanLabel?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Label htmlFor="imei-input">IMEI</Label>
      <Input
        id="imei-input"
        name="imei"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="356938035643809"
        inputMode="numeric"
        autoComplete="off"
        maxLength={17}
      />
      <Button
        type="button"
        variant="secondary"
        className="mt-2 min-h-11 w-full sm:w-auto"
        onClick={() => setOpen(true)}
      >
        <ScanBarcode className="h-4 w-4" aria-hidden />
        {scanLabel}
      </Button>
      {open ? (
        <ImeiScanner
          onDetected={(imei) => {
            setValue(imei);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
