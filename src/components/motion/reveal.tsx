"use client";

import { useRef, type ElementType, type ReactNode, type ComponentPropsWithoutRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type RevealProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  /** Intervalo entre filhos marcados com data-reveal (stagger). */
  stagger?: number;
  y?: number;
  delay?: number;
  /** "fade" (deslocamento + opacidade) ou "clip" (máscara de baixo para cima). */
  variant?: "fade" | "clip";
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

/**
 * SectionReveal: anima a entrada dos elementos com data-reveal quando a
 * seção entra na viewport. Sem JavaScript, ou com movimento reduzido, o
 * conteúdo aparece normalmente (o estado inicial é aplicado apenas pelo GSAP).
 */
export function Reveal<T extends ElementType = "div">({
  as,
  children,
  className,
  stagger = 0.09,
  y = 28,
  delay = 0,
  variant = "fade",
  ...rest
}: RevealProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const root = ref.current!;
        const items = root.querySelectorAll<HTMLElement>("[data-reveal]");
        const targets = items.length ? items : [root];
        const from =
          variant === "clip"
            ? { clipPath: "inset(100% 0% 0% 0%)", y: 12 }
            : { opacity: 0, y };
        const to =
          variant === "clip"
            ? { clipPath: "inset(0% 0% 0% 0%)", y: 0 }
            : { opacity: 1, y: 0 };
        gsap.fromTo(targets, from, {
          ...to,
          duration: variant === "clip" ? 1.1 : 0.95,
          ease: "expo.out",
          stagger,
          delay,
          clearProps: "transform,clipPath",
          scrollTrigger: { trigger: root, start: "top 82%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={cn(className)} {...rest}>
      {children}
    </Tag>
  );
}
