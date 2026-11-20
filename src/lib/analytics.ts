import { siteConfig } from "@/config/site";
import {
  FEEDBACK_KINDS,
  OUVIDORIA_CATEGORIES,
  PULSE_QUESTIONS,
  type ActionPlan,
  type FeedbackRecord,
  type OuvidoriaRecord,
  type PulseKey,
  type PulseResponse,
} from "./domain";

export interface CountDatum {
  label: string;
  value: number;
}

export interface WeeklyDatum {
  week: string; // rótulo curto, ex.: "03/11"
  ouvidoria: number;
  feedback: number;
}

export interface PulseDimension {
  key: PulseKey;
  label: string;
  average: number | null;
  /** Percentual de respostas 4 ou 5. */
  favorable: number | null;
  distribution: number[]; // contagem por nota 1..5
}

export interface PulseSummary {
  sample: number;
  enough: boolean;
  minSample: number;
  dimensions: PulseDimension[];
  trend: ({ period: string; n: number } & Partial<Record<PulseKey, number>>)[];
}

const MIN = siteConfig.minAggregateSample;

function startOfWeek(d: Date) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (x.getUTCDay() + 6) % 7; // segunda = 0
  x.setUTCDate(x.getUTCDate() - day);
  return x;
}
const fmtWeek = (d: Date) =>
  `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

export function weeklySeries(ouv: OuvidoriaRecord[], fb: FeedbackRecord[], weeks = 8, now = new Date()): WeeklyDatum[] {
  const current = startOfWeek(now);
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const d = new Date(current);
    d.setUTCDate(d.getUTCDate() - (weeks - 1 - i) * 7);
    return { start: d.getTime(), week: fmtWeek(d), ouvidoria: 0, feedback: 0 };
  });
  const place = (iso: string, key: "ouvidoria" | "feedback") => {
    const t = startOfWeek(new Date(iso)).getTime();
    const b = buckets.find((x) => x.start === t);
    if (b) b[key] += 1;
  };
  ouv.forEach((o) => place(o.createdAt, "ouvidoria"));
  fb.forEach((f) => place(f.createdAt, "feedback"));
  return buckets.map(({ week, ouvidoria, feedback }) => ({ week, ouvidoria, feedback }));
}

export function categoryCounts(ouv: OuvidoriaRecord[]): CountDatum[] {
  return (Object.keys(OUVIDORIA_CATEGORIES) as (keyof typeof OUVIDORIA_CATEGORIES)[])
    .map((k) => ({ label: OUVIDORIA_CATEGORIES[k], value: ouv.filter((o) => o.category === k).length }))
    .sort((a, b) => b.value - a.value);
}

export function feedbackKindCounts(fb: FeedbackRecord[]): CountDatum[] {
  return (Object.keys(FEEDBACK_KINDS) as (keyof typeof FEEDBACK_KINDS)[]).map((k) => ({
    label: FEEDBACK_KINDS[k],
    value: fb.filter((f) => f.feedbackKind === k).length,
  }));
}

export function topicCounts(records: { topic: string }[], limit = 6): CountDatum[] {
  const map = new Map<string, { label: string; value: number }>();
  for (const r of records) {
    const key = r.topic.trim().toLowerCase();
    const cur = map.get(key);
    if (cur) cur.value += 1;
    else map.set(key, { label: r.topic.trim(), value: 1 });
  }
  return [...map.values()].sort((a, b) => b.value - a.value).slice(0, limit);
}

export function statusTotals(records: { status: string }[]) {
  const count = (s: string) => records.filter((r) => r.status === s).length;
  return {
    total: records.length,
    recebido: count("recebido"),
    em_analise: count("em_analise"),
    acao_planejada: count("acao_planejada"),
    concluido: count("concluido"),
  };
}

export function actionTotals(actions: ActionPlan[]) {
  const count = (s: string) => actions.filter((a) => a.status === s).length;
  return { total: actions.length, planejada: count("planejada"), em_andamento: count("em_andamento"), concluida: count("concluida") };
}

/**
 * Indicadores agregados do pulso. Abaixo de `minAggregateSample` respostas
 * nada é exibido, e períodos da série temporal com amostra pequena são omitidos.
 */
export function pulseSummary(responses: PulseResponse[], now = new Date()): PulseSummary {
  const sample = responses.length;
  const enough = sample >= MIN;
  const dimensions: PulseDimension[] = PULSE_QUESTIONS.map((q) => {
    const values = responses.map((r) => r.answers[q.key]);
    const distribution = [1, 2, 3, 4, 5].map((n) => values.filter((v) => v === n).length);
    return {
      key: q.key,
      label: q.dimension,
      average: enough ? round(values.reduce((a, b) => a + b, 0) / sample) : null,
      favorable: enough ? Math.round((values.filter((v) => v >= 4).length / sample) * 100) : null,
      distribution: enough ? distribution : [0, 0, 0, 0, 0],
    };
  });

  // Série quinzenal das últimas 8 semanas, omitindo períodos com amostra pequena.
  const current = startOfWeek(now);
  const trend: PulseSummary["trend"] = [];
  for (let i = 3; i >= 0; i--) {
    const start = new Date(current);
    start.setUTCDate(start.getUTCDate() - (i * 14 + 7));
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 14);
    const s = start.toISOString().slice(0, 10);
    const e = end.toISOString().slice(0, 10);
    const slice = responses.filter((r) => r.createdOn >= s && r.createdOn < e);
    const point: PulseSummary["trend"][number] = { period: fmtWeek(start), n: slice.length };
    if (slice.length >= MIN) {
      for (const q of PULSE_QUESTIONS) point[q.key] = round(slice.reduce((a, r) => a + r.answers[q.key], 0) / slice.length);
    }
    trend.push(point);
  }
  return { sample, enough, minSample: MIN, dimensions, trend };
}

const round = (n: number) => Math.round(n * 10) / 10;
