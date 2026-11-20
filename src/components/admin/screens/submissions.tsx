import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, MessageSquareText, NotebookPen, RefreshCcw } from "lucide-react";
import {
  FEEDBACK_KINDS,
  OUVIDORIA_CATEGORIES,
  SUBMISSION_STATUSES,
  type ActionCategory,
  type DataMode,
  type FeedbackKind,
  type SubmissionKind,
  type SubmissionStatus,
} from "@/lib/domain";
import { parseFilters, type RawSearchParams } from "@/lib/filters";
import { formatDateTime } from "@/lib/format";
import { basePath, loadRepo } from "@/lib/server/admin-data";
import { uuidLike } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { ActionFormDialog } from "../action-form";
import { AutoRefresh } from "../auto-refresh";
import { NoteComposer, ResponseComposer, StatusControl } from "../submission-controls";
import { exportHref, SubmissionFiltersBar, SubmissionTable } from "../submission-table";
import { PageHeader, Panel, StatusBadge } from "../ui";

export async function OuvidoriaListScreen({ mode, searchParams }: { mode: DataMode; searchParams: Promise<RawSearchParams> }) {
  const repo = await loadRepo(mode);
  const sp = await searchParams;
  const filters = parseFilters(sp, Object.keys(OUVIDORIA_CATEGORIES));
  const records = await repo.listSubmissions("ouvidoria", filters);
  const base = `${basePath(mode)}/ouvidoria`;

  return (
    <div>
      <PageHeader
        eyebrow="Ouvidoria"
        title="Manifestações"
        description="Leia, classifique e responda. O conteúdo é anônimo: não há dados de identificação a exibir."
        actions={<AutoRefresh />}
      />
      <SubmissionFiltersBar action={base} filters={filters} categories={OUVIDORIA_CATEGORIES} exportHref={exportHref(mode, "ouvidoria", filters)} />
      <p className="mb-3 text-sm text-ink/55">{records.length} registro(s)</p>
      <SubmissionTable records={records} base={base} kind="ouvidoria" />
    </div>
  );
}

const FB_TABS: { key: FeedbackKind | ""; label: string }[] = [
  { key: "", label: "Todos" },
  { key: "reconhecimento", label: "Reconhecimentos" },
  { key: "construtivo", label: "Sugestões construtivas" },
  { key: "outro", label: "Outros retornos" },
];

export async function FeedbackListScreen({ mode, searchParams }: { mode: DataMode; searchParams: Promise<RawSearchParams> }) {
  const repo = await loadRepo(mode);
  const sp = await searchParams;
  const filters = parseFilters(sp, Object.keys(FEEDBACK_KINDS));
  const [records, all] = await Promise.all([repo.listSubmissions("feedback", filters), repo.listSubmissions("feedback")]);
  const base = `${basePath(mode)}/feedbacks`;

  return (
    <div>
      <PageHeader
        eyebrow="Feedbacks"
        title="Reconhecimentos e sugestões"
        description="Mensagens privadas: nada é publicado no site sem uma decisão consciente da gestão."
        actions={<AutoRefresh />}
      />
      <nav aria-label="Tipos de feedback" className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {FB_TABS.map((t) => {
          const active = (filters.category ?? "") === t.key;
          const count = t.key ? all.filter((r) => r.kind === "feedback" && r.feedbackKind === t.key).length : all.length;
          return (
            <Link
              key={t.key || "all"}
              href={t.key ? `${base}?categoria=${t.key}` : base}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors",
                active ? "bg-navy text-cream" : "bg-card text-ink/70 ring-1 ring-navy/10 hover:bg-cream-2",
              )}
            >
              {t.label}
              <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-cream/15" : "bg-cream-2")}>{count}</span>
            </Link>
          );
        })}
      </nav>
      <SubmissionFiltersBar action={base} filters={filters} categories={FEEDBACK_KINDS} exportHref={exportHref(mode, "feedback", filters)} hideCategory />
      <SubmissionTable records={records} base={base} kind="feedback" />
    </div>
  );
}

const ICONS = { note: NotebookPen, response: MessageSquareText, status: RefreshCcw };

const ACTION_CATEGORY_GUESS: Record<string, ActionCategory> = {
  condicoes: "condicoes",
  reclamacao: "processos",
  dificuldade: "bem_estar",
  sugestao: "comunicacao",
  outro: "comunicacao",
  reconhecimento: "reconhecimento",
  construtivo: "processos",
};

