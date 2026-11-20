"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

/* Um único IntersectionObserver para a página inteira: nenhum listener de
   scroll, nenhum estado React — apenas atributos e transições CSS (opacity +
   transform, que rodam no compositor). */
let observer: IntersectionObserver | null = null;
function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.shown = "";
          observer!.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
  }
  return observer;
}

/**
 * Revela o bloco (ou seus filhos com `data-reveal`, em sequência curta) quando
 * ele entra na viewport. Só "arma" elementos abaixo da dobra: o que já está
 * visível não pisca, e sem JavaScript ou com movimento reduzido tudo aparece.
 */
export function Reveal<T extends ElementType = "div">({ as, children, className, ...rest }: RevealProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    el.querySelectorAll<HTMLElement>("[data-reveal]").forEach((child, i) => child.style.setProperty("--i", String(Math.min(i, 6))));
    el.dataset.armed = "";
    const io = getObserver();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  return (
    <Tag ref={ref} className={cn(className)} {...rest}>
      {children}
    </Tag>
  );
}
