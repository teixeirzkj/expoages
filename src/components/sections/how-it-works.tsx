"use client";

import { useRef } from "react";
import { MonitorSmartphone, ListChecks, Send, Inbox, ClipboardCheck } from "lucide-react";
import { AnimatedHeading } from "@/components/motion/animated-heading";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

const STEPS = [
  { icon: MonitorSmartphone, title: "O colaborador acessa a plataforma", text: "Pelo celular, computador ou em um totem/tablet na empresa — sem cadastro e sem login." },
  { icon: ListChecks, title: "Escolhe o tipo de contribuição", text: "Ouvidoria anônima, reconhecimento, feedback construtivo ou a pesquisa de pulso." },
  { icon: Send, title: "Envia sua mensagem", text: "O formulário orienta a não incluir dados pessoais. Ao final, um protocolo é gerado." },
  { icon: Inbox, title: "A gestão recebe e analisa", text: "Apenas administradores autorizados acessam o painel, classificam e acompanham cada registro." },
  { icon: ClipboardCheck, title: "A organização dá uma devolutiva", text: "Uma resposta ou ação de melhoria é registrada e pode ser consultada pelo protocolo." },
];

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const root = ref.current!;
        root.dataset.enhanced = "true";
        const steps = gsap.utils.toArray<HTMLElement>("[data-step]");
        gsap.fromTo(
          "[data-track-fill]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: "[data-steps]", start: "top 60%", end: "bottom 60%", scrub: 0.5 },
          },
        );
        steps.forEach((step, i) => {
          ScrollTrigger.create({
            trigger: step,
            start: "top 62%",
            end: "bottom 62%",
            toggleClass: { targets: step, className: "is-active" },
            onEnter: () => setCounter(i),
            onEnterBack: () => setCounter(i),
          });
        });
        function setCounter(i: number) {
          const el = ref.current?.querySelector("[data-counter]");
          if (el) el.textContent = String(i + 1).padStart(2, "0");
        }
        return () => {
          delete root.dataset.enhanced;
        };
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.utils.toArray<HTMLElement>("[data-step]").forEach((s) => s.classList.add("is-active"));
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section id="como-funciona" ref={ref} aria-label="Como funciona" className="group/how relative bg-ivory-2 section-y">
      <div className="container-editorial grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow text-terracotta-2">03 — Como funciona</p>
            <AnimatedHeading
              lines={["Da mensagem", "à _devolutiva_,", "em cinco passos."]}
              accentClassName="text-terracotta-2"
              className="display-lg mt-6 text-petrol"
            />
            <p className="mt-6 max-w-sm text-ink/65">
              Uma jornada curta e transparente: quem participa sabe o que acontece com sua contribuição.
            </p>
            <p className="mt-12 hidden items-baseline gap-3 text-petrol lg:flex" aria-hidden>
              <span data-counter className="font-display text-7xl tabular-nums leading-none">01</span>
              <span className="text-sm text-ink/45">/ 05</span>
            </p>
          </div>
        </div>

        <ol data-steps className="relative lg:col-span-6 lg:col-start-7">
          <span aria-hidden className="absolute bottom-6 left-[1.6rem] top-6 w-px bg-petrol/12">
            <span data-track-fill className="absolute inset-0 origin-top bg-terracotta" />
          </span>
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li
              key={title}
              data-step
              className="group/step relative flex gap-6 py-8 opacity-100 transition-opacity duration-500 md:py-12 group-data-[enhanced=true]/how:[&:not(.is-active)]:opacity-40"
            >
              <span className="relative z-10 flex size-[3.25rem] shrink-0 items-center justify-center rounded-full border border-petrol/15 bg-ivory text-petrol transition-[background-color,color,border-color] duration-500 group-[.is-active]/step:border-petrol group-[.is-active]/step:bg-petrol group-[.is-active]/step:text-ivory">
                <Icon className="size-5" strokeWidth={1.6} />
              </span>
              <div className="pt-1.5">
                <span className="text-xs font-semibold tabular-nums text-terracotta-2">Etapa {String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 font-display text-[1.65rem] leading-tight text-petrol md:text-[2rem]">{title}</h3>
                <p className="mt-3 max-w-md text-ink/65">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