export async function SubmissionDetailScreen({
  mode,
  kind,
  params,
}: {
  mode: DataMode;
  kind: SubmissionKind;
  params: Promise<{ id: string }>;
}) {
  const repo = await loadRepo(mode);
  const { id } = await params;
  if (!uuidLike.safeParse(id).success) notFound();
  const record = await repo.getSubmission(kind, id);
  if (!record) notFound();
  const timeline = await repo.getTimeline(kind, id);
  const listHref = `${basePath(mode)}/${kind === "ouvidoria" ? "ouvidoria" : "feedbacks"}`;
  const label = record.kind === "ouvidoria" ? OUVIDORIA_CATEGORIES[record.category] : FEEDBACK_KINDS[record.feedbackKind];
  const body = record.kind === "ouvidoria" ? record.description : record.message;
  const score = record.kind === "ouvidoria" ? record.impact : record.rating;
  const catKey = record.kind === "ouvidoria" ? record.category : record.feedbackKind;

  return (
    <div>
      <Link href={listHref} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-ink">
        <ArrowLeft className="size-4" /> Voltar para a lista
      </Link>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-3">
          <Panel>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-cream-2 px-3 py-1 font-mono text-xs font-semibold text-navy">{record.reference}</span>
              <StatusBadge status={record.status} />
              <span className="text-xs text-ink/50">{label}</span>
            </div>
            <h1 className="mt-5 font-display text-[clamp(1.7rem,3vw,2.3rem)] leading-tight text-navy">{record.topic}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/50">
              <Clock3 className="size-4" /> Recebido em {formatDateTime(record.createdAt)}
            </p>
            <p className="mt-6 whitespace-pre-line text-[1.05rem] leading-relaxed text-ink/85">{body}</p>
            <dl className="mt-8 grid gap-4 border-t border-navy/8 pt-5 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-ink/50">{record.kind === "ouvidoria" ? "Impacto informado" : "Avaliação"}</dt>
                <dd className="mt-1 font-semibold">{score ? `${score} de 5` : "Não informado"}</dd>
              </div>
              {record.kind === "feedback" && (
                <div>
                  <dt className="text-ink/50">Área</dt>
                  <dd className="mt-1 font-semibold">{record.area ?? "Não informada"}</dd>
                </div>
              )}
              <div>
                <dt className="text-ink/50">Última atualização</dt>
                <dd className="mt-1 font-semibold">{formatDateTime(record.updatedAt)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Andamento" description="Altere o status conforme a análise avança. Quem enviou vê essa etapa ao consultar o protocolo.">
            <StatusControl mode={mode} kind={kind} id={record.id} status={record.status} />
          </Panel>

          <Panel title="Registrar">
            <div className="grid gap-4 lg:grid-cols-2">
              <ResponseComposer mode={mode} kind={kind} id={record.id} />
              <NoteComposer mode={mode} kind={kind} id={record.id} />
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-navy/20 p-4">
              <p className="text-sm text-ink/65">Esta contribuição pede uma providência? Leve-a para o plano de ações.</p>
              <ActionFormDialog
                mode={mode}
                triggerLabel="Criar ação de melhoria"
                defaults={{ title: record.topic, linkedReference: record.reference, category: ACTION_CATEGORY_GUESS[catKey] }}
              />
            </div>
          </Panel>
        </div>

        <Panel title="Histórico" description="Mudanças de status, respostas e observações." className="h-fit xl:col-span-2">
          <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[0.95rem] before:top-2 before:w-px before:bg-navy/12">
            {timeline.map((t) => {
              const Icon = ICONS[t.type];
              return (
                <li key={t.id} className="relative flex gap-4">
                  <span
                    className={cn(
                      "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-card",
                      t.type === "response" ? "bg-sky text-navy" : t.type === "note" ? "bg-cream-2 text-navy" : "bg-navy text-cream",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 pt-1">
                    <p className="text-xs font-semibold text-ink/55">
                      {t.type === "status" ? "Status alterado" : t.type === "response" ? "Resposta enviada" : "Observação interna"} · {formatDateTime(t.createdAt)}
                    </p>
                    {t.type === "status" ? (
                      <p className="mt-1.5"><StatusBadge status={t.body as SubmissionStatus} /></p>
                    ) : (
                      <p className="mt-1 whitespace-pre-line text-sm text-ink/80">{t.body}</p>
                    )}
                  </div>
                </li>
              );
            })}
            <li className="relative flex gap-4">
              <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-sky text-navy ring-4 ring-card">
                <span className="size-2 rounded-full bg-ink" />
              </span>
              <div className="pt-1">
                <p className="text-xs font-semibold text-ink/55">Recebido · {formatDateTime(record.createdAt)}</p>
                <p className="mt-1 text-sm text-ink/70">Registro criado com status “{SUBMISSION_STATUSES.recebido}”.</p>
              </div>
            </li>
          </ol>
        </Panel>
      </div>
    </div>
  );
}
