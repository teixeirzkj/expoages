"use client";

import { ArrowUpRight } from "lucide-react";
import { useRef, type PointerEvent } from "react";
import { DESKTOP_MOTION, gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

/** Conceito B — Institucional contemporâneo: fundo escuro, linhas geométricas, foco que segue o ponteiro. */
export function ConceptB() {
  const ref = useRef<HTMLElement>(null);
  const onMove = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-b-line]", { scaleX: 0, transformOrigin: "left", duration: 1.6, ease: "expo.out", stagger: 0.08 });
        gsap.from("[data-b-word]", { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.08, delay: 0.3 });
        gsap.to("[data-b-dot]", { left: "88%", duration: 6, ease: "sine.inOut", repeat: -1, yoyo: true });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      onPointerMove={onMove}
      className="relative isolate flex min-h-[100svh] flex-col justify-between overflow-hidden bg-charcoal px-[var(--gutter)] py-10 text-ivory [--mx:50%] [--my:40%]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(600px_circle_at_var(--mx)_var(--my),rgba(184,199,176,0.12),transparent_60%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {[18, 36, 54, 72].map((t) => (
          <span key={t} data-b-line className="absolute inset-x-0 h-px bg-ivory/8" style={{ top: `${t}%` }} />
        ))}
        {[25, 50, 75].map((l) => (
          <span key={l} className="absolute inset-y-0 w-px bg-ivory/5" style={{ left: `${l}%` }} />
        ))}
      </div>

      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-ivory/50">
        <span>Horizonte · Programa de valorização</span>
        <span>Proposta acadêmica</span>
      </div>

      <div>
        <p className="mb-6 text-sm text-sage">Escuta · Reconhecimento · Evolução</p>
        <h2 className="max-w-6xl font-sans text-[clamp(2.6rem,7vw,7rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
          {["Quando as pessoas são", "ouvidas, o trabalho ganha", "outro significado."].map((l, i) => (
            <span key={l} className="block overflow-hidden">
              <span data-b-word className={`block ${i === 1 ? "text-sage" : ""}`}>{l}</span>
            </span>
          ))}
        </h2>
      </div>

      <div className="relative">
        <div className="relative mb-8 h-px bg-ivory/20">
          <span data-b-dot className="absolute -top-1.5 left-[8%] size-3 rounded-full bg-terracotta shadow-[0_0_24px_rgba(213,142,114,0.8)]" />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <p className="max-w-md text-ivory/65">Uma proposta para transformar escuta, reconhecimento e feedback em um ambiente profissional mais saudável.</p>
          <span className="inline-flex h-14 items-center gap-3 rounded-none border border-ivory/30 px-6 font-semibold">
            Conhecer o programa <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </section>
  );
}

/** Conceito C — Experiência narrativa: palavras gigantes deslizando com a rolagem e formas orgânicas. */
export function ConceptC() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_MOTION, () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom bottom", scrub: 0.6 } });
        tl.fromTo("[data-c-row='1']", { xPercent: 0 }, { xPercent: -35, ease: "none" }, 0)
          .fromTo("[data-c-row='2']", { xPercent: -35 }, { xPercent: 0, ease: "none" }, 0)
          .fromTo("[data-c-row='3']", { xPercent: 0 }, { xPercent: -30, ease: "none" }, 0)
          .to("[data-c-blob]", { rotate: 90, scale: 1.3, ease: "none" }, 0)
          .fromTo("[data-c-claim]", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.3 }, 0.55);
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const row = "whitespace-nowrap font-display text-[clamp(4rem,16vw,15rem)] leading-[0.9] tracking-[-0.05em]";
  return (
    <section ref={ref} className="relative bg-sage-2 lg:h-[220vh]">
      <div className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden lg:sticky lg:top-0 lg:h-svh">
        <div data-c-blob aria-hidden className="absolute right-[10%] top-[18%] size-[38vmin] rounded-[42%_58%_63%_37%/41%_44%_56%_59%] bg-terracotta/70 mix-blend-multiply" />
        <div data-c-blob aria-hidden className="absolute bottom-[12%] left-[14%] size-[30vmin] rounded-[63%_37%_54%_46%/55%_48%_52%_45%] bg-petrol/80 mix-blend-multiply" />
        <div className="relative space-y-2 text-petrol">
          <p data-c-row="1" className={row}>escutar — escutar — escutar —</p>
          <p data-c-row="2" className={`${row} italic text-terracotta-2`}>reconhecer — reconhecer —</p>
          <p data-c-row="3" className={row}>transformar — transformar —</p>
        </div>
        <div data-c-claim className="relative mx-[var(--gutter)] mt-10 max-w-xl rounded-3xl bg-ivory/90 p-6 backdrop-blur">
          <p className="font-display text-2xl text-petrol">Quando as pessoas são ouvidas, o trabalho ganha outro significado.</p>
          <p className="mt-2 text-sm text-ink/60">Role para ver as palavras se moverem.</p>
        </div>
      </div>
    </section>
  );
}
