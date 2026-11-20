"use client";

import { FlaskConical } from "lucide-react";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { setDemoMode } from "@/app/actions/demo";
import { DEMO_COOKIE } from "@/lib/demo/constants";
import { cn } from "@/lib/utils";
import { useCookieFlag } from "./use-cookie-flag";

/**
 * Indicador do modo demonstração, integrado ao header (nunca flutua sobre
 * campos ou botões). Toque/clique abre um pequeno painel com a explicação.
 * `forced` = Supabase não configurado (não há como desativar).
 */
export function DemoModeBadge({ forced, tone }: { forced: boolean; tone: "light" | "dark" }) {
  const cookieOn = useCookieFlag(DEMO_COOKIE);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const root = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!(forced || cookieOn)) return null;

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[0.8125rem] font-semibold transition-colors",
          tone === "dark" ? "bg-white/10 text-sky hover:bg-white/15" : "bg-mist text-navy hover:bg-cream-2",
        )}
      >
        <FlaskConical className="size-3.5 shrink-0" aria-hidden />
        <span className="sm:hidden">Demo</span>
        <span className="hidden sm:inline">Demonstração</span>
      </button>
      <div
        id={panelId}
        role="status"
        hidden={!open}
        className="absolute right-0 top-[calc(100%+0.5rem)] w-[min(18rem,calc(100vw-2rem))] rounded-xl bg-white p-4 text-left text-sm text-ink shadow-[0_12px_32px_-12px_rgba(19,25,54,0.35)] ring-1 ring-navy/10 animate-panel-in sm:left-0 sm:right-auto"
      >
        <p className="font-semibold text-navy">Modo demonstração ativo</p>
        <p className="mt-1 leading-snug text-slate">
          Os envios deste aparelho vão para um ambiente fictício, usado na apresentação. Nenhum dado real é gravado.
        </p>
        {!forced && (
          <button
            type="button"
            disabled={pending}
            onClick={() => start(() => setDemoMode(false))}
            className="mt-3 inline-flex h-9 items-center rounded-full bg-navy px-3.5 text-[0.8125rem] font-semibold text-white disabled:opacity-60"
          >
            Desativar neste aparelho
          </button>
        )}
      </div>
    </div>
  );
}
