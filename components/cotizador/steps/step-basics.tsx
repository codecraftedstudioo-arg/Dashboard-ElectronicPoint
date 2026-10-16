"use client";

import { Button } from "@/components/cotizador/ui/button";
import { Card, CardHeader } from "@/components/cotizador/ui/card";
import { Select } from "@/components/cotizador/ui/select";
import { StoragePill } from "@/components/cotizador/ui/selection-card";
import { useWizard } from "@/components/cotizador/wizard-context";
import type { StorageCapacity } from "@/lib/cotizador/types";

export function StepBasics() {
  const { state, models, setModel, setStorage, nextStep } = useWizard();
  const storages = models.find((item) => item.model === state.model)?.storages ?? [];
  const canContinue = state.model !== null && state.storage !== null;

  return (
    <Card>
      <CardHeader title="¿Qué iPhone tenés?" />
      <div className="space-y-4">
        <Select
          label="Modelo"
          placeholder="Seleccioná tu modelo"
          options={models.map((item) => ({ value: item.model, label: item.model }))}
          value={state.model ?? undefined}
          onChange={setModel}
        />
        {state.model && storages.length > 0 ? (
          <div className="animate-fadeSlideIn space-y-2">
            <p className="text-sm font-medium text-fg-muted">Capacidad</p>
            <div className="flex flex-wrap gap-2">
              {storages.map((storage) => (
                <StoragePill
                  key={storage}
                  value={storage}
                  selected={state.storage === storage}
                  onClick={() => setStorage(storage as StorageCapacity)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <Button onClick={nextStep} fullWidth disabled={!canContinue} className="mt-6">
        Continuar
      </Button>
    </Card>
  );
}
