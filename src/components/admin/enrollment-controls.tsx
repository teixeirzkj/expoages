"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteEnrollment, updateEnrollmentStatus } from "@/app/actions/admin";
import { ENROLLMENT_STATUSES, type DataMode, type EnrollmentStatus } from "@/lib/domain";

/** Status da inscrição (select nativo, confortável no toque) e exclusão com confirmação. */
export function EnrollmentControls({ mode, id, status, name }: { mode: DataMode; id: string; status: EnrollmentStatus; name: string }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const change = (next: EnrollmentStatus) =>
    start(async () => {
      const res = await updateEnrollmentStatus(mode, { id, status: next });
      if (res.ok) toast.success(`Inscrição marcada como “${ENROLLMENT_STATUSES[next]}”`);
      else toast.error(res.error);
    });

  const remove = () =>
    start(async () => {
      const res = await deleteEnrollment(mode, { id });
      if (res.ok) toast.success("Inscrição excluída");
      else toast.error(res.error);
      setConfirming(false);
    });

  return (
    <div className="flex items-center justify-end gap-2">
      <label>
        <span className="sr-only">Status da inscrição de {name}</span>
        <select
          value={status}
          disabled={pending}
          onChange={(e) => change(e.target.value as EnrollmentStatus)}
          className="h-10 rounded-xl border border-navy/15 bg-card pl-3 pr-8 text-sm text-ink focus:border-navy focus:outline-none focus:ring-4 focus:ring-sky/20 disabled:cursor-wait"
        >
          {Object.entries(ENROLLMENT_STATUSES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      {pending ? (
        <LoaderCircle className="size-4 animate-spin text-ink/50" aria-label="Salvando" />
      ) : confirming ? (
        <span className="flex items-center gap-1">
          <button type="button" onClick={remove} className="h-10 rounded-xl bg-destructive px-3 text-xs font-semibold text-white">
            Excluir
          </button>
          <button type="button" onClick={() => setConfirming(false)} className="h-10 rounded-xl px-2 text-xs text-ink/60">
            Cancelar
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="flex size-10 items-center justify-center rounded-xl text-ink/50 hover:bg-cream-2 hover:text-destructive"
          aria-label={`Excluir inscrição de ${name}`}
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}
