"use client";

import { LoaderCircle, MessageSquareText, NotebookPen } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addInternalNote, addPublicResponse, updateSubmissionStatus } from "@/app/actions/admin";
import { LIMITS, SUBMISSION_STATUSES, type DataMode, type SubmissionKind, type SubmissionStatus } from "@/lib/domain";
import { cn } from "@/lib/utils";

const ORDER = Object.keys(SUBMISSION_STATUSES) as SubmissionStatus[];

export function StatusControl({ mode, kind, id, status }: { mode: DataMode; kind: SubmissionKind; id: string; status: SubmissionStatus }) {
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useState(status);
  const current = pending ? optimistic : status;

  const change = (next: SubmissionStatus) => {
    if (next === status) return;
    setOptimistic(next);
    start(async () => {
      const res = await updateSubmissionStatus(mode, { kind, id, status: next });
      if (res.ok) toast.success(`Status alterado para “${SUBMISSION_STATUSES[next]}”`);
      else toast.error(res.error);
    });
  };

  return (
    <div role="radiogroup" aria-label="Status" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {ORDER.map((s, i) => {
        const active = current === s;
        const done = ORDER.indexOf(current) >= i;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={pending}
            onClick={() => change(s)}
            className={cn(
              "relative min-h-14 rounded-2xl border px-3 py-2 text-left text-sm font-medium transition-colors disabled:cursor-wait",
              active ? "border-navy bg-navy text-cream" : done ? "border-navy/30 bg-mist/60 text-navy" : "border-navy/12 text-ink/65 hover:border-navy/35",
            )}
          >
            <span className="block text-[0.7rem] font-semibold opacity-60">Etapa {i + 1}</span>
            {SUBMISSION_STATUSES[s]}
            {active && pending && <LoaderCircle className="absolute right-3 top-3 size-4 animate-spin" />}
          </button>
        );
      })}
    </div>
  );
}

function TextComposer({
  label,
  hint,
  placeholder,
  submitLabel,
  icon,
  tone,
  onSubmit,
}: {
  label: string;
  hint: string;
  placeholder: string;
  submitLabel: string;
  icon: React.ReactNode;
  tone: "note" | "response";
  onSubmit: (body: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();
  const max = tone === "note" ? LIMITS.note : LIMITS.response;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await onSubmit(body);
          if (res.ok) {
            setBody("");
            toast.success(tone === "note" ? "Observação registrada" : "Resposta registrada e visível pelo protocolo");
          } else toast.error(res.error ?? "Não foi possível salvar.");
        });
      }}
      className={cn("rounded-2xl p-4", tone === "note" ? "bg-cream-2/70" : "bg-mist/60")}
    >
      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        {icon}
        {label}
      </label>
      <p className="mt-1 text-xs text-ink/55">{hint}</p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={max}
        rows={3}
        placeholder={placeholder}
        className="mt-3 w-full resize-y rounded-xl border border-navy/15 bg-card px-3 py-2.5 text-base focus:border-navy focus:outline-none focus:ring-4 focus:ring-sky/20"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs tabular-nums text-ink/40">{body.length}/{max}</span>
        <button
          type="submit"
          disabled={pending || body.trim().length < 2}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-navy px-4 text-sm font-semibold text-cream disabled:opacity-40"
        >
          {pending && <LoaderCircle className="size-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export function NoteComposer({ mode, kind, id }: { mode: DataMode; kind: SubmissionKind; id: string }) {
  return (
    <TextComposer
      tone="note"
      label="Observação interna"
      hint="Visível somente para a gestão. Nunca é exibida a quem enviou."
      placeholder="Ex.: tema recorrente, encaminhado à coordenação…"
      submitLabel="Salvar observação"
      icon={<NotebookPen className="size-4 text-navy/70" />}
      onSubmit={(body) => addInternalNote(mode, { kind, id, body })}
    />
  );
}

export function ResponseComposer({ mode, kind, id }: { mode: DataMode; kind: SubmissionKind; id: string }) {
  return (
    <TextComposer
      tone="response"
      label="Resposta vinculada ao protocolo"
      hint="Quem enviou poderá ler esta resposta ao consultar o protocolo. Escreva de forma respeitosa e sem expor pessoas."
      placeholder="Ex.: Obrigado pela contribuição. A situação foi analisada e…"
      submitLabel="Enviar resposta"
      icon={<MessageSquareText className="size-4 text-navy/70" />}
      onSubmit={(body) => addPublicResponse(mode, { kind, id, body })}
    />
  );
}
