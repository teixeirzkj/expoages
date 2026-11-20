"use client";

import { Dialog } from "@base-ui/react/dialog";
import { LoaderCircle, Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createActionPlan } from "@/app/actions/admin";
import {
  ACTION_CATEGORIES,
  ACTION_PRIORITIES,
  ACTION_STATUSES,
  LIMITS,
  type ActionCategory,
  type ActionPriority,
  type ActionStatus,
  type DataMode,
} from "@/lib/domain";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-xl border border-navy/15 bg-card px-3 text-base focus:border-navy focus:outline-none focus:ring-4 focus:ring-sky/20";

interface Defaults {
  title?: string;
  description?: string;
  category?: ActionCategory;
  linkedReference?: string;
}

/** Diálogo para registrar uma ação de melhoria (opcionalmente vinculada a um protocolo). */
export function ActionFormDialog({
  mode,
  defaults,
  triggerLabel = "Nova ação",
  triggerClassName,
}: {
  mode: DataMode;
  defaults?: Defaults;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();

  const submit = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    start(async () => {
      const res = await createActionPlan(mode, payload);
      if (res.ok) {
        toast.success("Ação registrada no plano");
        setErrors({});
        setOpen(false);
      } else {
        setErrors(res.fields ?? {});
        toast.error(res.error);
      }
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full bg-navy px-5 text-sm font-semibold text-cream transition-colors hover:bg-navy",
          triggerClassName,
        )}
      >
        <Plus className="size-4" /> {triggerLabel}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-navy/50 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[92dvh] w-[min(40rem,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-card p-6 shadow-2xl transition-[opacity,scale] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-2xl text-navy">Registrar ação de melhoria</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-ink/60">
                Transforme o que foi ouvido em uma providência com responsável e prazo.
              </Dialog.Description>
            </div>
            <Dialog.Close className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cream-2" aria-label="Fechar">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <form
            className="mt-6 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              submit(e.currentTarget);
            }}
          >
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-sm font-semibold">Título</span>
              <input name="title" required maxLength={LIMITS.actionTitle} defaultValue={defaults?.title} className={cn(field, "h-12")} />
              {errors.title && <span className="text-xs text-destructive">{errors.title}</span>}
            </label>
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-sm font-semibold">Descrição</span>
              <textarea name="description" rows={3} maxLength={LIMITS.actionDescription} defaultValue={defaults?.description} className={cn(field, "py-2.5")} />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold">Categoria</span>
              <select name="category" defaultValue={defaults?.category ?? "bem_estar"} className={cn(field, "h-12")}>
                {(Object.keys(ACTION_CATEGORIES) as ActionCategory[]).map((k) => (
                  <option key={k} value={k}>{ACTION_CATEGORIES[k]}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold">Prioridade</span>
              <select name="priority" defaultValue="media" className={cn(field, "h-12")}>
                {(Object.keys(ACTION_PRIORITIES) as ActionPriority[]).map((k) => (
                  <option key={k} value={k}>{ACTION_PRIORITIES[k]}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold">Responsável administrativo</span>
              <input name="owner" required maxLength={LIMITS.owner} placeholder="Ex.: Coordenação de operações" className={cn(field, "h-12")} />
              {errors.owner && <span className="text-xs text-destructive">{errors.owner}</span>}
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold">Prazo estimado</span>
              <input name="dueDate" type="date" className={cn(field, "h-12")} />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold">Status</span>
              <select name="status" defaultValue="planejada" className={cn(field, "h-12")}>
                {(Object.keys(ACTION_STATUSES) as ActionStatus[]).map((k) => (
                  <option key={k} value={k}>{ACTION_STATUSES[k]}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold">Protocolo relacionado</span>
              <input
                name="linkedReference"
                defaultValue={defaults?.linkedReference}
                placeholder="HZ-XXXX-XXXX (opcional)"
                className={cn(field, "h-12 font-mono uppercase")}
              />
            </label>
            <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
              <Dialog.Close className="h-11 rounded-full px-5 text-sm font-medium text-ink/70 hover:bg-cream-2">Cancelar</Dialog.Close>
              <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-full bg-navy px-6 text-sm font-semibold text-white hover:bg-blue disabled:opacity-50">
                {pending && <LoaderCircle className="size-4 animate-spin" />}
                Salvar ação
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
