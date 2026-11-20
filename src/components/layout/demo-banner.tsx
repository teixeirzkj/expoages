"use client";

import { FlaskConical, X } from "lucide-react";
import { useState, useTransition } from "react";
import { setDemoMode } from "@/app/actions/demo";
import { DEMO_COOKIE } from "@/lib/demo/constants";
import { useCookieFlag } from "./use-cookie-flag";

/**
 * DemoModeBanner: informa que os envios deste aparelho vão para o ambiente
 * fictício. `forced` indica que o Supabase não está configurado.
 */
export function DemoModeBanner({ forced }: { forced: boolean }) {
  const cookieOn = useCookieFlag(DEMO_COOKIE);
  const [hidden, setHidden] = useState(false);
  const [pending, start] = useTransition();
  if (!(forced || cookieOn) || hidden) return null;

  return (
    <div
      role="status"
      className="demo-banner fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex max-w-[calc(100vw-2rem)] items-center gap-3 whitespace-nowrap rounded-full bg-sage py-2 pl-4 pr-2 text-sm text-charcoal shadow-lg"
    >
      <FlaskConical className="size-4 shrink-0" />
      <span className="leading-tight">
        <strong className="font-semibold">Modo demonstração</strong>
        <span className="hidden sm:inline"> · envios vão para um ambiente fictício</span>
      </span>
      {!forced && (
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => setDemoMode(false))}
          className="rounded-full bg-charcoal/10 px-3 py-1 text-xs font-semibold hover:bg-charcoal/20"
        >
          Desativar
        </button>
      )}
      <button type="button" onClick={() => setHidden(true)} aria-label="Ocultar aviso" className="flex size-7 items-center justify-center rounded-full hover:bg-charcoal/10">
        <X className="size-3.5" />
      </button>
    </div>
  );
}
