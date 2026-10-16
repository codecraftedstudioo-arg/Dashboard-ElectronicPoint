export function ProgressBar({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const progress = ((currentStep - 1) / totalSteps) * 100;

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-sm text-fg-muted">
        <span>
          Paso {currentStep} de {totalSteps}
        </span>
        <span>{Math.round(progress)}% completado</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-fg/15 backdrop-blur-sm">
        <div
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
