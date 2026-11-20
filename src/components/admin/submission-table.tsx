import Form from "next/form";
import Link from "next/link";
import { ArrowUpRight, Download, Search, X } from "lucide-react";
import {
  FEEDBACK_KINDS,
  OUVIDORIA_CATEGORIES,
  SUBMISSION_STATUSES,
  type DataMode,
  type SubmissionFilters,
  type SubmissionKind,
  type SubmissionRecord,
} from "@/lib/domain";
import { toQuery } from "@/lib/filters";
import { formatDateTime, truncate } from "@/lib/format";
import { EmptyState, StatusBadge } from "./ui";

const control =
  "h-11 rounded-xl border border-petrol/15 bg-card px-3 text-sm focus:border-petrol focus:outline-none focus:ring-4 focus:ring-terracotta/20";

export function SubmissionFiltersBar({
  action,
  filters,
  categories,
  exportHref,
  hideCategory,
}: {
  action: string;
  filters: SubmissionFilters;
  categories: Record<string, string>;
  exportHref: string;
  hideCategory?: boolean;
}) {
  const hasFilters = Object.values(filters).some(Boolean);
  return (
    <Form action={action} className="mb-5 flex flex-wrap items-end gap-2.5">
      <label className="relative min-w-56 flex-1">
        <span className="sr-only">Pesquisar</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
        <input name="q" defaultValue={filters.q} placeholder="Protocolo, tema ou texto…" className={`${control} w-full pl-9`} />
      </label>
      <label>
        <span className="sr-only">Status</span>
        <select name="status" defaultValue={filters.status ?? ""} className={control}>
          <option value="">Todos os status</option>
          {Object.entries(SUBMISSION_STATUSES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </label>
      {!hideCategory && (
        <label>
          <span className="sr-only">Categoria</span>
          <select name="categoria" defaultValue={filters.category ?? ""} className={control}>
            <option value="">Todas as categorias</option>
            {Object.entries(categories).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
      )}
      {hideCategory && filters.category && <input type="hidden" name="categoria" value={filters.category} />}
      <label className="flex flex-col text-xs text-ink/55">
        De
        <input type="date" name="de" defaultValue={filters.from} className={control} />
      </label>
      <label className="flex flex-col text-xs text-ink/55">
        Até
        <input type="date" name="ate" defaultValue={filters.to} className={control} />
      </label>
      <button type="submit" className="h-11 rounded-xl bg-petrol px-4 text-sm font-semibold text-ivory">Filtrar</button>
      {hasFilters && (
        <Link href={action} className="flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm text-ink/60 hover:bg-ivory-2">
          <X className="size-4" /> Limpar
        </Link>
      )}
      <a href={exportHref} className="ml-auto flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium text-petrol ring-1 ring-petrol/15 hover:bg-ivory-2">
        <Download className="size-4" /> Exportar CSV
      </a>
    </Form>
  );
}

export function exportHref(mode: DataMode, type: string, filters: SubmissionFilters) {
  return `/api/export${toQuery({ tipo: type, modo: mode, status: filters.status, categoria: filters.category, de: filters.from, ate: filters.to, q: filters.q })}`;
}

export function SubmissionTable({ records, base, kind }: { records: SubmissionRecord[]; base: string; kind: SubmissionKind }) {
  if (records.length === 0) {
    return <EmptyState title="Nenhum registro encontrado" text="Ajuste os filtros ou aguarde novos envios. A lista se atualiza automaticamente." />;
  }
  return (
    <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-petrol/8">
      {/* Tabela no desktop */}
      <table className="hidden w-full text-left text-sm md:table">
        <thead className="border-b border-petrol/8 text-xs text-ink/55">
          <tr>
            <th className="px-5 py-3 font-medium">Protocolo</th>
            <th className="px-3 py-3 font-medium">{kind === "ouvidoria" ? "Categoria" : "Tipo"}</th>
            <th className="px-3 py-3 font-medium">Prévia</th>
            <th className="px-3 py-3 font-medium">Data</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-5 py-3"><span className="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => {
            const href = `${base}/${r.id}`;
            const cat = r.kind === "ouvidoria" ? OUVIDORIA_CATEGORIES[r.category] : FEEDBACK_KINDS[r.feedbackKind];
            const body = r.kind === "ouvidoria" ? r.description : r.message;
            return (
              <tr key={r.id} className="border-b border-petrol/5 last:border-0 hover:bg-ivory/60">
                <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-semibold text-petrol">{r.reference}</td>
                <td className="px-3 py-4 text-ink/75">{cat}</td>
                <td className="max-w-md px-3 py-4">
                  <p className="font-medium text-ink">{r.topic}</p>
                  <p className="mt-0.5 text-ink/55">{truncate(body, 90)}</p>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-ink/60">{formatDateTime(r.createdAt)}</td>
                <td className="px-3 py-4"><StatusBadge status={r.status} /></td>
                <td className="px-5 py-4 text-right">
                  <Link href={href} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-petrol ring-1 ring-petrol/15 hover:bg-petrol hover:text-ivory">
                    Visualizar <ArrowUpRight className="size-3.5" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Lista em cartões no celular / iPad retrato estreito */}
      <ul className="divide-y divide-petrol/8 md:hidden">
        {records.map((r) => {
          const body = r.kind === "ouvidoria" ? r.description : r.message;
          return (
            <li key={r.id}>
              <Link href={`${base}/${r.id}`} className="block p-4 active:bg-ivory">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs font-semibold text-petrol">{r.reference}</span>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-2 font-medium text-ink">{r.topic}</p>
                <p className="mt-1 text-sm text-ink/55">{truncate(body, 100)}</p>
                <p className="mt-2 text-xs text-ink/45">{formatDateTime(r.createdAt)}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
