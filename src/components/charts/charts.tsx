"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactNode } from "react";
import type { CountDatum, PulseSummary, WeeklyDatum } from "@/lib/analytics";
import { PULSE_QUESTIONS, PULSE_SCALE } from "@/lib/domain";

/** Ordem categórica fixa (ver tokens --chart-* em globals.css). */
const C = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];
/** Rampa sequencial de uma só matiz (verde-azulado), do claro ao escuro. */
const SEQ = ["#d3ecec", "#9fd5d7", "#5fb7bb", "#21969c", "#0b6a6f"];
const axis = { fontSize: 12, fill: "var(--chart-axis)" };

type TipProps = {
  active?: boolean;
  label?: unknown;
  payload?: readonly { dataKey?: unknown; name?: unknown; value?: unknown; color?: string }[];
  unit?: string;
};

function TooltipBox({ active, payload, label, unit = "" }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-charcoal px-3 py-2 text-xs text-ivory shadow-lg">
      {label !== undefined && <p className="mb-1 font-semibold">{String(label)}</p>}
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="text-ivory/75">{String(p.name)}</span>
          <span className="ml-auto pl-3 font-semibold tabular-nums">
            {String(p.value)}
            {unit}
          </span>
        </p>
      ))}
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink/70">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ background: i.color }} aria-hidden />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

/** Alternativa em tabela para cada gráfico (acessibilidade e conferência). */
export function DataTable({ caption, head, rows }: { caption: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer select-none text-xs font-medium text-ink/55 hover:text-ink">Ver dados em tabela</summary>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-petrol/10 text-ink/55">
              {head.map((h) => (
                <th key={h} className="py-1.5 pr-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-petrol/5">
                {r.map((c, j) => (
                  <td key={j} className="py-1.5 pr-4 tabular-nums">{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function Frame({ height, children }: { height: number; children: ReactNode }) {
  return (
    <div style={{ height }} className="w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

export function WeeklyChart({ data }: { data: WeeklyDatum[] }) {
  return (
    <div>
      <Legend items={[{ label: "Ouvidoria", color: C[0] }, { label: "Feedbacks", color: C[1] }]} />
      <Frame height={260}>
        <BarChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }} barGap={2} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey="week" tick={axis} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: "rgba(23,58,60,0.05)" }} content={(p) => <TooltipBox {...p} />} />
          <Bar dataKey="ouvidoria" name="Ouvidoria" fill={C[0]} radius={[4, 4, 0, 0]} maxBarSize={20} />
          <Bar dataKey="feedback" name="Feedbacks" fill={C[1]} radius={[4, 4, 0, 0]} maxBarSize={20} />
        </BarChart>
      </Frame>
      <DataTable
        caption="Registros por semana"
        head={["Semana (início)", "Ouvidoria", "Feedbacks"]}
        rows={data.map((d) => [d.week, d.ouvidoria, d.feedback])}
      />
    </div>
  );
}

/** Barras horizontais de uma série (sem legenda: o título do painel nomeia a série). */
export function HBarChart({ data, unit = "", max }: { data: CountDatum[]; unit?: string; max?: number }) {
  const height = Math.max(140, data.length * 40 + 20);
  return (
    <div>
      <Frame height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 36, left: 0, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
          <XAxis type="number" hide domain={[0, max ?? "dataMax"]} allowDecimals={false} />
          <YAxis type="category" dataKey="label" width={170} tick={axis} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: "rgba(23,58,60,0.05)" }} content={(p) => <TooltipBox {...p} unit={unit} />} />
          <Bar dataKey="value" name="Total" fill={C[0]} radius={[0, 4, 4, 0]} maxBarSize={18}>
            <LabelList dataKey="value" position="right" style={{ fontSize: 12, fill: "var(--brand-ink)" }} />
          </Bar>
        </BarChart>
      </Frame>
      <DataTable caption="Totais" head={["Item", "Valor"]} rows={data.map((d) => [d.label, `${d.value}${unit}`])} />
    </div>
  );
}

export function PulseTrendChart({ summary }: { summary: PulseSummary }) {
  const series = PULSE_QUESTIONS.map((q, i) => ({ key: q.key, label: q.dimension, color: C[i] }));
  return (
    <div>
      <Legend items={series} />
      <Frame height={260}>
        <LineChart data={summary.trend} margin={{ top: 8, right: 12, left: -24, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey="period" tick={axis} tickLine={false} axisLine={false} />
          <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={axis} tickLine={false} axisLine={false} />
          <Tooltip content={(p) => <TooltipBox {...p} />} />
          {series.map((s) => (
            <Line
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 4, fill: s.color, stroke: "var(--card)", strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: "var(--card)", strokeWidth: 2 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </Frame>
      <DataTable
        caption="Média por período"
        head={["Período", "Respostas", ...series.map((s) => s.label)]}
        rows={summary.trend.map((t) => [t.period, t.n, ...series.map((s) => (t[s.key] ?? "amostra insuficiente") as string | number)])}
      />
    </div>
  );
}

/** Distribuição das notas (100% empilhado) com rampa sequencial. */
export function PulseDistributionChart({ summary }: { summary: PulseSummary }) {
  const data = summary.dimensions.map((d) => {
    const total = d.distribution.reduce((a, b) => a + b, 0) || 1;
    const row: Record<string, string | number> = { label: d.label };
    d.distribution.forEach((n, i) => (row[`n${i + 1}`] = Math.round((n / total) * 100)));
    return row;
  });
  return (
    <div>
      <Legend items={PULSE_SCALE.map((s, i) => ({ label: `${s.value} · ${s.label}`, color: SEQ[i] }))} />
      <Frame height={230}>
        <BarChart data={data} layout="vertical" stackOffset="expand" margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="label" width={150} tick={axis} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: "rgba(23,58,60,0.05)" }} content={(p) => <TooltipBox {...p} unit="%" />} />
          {PULSE_SCALE.map((s, i) => (
            <Bar
              key={s.value}
              dataKey={`n${s.value}`}
              name={s.label}
              stackId="a"
              fill={SEQ[i]}
              stroke="var(--card)"
              strokeWidth={2}
              maxBarSize={22}
              radius={i === 0 ? [4, 0, 0, 4] : i === 4 ? [0, 4, 4, 0] : 0}
            />
          ))}
        </BarChart>
      </Frame>
      <DataTable
        caption="Distribuição percentual das respostas"
        head={["Dimensão", ...PULSE_SCALE.map((s) => `${s.value}`)]}
        rows={data.map((r) => [r.label as string, ...PULSE_SCALE.map((s) => `${r[`n${s.value}`]}%`)])}
      />
    </div>
  );
}
