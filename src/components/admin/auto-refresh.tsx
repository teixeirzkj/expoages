"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

/**
 * Atualiza os dados da tela periodicamente enquanto a aba está visível,
 * para que envios feitos em outro aparelho apareçam sem ação manual.
 */
export function AutoRefresh({ seconds = 12 }: { seconds?: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [last, setLast] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      start(() => router.refresh());
      setLast(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    const id = window.setInterval(tick, seconds * 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router, seconds]);

  return (
    <button
      type="button"
      onClick={() => start(() => router.refresh())}
      className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs text-ink/55 ring-1 ring-petrol/10 hover:bg-ivory-2"
      title="Atualizar agora"
    >
      <RefreshCw className={cn("size-3.5", pending && "animate-spin")} aria-hidden />
      <span>Atualização automática{last ? ` · ${last}` : ""}</span>
    </button>
  );
}
