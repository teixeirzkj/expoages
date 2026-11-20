import Form from "next/form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CircleCheck, Eye, FilePen, Plus, Search, X } from "lucide-react";
import {
  MONTHS,
  REVIEW_STATUSES,
  periodLabel,
  type DataMode,
  type ReviewStatus,
  type ReviewSummary,
} from "@/lib/domain";
import { formatDate, formatDateTime } from "@/lib/format";
import { basePath, loadRepo } from "@/lib/server/admin-data";
import { cn } from "@/lib/utils";
import { ReviewReport } from "@/components/employee/review-report";
import { ReviewEditor } from "../review-editor";
import { EmployeeRegisterForm, PublishReviewButton } from "../review-controls";
import { EmptyState, MetricCard, PageHeader, Panel } from "../ui";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const control =
  "h-11 rounded-xl border border-navy/15 bg-card px-3 text-sm focus:border-navy focus:outline-none focus:ring-4 focus:ring-blue/15";

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        status === "publicado" ? "bg-navy text-white ring-navy" : "bg-cream-2 text-ink ring-ink/10",
      )}
    >
      {status === "publicado" ? <CircleCheck className="size-3.5" aria-hidden /> : <FilePen className="size-3.5" aria-hidden />}
      {REVIEW_STATUSES[status]}
    </span>
  );
}

function ReadStatus({ r }: { r: ReviewSummary }) {
  if (r.status !== "publicado") return <span className="text-sm text-slate">—</span>;
  if (r.acknowledgedAt) return <span className="text-sm font-medium text-[#1b6447]">Ciente em {formatDate(r.acknowledgedAt)}</span>;
  if (r.viewedAt) return <span className="text-sm text-navy">Visualizado em {formatDate(r.viewedAt)}</span>;
  return <span className="text-sm text-slate">Ainda não visualizado</span>;
}

