import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, ArrowUpRight, Bell, CalendarDays, CircleCheck, CircleDot, FlaskConical, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { signOutEmployee } from "@/app/actions/auth";
import { Logo } from "@/components/brand/logo";
import { periodLabel, type DataMode, type EmployeeProfile, type ReviewSummary } from "@/lib/domain";
import { formatDate, toBullets } from "@/lib/format";
import { requireEmployee } from "@/lib/server/auth";
import { getRepository, type Repository } from "@/lib/server/repository";
import { cn } from "@/lib/utils";
import { AcknowledgeButton, ViewTracker } from "./review-actions";
import { ReviewReport } from "./review-report";

type SP = Record<string, string | string[] | undefined>;
const DEFAULT_DEMO_EMPLOYEE = "demo-emp-lucas";

interface Scope {
  mode: DataMode;
  repo: Repository;
  employee: EmployeeProfile;
  base: string;
  /** Sufixo de query para manter o colaborador fictício escolhido (só demo). */
  q: string;
  demoEmployee?: string;
}

/**
 * Resolve QUEM está vendo:
 *  - live: o colaborador autenticado (sessão + perfil) — nunca um parâmetro da URL;
 *  - demo: um colaborador fictício escolhido em ?p= (padrão: Lucas Almeida).
 */
async function resolveScope(mode: DataMode, searchParams: Promise<SP>): Promise<Scope> {
  await connection();
  if (mode === "live") {
    const user = await requireEmployee();
    const repo = getRepository("live");
    const employee = await repo.getEmployee(user.id);
    if (!employee) redirect("/colaborador/entrar");
    return { mode, repo, employee, base: "/colaborador", q: "" };
  }
  const sp = await searchParams;
  const raw = Array.isArray(sp.p) ? sp.p[0] : sp.p;
  const repo = getRepository("demo");
  const employee = (raw ? await repo.getEmployee(raw) : null) ?? (await repo.getEmployee(DEFAULT_DEMO_EMPLOYEE));
  if (!employee) notFound();
  return { mode, repo, employee, base: "/colaborador/demo", q: `?p=${encodeURIComponent(employee.id)}`, demoEmployee: employee.id };
}

async function EmployeeShell({ scope, children }: { scope: Scope; children: ReactNode }) {
  const people = scope.mode === "demo" ? await scope.repo.listEmployees() : [];
  return (
    <div className="min-h-dvh bg-cream">
      {scope.mode === "demo" && (
        <div role="status" className="flex items-center justify-center gap-2 bg-sky px-4 py-2 text-center text-xs font-medium text-navy">
          <FlaskConical className="size-3.5 shrink-0" aria-hidden />
          Demonstração · colaboradores e avaliações fictícios
        </div>
      )}
      <header className="surface-dark bg-navy text-cream">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between gap-4 px-5">
          <Link href="/" className="flex items-center gap-3 rounded-md" aria-label="Voltar ao site">
            <Logo tone="light" />
            <span className="hidden border-l border-white/15 pl-3 text-sm font-medium text-cream/80 sm:inline">Meu Feedback</span>
          </Link>
          {scope.mode === "live" ? (
            <form action={signOutEmployee}>
              <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm text-cream/75 hover:bg-white/10 hover:text-white">
                <LogOut className="size-4" /> Sair
              </button>
            </form>
          ) : (
            <Link href="/demo/avaliacoes" className="inline-flex h-10 items-center rounded-full bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/15">
              Painel da gestão (demo)
            </Link>
          )}
        </div>
      </header>
      {scope.mode === "demo" && (
        <nav aria-label="Ver como colaborador fictício" className="border-b border-navy/8 bg-white">
          <div className="mx-auto flex w-full max-w-4xl items-center gap-2 overflow-x-auto px-5 py-2.5">
            <span className="shrink-0 text-[0.8125rem] text-slate">Ver como:</span>
            {people.map((p) => (
              <Link
                key={p.id}
                href={`${scope.base}?p=${p.id}`}
                aria-current={p.id === scope.employee.id ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[0.8125rem] font-medium transition-colors",
                  p.id === scope.employee.id ? "bg-navy text-white" : "bg-mist text-navy hover:bg-cream-2",
                )}
              >
                {p.fullName}
              </Link>
            ))}
          </div>
        </nav>
      )}
      <main className="mx-auto w-full max-w-4xl px-5 pb-16 pt-8">{children}</main>
    </div>
  );
}

function ReadChip({ review }: { review: ReviewSummary }) {
  return review.acknowledgedAt ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#e2f1ea] px-2.5 py-1 text-xs font-semibold text-[#1b6447]">
      <CircleCheck className="size-3.5" aria-hidden /> Lido
    </span>
  ) : review.viewedAt ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-navy">Visualizado</span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-xs font-semibold text-white">
      <CircleDot className="size-3.5" aria-hidden /> Novo
    </span>
  );
}

