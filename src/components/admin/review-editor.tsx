"use client";

import { useRouter } from "next/navigation";
import { LoaderCircle, Save, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { publishReview, saveReview } from "@/app/actions/reviews";
import { COURSES, MONTHS, REVIEW_LIMITS, type CourseKey, type DataMode, type EmployeeProfile, type ReviewDetail } from "@/lib/domain";
import { FieldShell, SelectInput, TextArea, TextInput } from "@/components/forms/fields";
import { useSingleSubmit } from "@/components/forms/use-single-submit";

interface Props {
  mode: DataMode;
  base: string;
  employees: EmployeeProfile[];
  review?: ReviewDetail | null;
  defaultEmployeeId?: string;
}

const now = new Date();

/** Formulário da avaliação mensal (gestão). Rascunhos nunca chegam ao colaborador. */
export function ReviewEditor({ mode, base, employees, review, defaultEmployeeId }: Props) {
  const router = useRouter();
  const published = review?.status === "publicado";
  const [employeeId, setEmployeeId] = useState(review?.employeeId ?? defaultEmployeeId ?? "");
  const [month, setMonth] = useState(String(review?.month ?? now.getMonth() + 1));
  const [year, setYear] = useState(String(review?.year ?? now.getFullYear()));
  const [reviewerName, setReviewerName] = useState(review?.reviewerName ?? "");
  const [strengths, setStrengths] = useState(review?.strengths ?? "");
  const [improvements, setImprovements] = useState(review?.improvements ?? "");
  const [recommendations, setRecommendations] = useState(review?.recommendations ?? "");
  const [goals, setGoals] = useState<string[]>(() => {
    const g = [...(review?.goals ?? [])];
    while (g.length < REVIEW_LIMITS.goals) g.push("");
    return g;
  });
  const [suggestedCourse, setSuggestedCourse] = useState<CourseKey | "">(review?.suggestedCourse ?? "");
  const [managerMessage, setManagerMessage] = useState(review?.managerMessage ?? "");
  const [revisionNote, setRevisionNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, run] = useSingleSubmit();

  const submit = (andPublish: boolean) =>
    run(async () => {
      const res = await saveReview(
        mode,
        {
          employeeId,
          month,
          year,
          reviewerName,
          strengths,
          improvements,
          recommendations,
          goals,
          suggestedCourse,
          managerMessage,
          revisionNote: published ? revisionNote : undefined,
        },
        review?.id ?? null,
      );
      if (!res.ok) {
        setErrors(res.fields ?? {});
        toast.error(res.error);
        return;
      }
      setErrors({});
      if (andPublish && res.id) {
        const pub = await publishReview(mode, res.id);
        if (!pub.ok) {
          toast.error(pub.error);
          return;
        }
        toast.success("Avaliação publicada. O colaborador foi notificado na plataforma.");
      } else {
        toast.success(published ? "Correção salva e registrada no histórico." : "Rascunho salvo.");
      }
      router.push(`${base}/avaliacoes/${res.id}`);
    });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
      }}
      className="grid gap-6"
      aria-busy={pending}
    >
      <section className="grid gap-5 rounded-3xl bg-card p-5 ring-1 ring-navy/8 md:p-6">
        <h2 className="font-display text-lg font-semibold text-navy">Identificação</h2>
        <div className="grid items-start gap-5 md:grid-cols-[2fr_1fr_1fr]">
          <FieldShell label="Colaborador" htmlFor="rv-employee" error={errors.employeeId}>
            <SelectInput id="rv-employee" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} disabled={published}>
              <option value="">Selecione…</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.fullName}
                  {e.area ? ` — ${e.area}` : ""}
                </option>
              ))}
            </SelectInput>
          </FieldShell>
          <FieldShell label="Mês de referência" htmlFor="rv-month" error={errors.month}>
            <SelectInput id="rv-month" value={month} onChange={(e) => setMonth(e.target.value)} disabled={published}>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </SelectInput>
          </FieldShell>
          <FieldShell label="Ano" htmlFor="rv-year" error={errors.year}>
            <TextInput id="rv-year" type="number" inputMode="numeric" min={2020} max={2100} value={year} onChange={(e) => setYear(e.target.value)} disabled={published} />
          </FieldShell>
        </div>
        <FieldShell label="Responsável pela avaliação" htmlFor="rv-reviewer" optional hint="Ex.: Coordenação de Atendimento" hintBelow>
          <TextInput id="rv-reviewer" value={reviewerName} maxLength={REVIEW_LIMITS.name} onChange={(e) => setReviewerName(e.target.value)} />
        </FieldShell>
      </section>

      <section className="grid gap-5 rounded-3xl bg-card p-5 ring-1 ring-navy/8 md:p-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-navy">Conteúdo da avaliação</h2>
          <p className="text-sm text-slate">Escreva uma ideia por linha — cada linha vira um item no relatório do colaborador.</p>
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <FieldShell label="Pontos positivos" htmlFor="rv-strengths" error={errors.strengths}>
            <TextArea id="rv-strengths" value={strengths} maxLength={REVIEW_LIMITS.section} rows={5} onChange={(e) => setStrengths(e.target.value)} placeholder={"Boa comunicação com a equipe.\nComprometimento com as atividades."} />
          </FieldShell>
          <FieldShell label="Pontos de melhoria" htmlFor="rv-improvements" error={errors.improvements}>
            <TextArea id="rv-improvements" value={improvements} maxLength={REVIEW_LIMITS.section} rows={5} onChange={(e) => setImprovements(e.target.value)} placeholder="Aprimorar a organização das prioridades." />
          </FieldShell>
        </div>
        <FieldShell label="Recomendações" htmlFor="rv-recs" optional error={errors.recommendations}>
          <TextArea id="rv-recs" value={recommendations} maxLength={REVIEW_LIMITS.section} rows={3} onChange={(e) => setRecommendations(e.target.value)} placeholder="Participar de atividades de desenvolvimento." />
        </FieldShell>
        <FieldShell as="fieldset" label="Metas para o próximo mês" optional hint="Até três ações de desenvolvimento.">
          <div className="grid gap-2">
            {goals.map((g, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-mist text-xs font-semibold text-navy" aria-hidden>
                  {i + 1}
                </span>
                <TextInput
                  aria-label={`Meta ${i + 1}`}
                  value={g}
                  maxLength={REVIEW_LIMITS.goal}
                  onChange={(e) => setGoals((list) => list.map((x, j) => (j === i ? e.target.value : x)))}
                />
              </div>
            ))}
          </div>
        </FieldShell>
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <FieldShell label="Curso recomendado" htmlFor="rv-course" optional hint="Conecta a avaliação aos cursos da plataforma." hintBelow>
            <SelectInput id="rv-course" value={suggestedCourse} onChange={(e) => setSuggestedCourse(e.target.value as CourseKey | "")}>
              <option value="">Nenhum</option>
              {Object.entries(COURSES).map(([k, c]) => (
                <option key={k} value={k}>
                  {c.label}
                </option>
              ))}
            </SelectInput>
          </FieldShell>
          <FieldShell label="Mensagem complementar" htmlFor="rv-message" optional error={errors.managerMessage}>
            <TextArea id="rv-message" value={managerMessage} maxLength={REVIEW_LIMITS.message} rows={3} onChange={(e) => setManagerMessage(e.target.value)} />
          </FieldShell>
        </div>
      </section>

      {published && (
        <section className="grid gap-3 rounded-3xl bg-selected p-5 md:p-6">
          <p className="text-sm text-navy">
            Esta avaliação já foi publicada. A versão anterior será guardada no histórico de correções, com o motivo informado abaixo.
          </p>
          <FieldShell label="Motivo da correção" htmlFor="rv-note" error={errors.revisionNote}>
            <TextInput id="rv-note" value={revisionNote} maxLength={300} onChange={(e) => setRevisionNote(e.target.value)} placeholder="Ex.: ajuste de redação nas recomendações" />
          </FieldShell>
        </section>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[0.9375rem] font-semibold text-navy ring-1 ring-navy/20 hover:ring-navy/50 disabled:opacity-60"
        >
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
          {published ? "Salvar correção" : "Salvar rascunho"}
        </button>
        {!published && (
          <button
            type="button"
            disabled={pending}
            onClick={() => submit(true)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-navy px-6 text-[0.9375rem] font-semibold text-white hover:bg-blue disabled:opacity-60"
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
            Salvar e publicar
          </button>
        )}
      </div>
    </form>
  );
}
