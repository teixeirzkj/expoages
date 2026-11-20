import { Download, FlaskConical, Database } from "lucide-react";
import type { DataMode } from "@/lib/domain";
import { categoryCounts, feedbackKindCounts, statusTotals, topicCounts, weeklySeries } from "@/lib/analytics";
import { parsePeriod, toQuery, type RawSearchParams } from "@/lib/filters";
import { loadRepo } from "@/lib/server/admin-data";
import { HBarChart, WeeklyChart } from "@/components/charts/charts";
import { PeriodFilter } from "../period-filter";
import { EmptyState, MetricCard, PageHeader, Panel } from "../ui";

export async function ReportsScreen({ mode, searchParams }: { mode: DataMode; searchParams: Promise<RawSearchParams> }) {
  const repo = await loadRepo(mode);
  const period = parsePeriod(await searchParams);
  const [ouv, fb] = await Promise.all([repo.listSubmissions("ouvidoria", period), repo.listSubmissions("feedback", period)]);
  const st = statusTotals(ouv);
  const answered = ouv.length ? Math.round(((st.acao_planejada + st.concluido) / ouv.length) * 100) : 0;
  const q = (tipo: string) => `/api/export${toQuery({ tipo, modo: mode, de: period.from, ate: period.to })}`;
  const base = mode === "live" ? "/admin/relatorios" : "/demo/relatorios";

  return (
    <div>
      <PageHeader eyebrow="Relatórios" title="Indicadores do período" description="Filtre por período, acompanhe a evolução e exporte os dados autorizados." />

      <div className={`mb-6 flex items-center gap-3 rounded-2xl p-4 text-sm ${mode === "demo" ? "bg-mist text-navy" : "bg-mist/60 text-navy"}`}>
        {mode === "demo" ? <FlaskConical className="size-5 shrink-0" /> : <Database className="size-5 shrink-0" />}
        {mode === "demo"
          ? "Dados demonstrativos: registros fictícios criados para a apresentação, somados aos envios feitos em modo demonstração."
          : "Registros reais armazenados no banco de dados. Os dados demonstrativos nunca são misturados a esta visão."}
      </div>

      <PeriodFilter action={base} from={period.from} to={period.to} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard tone="dark" label="Manifestações" value={ouv.length} />
        <MetricCard label="Feedbacks" value={fb.length} />
        <MetricCard label="Com ação ou concluídas" value={`${answered}%`} hint="Manifestações que avançaram além da análise" />
        <MetricCard label="Aguardando análise" value={st.recebido} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Evolução dos registros" description="Por semana (últimas 8 semanas do período)">
          <WeeklyChart data={weeklySeries(ouv, fb, 8, period.to ? new Date(`${period.to}T12:00:00Z`) : new Date())} />
        </Panel>
        <Panel title="Temas mais recorrentes" description="Ouvidoria e feedbacks">
          {ouv.length + fb.length ? <HBarChart data={topicCounts([...ouv, ...fb])} /> : <EmptyState title="Sem registros no período" />}
        </Panel>
        <Panel title="Categorias da ouvidoria">
          {ouv.length ? <HBarChart data={categoryCounts(ouv)} /> : <EmptyState title="Sem manifestações no período" />}
        </Panel>
        <Panel title="Tipos de feedback">
          {fb.length ? <HBarChart data={feedbackKindCounts(fb)} /> : <EmptyState title="Sem feedbacks no período" />}
        </Panel>
      </div>

      <Panel title="Exportar dados" description="Arquivos CSV com os registros do período. O pulso é exportado somente de forma agregada." className="mt-6">
        <div className="flex flex-wrap gap-2">
          {[
            ["ouvidoria", "Manifestações"],
            ["feedback", "Feedbacks"],
            ["acoes", "Plano de ações"],
            ["pulso", "Pulso (agregado)"],
          ].map(([tipo, label]) => (
            <a key={tipo} href={q(tipo)} className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-navy ring-1 ring-navy/15 hover:bg-cream-2">
              <Download className="size-4" /> {label}
            </a>
          ))}
        </div>
      </Panel>
    </div>
  );
}
