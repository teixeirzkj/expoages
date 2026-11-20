"use client";

import { Fragment, useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface AnimatedHeadingProps {
  as?: ElementType;
  /** Cada string é uma linha (a partir de 768px); trechos em _sublinhado_ ficam em itálico de destaque. */
  lines: string[];
  className?: string;
  accentClassName?: string;
  delay?: number;
}

function renderLine(line: string, accentClassName?: string): ReactNode[] {
  return line.split(/(_[^_]+_)/g).filter(Boolean).map((chunk, i) =>
    chunk.startsWith("_") && chunk.endsWith("_") ? (
      <em key={i} className={cn("italic", accentClassName)}>
        {chunk.slice(1, -1)}
      </em>
    ) : (
      <Fragment key={i}>{chunk}</Fragment>
    ),
  );
}

/**
 * Título com revelação por máscara, linha a linha (tablet/desktop). No
 * celular as linhas fluem naturalmente (sem órfãs) e o título surge como bloco.
 * O texto completo fica no DOM desde o servidor: legível sem JS e por leitores de tela.
 */
export function AnimatedHeading({ as: Tag = "h2", lines, className, accentClassName, delay = 0 }: AnimatedHeadingProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const trigger = { trigger: ref.current, start: "top 85%", once: true };
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ref.current!.querySelectorAll("[data-line-inner]"),
          { yPercent: 110, rotate: 1.5 },
          { yPercent: 0, rotate: 0, duration: 1.25, ease: "expo.out", stagger: 0.1, delay, scrollTrigger: trigger },
        );
      });
      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ref.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 1, ease: "expo.out", delay, scrollTrigger: trigger, clearProps: "transform" },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          <span className="md:block md:overflow-hidden md:pb-[0.08em] md:-mb-[0.08em]">
            <span data-line-inner className="md:block md:will-change-transform">
              {renderLine(line, accentClassName)}
            </span>
          </span>
          {i < lines.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
