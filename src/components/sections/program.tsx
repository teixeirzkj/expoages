"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { AnimatedHeading } from "@/components/motion/animated-heading";
import { LineGrow } from "@/components/motion/line-grow";
import { Reveal } from "@/components/motion/reveal";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

function ListeningWaves() {
  const ref = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const paths = ref.current!.querySelectorAll<SVGPathElement>("path");
        paths.forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.to(paths, {
          strokeDashoffset: 0,
          duration: 2.2,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  const waves = [
    { a: 10, f: 2, o: 0.9, w: 1.6 },
    { a: 22, f: 1.5, o: 0.55, w: 1.2 },
    { a: 34, f: 1.2, o: 0.35, w: 1 },
    { a: 46, f: 1, o: 0.2, w: 1 },
  ];
  const d = (amp: number, freq: number) => {
    let s = "M0 60";
    for (let x = 0; x <= 400; x += 8) {
      const env = Math.sin((x / 400) * Math.PI);
      s += ` L${x} ${(60 + Math.sin((x / 400) * Math.PI * 2 * freq * 2) * amp * env).toFixed(1)}`;
    }
    return s;
  };
  return (
    <svg ref={ref} viewBox="0 0 400 120" className="h-auto w-full" aria-hidden>
      {waves.map((w, i) => (
        <path key={i} d={d(w.a, w.f)} fill="none" stroke="currentColor" strokeWidth={w.w} strokeOpacity={w.o} strokeLinecap="round" />
      ))}
    </svg>
  );
}

const NOTES = [
  { text: "Obrigado pela parceria no plantão de sábado.", x: "4%", y: "8%", r: -3 },
  { text: "Sua calma fez diferença para o cliente.", x: "26%", y: "40%", r: 2 },
  { text: "Equipe da manhã: excelente organização!", x: "8%", y: "70%", r: -1.5 },
];

function FloatingNotes() {
  const reduce = useReducedMotion();
  return (
    <div className="relative h-52 sm:h-56" aria-hidden>
      {NOTES.map((n, i) => (
        <motion.span
          key={n.text}
          className="absolute max-w-[15rem] rounded-2xl bg-ivory px-4 py-3 text-sm leading-snug text-ink shadow-[0_18px_40px_-28px_rgba(20,36,43,0.6)]"
          style={{ left: n.x, top: n.y, rotate: n.r }}
          animate={reduce ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
        >
          <span className="mr-1.5 inline-block size-1.5 -translate-y-px rounded-full bg-terracotta" />
          {n.text}
        </motion.span>
      ))}
    </div>
  );
}

function GrowthPath() {
  const ref = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const path = ref.current!.querySelector<SVGPathElement>("[data-path]")!;
        const len = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ref.current, start: "top 85%", end: "top 35%", scrub: 0.6 } },
        );
        gsap.from(ref.current!.querySelectorAll("[data-node]"), {
          scale: 0,
          transformOrigin: "center",
          stagger: 0.25,
          ease: "back.out(2)",
          scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  const nodes = [
    { x: 30, y: 120, label: "Feedback" },
    { x: 170, y: 82, label: "Ação" },
    { x: 310, y: 30, label: "Melhoria" },
  ];
  return (
    <svg ref={ref} viewBox="0 0 360 150" className="h-auto w-full overflow-visible" aria-hidden>
      <path data-path d="M30 120 C 90 120, 110 82, 170 82 S 250 30, 310 30" fill="none" stroke="currentColor" strokeWidth="1.6" />
      {nodes.map((n) => (
        <g key={n.label}>
          <circle data-node cx={n.x} cy={n.y} r="7" className="fill-petrol" />
          <text x={n.x} y={n.y + 26} textAnchor="middle" className="fill-petrol text-[12px] font-semibold">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function Program() {
  return (
    <section id="programa" aria-label="O programa" className="relative bg-ivory section-y">
      <div className="container-editorial">
        <div className="grid gap-8 lg:grid-cols-12">
          <p className="eyebrow text-terracotta-2 lg:col-span-3">02 — O programa</p>
          <div className="lg:col-span-9">
            <AnimatedHeading
              lines={["Um programa para que", "_cada contribuição_ seja vista."]}
              accentClassName="text-terracotta-2"
              className="display-lg text-petrol"
            />
            <Reveal className="mt-8 grid gap-6 text-ink/70 md:grid-cols-2">
              <p data-reveal className="lead">
                O Programa de Reconhecimento e Valorização Profissional organiza canais de escuta, práticas de
                reconhecimento e rotinas de feedback em um ciclo contínuo.
              </p>
              <p data-reveal>
                A proposta parte da Psicologia Organizacional e do Trabalho: cuidar das condições que evitam o desgaste e,
                ao mesmo tempo, fortalecer aquilo que dá sentido ao trabalho — ser visto, ouvido e reconhecido.
              </p>
            </Reveal>
          </div>
        </div>

        <LineGrow className="my-16 text-petrol md:my-20" />

        <div className="grid gap-5 lg:grid-cols-12 lg:grid-rows-[auto_auto]">
          {/* Escuta */}
          <Reveal variant="clip" className="relative overflow-hidden rounded-[var(--radius-card)] bg-petrol p-8 text-ivory md:p-12 lg:col-span-7 lg:row-span-2">
            <div className="flex items-start justify-between gap-6">
              <span className="eyebrow text-sage">Pilar 01</span>
              <span className="font-display text-sm italic text-ivory/50">compreender antes de agir</span>
            </div>
            <h3 className="mt-16 font-display text-[clamp(3rem,7vw,6rem)] leading-none tracking-tight">Escuta</h3>
            <p className="mt-6 max-w-md text-lg text-ivory/75">
              Criar oportunidades reais para compreender necessidades, preocupações e sugestões dos colaboradores.
            </p>
            <div className="mt-12 text-sage">
              <ListeningWaves />
            </div>
            <ul className="mt-10 grid gap-3 text-sm text-ivory/80 sm:grid-cols-3">
              {["Ouvidoria anônima", "Pulso organizacional", "Feedback construtivo"].map((c) => (
                <li key={c} className="border-t border-ivory/15 pt-3">{c}</li>
              ))}
            </ul>
          </Reveal>

          {/* Reconhecimento */}
          <Reveal variant="clip" delay={0.1} className="relative overflow-hidden rounded-[var(--radius-card)] bg-[color-mix(in_oklab,var(--brand-terracotta)_32%,var(--brand-ivory))] p-8 md:p-10 lg:col-span-5">
            <span className="eyebrow text-terracotta-2">Pilar 02</span>
            <div className="mt-4 flex items-end justify-between gap-4">
              <h3 className="display-md text-ink">Reconhecimento</h3>
            </div>
            <p className="mt-3 max-w-sm text-ink/70">Valorizar esforços, habilidades e contribuições — não apenas resultados numéricos.</p>
            <FloatingNotes />
          </Reveal>

          {/* Evolução */}
          <Reveal variant="clip" delay={0.2} className="relative overflow-hidden rounded-[var(--radius-card)] bg-sage-2 p-8 text-petrol md:p-10 lg:col-span-5">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">Pilar 03</span>
              <span className="text-xs text-petrol/60">melhoria contínua</span>
            </div>
            <h3 className="display-md mt-4">Evolução</h3>
            <p className="mt-3 max-w-sm text-petrol/75">Transformar feedbacks em ações de melhoria acompanhadas pela gestão.</p>
            <div className="mt-8 px-2">
              <GrowthPath />
            </div>
          </Reveal>
        </div>

        {/* Herzberg */}
        <Reveal className="mt-20 grid gap-10 border-t border-petrol/15 pt-12 md:mt-28 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-4">
            <p className="eyebrow text-terracotta-2">Fundamento teórico</p>
            <h3 className="display-md mt-4 text-petrol">A teoria dos dois fatores</h3>
            <p className="mt-4 text-ink/65">
              Frederick Herzberg (1959) distinguiu fatores que evitam a insatisfação daqueles que de fato geram motivação.
              O programa atua sobre os dois.
            </p>
          </div>
          <div data-reveal className="rounded-[var(--radius-card)] border border-petrol/15 p-7 lg:col-span-4">
            <p className="text-sm font-semibold text-petrol">Fatores higiênicos</p>
            <p className="mt-1 text-sm text-ink/55">Quando ausentes, geram insatisfação.</p>
            <ul className="mt-5 space-y-2.5 text-ink/80">
              {["Condições de trabalho", "Supervisão e comunicação", "Relações interpessoais", "Políticas e critérios claros"].map((t) => (
                <li key={t} className="flex gap-3"><span className="mt-2.5 h-px w-4 shrink-0 bg-petrol/40" />{t}</li>
              ))}
            </ul>
          </div>
          <div data-reveal className="rounded-[var(--radius-card)] bg-petrol p-7 text-ivory lg:col-span-4">
            <p className="text-sm font-semibold text-sage">Fatores motivacionais</p>
            <p className="mt-1 text-sm text-ivory/55">Quando presentes, geram satisfação.</p>
            <ul className="mt-5 space-y-2.5 text-ivory/85">
              {["Reconhecimento", "Realização", "Crescimento e desenvolvimento", "Responsabilidade e autonomia"].map((t) => (
                <li key={t} className="flex gap-3"><span className="mt-2.5 h-px w-4 shrink-0 bg-terracotta" />{t}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
