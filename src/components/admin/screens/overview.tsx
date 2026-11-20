import Link from "next/link";
import { ArrowUpRight, CircleCheck, Clock3, HandHeart, Inbox, MessageSquareHeart, SquareKanban } from "lucide-react";
import type { DataMode } from "@/lib/domain";
import { actionTotals, categoryCounts, pulseSummary, statusTotals, weeklySeries } from "@/lib/analytics";
import { formatDateTime, truncate } from "@/lib/format";
import { basePath, loadRepo } from "@/lib/server/admin-data";
import { HBarChart, WeeklyChart } from "@/components/charts/charts";
import { AutoRefresh } from "../auto-refresh";
import { EmptyState, MetricCard, PageHeader, Panel, StatusBadge } from "../ui";

export async function OverviewScreen({ mode }: { mode: DataMode }) {
  const repo = await loadRepo(mode);
  const base = basePath(mode);
  const [ouv, fb, pulse, actions] = await Promise.all([
    repo.listSubmissions("ouvidoria"),
    repo.listSubmissions("feedback"),
    repo.listPulse(),
    repo.listActions(),
  ]);
  const st = statusTotals(ouv);
  const recognitions = fb.filter((f) => f.feedbackKind === "reconhecimento").length;
  const pulseData = pulseSummary(pulse);
  const act = actionTotals(actions);
  const recent = [...ouv, ...fb].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  return (
    <div>
      <PageHeader
        eyebrow={mode === "demo" ? "Demonstração · dados fictícios" : "Painel da gestão"}
        title="Visão geral"
        description="Acompanhe o que a equipe tem compartilhado e o andamento das devolutivas."
        actions={<AutoRefresh />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard tone="dark" label="Manifestações" value={st.total} icon={Inbox} hint="Total recebido na ouvidoria" />
        <MetricCard label="Pendentes" value={st.recebido} icon={Inbox} hint="Aguardando primeira análise" />
        <MetricCard label="Em análise" value={st.em_analise + st.acao_planejada} icon={Clock3} hint={`${st.acao_planejada} com ação planejada`} />
        <MetricCard label="Concluídas" value={st.concluido} icon={CircleCheck} hint="Com devolutiva finalizada" />
        <MetricCard label="Feedbacks recebidos" value={fb.length} icon={MessageSquareHeart} />
        <MetricCard tone="accent" label="Reconhecimentos" value={recognitions} icon={HandHeart} hint="Elogios a equipes e práticas" />
        <MetricCard label="Ações em andamento" value={act.em_andamento} icon={SquareKanban} hint={`${act.planejada} planejadas · ${act.concluida} concluídas`} />
        <MetricCard
          label="Percepção de reconhecimento"
          value={pulseData.enough ? `${pulseData.dimensions[0].average?.toFixed(1)}` : "—"}
          hint={pulseData.enough ? `Média de 1 a 5 · ${pulseData.sample} respostas` : `Amostra insuficiente (mín. ${pulseData.minSample})`}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Panel title="Registros por semana" description="Últimas 8 semanas" className="xl:col-span-3">
          <WeeklyChart data={weeklySeries(ouv, fb)} />
        </Panel>
        <Panel title="Principais categorias" description="Manifestações da ouvidoria" className="xl:col-span-2">
          {ouv.length ? <HBarChart data={categoryCounts(ouv)} /> : <EmptyState title="Sem manifestações ainda" />}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Panel
          title="Registros recentes"
          className="xl:col-span-3"
          action={<Link href={`${base}/ouvidoria`} className="text-sm font-medium text-petrol hover:underline">Ver todos</Link>}
        >
          {recent.length === 0 ? (
            <EmptyState title="Nenhum registro" text="Os envios aparecerão aqui automaticamente." />
          ) : (
            <ul className="divide-y divide-petrol/8">
              {recent.map((r) => (
                <li key={r.id}>
                  <Link href={`${base}/${r.kind === "ouvidoria" ? "ouvidoria" : "feedbacks"}/${r.id}`} className="flex items-center gap-4 py-3.5 hover:bg-ivory/50">
                    <span className="w-24 shrink-0 font-mono text-[0.7rem] font-semibold text-petrol">{r.reference}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink">{r.topic}</span>
                      <span className="block truncate text-xs text-ink/50">
                        {r.kind === "ouvidoria" ? "Ouvidoria" : "Feedback"} · {formatDateTime(r.createdAt)} · {truncate(r.kind === "ouvidoria" ? r.description : r.message, 60)}
                      </span>
                    </span>
                    <StatusBadge status={r.status} className="max-sm:hidden" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Atalhos" className="xl:col-span-2">
          <ul className="grid gap-2">
            {[
              { href: `${base}/ouvidoria?status=recebido`, label: "Analisar manifestações pendentes", n: st.recebido },
              { href: `${base}/acoes`, label: "Organizar o plano de ações", n: act.total - act.concluida },
              { href: `${base}/feedbacks?categoria=reconhecimento`, label: "Ler reconhecimentos", n: recognitions },
              { href: `${base}/pulso`, label: "Ver pulso organizacional", n: pulseData.sample },
            ].map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="group flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-ivory px-4 hover:bg-sage-2">
                  <span className="text-sm font-medium text-ink">{s.label}</span>
                  <span className="flex items-center gap-2 text-sm tabular-nums text-ink/55">
                    {s.n}
                    <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
