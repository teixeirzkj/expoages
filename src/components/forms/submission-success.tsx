"use client";

import { motion } from "motion/react";
import { Check, Copy, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { DataMode } from "@/lib/domain";
import { ActionButton } from "@/components/brand/action-button";

export function SubmissionSuccess({
  protocol,
  mode,
  title,
  message,
  onTrack,
  onClose,
}: {
  protocol: string;
  mode: DataMode;
  title: string;
  message: string;
  onTrack: (protocol: string) => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(protocol);
      setCopied(true);
      toast.success("Protocolo copiado");
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      toast.error("Não foi possível copiar. Anote o protocolo manualmente.");
    }
  };

  return (
    <div className="py-2 text-center" aria-live="polite">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative mx-auto flex size-20 items-center justify-center"
      >
        <span className="absolute inset-0 rounded-full bg-sage/40 motion-safe:animate-[ripple_1.8s_ease-out_infinite]" />
        <span className="relative flex size-16 items-center justify-center rounded-full bg-petrol text-ivory">
          <svg viewBox="0 0 24 24" className="size-8" aria-hidden>
            <motion.path
              d="M5 12.5l4.2 4.2L19 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
            />
          </svg>
        </span>
      </motion.div>

      <h3 className="display-md mt-6 text-petrol">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-ink/65">{message}</p>

      <div className="mx-auto mt-8 max-w-md rounded-3xl border border-dashed border-petrol/30 bg-ivory p-6">
        <p className="eyebrow text-ink/50">Seu protocolo</p>
        <p className="mt-3 break-all font-mono text-[clamp(1.15rem,4.5vw,1.6rem)] font-semibold tracking-wider text-petrol" translate="no">
          {protocol}
        </p>
        <p className="mt-3 text-xs text-ink/55">
          Guarde este código: ele é a única forma de acompanhar o retorno. Não é possível recuperá-lo depois.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <ActionButton size="sm" variant="outline" className="text-petrol" onClick={copy} icon={copied ? <Check className="size-4" /> : <Copy className="size-4" />}>
            {copied ? "Copiado" : "Copiar protocolo"}
          </ActionButton>
          <ActionButton size="sm" onClick={() => onTrack(protocol)} icon={<Search className="size-4" />}>
            Acompanhar agora
          </ActionButton>
        </div>
      </div>

      {mode === "demo" && (
        <p className="mx-auto mt-5 max-w-md rounded-xl bg-sage-2 px-4 py-2.5 text-xs text-petrol">
          Modo demonstração: este envio foi registrado apenas no ambiente fictício da apresentação.
        </p>
      )}

      <button type="button" onClick={onClose} className="mt-6 text-sm font-medium text-ink/60 underline-offset-4 hover:underline">
        Fechar
      </button>
    </div>
  );
}
