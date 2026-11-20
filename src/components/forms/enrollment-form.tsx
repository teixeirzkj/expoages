"use client";

import { CircleCheck, GraduationCap, LoaderCircle, Mail, RotateCcw, Send } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { submitEnrollment } from "@/app/actions/public";
import { AREAS, COURSE_SHIFTS, COURSES, type CourseKey, type CourseShift, type DataMode } from "@/lib/domain";
import { enrollmentSchema, fieldErrors } from "@/lib/validation";
import { ActionButton } from "@/components/brand/action-button";
import { ChoiceGroup, FieldShell, Honeypot, SegmentedChoice, SelectInput, TextInput } from "./fields";
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
  const sending = useRef(false); // trava contra cliques repetidos antes do re-render
  const anti = useAntiAbuse();

  const submit = () => {
    if (sending.current) return;
    const data = { fullName, email, course, shift, area, consent };
    const parsed = enrollmentSchema.safeParse(data);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    sending.current = true;
    startTransition(async () => {
      try {
        const res = await submitEnrollment({ ...data, ...anti.meta() });
        if (res.ok) setDone({ mode: res.mode, course: parsed.data.course, email: parsed.data.email });
        else {
          if (res.fields) setErrors(res.fields);
          toast.error(res.error);
        }
      } finally {
        sending.current = false;
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
      <div className="rounded-xl bg-cream px-5 py-8 text-center sm:px-8" aria-live="polite">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-navy text-white">
          <CircleCheck className="size-7" strokeWidth={1.8} />
        </span>
        <h4 className="display-md mt-5 text-navy">Inscrição recebida!</h4>
        <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-slate">
          Seu interesse foi registrado. As próximas informações serão enviadas para o e-mail informado.
        </p>
        <dl className="mx-auto mt-5 grid max-w-md gap-2 text-left text-sm">
          <div className="flex items-center gap-2.5 rounded-xl bg-white px-4 py-3">
            <GraduationCap className="size-4 shrink-0 text-blue" aria-hidden />
            <dt className="sr-only">Curso</dt>
            <dd className="font-medium text-ink">{COURSES[done.course].label}</dd>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-white px-4 py-3">
            <Mail className="size-4 shrink-0 text-blue" aria-hidden />
            <dt className="sr-only">E-mail</dt>
            <dd className="truncate font-medium text-ink">{done.email}</dd>
          </div>
        </dl>
        {done.mode === "demo" && (
          <p className="mx-auto mt-4 max-w-md text-[0.8125rem] text-slate">
            Modo demonstração: registrada apenas no ambiente fictício da apresentação.
          </p>
        )}
        <ActionButton variant="outline" className="mt-6 text-navy" onClick={restart}>
          <RotateCcw className="size-4" /> Nova inscrição
        </ActionButton>
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
      className="relative grid gap-7"
      aria-busy={pending}
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

      {/* Linha 1: nome e e-mail começam na mesma altura (ajuda fica abaixo do campo) */}
      <div className="grid items-start gap-x-4 gap-y-6 sm:grid-cols-2">
        <FieldShell label="Nome completo" htmlFor="cur-name" error={errors.fullName}>
          <TextInput
            id="cur-name"
            value={fullName}
            maxLength={80}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            placeholder="Seu nome"
            aria-invalid={!!errors.fullName}
          />
        </FieldShell>
        <FieldShell label="E-mail" htmlFor="cur-email" error={errors.email} hint="As informações do curso chegam por aqui." hintBelow>
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

      {/* Linha 2: turno */}
      <FieldShell as="fieldset" label="Turno de preferência" error={errors.shift}>
        <SegmentedChoice
          name="shift"
          value={shift}
          onChange={setShift}
          options={(Object.keys(COURSE_SHIFTS) as CourseShift[]).map((k) => ({ value: k, label: COURSE_SHIFTS[k] }))}
        />
      </FieldShell>

      {/* Linha 3: área (opcional) */}
      <FieldShell label="Área em que trabalha" htmlFor="cur-area" optional>
        <SelectInput id="cur-area" value={area} onChange={(e) => setArea(e.target.value)}>
          <option value="">Prefiro não informar</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </SelectInput>
      </FieldShell>

      {/* Resumo + autorização + envio */}
      <div className="grid gap-3">
        {course && (
          <p className="flex items-start gap-2.5 rounded-xl bg-selected px-4 py-3 text-[0.9375rem] text-navy" aria-live="polite">
            <GraduationCap className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              Você está se inscrevendo em <strong className="font-semibold">{COURSES[course].label}</strong>
              {shift ? (
                <>
                  {" "}
                  · turno: <strong className="font-semibold">{COURSE_SHIFTS[shift].toLowerCase()}</strong>
                </>
              ) : null}
              .
            </span>
          </p>
        )}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy/15 px-4 py-3.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={!!errors.consent}
            className="mt-0.5 size-5 shrink-0 accent-[var(--brand-navy)]"
          />
          <span className="text-[0.9375rem] leading-snug text-ink">
            Autorizo o uso do meu nome e e-mail <strong className="font-semibold">apenas</strong> para o contato sobre a
            inscrição. Esses dados não se misturam às mensagens anônimas da ouvidoria.
          </span>
        </label>
        {errors.consent && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {errors.consent}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.8125rem] text-slate">Registra seu interesse; a coordenação confirma as vagas por e-mail.</p>
        <ActionButton type="submit" size="lg" disabled={pending} aria-busy={pending} className="w-full sm:w-auto">
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
          {pending ? "Enviando…" : "Confirmar inscrição"}
        </ActionButton>
      </div>
    </form>
  );
}
