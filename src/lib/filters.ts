import { SUBMISSION_STATUSES, type SubmissionFilters, type SubmissionStatus } from "./domain";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const isDate = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);

/** Converte e valida os parâmetros da URL em filtros seguros. */
export function parseFilters(sp: RawSearchParams, allowedCategories: readonly string[]): SubmissionFilters {
  const status = one(sp.status);
  const category = one(sp.categoria);
  return {
    q: one(sp.q)?.slice(0, 60),
    status: status && status in SUBMISSION_STATUSES ? (status as SubmissionStatus) : undefined,
    category: category && allowedCategories.includes(category) ? category : undefined,
    from: isDate(one(sp.de)),
    to: isDate(one(sp.ate)),
  };
}

export function parsePeriod(sp: RawSearchParams) {
  return { from: isDate(one(sp.de)), to: isDate(one(sp.ate)) };
}

export function toQuery(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `?${s}` : "";
}
