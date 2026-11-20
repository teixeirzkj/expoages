"use client";

import { CircleCheck, LoaderCircle, Mail, RotateCcw, Send } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitEnrollment } from "@/app/actions/public";
import { AREAS, COURSE_SHIFTS, COURSES, type CourseKey, type CourseShift, type DataMode } from "@/lib/domain";
import { enrollmentSchema, fieldErrors } from "@/lib/validation";
import { ActionButton } from "@/components/brand/action-button";
import { ChoiceGroup, FieldShell, Honeypot, TextInput } from "./fields";
import { useAntiAbuse } from "./use-anti-abuse";

/**
 * Inscrição em cursos profissionalizantes. Diferente dos canais de escuta,
 * é IDENTIFICADA: pede somente nome e e-mail para o contato sobre o curso,
 * com consentimento explícito, e fica separada das mensagens anônimas.
 */
export function EnrollmentForm() {
  const [course, setCourse] = useState<CourseKey | "">("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [shift, setShift] = useState<CourseShift | "">("");
  const [area, setArea] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<{ mode: DataMode; course: CourseKey; email: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const anti = useAntiAbuse();

  const submit = () => {
    const data = { fullName, email, course, shift, area, consent };
    const parsed = enrollmentSchema.safeParse(data);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    startTransition(async () => {
      const res = await submitEnrollment({ ...data, ...anti.meta() });
      if (res.ok) setDone({ mode: res.mode, course: parsed.data.course, email: parsed.data.email });
      else {
        if (res.fields) setErrors(res.fields);
        toast.error(res.error);
      }
    });
  };

  const restart = () => {
    setCourse("");
    setFullName("");
    setEmail("");
    setShift("");
    setArea("");
    setConsent(false);
    setDone(null);
    anti.reset();
  };

  if (done) {
    return (
      <div className="py-4 text-center" aria-live="polite">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-navy text-white">
          <CircleCheck className="size-7" strokeWidth={1.8} />
        </span>
        <h3 className="display-md mt-5 text-navy">Inscrição recebida.</h3>
        <p className="mx-auto mt-2 max-w-md text-slate">
          Você se inscreveu em <strong className="font-semibold text-ink">{COURSES[done.course].label}</strong>. As próximas
          informações — datas, horários e local — serão enviadas pela coordenação para:
        </p>
        <p className="mx-auto mt-4 inline-flex max-w-full items-center gap-2 rounded-full bg-mist px-4 py-2 text-sm font-medium text-navy">
          <Mail className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{done.email}</span>
        </p>
        {done.mode === "demo" && (
          <p className="mx-auto mt-4 max-w-md rounded-xl bg-cream px-4 py-2.5 text-xs text-navy">
            Modo demonstração: a inscrição foi registrada apenas no ambiente fictício da apresentação.
          </p>
        )}
        <div className="mt-6">
          <ActionButton variant="outline" className="text-navy" onClick={restart}>
            <RotateCcw className="size-4" /> Nova inscrição
          </ActionButton>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="relative space-y-7"
    >
      <Honeypot value={anti.website} onChange={anti.setWebsite} />

      <FieldShell as="fieldset" label="Curso" error={errors.course}>
        <ChoiceGroup
          name="course"
          value={course}
          onChange={setCourse}
          columns="2"
          options={(Object.keys(COURSES) as CourseKey[]).map((k) => ({
            value: k,
            label: COURSES[k].label,
            description: COURSES[k].description,
          }))}
        />
      </FieldShell>

      <div className="grid gap-6 sm:grid-cols-2">
        <FieldShell label="Nome completo" htmlFor="cur-name" error={errors.fullName}>
          <TextInput
            id="cur-name"
            value={fullName}
            maxLength={80}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            aria-invalid={!!errors.fullName}
          />
        </FieldShell>
        <FieldShell label="E-mail" htmlFor="cur-email" error={errors.email} hint="As informações do curso chegam por aqui.">
          <TextInput
            id="cur-email"
            type="email"
            inputMode="email"
            value={email}
            maxLength={120}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="nome@exemplo.com"
            aria-invalid={!!errors.email}
          />
        </FieldShell>
      </div>

      <FieldShell as="fieldset" label="Turno de preferência" error={errors.shift}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.keys(COURSE_SHIFTS) as CourseShift[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={shift === k}
              onClick={() => setShift(k)}
              className={
                shift === k
                  ? "min-h-11 rounded-xl border border-navy bg-navy px-3 text-sm font-medium text-white"
                  : "min-h-11 rounded-xl border border-navy/15 bg-white px-3 text-sm text-ink/80 hover:border-navy/40"
              }
            >
              {COURSE_SHIFTS[k]}
            </button>
          ))}
        </div>
      </FieldShell>

      <FieldShell label="Área em que trabalha" htmlFor="cur-area" optional>
        <select
          id="cur-area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="h-12 w-full rounded-xl border border-navy/15 bg-white px-4 text-base text-ink focus:border-navy focus:outline-none focus:ring-4 focus:ring-blue/15"
        >
          <option value="">Prefiro não informar</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </FieldShell>

      <div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy/15 p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 size-5 shrink-0 accent-[var(--brand-navy)]"
          />
          <span className="text-[0.9375rem] text-ink">
            Autorizo o uso do meu nome e e-mail <strong className="font-semibold">apenas</strong> para o contato sobre a
            inscrição. Esses dados não se misturam às mensagens anônimas da ouvidoria.
          </span>
        </label>
        {errors.consent && (
          <p role="alert" className="mt-2 text-sm font-medium text-destructive">
            {errors.consent}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-navy/10 pt-5">
        <span className="text-xs text-slate">Inscrição identificada</span>
        <ActionButton type="submit" disabled={pending} aria-busy={pending}>
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
          {pending ? "Enviando…" : "Confirmar inscrição"}
        </ActionButton>
      </div>
    </form>
  );
}
