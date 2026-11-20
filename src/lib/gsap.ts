"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

let registered = false;
if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  registered = true;
}

/** Condição padrão: só anima quando o usuário não pediu movimento reduzido. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
/** Efeitos mais elaborados (pin/scrub) apenas em telas largas com ponteiro preciso. */
export const DESKTOP_MOTION = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, useGSAP };
