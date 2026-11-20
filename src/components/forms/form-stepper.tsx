"use client";

import { cn } from "@/lib/utils";

/** Indicador de etapas do formulário. */
export function FormStepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label={`Etapa ${current + 1} de ${steps.length}`}>
      {steps.map((s, i) => (
        <li key={s} className="flex flex-1 flex-col gap-2" aria-current={i === current ? "step" : undefined}>
          <span className="relative h-1 overflow-hidden rounded-full bg-petrol/10">
            <span
              className={cn(
                "absolute inset-y-0 left-0 rounded-full bg-petrol transition-[width] duration-500 ease-[var(--ease-out-expo)]",
                i < current ? "w-full" : i === current ? "w-1/2" : "w-0",
              )}
            />
          </span>
          <span className={cn("text-xs font-medium", i <= current ? "text-petrol" : "text-ink/40")}>
            <span className="tabular-nums">{i + 1}.</span> {s}
          </span>
        </li>
      ))}
    </ol>
  );
}
