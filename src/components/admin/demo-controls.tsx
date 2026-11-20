"use client";

import { FlaskConical, MonitorPlay, RotateCcw } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { resetDemo, setDemoMode, setPresentationMode } from "@/app/actions/demo";
import { DEMO_COOKIE, PRESENT_COOKIE } from "@/lib/demo/constants";
import { useCookieFlag } from "@/components/layout/use-cookie-flag";
import { cn } from "@/lib/utils";

function Toggle({ on, label, hint, icon, onChange, disabled }: { on: boolean; label: string; hint: string; icon: React.ReactNode; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      disabled={disabled}
      className="flex w-full items-center gap-4 rounded-2xl bg-cream px-4 py-3.5 text-left disabled:opacity-60"
    >
      <span className="text-navy">{icon}</span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="block text-xs text-ink/55">{hint}</span>
      </span>
      <span className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", on ? "bg-navy" : "bg-navy/20")}>
        <span className={cn("absolute top-1 size-5 rounded-full bg-cream shadow transition-all", on ? "left-6" : "left-1")} />
      </span>
    </button>
  );
}

/** Controles do modo demonstração (cookies deste aparelho + memória fictícia). */
export function DemoControls({ supabaseConfigured }: { supabaseConfigured: boolean }) {
  const demoOn = useCookieFlag(DEMO_COOKIE) || !supabaseConfigured;
  const presentOn = useCookieFlag(PRESENT_COOKIE);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-3">
      <Toggle
        on={demoOn}
        disabled={!supabaseConfigured || pending}
        icon={<FlaskConical className="size-5" />}
        label="Envios deste aparelho no modo demonstração"
        hint={supabaseConfigured ? "Formulários públicos gravam no ambiente fictício, não no banco real." : "Sempre ativo: o Supabase ainda não foi configurado."}
        onChange={() => start(() => setDemoMode(!demoOn))}
      />
      <Toggle
        on={presentOn}
        disabled={pending}
        icon={<MonitorPlay className="size-5" />}
        label="Modo apresentação neste aparelho"
        hint="Interface limpa no site e barra de atalhos para quem apresenta."
        onChange={() => start(() => setPresentationMode(!presentOn))}
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Restaurar os dados fictícios iniciais? Envios feitos na demonstração serão apagados.")) return;
          start(async () => {
            await resetDemo();
            toast.success("Demonstração reiniciada");
          });
        }}
        className="inline-flex h-11 items-center gap-2 rounded-full bg-navy px-5 text-sm font-semibold text-white hover:bg-blue disabled:opacity-50"
      >
        <RotateCcw className="size-4" /> Reiniciar demonstração
      </button>
    </div>
  );
}
