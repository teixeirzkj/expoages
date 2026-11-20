"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { AnimatedHeading } from "@/components/motion/animated-heading";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

function Bars() {
  const data = [
    ["Metas e pressão", 82],
    ["Carga de trabalho", 68],
    ["Comunicação", 54],
    ["Pausas", 41],
    ["Ambiente físico", 26],
  ] as const;
  return (
    <ul className="space-y-4">
      {data.map(([label, v], i) => (
        <li key={label}>
          <div className="mb-1.5 flex justify-between text-sm text-ivory/75">
            <span>{label}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-ivory/10">
            <motion.div
              className="h-full rounded-full bg-sage"
              initial={{ width: 0 }}
              animate={{ width: `${v}%` }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.9, ease }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Matrix() {
  const dots = [
    { x: 78, y: 22, l: "Pausas garantidas", hot: true },
    { x: 66, y: 34, l: "Critérios de metas", hot: true },
    { x: 30, y: 30, l: "Ergonomia" },
    { x: 70, y: 70, l: "Mural de decisões" },
    { x: 24, y: 72, l: "Integração" },
  ];
  return (
    <div className="relative aspect-[4/3] rounded-2xl border border-ivory/12">
      <span className="absolute inset-x-0 top-1/2 h-px bg-ivory/12" />
      <span className="absolute inset-y-0 left-1/2 w-px bg-ivory/12" />
      <span className="absolute left-3 top-3 text-[0.7rem] text-ivory/45">Alto impacto</span>
      <span className="absolute bottom-3 right-3 text-[0.7rem] text-ivory/45">Mais recorrente →</span>
      {dots.map((d, i) => (
        <motion.span
          key={d.l}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2"
          style={{ left: `${d.x}%`, top: `${d.y}%` }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 260, damping: 18 }}
        >
          <span className={cn("size-3 rounded-full", d.hot ? "bg-terracotta shadow-[0_0_0_6px_rgba(213,142,114,0.2)]" : "bg-sage")} />
          <span className="whitespace-nowrap text-xs text-ivory/80 max-sm:hidden">{d.l}</span>
        </motion.span>
      ))}
    </div>
  );
}

function Board() {
  const items = [
    { t: "Publicar critérios das metas", s: "Decidido" },
    { t: "Reunião semanal de alinhamento", s: "Em teste" },
    { t: "Devolutiva mensal da ouvidoria", s: "Decidido" },
  ];
  return (
    <ul className="space-y-3">
      {items.map((it, i) => (
        <motion.li
          key={it.t}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.5, ease }}
          className="flex items-center justify-between gap-4 rounded-2xl bg-ivory/[0.07] px-5 py-4"
        >
          <span className="text-ivory/90">{it.t}</span>
          <span className="shrink-0 rounded-full bg-sage px-2.5 py-0.5 text-xs font-semibold text-charcoal">{it.s}</span>
        </motion.li>
      ))}
    </ul>
  );
}

function Rituals() {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {months.map((m, i) => (
        <motion.div
          key={m}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.5, ease }}
          className="rounded-2xl border border-ivory/12 p-3 text-center"
        >
          <p className="text-xs text-ivory/50">{m}</p>
          <span className="mx-auto mt-3 block size-2.5 rounded-full bg-terracotta" />
          <p className="mt-2 text-[0.7rem] leading-tight text-ivory/70">Momento de reconhecimento</p>
        </motion.div>
      ))}
    </div>
  );
}

function Tracking() {
  const cols = [
    { l: "Planejadas", n: 3, w: 30 },
    { l: "Em andamento", n: 2, w: 20 },
    { l: "Concluídas", n: 5, w: 50 },
  ];
  return (
    <div>
      <div className="flex h-4 overflow-hidden rounded-full">
        {cols.map((c, i) => (
          <motion.span
            key={c.l}
            className={cn(i === 0 ? "bg-ivory/25" : i === 1 ? "bg-sage" : "bg-terracotta")}
            initial={{ width: 0 }}
            animate={{ width: `${c.w}%` }}
            transition={{ delay: i * 0.12, duration: 0.8, ease }}
          />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {cols.map((c) => (
          <div key={c.l} className="rounded-2xl bg-ivory/[0.06] p-4">
            <p className="font-display text-4xl text-ivory">{c.n}</p>
            <p className="mt-1 text-xs text-ivory/60">{c.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const STAGES: { title: string; text: string; viz: ReactNode }[] = [
  { title: "Identificar dificuldades recorrentes", text: "Agrupar manifestações por tema revela padrões que um relato isolado não mostra.", viz: <Bars /> },
  { title: "Organizar prioridades", text: "Cruzar impacto e recorrência ajuda a decidir por onde começar.", viz: <Matrix /> },
  { title: "Melhorar a comunicação", text: "Devolver à equipe o que foi decidido fortalece a confiança no canal.", viz: <Board /> },
  { title: "Criar ações de reconhecimento", text: "Rituais simples e frequentes tornam o reconhecimento parte da rotina.", viz: <Rituals /> },
  { title: "Acompanhar medidas de melhoria", text: "Um plano de ações com responsáveis e prazos mostra que a escuta gera providências.", viz: <Tracking /> },
];

export function ActionFlow() {
  const [active, setActive] = useState(0);

  return (
    <section id="acao" aria-label="Transformando escuta em ação" className="relative bg-petrol text-ivory section-y grain">
      <div className="container-editorial">
        <div className="grid gap-8 lg:grid-cols-12">
          <p className="eyebrow text-sage lg:col-span-3">07 — Da escuta à ação</p>
          <AnimatedHeading
            lines={["Transformando", "escuta em _ação._"]}
            accentClassName="text-terracotta"
            className="display-lg lg:col-span-9"
          />
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <ol className="lg:col-span-5" role="tablist" aria-label="Etapas de uso das informações">
            {STAGES.map((s, i) => (
              <li key={s.title}>
                <button
                  type="button"
                  role="tab"
                  id={`flow-tab-${i}`}
                  aria-selected={active === i}
                  aria-controls="flow-panel"
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex w-full gap-4 rounded-2xl px-4 py-4 text-left transition-colors",
                    active === i ? "bg-ivory/[0.08]" : "hover:bg-ivory/[0.04]",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs tabular-nums transition-colors",
                      active === i ? "bg-terracotta text-ink" : "border border-ivory/25 text-ivory/60",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className={cn("block font-semibold", active === i ? "text-ivory" : "text-ivory/70")}>{s.title}</span>
                    <span
                      className={cn(
                        "grid text-sm text-ivory/60 transition-[grid-template-rows,opacity] duration-500",
                        active === i ? "mt-1 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <span className="overflow-hidden">{s.text}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <div
            id="flow-panel"
            role="tabpanel"
            aria-labelledby={`flow-tab-${active}`}
            className="rounded-[var(--radius-card)] bg-charcoal/60 p-6 ring-1 ring-ivory/10 md:p-10 lg:col-span-7"
          >
            <div className="mb-8 flex items-center justify-between gap-4">
              <p className="font-display text-2xl">{STAGES[active].title}</p>
              <span className="shrink-0 rounded-full border border-ivory/20 px-3 py-1 text-[0.7rem] uppercase tracking-wider text-ivory/60">
                Dados demonstrativos
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {STAGES[active].viz}
              </motion.div>
            </AnimatePresence>
            <p className="mt-8 text-xs text-ivory/45">
              Ilustração conceitual com valores fictícios. Não representa resultados medidos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
