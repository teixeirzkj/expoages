"use client";

import Lenis from "lenis";
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type ScrollTo = (target: string | HTMLElement | number, opts?: { offset?: number }) => void;
const ScrollContext = createContext<ScrollTo | null>(null);

/**
 * Scroll suave com Lenis APENAS em desktop com ponteiro preciso e sem
 * preferência por movimento reduzido. Em iPad/celulares o scroll é nativo.
 * O Lenis é dirigido pelo ticker do GSAP para manter o ScrollTrigger em sincronia.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    let tick: ((time: number) => void) | null = null;

    const start = () => {
      if (lenisRef.current) return;
      const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95, smoothWheel: true });
      lenisRef.current = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    };
    const stop = () => {
      if (tick) gsap.ticker.remove(tick);
      lenisRef.current?.destroy();
      lenisRef.current = null;
      tick = null;
    };
    const sync = () => (mq.matches ? start() : stop());
    sync();
    mq.addEventListener("change", sync);
    // Recalcula gatilhos quando as fontes terminam de carregar.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      mq.removeEventListener("change", sync);
      stop();
    };
  }, []);

  const scrollTo = useCallback<ScrollTo>((target, opts) => {
    const offset = opts?.offset ?? -72;
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (lenisRef.current && el != null) {
      lenisRef.current.scrollTo(el, { offset, duration: 1.4 });
      return;
    }
    if (typeof el === "number") {
      window.scrollTo({ top: el, behavior: "smooth" });
    } else if (el) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    }
  }, []);

  return <ScrollContext value={scrollTo}>{children}</ScrollContext>;
}

export function useScrollTo(): ScrollTo {
  const ctx = useContext(ScrollContext);
  return (
    ctx ??
    ((target) => {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      if (el instanceof HTMLElement) el.scrollIntoView({ behavior: "smooth" });
    })
  );
}
