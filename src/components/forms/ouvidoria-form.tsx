"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitOuvidoria } from "@/app/actions/public";
import { LIMITS, OUVIDORIA_CATEGORIES, TOPIC_SUGGESTIONS, type OuvidoriaCategory } from "@/lib/domain";
import { fieldErrors, ouvidoriaSchema } from "@/lib/validation";
import { ActionButton } from "@/components/brand/action-button";
import { ChoiceGroup, FieldShell, Honeypot, PrivacyHint, ScaleInput, SuggestionChips, TextArea, TextInput } from "./fields";
import { FormStepper } from "./form-stepper";
import { SubmissionSuccess } from "./submission-success";
import { useAntiAbuse } from "./use-anti-abuse";

const STEPS = ["Tipo e tema", "Relato", "Revisão"];
const CATEGORY_HINTS: Record<OuvidoriaCategory, string> = {
  sugestao: "Uma ideia para melhorar algo",
  reclamacao: "Algo que não está funcionando bem",
  dificuldade: "Um obstáculo no dia a dia",
  condicoes: "Estrutura, equipamentos, pausas",
  outro: "Qualquer outro assunto",
};

export function OuvidoriaForm({
  onTrack,
  onClose,
  closeLabel,
}: {
  onTrack: (p: string) => void;
  onClose: () => void;
  closeLabel?: string;
}) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<OuvidoriaCategory | "">("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [impact, setImpact] = useState<number | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ protocol: string; mode: "live" | "demo" } | null>(null);
  const [pending, startTransition] = useTransition();
  const anti = useAntiAbuse();

  const validateStep = (s: number) => {
    const shape =
      s === 0
        ? ouvidoriaSchema.pick({ category: true, topic: true })
        : s === 1
          ? ouvidoriaSchema.pick({ description: true, impact: true })
          : ouvidoriaSchema;
    const parsed = shape.safeParse({ category, topic, description, impact, confirm });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return false;
    }
    setErrors({});
    return true;
  };

  const next = () => validateStep(step) && setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = () => {
    if (!validateStep(2)) return;
    startTransition(async () => {
      const res = await submitOuvidoria({ category, topic, description, impact, confirm, ...anti.meta() });
      if (res.ok) {
        setResult({ protocol: res.protocol, mode: res.mode });
      } else {
        if (res.fields) setErrors(res.fields);
        toast.error(res.error);
      }
    });
  };

  if (result) {
    return (
      <SubmissionSuccess
        protocol={result.protocol}
        mode={result.mode}
        title="Sua manifestação foi recebida."
        message="Obrigado por compartilhar. A gestão responsável vai analisar o relato e poderá registrar uma devolutiva vinculada ao protocolo."
        onTrack={onTrack}
        onClose={onClose}
        closeLabel={closeLabel}
      />
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (step < 2) next();
        else submit();
      }}
      className="relative"
    >
      <Honeypot value={anti.website} onChange={anti.setWebsite} />
      <FormStepper steps={STEPS} current={step} />

      <div className="mt-8 min-h-[22rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            {step === 0 && (
              <>
                <FieldShell as="fieldset" label="Tipo de manifestação" error={errors.category}>
                  <ChoiceGroup
                    name="category"
                    value={category}
                    onChange={setCategory}
                    options={(Object.keys(OUVIDORIA_CATEGORIES) as OuvidoriaCategory[]).map((k) => ({
                      value: k,
                      label: OUVIDORIA_CATEGORIES[k],
                      description: CATEGORY_HINTS[k],
                    }))}
                  />
                </FieldShell>
                <FieldShell label="Tema principal" htmlFor="ouv-topic" error={errors.topic} hint="Resuma em poucas palavras ou escolha uma sugestão.">
                  <TextInput
                    id="ouv-topic"
                    value={topic}
                    maxLength={LIMITS.topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex.: Pausas durante o turno"
                    aria-invalid={!!errors.topic}
                    autoComplete="off"
                  />
                  <SuggestionChips items={TOPIC_SUGGESTIONS} current={topic} onPick={setTopic} />
                </FieldShell>
              </>
            )}

            {step === 1 && (
              <>
                <FieldShell
                  label="Descreva a situação"
                  htmlFor="ouv-desc"
                  error={errors.description}
                  hint="Conte o que acontece e, se quiser, o que poderia melhorar. Evite citar nomes."
                >
                  <TextArea
                    id="ouv-desc"
                    value={description}
                    maxLength={LIMITS.description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Escreva com suas palavras…"
                    aria-invalid={!!errors.description}
                    rows={6}
                  />
                  <PrivacyHint text={description} />
                </FieldShell>
                <FieldShell as="fieldset" label="Quanto essa situação impacta seu dia a dia?" optional>
                  <ScaleInput name="Impacto da situação" value={impact} onChange={setImpact} labels={["Pouco", "Muito"]} />
                </FieldShell>
              </>
            )}

            {step === 2 && (
              <>
                <dl className="divide-y divide-navy/10 rounded-2xl border border-navy/12 bg-cream">
                  {[
                    ["Tipo", category ? OUVIDORIA_CATEGORIES[category] : "—"],
                    ["Tema", topic],
                    ["Impacto", impact ? `${impact} de 5` : "Não informado"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 px-5 py-3.5 text-sm">
                      <dt className="text-ink/55">{k}</dt>
                      <dd className="text-right font-medium text-ink">{v}</dd>
                    </div>
                  ))}
                  <div className="px-5 py-4">
                    <dt className="text-sm text-ink/55">Descrição</dt>
                    <dd className="mt-2 max-h-40 overflow-y-auto whitespace-pre-line text-[0.95rem] text-ink">
                      {description}
                    </dd>
                  </div>
                </dl>
                <div className="flex gap-3 rounded-xl bg-mist/70 p-4 text-sm text-navy">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0" />
                  <p>
                    Não pedimos nome, e-mail, telefone ou cadastro, e a aplicação não grava seu endereço de rede. Mesmo assim,
                    detalhes muito específicos no texto podem indicar quem escreveu.
                  </p>
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy/15 p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue">
                  <input
                    type="checkbox"
                    checked={confirm}
                    onChange={(e) => setConfirm(e.target.checked)}
                    className="mt-0.5 size-5 shrink-0 accent-[var(--brand-navy)]"
                  />
                  <span className="text-[0.95rem] text-ink">
                    Revisei minha mensagem e confirmo o envio. Entendo que ela será lida pela gestão autorizada.
                  </span>
                </label>
                {errors.confirm && <p role="alert" className="text-sm font-medium text-destructive">{errors.confirm}</p>}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-navy/10 pt-5">
        {step > 0 ? (
          <ActionButton variant="ghost" className="text-navy" onClick={back} disabled={pending}>
            <ArrowLeft className="size-4" /> Voltar
          </ActionButton>
        ) : (
          <span className="text-xs text-ink/45">Leva cerca de 2 minutos</span>
        )}
        {step < 2 ? (
          <ActionButton type="submit" icon={<ArrowRight className="size-4" />}>
            Continuar
          </ActionButton>
        ) : (
          <ActionButton type="submit" disabled={pending} aria-busy={pending}>
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {pending ? "Enviando…" : "Enviar manifestação"}
          </ActionButton>
        )}
      </div>
    </form>
  );
}
