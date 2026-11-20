"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, MessageSquarePlus } from "lucide-react";
import { useEffect, useTransition } from "react";
import { setPresentationMode } from "@/app/actions/demo";
import { PRESENT_COOKIE } from "@/lib/demo/constants";
import { useParticipation } from "@/components/forms/participation";
import { useScrollTo } from "@/components/motion/smooth-scroll";
import { useCookieFlag } from "./use-cookie-flag";

const JUMPS = [
  { id: "inicio", label: "Início" },
  { id: "problema", label: "Problema" },
  { id: "programa", label: "Programa" },
  { id: "ouvidoria", label: "Ouvidoria" },
  { id: "reconhecimento", label: "Feedback" },
  { id: "pulso", label: "Pulso" },
  { id: "acao", label: "Ação" },
];

/** Barra de navegação rápida para quem apresenta (modo apresentação). */
export function PresenterDock() {
  const on = useCookieFlag(PRESENT_COOKIE);
  const scrollTo = useScrollTo();
  const { open } = useParticipation();
  const [pending, start] = useTransition();

  useEffect(() => {
    if (on) document.documentElement.dataset.presentation = "true";
    else delete document.documentElement.dataset.presentation;
  }, [on]);

  if (!on) return null;

  return (
    <nav
      aria-label="Atalhos de apresentação"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full bg-charcoal/95 p-1.5 text-ivory shadow-2xl backdrop-blur"
    >
      {JUMPS.map((j) => (
        <button
          key={j.id}
          type="button"
          onClick={() => scrollTo(`#${j.id}`)}
          className="h-11 shrink-0 rounded-full px-3.5 text-sm font-medium text-ivory/80 hover:bg-ivory/10 hover:text-ivory"
        >
          {j.label}
        </button>
      ))}
      <span className="mx-1 h-6 w-px shrink-0 bg-ivory/20" />
      <button
        type="button"
        onClick={() => open("ouvidoria")}
        className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-terracotta px-4 text-sm font-semibold text-ink"
      >
        <MessageSquarePlus className="size-4" /> Enviar
      </button>
      <Link href="/demo" className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-sage px-4 text-sm font-semibold text-charcoal">
        <LayoutDashboard className="size-4" /> Painel demo
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => setPresentationMode(false))}
        aria-label="Sair do modo apresentação"
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-ivory/70 hover:bg-ivory/10"
      >
        <LogOut className="size-4" />
      </button>
    </nav>
  );
}
