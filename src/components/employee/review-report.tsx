import Link from "next/link";
import { ArrowUpRight, GraduationCap, Lightbulb, MessageSquareQuote, Sparkles, Sprout, Target, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { COURSES, periodLabel, type ReviewDetail } from "@/lib/domain";
import { formatDate, toBullets } from "@/lib/format";
import { cn } from "@/lib/utils";

function Section({ icon: Icon, title, children, tone = "default" }: { icon: LucideIcon; title: string; children: ReactNode; tone?: "default" | "soft" }) {
  return (
    <section className={cn("rounded-[var(--radius-card)] p-5 sm:p-6", tone === "soft" ? "bg-selected" : "bg-white ring-1 ring-navy/8")}>
      <h3 className="flex items-center gap-2.5 font-display text-[1.0625rem] font-semibold text-navy">
        <span className="flex size-8 items-center justify-center rounded-full bg-mist text-navy">
          <Icon className="size-4" strokeWidth={1.8} aria-hidden />
        </span>
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Bullets({ text }: { text: string }) {
  const items = toBullets(text);
  if (!items.length) return <p className="text-slate">Sem observações neste período.</p>;
  return (
    <ul className="space-y-2 text-[0.9375rem] leading-relaxed text-ink">
      {items.map((t) => (
        <li key={t} className="flex gap-3">
          <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-blue" aria-hidden />
          {t}
        </li>
      ))}
    </ul>
  );
}

/**
 * Relatório de avaliação profissional (visão do colaborador e prévia da gestão).
 * `footer` recebe a área de ciência ("Marcar como lido") quando aplicável.
 */
export function ReviewReport({ review, footer, preview = false }: { review: ReviewDetail; footer?: ReactNode; preview?: boolean }) {
  const course = review.suggestedCourse ? COURSES[review.suggestedCourse] : null;
  return (
    <article className="space-y-4">
      <header className="surface-dark rounded-[var(--radius-card)] bg-navy p-5 text-cream sm:p-7">
        <p className="text-[0.8125rem] font-semibold text-sky">Avaliação profissional{preview ? " · prévia" : ""}</p>
        <h2 className="mt-1 font-display text-[clamp(1.375rem,1.1rem+1vw,1.75rem)] font-semibold text-white">
          {periodLabel(review.month, review.year)}
        </h2>
        <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-cream/60">Colaborador</dt>
            <dd className="font-medium text-white">{review.employeeName}</dd>
          </div>
          <div>
            <dt className="text-cream/60">Publicado em</dt>
            <dd className="font-medium text-white">{review.publishedAt ? formatDate(review.publishedAt) : "Ainda não publicado"}</dd>
          </div>
          {review.reviewerName && (
            <div>
              <dt className="text-cream/60">Responsável</dt>
              <dd className="font-medium text-white">{review.reviewerName}</dd>
            </div>
          )}
        </dl>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Section icon={Sparkles} title="Pontos positivos">
          <Bullets text={review.strengths} />
        </Section>
        <Section icon={Sprout} title="Pontos de melhoria">
          <Bullets text={review.improvements} />
        </Section>
      </div>

      {review.recommendations && (
        <Section icon={Lightbulb} title="Recomendações">
          <Bullets text={review.recommendations} />
        </Section>
      )}

      {review.goals.length > 0 && (
        <Section icon={Target} title="Metas para o próximo mês" tone="soft">
          <ol className="space-y-2.5">
            {review.goals.map((g, i) => (
              <li key={g} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold tabular-nums text-white">
                  {i + 1}
                </span>
                {g}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {course && (
        <section className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-navy/8 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mist text-navy">
              <GraduationCap className="size-5" strokeWidth={1.7} aria-hidden />
            </span>
            <div>
              <p className="text-[0.8125rem] font-semibold text-blue">Curso recomendado pela gestão</p>
              <p className="font-display text-lg font-semibold text-navy">{course.label}</p>
              <p className="text-sm text-slate">{course.description}</p>
            </div>
          </div>
          {!preview && (
            <Link
              href="/?aba=cursos#participe"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-navy/20 px-5 text-sm font-semibold text-navy transition-colors hover:border-navy/50"
            >
              Ver inscrição <ArrowUpRight className="size-4" />
            </Link>
          )}
        </section>
      )}

      {review.managerMessage && (
        <Section icon={MessageSquareQuote} title="Mensagem da gestão">
          <p className="whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink">{review.managerMessage}</p>
        </Section>
      )}

      {footer && <div className="rounded-[var(--radius-card)] bg-cream-2/60 p-5 sm:p-6">{footer}</div>}
    </article>
  );
}
