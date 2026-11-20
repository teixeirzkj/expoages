"use client";

import Link from "next/link";
import { GraduationCap, LayoutDashboard, LogOut, MessageSquarePlus } from "lucide-react";
import { useEffect, useTransition } from "react";
import { setPresentationMode } from "@/app/actions/demo";
import { PRESENT_COOKIE } from "@/lib/demo/constants";
import { useParticipation } from "@/components/forms/participation";
import { useScrollTo } from "@/components/motion/scroll-to";
import { useCookieFlag } from "./use-cookie-flag";

const JUMPS = [
  { id: "inicio", label: "Início" },
  { id: "programa", label: "Programa" },
  { id: "como-funciona", label: "Como funciona" },
  { id: "sobre", label: "Sobre" },
];

/** Barra de navegação rápida para quem apresenta (modo apresentação). */
export function PresenterDock() {
  const on = useCookieFlag(PRESENT_COOKIE);
  const scrollTo = useScrollTo();
  const { selectTab } = useParticipation();
  const [pending, start] = useTransition();

  useEffect(() => {
    if (on) document.documentElement.dataset.presentation = "true";
    else delete document.documentElement.dataset.presentation;
  }, [on]);

  if (!on) return null;

  return (
    <nav
      aria-label="Atalhos de apresentação"
      className="surface-dark fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full bg-navy p-1.5 text-cream shadow-2xl"
    >
      {JUMPS.map((j) => (
        <button
          key={j.id}
          type="button"
          onClick={() => scrollTo(`#${j.id}`)}
          className="h-11 shrink-0 rounded-full px-3.5 text-sm font-medium text-cream/80 hover:bg-cream/10 hover:text-cream"
        >
          {j.label}
        </button>
      ))}
      <span className="mx-1 h-6 w-px shrink-0 bg-cream/20" />
      <button
        type="button"
        onClick={() => selectTab("ouvidoria", { scroll: true })}
        className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-navy"
      >
        <MessageSquarePlus className="size-4" /> Participar
      </button>
      <button
        type="button"
        onClick={() => selectTab("cursos", { scroll: true })}
        className="flex h-11 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-medium text-cream/80 hover:bg-cream/10 hover:text-cream"
      >
        <GraduationCap className="size-4" /> Cursos
      </button>
      <Link href="/demo" className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-sky px-4 text-sm font-semibold text-navy">
        <LayoutDashboard className="size-4" /> Painel demo
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => setPresentationMode(false))}
        aria-label="Sair do modo apresentação"
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-cream/70 hover:bg-cream/10"
      >
        <LogOut className="size-4" />
      </button>
    </nav>
  );
}
