"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, LoaderCircle, RotateCcw } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitPulse } from "@/app/actions/public";
import { PULSE_QUESTIONS, PULSE_SCALE, type PulseKey } from "@/lib/domain";
import { ActionButton } from "@/components/brand/action-button";
import { cn } from "@/lib/utils";
import { Honeypot } from "./fields";
import { useAntiAbuse } from "./use-anti-abuse";

type Answers = Partial<Record<PulseKey, number>>;

export function PulseForm() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState<null | "live" | "demo">(null);
  const [pending, startTransition] = useTransition();
  const anti = useAntiAbuse();
  const total = PULSE_QUESTIONS.length;
  const q = PULSE_QUESTIONS[Math.min(index, total - 1)];
  const complete = PULSE_QUESTIONS.every((x) => answers[x.key]);

  const choose = (value: number) => {
    const nextAnswers = { ...answers, [q.key]: value };
    setAnswers(nextAnswers);
    if (index < total - 1) window.setTimeout(() => setIndex((i) => i + 1), 260);
  };

  const send = () => {
    startTransition(async () => {
      const res = await submitPulse({ ...answers, ...anti.meta() });
      if (res.ok) setDone(res.mode);
      else toast.error(res.error);
    });
  };

  const restart = () => {
    setAnswers({});
    setIndex(0);
    setDone(null);
    anti.reset();
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-card p-6 shadow-[0_30px_80px_-50px_rgba(20,36,43,0.55)] sm:p-10">
      <Honeypot value={anti.website} onChange={anti.setWebsite} />
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-6 text-center"
            aria-live="polite"
          >
            <p className="font-display text-[clamp(2rem,4vw,3rem)] leading-tight text-petrol">Obrigado por participar.</p>
            <p className="mx-auto mt-4 max-w-md text-ink/65">
              Suas respostas são anônimas e aparecem apenas em indicadores agregados, exibidos somente quando há um
              número mínimo de participações.
            </p>
            {done === "demo" && (
              <p className="mx-auto mt-4 max-w-md rounded-xl bg-sage-2 px-4 py-2 text-xs text-petrol">
                Modo demonstração: resposta registrada no ambiente fictício.
              </p>
            )}
            <ActionButton variant="outline" className="mt-8 text-petrol" onClick={restart}>
              <RotateCcw className="size-4" /> Responder novamente
            </ActionButton>
          </motion.div>
        ) : (
          <motion.div key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-1.5" aria-hidden>
                {PULSE_QUESTIONS.map((x, i) => (
                  <span
                    key={x.key}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      i === index ? "w-8 bg-petrol" : answers[x.key] ? "w-3 bg-petrol/60" : "w-3 bg-petrol/15",
                    )}
                  />
                ))}
              </div>
              <span className="text-sm tabular-nums text-ink/50">
                {Math.min(index + 1, total)} de {total}
              </span>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.fieldset
                key={q.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8"
              >
                <p className="eyebrow text-terracotta-2">{q.dimension}</p>
                <legend className="sr-only">{q.question}</legend>
                <p aria-hidden className="mt-3 font-display text-[clamp(1.7rem,3.4vw,2.6rem)] leading-tight text-petrol">
                  {q.question}
                </p>
                <div className="mt-8 grid grid-cols-5 gap-2 sm:gap-3" role="radiogroup" aria-label={q.question}>
                  {PULSE_SCALE.map((s) => {
                    const checked = answers[q.key] === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        onClick={() => choose(s.value)}
                        className={cn(
                          "flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border px-1 py-3 transition-[background-color,border-color,color,transform] duration-200 active:scale-95",
                          checked ? "border-petrol bg-petrol text-ivory" : "border-petrol/15 bg-ivory text-petrol hover:border-petrol/40",
                        )}
                      >
                        <span className="font-display text-2xl tabular-nums sm:text-3xl">{s.value}</span>
                        <span className={cn("text-[0.7rem] leading-tight sm:text-xs", checked ? "text-ivory/80" : "text-ink/55")}>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.fieldset>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between gap-3">
              <ActionButton variant="ghost" className="text-petrol" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
                <ArrowLeft className="size-4" /> Anterior
              </ActionButton>
              {index === total - 1 && (
                <ActionButton variant="terracotta" onClick={send} disabled={!complete || pending} aria-busy={pending}>
                  {pending && <LoaderCircle className="size-4 animate-spin" />}
                  {pending ? "Enviando…" : "Enviar respostas"}
                </ActionButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
