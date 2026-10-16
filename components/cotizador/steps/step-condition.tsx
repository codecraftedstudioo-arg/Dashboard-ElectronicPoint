"use client";

import { Button } from "@/components/cotizador/ui/button";
import { Card, CardHeader } from "@/components/cotizador/ui/card";
import { ConditionCard, ToggleCard } from "@/components/cotizador/ui/selection-card";
import { useWizard } from "@/components/cotizador/wizard-context";

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const ScratchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" d="M4 4l16 16M8 4l12 12M4 8l12 12" />
  </svg>
);

const CrackedIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L8 9l4-2 4 5-3 1 3 5-4-2-4 5" />
  </svg>
);

const FramePerfectIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
  </svg>
);

const FrameDamagedIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
    <path strokeLinecap="round" d="M8 8l2 4-2 4M16 8l-2 4 2 4" />
  </svg>
);

const WaterDropIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z" clipRule="evenodd" />
  </svg>
);

const NoWaterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 01-6.36-15.36A7.5 7.5 0 0112 3a7.5 7.5 0 016.36 2.64A9 9 0 0112 21z" />
    <path strokeLinecap="round" d="M5 5l14 14" strokeWidth={2} />
  </svg>
);

export function StepCondition() {
  const { state, setScreenCondition, setBackCondition, setFrameCondition, setLiquidDamage, nextStep } =
    useWizard();
  const canContinue =
    state.screenCondition !== null &&
    state.backCondition !== null &&
    state.frameCondition !== null &&
    state.hasLiquidDamage !== null;

  return (
    <Card>
      <CardHeader title="¿En qué estado está?" />
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-fg-muted">Pantalla</p>
          <div className="grid grid-cols-3 gap-2">
            <ConditionCard selected={state.screenCondition === "perfect"} onClick={() => setScreenCondition("perfect")} icon={<SparkleIcon />} label="Perfecta" variant="good" />
            <ConditionCard selected={state.screenCondition === "scratches"} onClick={() => setScreenCondition("scratches")} icon={<ScratchIcon />} label="Rayones" variant="warning" />
            <ConditionCard selected={state.screenCondition === "cracked"} onClick={() => setScreenCondition("cracked")} icon={<CrackedIcon />} label="Rota" variant="bad" />
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-fg-muted">Tapa trasera (vidrio)</p>
          <div className="grid grid-cols-2 gap-2">
            <ConditionCard selected={state.backCondition === "perfect"} onClick={() => setBackCondition("perfect")} icon={<SparkleIcon />} label="Perfecta" variant="good" />
            <ConditionCard selected={state.backCondition === "cracked"} onClick={() => setBackCondition("cracked")} icon={<CrackedIcon />} label="Rota" variant="bad" />
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-fg-muted">Marco / Chasis</p>
          <div className="grid grid-cols-2 gap-2">
            <ConditionCard selected={state.frameCondition === "perfect"} onClick={() => setFrameCondition("perfect")} icon={<FramePerfectIcon />} label="Perfecto" variant="good" />
            <ConditionCard selected={state.frameCondition === "damaged"} onClick={() => setFrameCondition("damaged")} icon={<FrameDamagedIcon />} label="Dañado" variant="bad" />
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-fg-muted">¿Daño por líquido?</p>
          <div className="flex gap-3">
            <ToggleCard selected={state.hasLiquidDamage === false} onClick={() => setLiquidDamage(false)} icon={<NoWaterIcon />} label="No" isPositive />
            <ToggleCard selected={state.hasLiquidDamage === true} onClick={() => setLiquidDamage(true)} icon={<WaterDropIcon />} label="Sí" isPositive={false} />
          </div>
        </div>
      </div>
      <Button onClick={nextStep} fullWidth disabled={!canContinue} className="mt-6">
        Continuar
      </Button>
    </Card>
  );
}
