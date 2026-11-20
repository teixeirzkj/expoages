"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { scrollToTarget } from "@/components/motion/scroll-to";
import { ProtocolTracker } from "./protocol-tracker";

export type ParticipeTab = "ouvidoria" | "feedback" | "pulso" | "cursos";

interface ParticipationApi {
  tab: ParticipeTab;
  /** Seleciona uma aba da seção "Participe" (e rola até ela, se pedido). */
  selectTab: (tab: ParticipeTab, opts?: { scroll?: boolean }) => void;
  /** Abre o painel de consulta pelo protocolo. */
  openTracker: (protocol?: string) => void;
}

const Ctx = createContext<ParticipationApi | null>(null);

/**
 * Estado compartilhado da área de participação: aba ativa (para que header,
 * hero e modo apresentação levem direto ao formulário certo) e o painel
 * lateral de acompanhamento por protocolo.
 */
export function ParticipationProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<ParticipeTab>("ouvidoria");
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [protocol, setProtocol] = useState("");
  const [instance, setInstance] = useState(0);

  const selectTab = useCallback((next: ParticipeTab, opts?: { scroll?: boolean }) => {
    setTab(next);
    if (opts?.scroll) scrollToTarget("#participe");
  }, []);

  const openTracker = useCallback((proto?: string) => {
    setProtocol(proto ?? "");
    setInstance((n) => n + 1); // consulta sempre limpa a cada abertura
    setTrackerOpen(true);
  }, []);

  const api = useMemo(() => ({ tab, selectTab, openTracker }), [tab, selectTab, openTracker]);

  return (
    <Ctx value={api}>
      {children}
      <Dialog.Root open={trackerOpen} onOpenChange={setTrackerOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-[80] bg-navy/50 transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
          <Dialog.Popup className="fixed inset-y-0 right-0 z-[90] flex w-full flex-col overflow-y-auto overscroll-contain bg-white shadow-2xl outline-none transition-transform duration-300 ease-[var(--ease-out-quart)] data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full md:w-[min(40rem,92vw)]">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-navy/8 bg-white px-5 py-3 md:px-8">
              <p className="eyebrow text-blue">Acompanhar retorno</p>
              <Dialog.Close
                className="inline-flex size-11 items-center justify-center rounded-full bg-mist text-navy transition-colors hover:bg-cream-2"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </Dialog.Close>
            </div>
            <div className="flex-1 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 md:px-8">
              <Dialog.Title className="display-md text-navy">Consulte pelo protocolo</Dialog.Title>
              <Dialog.Description className="mt-2 max-w-lg text-slate">
                Digite o protocolo completo recebido no envio para ver o andamento e as devolutivas da gestão.
              </Dialog.Description>
              <div className="mt-8">
                <ProtocolTracker key={instance} initialProtocol={protocol} />
              </div>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </Ctx>
  );
}

export function useParticipation() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useParticipation precisa estar dentro de ParticipationProvider");
  return ctx;
}
