"use client";

import { useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Linha decorativa que cresce acompanhando a rolagem. */
export function LineGrow({ className, vertical = false }: { className?: string; vertical?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          ref.current,
          vertical ? { scaleY: 0 } : { scaleX: 0 },
          {
            ...(vertical ? { scaleY: 1 } : { scaleX: 1 }),
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top 92%", end: "top 45%", scrub: 0.6 },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(vertical ? "w-px origin-top" : "h-px origin-left", "bg-current opacity-25", className)}
    />
  );
}
