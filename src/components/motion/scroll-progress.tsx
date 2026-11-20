"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Barra fina de progresso da leitura no topo da página. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      data-secondary
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-terracotta"
    />
  );
}
