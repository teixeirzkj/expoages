import { ShieldCheck } from "lucide-react";
import type { DataMode } from "@/lib/domain";
import { pulseSummary } from "@/lib/analytics";
import { parsePeriod, type RawSearchParams } from "@/lib/filters";
import { loadRepo } from "@/lib/server/admin-data";
import { HBarChart, PulseDistributionChart, PulseTrendChart } from "@/components/charts/charts";
import { AutoRefresh } from "../auto-refresh";
import { PeriodFilter } from "../period-filter";
import { EmptyState, MetricCard, PageHeader, Panel } from "../ui";

export async function PulseScreen({ mode, searchParams }: { mode: DataMode; searchParams: Promise<RawSearchParams> }) {
  const repo = await loadRepo(mode);
  const period = parsePeriod(await searchParams);
  const summary = pulseSummary(await repo.listPulse(period));
  const base = mode === "live" ? "/admin/pulso" : "/demo/pulso";

  return (
    <div>
      <PageHeader
        eyebrow="Pulso organizacional"
        title="Percepção do ambiente"
        description="Indicadores agregados das respostas anônimas. Respostas individuais não são exibidas."
        actions={<AutoRefresh />}
      />
      <PeriodFilter action={base} from={period.from} to={period.to} />

      <div className="mb-6 flex items-start gap-3 rounded-2xl bg-sage-2/60 p-4 text-sm text-petrol">
        <ShieldCheck className="mt-0.5 size-5 shrink-0" />
        <p>
          Indicadores só aparecem com pelo menos {summary.minSample} respostas no período, e cada ponto da evolução temporal
          exige a mesma amostra mínima — para evitar a identificação indireta de participantes. As respostas guardam apenas a data,
          sem horário.
        </p>
      </div>

      {!summary.enough ? (
        <EmptyState
          title="Amostra insuficiente"
          text={`Há ${summary.sample} resposta(s) no período. São necessárias ao menos ${summary.minSample} para exibir indicadores.`}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summary.dimensions.map((d, i) => (
              <MetricCard
                key={d.key}
                tone={i === 0 ? "dark" : "default"}
                label={d.label}
                value={d.average?.toFixed(1) ?? "—"}
                hint={`${d.favorable}% responderam “frequentemente” ou “sempre”`}
              />
            ))}
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <Panel title="Média por dimensão" description={`Escala de 1 a 5 · ${summary.sample} respostas`}>
              <HBarChart data={summary.dimensions.map((d) => ({ label: d.label, value: d.average ?? 0 }))} max={5} />
            </Panel>
            <Panel title="Distribuição das respostas" description="Percentual de cada nota por dimensão">
              <PulseDistributionChart summary={summary} />
            </Panel>
          </div>
          <Panel title="Evolução temporal" description="Médias quinzenais; períodos com amostra pequena ficam em branco." className="mt-6">
            <PulseTrendChart summary={summary} />
          </Panel>
        </>
      )}
    </div>
  );
}
