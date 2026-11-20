"use client";

import { ArrowLeft, ArrowRight, CalendarClock, Link2, Trash2, UserRound } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteActionPlan, updateActionPlanStatus } from "@/app/actions/admin";
import { ACTION_CATEGORIES, ACTION_STATUSES, type ActionPlan, type ActionStatus, type DataMode } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "./ui";

const COLUMNS: { status: ActionStatus; tone: string }[] = [
  { status: "planejada", tone: "bg-ivory-2" },
  { status: "em_andamento", tone: "bg-[#fdf1d9]" },
  { status: "concluida", tone: "bg-sage-2" },
];

function Card({ action, mode }: { action: ActionPlan; mode: DataMode }) {
  const [pending, start] = useTransition();
  const idx = COLUMNS.findIndex((c) => c.status === action.status);

  const move = (dir: -1 | 1) => {
    const next = COLUMNS[idx + dir]?.status;
    if (!next) return;
    start(async () => {
      const res = await updateActionPlanStatus(mode, { id: action.id, status: next });
      if (res.ok) toast.success(`Ação movida para “${ACTION_STATUSES[next]}”`);
      else toast.error(res.error);
    });
  };
  const remove = () => {
    if (!window.confirm("Excluir esta ação do plano?")) return;
    start(async () => {
      const res = await deleteActionPlan(mode, { id: action.id });
      if (!res.ok) toast.error(res.error);
    });
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: pending ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl bg-card p-4 shadow-[0_1px_0_rgba(23,58,60,0.06),0_10px_30px_-24px_rgba(20,36,43,0.5)] ring-1 ring-petrol/8"
    >
      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={action.priority} />
        <span className="text-[0.7rem] text-ink/50">{ACTION_CATEGORIES[action.category]}</span>
      </div>
      <p className="mt-2.5 font-semibold leading-snug text-ink">{action.title}</p>
      {action.description && <p className="mt-1.5 line-clamp-3 text-sm text-ink/60">{action.description}</p>}
      <dl className="mt-3 space-y-1 text-xs text-ink/55">
        <div className="flex items-center gap-1.5"><UserRound className="size-3.5" /><dt className="sr-only">Responsável</dt><dd>{action.owner}</dd></div>
        {action.dueDate && <div className="flex items-center gap-1.5"><CalendarClock className="size-3.5" /><dt className="sr-only">Prazo</dt><dd>Prazo: {formatDate(action.dueDate)}</dd></div>}
        {action.linkedReference && <div className="flex items-center gap-1.5"><Link2 className="size-3.5" /><dt className="sr-only">Protocolo</dt><dd className="font-mono">{action.linkedReference}</dd></div>}
      </dl>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-petrol/8 pt-3">
        <button type="button" onClick={remove} disabled={pending} aria-label="Excluir ação" className="flex size-9 items-center justify-center rounded-full text-ink/45 hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="size-4" />
        </button>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => move(-1)} disabled={pending || idx === 0} aria-label="Mover para a coluna anterior" className="flex size-9 items-center justify-center rounded-full ring-1 ring-petrol/15 disabled:opacity-30">
            <ArrowLeft className="size-4" />
          </button>
          <button type="button" onClick={() => move(1)} disabled={pending || idx === COLUMNS.length - 1} aria-label="Mover para a próxima coluna" className="flex h-9 items-center gap-1.5 rounded-full bg-petrol px-3 text-xs font-semibold text-ivory disabled:opacity-30">
            Avançar <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    </motion.li>
  );
}

export function ActionBoard({ actions, mode }: { actions: ActionPlan[]; mode: DataMode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {COLUMNS.map((col) => {
        const items = actions.filter((a) => a.status === col.status);
        return (
          <section key={col.status} className={cn("rounded-3xl p-3", col.tone)} aria-label={ACTION_STATUSES[col.status]}>
            <header className="flex items-center justify-between px-2 pb-3 pt-1">
              <h2 className="text-sm font-semibold text-ink">{ACTION_STATUSES[col.status]}</h2>
              <span className="rounded-full bg-card px-2 py-0.5 text-xs font-semibold tabular-nums text-ink/60">{items.length}</span>
            </header>
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {items.map((a) => (
                  <Card key={a.id} action={a} mode={mode} />
                ))}
              </AnimatePresence>
              {items.length === 0 && <li className="rounded-2xl border border-dashed border-petrol/15 px-4 py-8 text-center text-sm text-ink/45">Nenhuma ação aqui.</li>}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
