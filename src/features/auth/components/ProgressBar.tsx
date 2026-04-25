export function ProgressBar({ currentStep }: { currentStep: number }) {
  const steps = [1, 2, 3, 4];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s) => (
        <div
          key={s}
          className={`h-2 flex-1 rounded-full ${
            s <= currentStep ? "bg-amber-500" : "bg-neutral-200"
          }`}
        />
      ))}
    </div>
  );
}