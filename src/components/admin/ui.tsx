import { CircleCheck, CircleDashed, CircleDot, Clock3, Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ACTION_PRIORITIES, SUBMISSION_STATUSES, type ActionPriority, type SubmissionStatus } from "@/lib/domain";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<SubmissionStatus, { cls: string; icon: LucideIcon }> = {
  recebido: { cls: "bg-cream-2 text-ink ring-ink/10", icon: Inbox },
  em_analise: { cls: "bg-[#fdf1d9] text-[#7a5a00] ring-[#7a5a00]/15", icon: Clock3 },
  acao_planejada: { cls: "bg-[#e6e8f7] text-[#3d4592] ring-[#3d4592]/15", icon: CircleDot },
  concluido: { cls: "bg-[#e2f1ea] text-[#1b6447] ring-[#1b6447]/15", icon: CircleCheck },
};

/** StatusBadge: cor + ícone + texto (nunca apenas cor). */
export function StatusBadge({ status, className }: { status: SubmissionStatus; className?: string }) {
  const s = STATUS_STYLE[status];
  const Icon = s.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1", s.cls, className)}>
      <Icon className="size-3.5" aria-hidden />
      {SUBMISSION_STATUSES[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: ActionPriority }) {
  const cls =
    priority === "alta" ? "bg-navy text-white" : priority === "media" ? "bg-mist text-navy" : "bg-cream-2 text-slate";
  return <span className={cn("rounded-full px-2 py-0.5 text-[0.7rem] font-semibold", cls)}>Prioridade {ACTION_PRIORITIES[priority].toLowerCase()}</span>;
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "dark" | "accent";
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-28 flex-col justify-between rounded-2xl p-4 md:p-5",
        tone === "dark" && "bg-navy text-cream",
        tone === "accent" && "bg-mist",
        tone === "default" && "bg-card ring-1 ring-navy/8",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={cn("text-sm", tone === "dark" ? "text-cream/70" : "text-ink/60")}>{label}</p>
        {Icon && <Icon className={cn("size-4", tone === "dark" ? "text-sky" : "text-navy/50")} aria-hidden />}
      </div>
      <div>
        <p className="font-display text-[2rem] font-semibold leading-none tabular-nums">{value}</p>
        {hint && <p className={cn("mt-2 text-xs", tone === "dark" ? "text-cream/55" : "text-ink/50")}>{hint}</p>}
      </div>
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-3xl bg-card p-5 ring-1 ring-navy/8 md:p-6", className)}>
      {(title || action) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-1 text-sm text-ink/55">{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ title, text, icon: Icon = CircleDashed, children }: { title: string; text?: string; icon?: LucideIcon; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-navy/20 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-cream-2 text-navy/60">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-4 font-semibold text-ink">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-ink/55">{text}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow text-blue">{eyebrow}</p>}
        <h1 className="mt-2 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2rem)] font-semibold leading-tight text-navy">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-ink/60">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-navy/[0.06]", className)} />;
}

export function ScreenSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando">
      <Skeleton className="mb-3 h-4 w-32" />
      <Skeleton className="mb-10 h-10 w-80" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="mt-6 h-80" />
    </div>
  );
}