export async function EmployeeHomeScreen({ mode, searchParams }: { mode: DataMode; searchParams: Promise<SP> }) {
  const scope = await resolveScope(mode, searchParams);
  const { repo, employee } = scope;
  const [reviews, notifications] = await Promise.all([repo.listMyReviews(employee.id), repo.listNotifications(employee.id)]);
  const unread = notifications.filter((n) => !n.readAt);
  const latest = reviews[0] ? await repo.getMyReview(employee.id, reviews[0].id) : null;
  const href = (id: string) => `${scope.base}/feedback/${id}${scope.q}`;
  const firstName = employee.fullName.split(" ")[0];
  const years = [...new Set(reviews.map((r) => r.year))];

  return (
    <EmployeeShell scope={scope}>
      <p className="text-[0.8125rem] font-semibold text-blue">Meu Feedback</p>
      <h1 className="display-lg mt-1 text-navy">Olá, {firstName}.</h1>
      <p className="mt-1 text-slate">Acompanhe seu desenvolvimento profissional.</p>

      {unread.length > 0 && (
        <section aria-label="Notificações" className="mt-6 space-y-2">
          {unread.map((n) => (
            <div key={n.id} className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-white p-4 ring-1 ring-blue/30 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex gap-3">
                <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-navy text-white">
                  <Bell className="size-5" aria-hidden />
                  <span className="absolute right-0.5 top-0.5 size-2.5 rounded-full bg-sky ring-2 ring-navy" />
                </span>
                <div>
                  <p className="font-semibold text-navy">{n.title}</p>
                  <p className="text-sm text-slate">{n.body}</p>
                </div>
              </div>
              {n.reviewId && (
                <Link href={href(n.reviewId)} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-navy px-5 text-sm font-semibold text-white hover:bg-blue">
                  Ver meu feedback <ArrowUpRight className="size-4" />
                </Link>
              )}
            </div>
          ))}
        </section>
      )}

      {latest ? (
        <section aria-labelledby="ultimo" className="mt-6 rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-navy/8 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p id="ultimo" className="text-[0.8125rem] font-semibold text-slate">Último feedback recebido</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-navy">{periodLabel(latest.month, latest.year)}</h2>
              <p className="mt-0.5 text-sm text-slate">
                Publicado em {latest.publishedAt ? formatDate(latest.publishedAt) : "—"}
                {latest.reviewerName ? ` · ${latest.reviewerName}` : ""}
              </p>
            </div>
            <ReadChip review={latest} />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-cream p-4">
              <p className="text-[0.8125rem] font-semibold text-navy">Pontos positivos</p>
              <ul className="mt-2 space-y-1 text-sm text-ink">
                {toBullets(latest.strengths).slice(0, 2).map((t) => (
                  <li key={t}>· {t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-cream p-4">
              <p className="text-[0.8125rem] font-semibold text-navy">Para desenvolver</p>
              <ul className="mt-2 space-y-1 text-sm text-ink">
                {toBullets(latest.improvements).slice(0, 2).map((t) => (
                  <li key={t}>· {t}</li>
                ))}
              </ul>
            </div>
          </div>
          <Link href={href(latest.id)} className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-navy px-6 text-[0.9375rem] font-semibold text-white hover:bg-blue">
            Abrir relatório completo <ArrowUpRight className="size-4" />
          </Link>
        </section>
      ) : (
        <section className="mt-6 rounded-[var(--radius-card)] bg-white p-7 text-center ring-1 ring-navy/8">
          <p className="font-display text-lg font-semibold text-navy">Nenhuma avaliação publicada ainda</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate">Quando a gestão publicar seu feedback do mês, ele aparecerá aqui e você receberá uma notificação.</p>
        </section>
      )}

      {reviews.length > 0 && (
        <section aria-labelledby="historico" className="mt-8">
          <h2 id="historico" className="flex items-center gap-2 font-display text-lg font-semibold text-navy">
            <CalendarDays className="size-5 text-blue" aria-hidden /> Histórico de avaliações
          </h2>
          {years.map((y) => (
            <div key={y} className="mt-4">
              <p className="mb-2 text-[0.8125rem] font-semibold text-slate">{y}</p>
              <ul className="divide-y divide-navy/8 overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-navy/8">
                {reviews
                  .filter((r) => r.year === y)
                  .map((r) => (
                    <li key={r.id}>
                      <Link href={href(r.id)} className="flex min-h-16 items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-cream">
                        <span>
                          <span className="block font-medium text-ink">{periodLabel(r.month, r.year)}</span>
                          <span className="text-[0.8125rem] text-slate">Publicado em {r.publishedAt ? formatDate(r.publishedAt) : "—"}</span>
                        </span>
                        <ReadChip review={r} />
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </EmployeeShell>
  );
}

export async function EmployeeReviewScreen({
  mode,
  params,
  searchParams,
}: {
  mode: DataMode;
  params: Promise<{ id: string }>;
  searchParams: Promise<SP>;
}) {
  const scope = await resolveScope(mode, searchParams);
  const { id } = await params;
  // Bloqueio no backend: só a PRÓPRIA avaliação PUBLICADA. Qualquer outro id → 404.
  const review = await scope.repo.getMyReview(scope.employee.id, id);
  if (!review) notFound();

  return (
    <EmployeeShell scope={scope}>
      <ViewTracker mode={mode} reviewId={review.id} demoEmployee={scope.demoEmployee} />
      <Link href={`${scope.base}${scope.q}`} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate hover:text-navy">
        <ArrowLeft className="size-4" /> Voltar ao Meu Feedback
      </Link>
      <ReviewReport
        review={review}
        footer={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-sm text-slate">
              Registrar a leitura indica apenas que você viu o relatório — não significa concordar com ele. Dúvidas ou
              discordâncias podem ser conversadas com a gestão.
            </p>
            <AcknowledgeButton mode={mode} reviewId={review.id} demoEmployee={scope.demoEmployee} acknowledgedAt={review.acknowledgedAt} />
          </div>
        }
      />
    </EmployeeShell>
  );
}
