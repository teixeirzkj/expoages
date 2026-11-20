"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { FeedbackKind } from "@/lib/domain";
import { FeedbackForm } from "./feedback-form";
import { OuvidoriaForm } from "./ouvidoria-form";
import { ProtocolTracker } from "./protocol-tracker";

type Panel = "ouvidoria" | "reconhecimento" | "construtivo" | "tracker";

interface ParticipationApi {
  open: (panel: Panel, protocol?: string) => void;
}

const Ctx = createContext<ParticipationApi | null>(null);

const META: Record<Panel, { eyebrow: string; title: string; description: string }> = {
  ouvidoria: {
    eyebrow: "Ouvidoria anônima",
    title: "Sua voz merece espaço.",
    description: "Compartilhe uma ideia, preocupação ou oportunidade de melhoria. Nenhum dado pessoal é solicitado.",
  },
  reconhecimento: {
    eyebrow: "Reconhecimento",
    title: "Reconhecer também é cuidar.",
    description: "Valorize uma equipe, prática ou contribuição. A mensagem não é publicada automaticamente.",
  },
  construtivo: {
    eyebrow: "Feedback construtivo",
    title: "O que poderia ser melhor?",
    description: "Sugira melhorias em práticas, processos ou no ambiente organizacional.",
  },
  tracker: {
    eyebrow: "Acompanhar retorno",
    title: "Consulte pelo protocolo.",
    description: "Digite o protocolo completo recebido no envio para ver o andamento e as devolutivas autorizadas.",
  },
};

/**
 * Centraliza os formulários de participação em um único painel modal, que
 * pode ser aberto de qualquer seção (e pelo modo apresentação).
 */
export function ParticipationProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [protocol, setProtocol] = useState("");
  const [instance, setInstance] = useState(0);

  const open = useCallback((p: Panel, proto?: string) => {
    setProtocol(proto ?? "");
    setPanel(p);
    setInstance((n) => n + 1); // formulário sempre limpo a cada abertura
  }, []);
  const close = useCallback(() => setPanel(null), []);
  const api = useMemo(() => ({ open }), [open]);
  const toTracker = useCallback((p: string) => open("tracker", p), [open]);

  const [lastPanel, setLastPanel] = useState<Panel>("ouvidoria");
  if (panel && panel !== lastPanel) setLastPanel(panel);
  const shown = panel ?? lastPanel; // mantém o conteúdo durante a animação de saída
  const meta = META[shown];

  return (
    <Ctx value={api}>
      {children}
      <Dialog.Root open={panel !== null} onOpenChange={(o) => !o && close()}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-[80] bg-charcoal/55 backdrop-blur-[2px] transition-opacity duration-500 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
          <Dialog.Popup
            data-lenis-prevent
            className="fixed inset-y-0 right-0 z-[90] flex w-full flex-col overflow-y-auto overscroll-contain bg-card shadow-2xl outline-none transition-transform duration-500 ease-[var(--ease-out-expo)] data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full md:w-[min(46rem,92vw)] md:rounded-l-[2rem]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-petrol/8 bg-card/95 px-6 py-4 backdrop-blur md:px-10">
              <p className="eyebrow text-terracotta-2">{meta.eyebrow}</p>
              <Dialog.Close
                className="inline-flex size-11 items-center justify-center rounded-full bg-ivory-2 text-petrol transition-colors hover:bg-sage-2"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </Dialog.Close>
            </div>
            <div className="flex-1 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 md:px-10">
              <Dialog.Title className="display-md text-petrol">{meta.title}</Dialog.Title>
              <Dialog.Description className="mt-3 max-w-lg text-ink/65">{meta.description}</Dialog.Description>
              <div className="mt-10">
                {shown === "ouvidoria" && <OuvidoriaForm key={instance} onTrack={toTracker} onClose={close} />}
                {(shown === "reconhecimento" || shown === "construtivo") && (
                  <FeedbackForm key={instance} initialKind={shown as FeedbackKind} onTrack={toTracker} onClose={close} />
                )}
                {shown === "tracker" && <ProtocolTracker key={instance} initialProtocol={protocol} />}
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
