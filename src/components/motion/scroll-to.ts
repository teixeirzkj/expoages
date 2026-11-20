"use client";

import { useCallback } from "react";

/**
 * Rolagem até uma âncora com o scroll NATIVO do navegador (sem bibliotecas):
 * responde imediatamente ao toque/roda e respeita o movimento reduzido.
 * O deslocamento do header fixo vem de `scroll-padding-top` (globals.css).
 */
export function scrollToTarget(target: string | HTMLElement) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

export function useScrollTo() {
  return useCallback((target: string | HTMLElement) => scrollToTarget(target), []);
}
