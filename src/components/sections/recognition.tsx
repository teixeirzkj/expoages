"use client";

import { ArrowUpRight, HandHeart, MessageSquareDiff, SearchCheck } from "lucide-react";
import { AnimatedHeading } from "@/components/motion/animated-heading";
import { Reveal } from "@/components/motion/reveal";
import { useParticipation } from "@/components/forms/participation";
import { cn } from "@/lib/utils";

const OPTIONS = [
  {
    panel: "reconhecimento" as const,
    icon: HandHeart,
    title: "Enviar reconhecimento",
    text: "Registre um elogio a uma equipe, contribuição ou prática profissional.",
    tone: "bg-terracotta",
  },
  {
    panel: "construtivo" as const,
    icon: MessageSquareDiff,
    title: "Compartilhar feedback construtivo",
    text: "Sugira melhorias sobre práticas, processos ou o ambiente organizacional.",
    tone: "bg-sage",
  },
  {
    panel: "tracker" as const,
    icon: SearchCheck,
    title: "Acompanhar retorno",
    text: "Consulte pelo protocolo a resposta registrada pela gestão.",
    tone: "bg-ivory-2",
  },
];

export function Recognition() {
  const { open } = useParticipation();

  return (
    <section id="reconhecimento" aria-label="Reconhecimento e feedback" className="relative bg-ivory section-y">
      <div className="container-editorial grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow text-terracotta-2">05 — Reconhecimento e feedback</p>
          <AnimatedHeading
            lines={["Reconhecer", "também é uma", "forma de _cuidar._"]}
            accentClassName="text-terracotta-2"
            className="display-lg mt-6 text-petrol"
          />
          <Reveal>
            <p data-reveal className="mt-6 max-w-md text-ink/70">
              Agradecer e apontar caminhos de melhoria são duas faces da mesma atenção. Aqui, ambos acontecem sem exigir
              identificação.
            </p>
            <p data-reveal className="mt-8 max-w-md border-l-2 border-terracotta pl-4 text-sm text-ink/55">
              Nesta versão não é possível avaliar uma pessoa específica pelo nome. Isso exigiria regras próprias de
              identidade, privacidade e consentimento, ainda em definição pelo grupo.
            </p>
          </Reveal>
        </div>

        <Reveal as="ul" className="border-t border-petrol/15 lg:col-span-7" stagger={0.1}>
          {OPTIONS.map(({ panel, icon: Icon, title, text, tone }, i) => (
            <li key={panel} data-reveal className="border-b border-petrol/15">
              <button
                type="button"
                onClick={() => open(panel)}
                className="group relative flex w-full items-center gap-5 overflow-hidden px-2 py-8 text-left md:gap-8 md:px-4 md:py-10"
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-y-100 group-focus-visible:scale-y-100",
                    tone,
                  )}
                />
                <span className="relative self-start pt-2 text-xs tabular-nums text-ink/45">0{i + 1}</span>
                <span className="relative flex-1">
                  <span className="flex items-center gap-3">
                    <Icon className="size-5 text-terracotta-2 transition-colors group-hover:text-ink" strokeWidth={1.7} />
                    <span className="font-display text-[clamp(1.6rem,3vw,2.5rem)] leading-tight text-petrol">{title}</span>
                  </span>
                  <span className="mt-2 block max-w-md text-ink/60">{text}</span>
                </span>
                <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full border border-petrol/20 text-petrol transition-[transform,background-color,color] duration-500 group-hover:rotate-45 group-hover:bg-petrol group-hover:text-ivory">
                  <ArrowUpRight className="size-5" />
                </span>
              </button>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