export async function ReviewsListScreen({ mode, searchParams }: { mode: DataMode; searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const base = basePath(mode);
  const repo = await loadRepo(mode);
  const employeeId = one(sp.colaborador) || undefined;
  const month = Number(one(sp.mes)) || undefined;
  const year = Number(one(sp.ano)) || undefined;
  const status = one(sp.status) in REVIEW_STATUSES ? (one(sp.status) as ReviewStatus) : undefined;
  const q = one(sp.q).slice(0, 60) || undefined;

  const [employees, all, rows] = await Promise.all([
    repo.listEmployees(),
    repo.listReviews(),
    repo.listReviews({ employeeId, month, year, status, q }),
  ]);
  const years = [...new Set(all.map((r) => r.year))].sort((a, b) => b - a);
  const drafts = all.filter((r) => r.status === "rascunho").length;
  const unread = all.filter((r) => r.status === "publicado" && !r.acknowledgedAt).length;
  const hasFilters = Boolean(employeeId || month || year || status || q);
  const action = `${base}/avaliacoes`;

  return (
    <div>
      <PageHeader
        eyebrow="Avaliações profissionais"
        title="Feedback da gestão"
        description="Prepare avaliações mensais, publique quando estiverem prontas e acompanhe a leitura. Rascunhos nunca ficam visíveis ao colaborador."
        actions={
          <>
            {mode === "demo" && (
              <Link href="/colaborador/demo" className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-navy ring-1 ring-navy/15 hover:bg-cream-2">
                <Eye className="size-4" /> Visão do colaborador
              </Link>
            )}
            <Link href={`${base}/avaliacoes/nova`} className="inline-flex h-11 items-center gap-2 rounded-full bg-navy px-5 text-sm font-semibold text-white hover:bg-blue">
              <Plus className="size-4" /> Nova avaliação
            </Link>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard tone="dark" label="Colaboradores" value={employees.length} />
        <MetricCard label="Publicadas" value={all.length - drafts} />
        <MetricCard label="Rascunhos" value={drafts} hint="Visíveis só para a gestão" />
        <MetricCard tone="accent" label="Aguardando leitura" value={unread} hint="Publicadas sem ciência" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <Form action={action} className="mb-4 flex flex-wrap items-end gap-2.5">
            <label className="relative min-w-48 flex-1">
              <span className="sr-only">Pesquisar</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate" />
              <input name="q" defaultValue={q} placeholder="Buscar no conteúdo…" className={`${control} w-full pl-9`} />
            </label>
            <label>
              <span className="sr-only">Colaborador</span>
              <select name="colaborador" defaultValue={employeeId ?? ""} className={control}>
                <option value="">Todos os colaboradores</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.fullName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Mês</span>
              <select name="mes" defaultValue={month ?? ""} className={control}>
                <option value="">Todos os meses</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Ano</span>
              <select name="ano" defaultValue={year ?? ""} className={control}>
                <option value="">Todos os anos</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Status</span>
              <select name="status" defaultValue={status ?? ""} className={control}>
                <option value="">Todos os status</option>
                {Object.entries(REVIEW_STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="h-11 rounded-xl bg-navy px-4 text-sm font-semibold text-white">
              Filtrar
            </button>
            {hasFilters && (
              <Link href={action} className="flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm text-slate hover:bg-cream-2">
                <X className="size-4" /> Limpar
              </Link>
            )}
          </Form>

          {rows.length === 0 ? (
            <EmptyState title="Nenhuma avaliação encontrada" text="Ajuste os filtros ou crie uma nova avaliação." />
          ) : (
            <ul className="divide-y divide-navy/8 overflow-hidden rounded-3xl bg-card ring-1 ring-navy/8">
              {rows.map((r) => (
                <li key={r.id}>
                  <Link href={`${base}/avaliacoes/${r.id}`} className="grid gap-2 px-5 py-4 transition-colors hover:bg-cream sm:grid-cols-[1.4fr_1fr_auto] sm:items-center sm:gap-4">
                    <span>
                      <span className="block font-medium text-ink">{r.employeeName}</span>
                      <span className="text-sm text-slate">{periodLabel(r.month, r.year)}</span>
                    </span>
                    <ReadStatus r={r} />
                    <span className="flex items-center gap-3 sm:justify-end">
                      <ReviewStatusBadge status={r.status} />
                      <ArrowUpRight className="size-4 text-slate" aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="space-y-4">
          <Panel title="Colaboradores" description={mode === "demo" ? "Perfis fictícios da demonstração." : "Contas com acesso ao Meu Feedback."}>
            <ul className="mb-5 divide-y divide-navy/8">
              {employees.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">{e.fullName}</span>
                    <span className="block truncate text-xs text-slate">{e.area ?? e.email}</span>
                  </span>
                  <Link
                    href={`${base}/avaliacoes/nova?colaborador=${e.id}`}
                    className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold text-navy ring-1 ring-navy/15 hover:bg-cream-2"
                    aria-label={`Nova avaliação para ${e.fullName}`}
                  >
                    Avaliar
                  </Link>
                </li>
              ))}
              {employees.length === 0 && <li className="py-3 text-sm text-slate">Nenhum colaborador vinculado.</li>}
            </ul>
            <EmployeeRegisterForm mode={mode} />
          </Panel>
        </aside>
      </div>
    </div>
  );
}

export async function ReviewNewScreen({ mode, searchParams }: { mode: DataMode; searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const base = basePath(mode);
  const repo = await loadRepo(mode);
  const employees = await repo.listEmployees();
  return (
    <div className="mx-auto max-w-5xl">
      <Link href={`${base}/avaliacoes`} className="mb-4 inline-flex items-center gap-2 text-sm text-slate hover:text-navy">
        <ArrowLeft className="size-4" /> Avaliações
      </Link>
      <PageHeader eyebrow="Avaliações profissionais" title="Nova avaliação mensal" description="Salve como rascunho para revisar depois, ou publique para disponibilizar ao colaborador." />
      <ReviewEditor mode={mode} base={base} employees={employees} defaultEmployeeId={one(sp.colaborador)} />
    </div>
  );
}

export async function ReviewEditScreen({ mode, params }: { mode: DataMode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const base = basePath(mode);
  const repo = await loadRepo(mode);
  const [review, employees] = await Promise.all([repo.getReview(id), repo.listEmployees()]);
  if (!review) notFound();
  return (
    <div className="mx-auto max-w-5xl">
      <Link href={`${base}/avaliacoes/${id}`} className="mb-4 inline-flex items-center gap-2 text-sm text-slate hover:text-navy">
        <ArrowLeft className="size-4" /> Voltar à avaliação
      </Link>
      <PageHeader
        eyebrow={review.status === "publicado" ? "Correção de avaliação publicada" : "Rascunho"}
        title={`${review.employeeName} · ${periodLabel(review.month, review.year)}`}
      />
      <ReviewEditor mode={mode} base={base} employees={employees} review={review} />
    </div>
  );
}

export async function ReviewDetailScreen({ mode, params }: { mode: DataMode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const base = basePath(mode);
  const repo = await loadRepo(mode);
  const review = await repo.getReview(id);
  if (!review) notFound();
  const revisions = await repo.listRevisions(id);
  const published = review.status === "publicado";

  return (
    <div className="mx-auto max-w-5xl">
      <Link href={`${base}/avaliacoes`} className="mb-4 inline-flex items-center gap-2 text-sm text-slate hover:text-navy">
        <ArrowLeft className="size-4" /> Avaliações
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <ReviewStatusBadge status={review.status} />
          <h1 className="mt-2 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2rem)] font-semibold text-navy">
            {review.employeeName} · {periodLabel(review.month, review.year)}
          </h1>
          <p className="text-sm text-slate">Atualizada em {formatDateTime(review.updatedAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`${base}/avaliacoes/${id}/editar`} className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-navy ring-1 ring-navy/20 hover:ring-navy/50">
            <FilePen className="size-4" /> {published ? "Corrigir" : "Editar"}
          </Link>
          {!published && <PublishReviewButton mode={mode} id={id} employeeName={review.employeeName} />}
          {published && mode === "demo" && (
            <Link
              href={`/colaborador/demo?p=${review.employeeId}`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-navy px-5 text-sm font-semibold text-white hover:bg-blue"
            >
              <Eye className="size-4" /> Ver como colaborador
            </Link>
          )}
        </div>
      </div>

      {published && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <MetricCard label="Publicada em" value={review.publishedAt ? formatDate(review.publishedAt) : "—"} />
          <MetricCard label="Visualizada" value={review.viewedAt ? formatDate(review.viewedAt) : "Ainda não"} />
          <MetricCard tone="accent" label="Ciência registrada" value={review.acknowledgedAt ? formatDate(review.acknowledgedAt) : "Ainda não"} hint="Ciência não significa concordância" />
        </div>
      )}
      {!published && (
        <p className="mb-6 rounded-2xl bg-cream-2 px-4 py-3 text-sm text-ink">
          Rascunho: o colaborador ainda não tem acesso a esta avaliação. Revise o conteúdo e publique quando estiver pronto.
        </p>
      )}

      <ReviewReport review={review} preview />

      {revisions.length > 0 && (
        <Panel title="Histórico de correções" description="Versões anteriores guardadas a cada alteração após a publicação." className="mt-6">
          <ol className="space-y-3">
            {revisions.map((v) => (
              <li key={v.id} className="rounded-2xl bg-cream p-4">
                <p className="text-sm font-semibold text-navy">{formatDateTime(v.createdAt)} — {v.note}</p>
                <details className="mt-2 text-sm text-slate">
                  <summary className="cursor-pointer text-navy">Ver versão anterior</summary>
                  <div className="mt-2 space-y-2 whitespace-pre-line">
                    <p><strong className="text-ink">Pontos positivos:</strong> {v.snapshot.strengths}</p>
                    <p><strong className="text-ink">Pontos de melhoria:</strong> {v.snapshot.improvements}</p>
                    {v.snapshot.recommendations && <p><strong className="text-ink">Recomendações:</strong> {v.snapshot.recommendations}</p>}
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </Panel>
      )}
    </div>
  );
}
