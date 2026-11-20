"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { AnimatedHeading } from "@/components/motion/animated-heading";
import { Reveal } from "@/components/motion/reveal";
import { DESKTOP_MOTION, gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const PROBLEM_WORDS = ["Sobrecarga.", "Desmotivação.", "Falta de reconhecimento."];
const ANSWER_WORDS = ["Escutar.", "Reconhecer.", "Transformar."];

const CHALLENGES = [
  {
    title: "Pressão excessiva",
    text: "Metas ajustadas sem explicação e cobrança constante transformam o desempenho em fonte de ansiedade, e não de realização.",
    factor: "Fator higiênico",
    factorText: "Políticas e condições de trabalho: quando falham, geram insatisfação.",
  },
  {
    title: "Falta de reconhecimento",
    text: "Quando o esforço só aparece em números, contribuições importantes ficam invisíveis e o sentimento de desvalorização cresce.",
    factor: "Fator motivacional",
    factorText: "Reconhecimento é um dos motivadores centrais descritos por Herzberg.",
  },
  {
    title: "Sobrecarga emocional",
    text: "O atendimento ao público exige controle emocional contínuo. Sem pausas e apoio, o desgaste físico e mental se acumula.",
    factor: "Fator higiênico",
    factorText: "Condições de trabalho adequadas previnem o adoecimento e a insatisfação.",
  },
  {
    title: "Comunicação insuficiente",
    text: "Decisões chegam sem contexto e não há canais para responder. A distância entre equipe e gestão vira desconfiança.",
    factor: "Fator higiênico",
    factorText: "Supervisão e relações interpessoais influenciam diretamente o clima.",
  },
  {
    title: "Ausência de feedback",
    text: "Sem critérios claros e retornos construtivos, ninguém sabe onde está acertando ou como pode crescer.",
    factor: "Fator motivacional",
    factorText: "Realização e crescimento dependem de saber como evoluir.",
  },
];

function WordStage() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_MOTION, () => {
        const root = ref.current!;
        root.dataset.enhanced = "true";
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.8 },
        });
        tl.from("[data-problem-word]", { yPercent: 110, stagger: 0.5, duration: 1 })
          .fromTo("[data-strike]", { scaleX: 0 }, { scaleX: 1, stagger: 0.18, duration: 0.7, ease: "power2.inOut" }, "+=0.4")
          .to("[data-word-text]", { autoAlpha: 0.22, duration: 0.6 }, "<0.3")
          .to("[data-problem-group]", { yPercent: -40, autoAlpha: 0, duration: 1, ease: "power2.in" }, "+=0.3")
          .from("[data-answer-word]", { yPercent: 110, stagger: 0.35, duration: 1 }, "<0.5")
          .from("[data-stage-caption]", { autoAlpha: 0, y: 16, duration: 0.6 }, "<0.6")
          .to({}, { duration: 0.6 });
        return () => {
          delete root.dataset.enhanced;
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="group/stage relative data-[enhanced=true]:h-[340vh]">
      <div className="group-data-[enhanced=true]/stage:sticky group-data-[enhanced=true]/stage:top-0 group-data-[enhanced=true]/stage:flex group-data-[enhanced=true]/stage:h-svh group-data-[enhanced=true]/stage:flex-col group-data-[enhanced=true]/stage:justify-center">
        <div className="container-editorial grid gap-14 py-[var(--section-y)] group-data-[enhanced=true]/stage:py-0">
          <div
            data-problem-group
            className="font-display text-[clamp(2.6rem,8.5vw,8.5rem)] leading-[0.98] tracking-[-0.035em] group-data-[enhanced=true]/stage:[grid-area:1/1]"
          >
            {PROBLEM_WORDS.map((w, i) => (
              <span key={w} className={cn("block overflow-hidden pb-[0.06em]", i === 1 && "md:pl-[10vw]", i === 2 && "md:pl-[4vw]")}>
                <span data-problem-word className="relative inline-block text-ivory">
                  <span data-word-text className="line-through decoration-terracotta decoration-[0.06em] group-data-[enhanced=true]/stage:no-underline">{w}</span>
                  <span
                    data-strike
                    aria-hidden
                    className="absolute left-0 top-[55%] hidden h-[0.06em] w-full origin-left bg-terracotta group-data-[enhanced=true]/stage:block"
                  />
                </span>
              </span>
            ))}
          </div>

          <div className="group-data-[enhanced=true]/stage:[grid-area:1/1] group-data-[enhanced=true]/stage:self-center">
            <p className="eyebrow mb-6 text-sage group-data-[enhanced=true]/stage:hidden">A resposta proposta</p>
            <div className="font-display text-[clamp(2.6rem,8.5vw,8.5rem)] italic leading-[0.98] tracking-[-0.035em] text-sage">
              {ANSWER_WORDS.map((w, i) => (
                <span key={w} className={cn("block overflow-hidden pb-[0.06em]", i === 1 && "md:pl-[14vw]", i === 2 && "md:pl-[28vw]")}>
                  <span data-answer-word className="inline-block">
                    {w}
                  </span>
                </span>
              ))}
            </div>
            <p data-stage-caption className="mt-10 max-w-md text-ivory/70 md:ml-[28vw]">
              O caminho não começa com uma solução pronta, mas com a disposição de ouvir quem vive o trabalho todos os
              dias.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChallengeIndex() {
  const [active, setActive] = useState(0);
  const item = CHALLENGES[active];

  return (
    <div className="container-editorial pb-[var(--section-y)]">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow text-sage">Desafios do cenário estudado</p>
          <p className="mt-4 max-w-sm text-ivory/65">
            Selecione um desafio para ver como ele se relaciona com a teoria dos dois fatores de Frederick Herzberg.
          </p>
          <Reveal as="ul" className="mt-10 border-t border-ivory/12" role="tablist" aria-label="Desafios organizacionais">
            {CHALLENGES.map((c, i) => (
              <li key={c.title} data-reveal className="border-b border-ivory/12">
                <button
                  type="button"
                  role="tab"
                  id={`challenge-tab-${i}`}
                  aria-selected={active === i}
                  aria-controls="challenge-panel"
                  onClick={() => setActive(i)}
                  className={cn(
                    "group flex w-full items-center gap-5 py-5 text-left transition-colors",
                    active === i ? "text-ivory" : "text-ivory/55 hover:text-ivory/85",
                  )}
                >
                  <span className={cn("text-xs tabular-nums transition-colors", active === i ? "text-terracotta" : "text-ivory/40")}>
                    0{i + 1}
                  </span>
                  <span className="font-display text-[1.6rem] leading-tight md:text-[1.9rem]">{c.title}</span>
                  <span
                    aria-hidden
                    className={cn(
                      "ml-auto h-px bg-terracotta transition-all duration-500 ease-[var(--ease-out-expo)]",
                      active === i ? "w-10" : "w-0",
                    )}
                  />
                </button>
              </li>
            ))}
          </Reveal>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <div
            id="challenge-panel"
            role="tabpanel"
            aria-labelledby={`challenge-tab-${active}`}
            className="relative min-h-[22rem] overflow-hidden rounded-[var(--radius-card)] bg-petrol-2 p-8 md:p-12 lg:sticky lg:top-28"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="font-display text-[5.5rem] leading-none text-ivory/10">0{active + 1}</span>
                <h3 className="display-md mt-2 text-ivory">{item.title}</h3>
                <p className="mt-5 text-lg leading-relaxed text-ivory/75">{item.text}</p>
                <div className="mt-10 flex items-start gap-4 border-t border-ivory/12 pt-6">
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                      item.factor === "Fator motivacional" ? "bg-terracotta text-ink" : "bg-sage text-charcoal",
                    )}
                  >
                    {item.factor}
                  </span>
                  <p className="text-sm text-ivory/65">{item.factorText}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Problem() {
  return (
    <section id="problema" aria-label="O problema" className="relative bg-petrol text-ivory">
      <div className="container-editorial pt-[var(--section-y)]">
        <div className="grid gap-8 lg:grid-cols-12">
          <p className="eyebrow text-sage lg:col-span-3">01 — O problema</p>
          <AnimatedHeading
            as="h2"
            lines={["Um ambiente de trabalho melhor", "começa reconhecendo o que", "_precisa mudar._"]}
            accentClassName="text-terracotta"
            className="display-lg lg:col-span-9"
          />
        </div>
      </div>
      <WordStage />
      <ChallengeIndex />
    </section>
  );
}
