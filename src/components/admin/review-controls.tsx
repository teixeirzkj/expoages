"use client";

import { LoaderCircle, Send, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { publishReview, registerEmployee } from "@/app/actions/reviews";
import { AREAS, type DataMode } from "@/lib/domain";
import { FieldShell, SelectInput, TextInput } from "@/components/forms/fields";
import { useSingleSubmit } from "@/components/forms/use-single-submit";

/** Publica um rascunho, com confirmação (a publicação notifica o colaborador). */
export function PublishReviewButton({ mode, id, employeeName }: { mode: DataMode; id: string; employeeName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, run] = useSingleSubmit();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex h-11 items-center gap-2 rounded-full bg-navy px-5 text-sm font-semibold text-white hover:bg-blue"
      >
        <Send className="size-4" /> Publicar
      </button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-selected p-2 pl-4 text-sm text-navy">
      <span>Publicar para {employeeName}?</span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          run(async () => {
            const res = await publishReview(mode, id);
            if (res.ok) toast.success("Avaliação publicada. O colaborador foi notificado na plataforma.");
            else toast.error(res.error);
            setConfirming(false);
          })
        }
        className="inline-flex h-10 items-center gap-2 rounded-full bg-navy px-4 font-semibold text-white disabled:opacity-60"
      >
        {pending && <LoaderCircle className="size-4 animate-spin" />} Confirmar
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="h-10 rounded-full px-3 text-slate hover:text-navy">
        Cancelar
      </button>
    </div>
  );
}

/** Cadastro/vínculo de colaborador. No modo real, a conta precisa existir no Supabase Auth. */
export function EmployeeRegisterForm({ mode }: { mode: DataMode }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, run] = useSingleSubmit();

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          const res = await registerEmployee(mode, { fullName, email, area });
          if (res.ok) {
            toast.success(mode === "demo" ? "Colaborador fictício adicionado." : "Colaborador vinculado.");
            setFullName("");
            setEmail("");
            setArea("");
            setErrors({});
          } else {
            setErrors(res.fields ?? {});
            toast.error(res.error);
          }
        });
      }}
      className="grid gap-4"
    >
      <FieldShell label="Nome completo" htmlFor="emp-name" error={errors.fullName}>
        <TextInput id="emp-name" value={fullName} maxLength={80} onChange={(e) => setFullName(e.target.value)} />
      </FieldShell>
      <FieldShell
        label="E-mail da conta"
        htmlFor="emp-email"
        error={errors.email}
        hint={mode === "live" ? "A conta deve existir no Supabase Auth (Authentication → Users)." : "Use um e-mail fictício, ex.: nome@example.com"}
        hintBelow
      >
        <TextInput id="emp-email" type="email" value={email} maxLength={120} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
      </FieldShell>
      <FieldShell label="Área" htmlFor="emp-area" optional>
        <SelectInput id="emp-area" value={area} onChange={(e) => setArea(e.target.value)}>
          <option value="">Não informar</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </SelectInput>
      </FieldShell>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-navy px-5 text-sm font-semibold text-white hover:bg-blue disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        {mode === "demo" ? "Adicionar colaborador fictício" : "Vincular colaborador"}
      </button>
    </form>
  );
}
