import { Download } from "lucide-react";
import type { DataMode } from "@/lib/domain";
import { actionTotals } from "@/lib/analytics";
import { loadRepo } from "@/lib/server/admin-data";
import { ActionBoard } from "../action-board";
import { ActionFormDialog } from "../action-form";
import { MetricCard, PageHeader } from "../ui";

export async function ActionsScreen({ mode }: { mode: DataMode }) {
  const repo = await loadRepo(mode);
  const actions = await repo.listActions();
  const t = actionTotals(actions);
  const done = t.total ? Math.round((t.concluida / t.total) * 100) : 0;

  return (
    <div>
      <PageHeader
        eyebrow="Plano de ações"
        title="Da escuta à providência"
        description="Transforme manifestações e feedbacks em ações com responsável, prioridade e prazo — e mostre à equipe que ela foi ouvida."
        actions={
          <>
            <a
              href={`/api/export?tipo=acoes&modo=${mode}`}
              className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-navy ring-1 ring-navy/15 hover:bg-cream-2"
            >
              <Download className="size-4" /> CSV
            </a>
            <ActionFormDialog mode={mode} />
          </>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard tone="dark" label="Ações no plano" value={t.total} />
        <MetricCard label="Planejadas" value={t.planejada} />
        <MetricCard label="Em andamento" value={t.em_andamento} />
        <MetricCard tone="accent" label="Concluídas" value={`${done}%`} hint={`${t.concluida} de ${t.total}`} />
      </div>
      <ActionBoard actions={actions} mode={mode} />
    </div>
  );
}
