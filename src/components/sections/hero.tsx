"use client";

import { ArrowDown, MessageSquareText } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ActionButton } from "@/components/brand/action-button";
import { useParticipation } from "@/components/forms/participation";
import { useScrollTo } from "@/components/motion/scroll-to";

const ORBIT = 132;
const PEOPLE = [
  { angle: -72, accent: false },
  { angle: 14, accent: true },
  { angle: 96, accent: false },
  { angle: 166, accent: false },
  { angle: 222, accent: false },
].map((p, i) => {
  const r = (p.angle * Math.PI) / 180;
  return { ...p, i, x: +(200 + ORBIT * Math.cos(r)).toFixed(1), y: +(200 + ORBIT * Math.sin(r)).toFixed(1) };
});

/**
 * Ilustração própria: uma fala no centro, ondas de escuta e pessoas ao redor.
 * Animação de entrada única em CSS (traço + opacidade); depois fica estática.
 */
function ListeningVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[26rem]" aria-hidden>
      <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible">
        {[92, 132, 172].map((r, i) => (
          <circle
            key={r}
            cx="200"
            cy="200"
            r={r}
            fill="none"
            stroke="var(--brand-sky)"
            strokeOpacity={[0.4, 0.22, 0.12][i]}
            strokeWidth="1.25"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="1"
            transform="rotate(-90 200 200)"
            style={{ animation: `draw 1.4s var(--ease-out-quart) ${0.15 + i * 0.15}s forwards` }}
          />
        ))}
        {PEOPLE.map((p) => (
          <line
            key={`l${p.i}`}
            x1="200"
            y1="200"
            x2={p.x}
            y2={p.y}
            stroke="var(--brand-sky)"
            strokeOpacity="0.25"
            strokeDasharray="2 5"
            className="animate-fade-up"
            style={{ animationDelay: `${0.7 + p.i * 0.08}s` }}
          />
        ))}
        {PEOPLE.map((p) => (
          <g key={p.i} className="animate-fade-up" style={{ animationDelay: `${0.6 + p.i * 0.08}s` }}>
            <g transform={`translate(${p.x} ${p.y})`}>
              <circle r="23" fill={p.accent ? "var(--brand-sky)" : "var(--brand-navy-2)"} />
              <circle cy="-6" r="6" fill={p.accent ? "var(--brand-navy)" : "var(--brand-cream)"} />
              <path d="M-11 13 a11 10 0 0 1 22 0 z" fill={p.accent ? "var(--brand-navy)" : "var(--brand-cream)"} />
            </g>
          </g>
        ))}
        {/* Fala central */}
        <g className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <circle cx="200" cy="200" r="54" fill="var(--brand-sky)" opacity="0.18" style={{ transformOrigin: "200px 200px", animation: "pulse-ring 2.4s ease-out 1.2s 2 both" }} />
          <path d="M162 176 a16 16 0 0 1 16 -16 h44 a16 16 0 0 1 16 16 v32 a16 16 0 0 1 -16 16 h-26 l-14 14 v-14 h-4 a16 16 0 0 1 -16 -16 z" fill="var(--brand-cream)" />
          <rect x="178" y="180" width="44" height="5" rx="2.5" fill="var(--brand-navy)" opacity="0.8" />
          <rect x="178" y="193" width="30" height="5" rx="2.5" fill="var(--brand-navy)" opacity="0.45" />
        </g>
      </svg>
      {[
        { label: "Escuta", cls: "left-0 top-[16%]" },
        { label: "Reconhecimento", cls: "right-0 top-[44%] translate-x-2" },
        { label: "Evolução", cls: "bottom-[8%] left-[6%]" },
      ].map((t, i) => (
        <span
          key={t.label}
          className={`absolute ${t.cls} inline-flex items-center gap-2 rounded-full border border-white/12 bg-navy-2 px-3 py-1.5 text-xs font-medium text-cream animate-fade-up`}
          style={{ animationDelay: `${0.9 + i * 0.1}s` }}
        >
          <span className="size-1.5 rounded-full bg-sky" />
          {t.label}
        </span>
      ))}
    </div>
  );
}

export function Hero() {
  const scrollTo = useScrollTo();
  const { selectTab } = useParticipation();

  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="surface-dark relative overflow-hidden bg-navy pb-14 pt-[calc(var(--header-h)+2.5rem)] text-cream md:pb-20 md:pt-[calc(var(--header-h)+4rem)]"
    >
      <div className="container-editorial grid items-center gap-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-1.5 text-[0.8125rem] text-cream/80 animate-fade-up">
            <span className="size-1.5 rounded-full bg-sky" />
            Proposta acadêmica<span className="hidden sm:inline"> · {siteConfig.academic.course}</span>
          </p>
          <h1 id="hero-title" className="display-xl mt-6 max-w-[16ch] text-white animate-fade-up" style={{ animationDelay: "0.08s" }}>
            Valorizar pessoas começa por <span className="text-sky">ouvi-las.</span>
          </h1>
          <p className="lead mt-5 max-w-[34rem] text-cream/75 animate-fade-up" style={{ animationDelay: "0.16s" }}>
            Um espaço para escuta, reconhecimento e melhoria do ambiente de trabalho.
          </p>
          <div className="mt-8 flex flex-col gap-3 animate-fade-up sm:flex-row sm:flex-wrap" style={{ animationDelay: "0.24s" }}>
            <ActionButton size="lg" variant="accent" onClick={() => scrollTo("#programa")} icon={<ArrowDown className="size-4" />}>
              Conhecer o programa
            </ActionButton>
            <ActionButton
              size="lg"
              variant="outline"
              className="text-cream"
              onClick={() => selectTab("ouvidoria", { scroll: true })}
              icon={<MessageSquareText className="size-4" />}
            >
              Acessar a ouvidoria
            </ActionButton>
          </div>
          <p className="mt-10 text-sm text-cream/55 animate-fade-up" style={{ animationDelay: "0.32s" }}>
            Cenário de estudo: {siteConfig.company.name.replace(" Ltda.", "")} — empresa fictícia de contact center na{" "}
            {siteConfig.company.location}.
          </p>
        </div>
        <div className="hidden md:col-span-5 md:block">
          <ListeningVisual />
        </div>
      </div>
    </section>
  );
}
