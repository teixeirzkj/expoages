"use client";

import { ArrowUpRight, EyeOff, KeyRound, Lock, Search } from "lucide-react";
import { AnimatedHeading } from "@/components/motion/animated-heading";
import { Magnetic } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";
import { useParticipation } from "@/components/forms/participation";

const POINTS = [
  { icon: EyeOff, title: "Sem identificação", text: "Não pedimos nome, e-mail, telefone, CPF ou cadastro." },
  { icon: KeyRound, title: "Protocolo seguro", text: "Um código aleatório permite acompanhar o retorno sem revelar quem enviou." },
  { icon: Lock, title: "Acesso restrito", text: "Somente a gestão autorizada lê as manifestações. Nada é publicado no site." },
];

export function OuvidoriaSection() {
  const { open } = useParticipation();

  return (
    <section id="ouvidoria" aria-label="Ouvidoria anônima" className="relative overflow-hidden bg-charcoal text-ivory section-y grain">
      <span id="participar" className="absolute top-0" aria-hidden />
      <div className="container-editorial grid items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow text-terracotta">04 — Ouvidoria anônima</p>
          <AnimatedHeading
            lines={["Sua voz", "merece _espaço._"]}
            accentClassName="text-sage"
            className="mt-6 font-display text-[clamp(3.2rem,9vw,8.5rem)] leading-[0.95] tracking-[-0.04em]"
          />
          <Reveal>
            <p data-reveal className="lead mt-8 max-w-lg text-ivory/75">
              Um canal para compartilhar ideias, preocupações e oportunidades de melhoria no ambiente de trabalho.
            </p>
            <div data-reveal className="mt-10 flex flex-wrap items-center gap-3">
              <Magnetic>
                <button
                  type="button"
                  onClick={() => open("ouvidoria")}
                  className="group inline-flex h-16 items-center gap-3 rounded-full bg-terracotta pl-7 pr-2 text-[1.05rem] font-semibold text-ink transition-colors hover:bg-[#df9d83] active:scale-[0.98]"
                >
                  Enviar mensagem anônima
                  <span className="flex size-12 items-center justify-center rounded-full bg-ink text-ivory transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45">
                    <ArrowUpRight className="size-5" />
                  </span>
                </button>
              </Magnetic>
              <button
                type="button"
                onClick={() => open("tracker")}
                className="inline-flex h-16 items-center gap-2.5 rounded-full border border-ivory/20 px-6 font-semibold text-ivory transition-colors hover:border-ivory/50"
              >
                <Search className="size-4" /> Acompanhar manifestação
              </button>
            </div>
          </Reveal>
        </div>

        <div className="relative lg:col-span-5">
          {/* Ondas de voz */}
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-0 size-[34rem] -translate-x-1/2 -translate-y-1/2 max-lg:hidden">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="absolute inset-0 rounded-full border border-sage/30 motion-safe:animate-[ripple_6s_ease-out_infinite]"
                style={{ animationDelay: `${i * 2}s` }}
              />
            ))}
          </div>
          <Reveal as="ul" className="relative space-y-3" stagger={0.12}>
            {POINTS.map(({ icon: Icon, title, text }) => (
              <li key={title} data-reveal className="flex gap-5 rounded-3xl bg-ivory/[0.06] p-6 ring-1 ring-ivory/10 backdrop-blur-sm">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sage text-charcoal">
                  <Icon className="size-5" strokeWidth={1.8} />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ivory/65">{text}</p>
                </div>
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
