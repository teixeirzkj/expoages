"use client";

import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { siteConfig } from "@/config/site";
import { ActionButton } from "@/components/brand/action-button";
import { Magnetic } from "@/components/motion/magnetic-button";
import { useScrollTo } from "@/components/motion/smooth-scroll";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

const LINES: { text: React.ReactNode; indent?: string }[] = [
  { text: "Quando as pessoas" },
  { text: <>são <em className="italic text-terracotta-2">ouvidas</em>, o trabalho</>, indent: "md:pl-[8vw]" },
  { text: "ganha outro significado." },
];

/**
 * Abertura editorial. O título é animado por CSS (aparece já na primeira
 * pintura, sem depender de JS). A rolagem expande o "sol" do horizonte,
 * que cobre a tela e conduz à seção escura seguinte.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.5 },
        });
        tl.to("[data-sun]", { scale: 9, ease: "power2.in", duration: 1 }, 0)
          .to("[data-rings]", { scale: 1.6, autoAlpha: 0, ease: "power1.in", duration: 0.8 }, 0)
          .to("[data-hero-copy]", { yPercent: -12, autoAlpha: 0, ease: "power1.out", duration: 0.42 }, 0)
          .to("[data-hero-foot]", { autoAlpha: 0, duration: 0.2 }, 0);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      id="inicio"
      ref={root}
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ivory pt-[calc(var(--header-h)+2.5rem)] grain"
    >
      {/* Composição abstrata: sol, ondas de escuta e órbita */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 flex justify-center">
        <div data-rings className="absolute bottom-0 left-1/2 aspect-square w-[min(120vw,74rem)] -translate-x-1/2 translate-y-1/2">
          {[1, 0.78, 0.58].map((s, i) => (
            <span
              key={s}
              className="absolute inset-0 m-auto rounded-full border border-petrol/15"
              style={{ width: `${s * 100}%`, height: `${s * 100}%`, animation: `breathe ${9 + i * 2}s ease-in-out ${i * 0.8}s infinite` }}
            />
          ))}
          <span className="absolute inset-0 m-auto size-[78%] animate-orbit">
            <span className="absolute left-1/2 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-terracotta shadow-[0_0_0_6px_rgba(213,142,114,0.18)]" />
          </span>
        </div>
        <div
          data-sun
          className="absolute bottom-0 left-1/2 aspect-square w-[min(46vw,22rem)] -translate-x-1/2 translate-y-1/2 rounded-full bg-petrol will-change-transform max-md:w-[58vw]"
        />
      </div>

      <div data-hero-copy className="container-editorial relative flex flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[0.8rem] text-ink/60 [animation-delay:.1s] animate-fade-up">
          <p className="flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-terracotta" />
            Proposta acadêmica · {siteConfig.academic.course}
          </p>
          <p className="hidden sm:block">Cenário: {siteConfig.company.name.replace(" Ltda.", "")} (fictícia)</p>
        </div>

        <h1
          id="hero-title"
          className="display-xl mt-[clamp(2.5rem,7vh,5.5rem)] max-w-[15ch] text-petrol md:max-w-none"
        >
          {LINES.map((line, i) => (
            <span key={i} className={`block overflow-hidden pb-[0.1em] -mb-[0.1em] ${line.indent ?? ""}`}>
              <span className="block animate-hero-line" style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
                {line.text}
              </span>
            </span>
          ))}
        </h1>

        <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
          <p
            className="lead max-w-[34rem] text-ink/75 animate-fade-up md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8"
            style={{ animationDelay: "0.65s" }}
          >
            Uma proposta para transformar escuta, reconhecimento e feedback em caminhos para um ambiente profissional mais
            saudável.
          </p>
        </div>

        <div
          className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up md:ml-[calc(50%+0.5rem)] lg:ml-[calc(58.33%+0.5rem)]"
          style={{ animationDelay: "0.8s" }}
        >
          <Magnetic>
            <ActionButton size="lg" onClick={() => scrollTo("#programa")} icon={<ArrowDown className="size-4" />}>
              Conhecer o programa
            </ActionButton>
          </Magnetic>
          <ActionButton
            size="lg"
            variant="outline"
            className="text-petrol"
            onClick={() => scrollTo("#participar")}
            icon={<ArrowUpRight className="size-4" />}
          >
            Enviar uma contribuição
          </ActionButton>
        </div>

        <div data-hero-foot className="mt-auto flex items-end justify-between gap-6 pb-6 pt-16 text-xs text-ink/55">
          <ol className="hidden gap-8 md:flex" aria-label="Pilares do programa">
            {["Escuta", "Reconhecimento", "Evolução"].map((p, i) => (
              <li key={p} className="flex items-center gap-2">
                <span className="tabular-nums text-terracotta-2">0{i + 1}</span>
                {p}
              </li>
            ))}
          </ol>
          <span className="flex items-center gap-2" data-secondary>
            <span className="relative block h-8 w-px overflow-hidden bg-ink/15">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_ease-in-out_infinite] bg-petrol" />
            </span>
            Role para continuar
          </span>
        </div>
      </div>
    </section>
  );
}
