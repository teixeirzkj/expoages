"use client";

import { LoaderCircle, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { submitFeedback } from "@/app/actions/public";
import { AREAS, FEEDBACK_KINDS, LIMITS, type FeedbackKind } from "@/lib/domain";
import { feedbackSchema, fieldErrors } from "@/lib/validation";
import { ActionButton } from "@/components/brand/action-button";
import { cn } from "@/lib/utils";
import { ChoiceGroup, FieldShell, Honeypot, PrivacyHint, ScaleInput, SuggestionChips, TextArea, TextInput } from "./fields";
import { SubmissionSuccess } from "./submission-success";
import { useAntiAbuse } from "./use-anti-abuse";
import { useSingleSubmit } from "./use-single-submit";

const TOPICS: Record<FeedbackKind, string[]> = {
  reconhecimento: ["Colaboração", "Atendimento", "Liderança", "Integração", "Iniciativa", "Treinamento"],
  construtivo: ["Processos", "Comunicação", "Metas", "Escalas", "Feedback e desenvolvimento", "Ambiente"],
  outro: ["Bem-estar", "Ambiente", "Comunicação", "Outro assunto"],
};

const COPY: Record<FeedbackKind, { message: string; placeholder: string; rating: string; labels: [string, string] }> = {
  reconhecimento: {
    message: "O que você quer reconhecer?",
    placeholder: "Descreva a atitude, prática ou contribuição que merece ser valorizada…",
    rating: "Qual foi o impacto positivo dessa prática?",
    labels: ["Pequeno", "Muito grande"],
  },
  construtivo: {
    message: "Qual é a sua sugestão?",
    placeholder: "Descreva o que poderia funcionar melhor e, se quiser, como…",
    rating: "Qual a prioridade dessa melhoria, na sua visão?",
    labels: ["Baixa", "Alta"],
  },
  outro: {
    message: "Sua mensagem",
    placeholder: "Compartilhe seu retorno…",
    rating: "Como você avalia o tema?",
    labels: ["Negativo", "Positivo"],
  },
};

export function FeedbackForm({
  initialKind,
  onTrack,
  onClose,
  closeLabel,
}: {
  initialKind: FeedbackKind;
  onTrack: (p: string) => void;
  onClose: () => void;
  closeLabel?: string;
}) {
  const [feedbackKind, setKind] = useState<FeedbackKind>(initialKind);
  const [topic, setTopic] = useState("");
  const [area, setArea] = useState<string>("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ protocol: string; mode: "live" | "demo" } | null>(null);
  const [pending, startTransition] = useSingleSubmit();
  const anti = useAntiAbuse();
  const copy = COPY[feedbackKind];

  const submit = () => {
    const parsed = feedbackSchema.safeParse({ feedbackKind, topic, area, message, rating });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    startTransition(async () => {
      const res = await submitFeedback({ feedbackKind, topic, area, message, rating, ...anti.meta() });
      if (res.ok) setResult({ protocol: res.protocol, mode: res.mode });
      else {
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
        title={feedbackKind === "reconhecimento" ? "Reconhecimento enviado." : "Feedback enviado."}
        message={
          feedbackKind === "reconhecimento"
            ? "Obrigado por valorizar quem faz a diferença. A gestão poderá compartilhar o reconhecimento de forma cuidadosa — nada é publicado automaticamente."
            : "Obrigado pela contribuição. A gestão vai analisar a sugestão e poderá registrar uma devolutiva pelo protocolo."
        }
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
        submit();
      }}
      className="relative space-y-8"
    >
      <Honeypot value={anti.website} onChange={anti.setWebsite} />

      <FieldShell as="fieldset" label="Tipo de contribuição">
        <ChoiceGroup
          name="feedbackKind"
          value={feedbackKind}
          onChange={(k) => {
            setKind(k);
            setTopic("");
          }}
          options={(Object.keys(FEEDBACK_KINDS) as FeedbackKind[]).map((k) => ({ value: k, label: FEEDBACK_KINDS[k] }))}
        />
      </FieldShell>

      <FieldShell label="Tema" htmlFor="fb-topic" error={errors.topic}>
        <TextInput
          id="fb-topic"
          value={topic}
          maxLength={LIMITS.topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex.: Colaboração entre equipes"
          aria-invalid={!!errors.topic}
          autoComplete="off"
        />
        <SuggestionChips items={TOPICS[feedbackKind]} current={topic} onPick={setTopic} />
      </FieldShell>

      <FieldShell
        as="fieldset"
        label="Equipe ou área relacionada"
        optional
        hint="Escolha uma área genérica. Não é possível indicar uma pessoa específica nesta versão."
      >
        <div className="flex flex-wrap gap-2">
          {["", ...AREAS].map((a) => (
            <button
              key={a || "none"}
              type="button"
              aria-pressed={area === a}
              onClick={() => setArea(a)}
              className={cn(
                "min-h-11 rounded-full border px-4 text-sm transition-colors",
                area === a ? "border-navy bg-navy text-cream" : "border-navy/15 text-ink/75 hover:border-navy/40",
              )}
            >
              {a || "Prefiro não informar"}
            </button>
          ))}
        </div>
      </FieldShell>

      <FieldShell label={copy.message} htmlFor="fb-message" error={errors.message}>
        <TextArea
          id="fb-message"
          value={message}
          maxLength={LIMITS.description}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={copy.placeholder}
          aria-invalid={!!errors.message}
          rows={5}
        />
        <PrivacyHint text={message} />
      </FieldShell>

      <FieldShell as="fieldset" label={copy.rating} optional>
        <ScaleInput name={copy.rating} value={rating} onChange={setRating} labels={copy.labels} />
      </FieldShell>

      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-[0.8125rem] text-slate">Sem identificação pessoal</span>
        <ActionButton type="submit" disabled={pending} aria-busy={pending}>
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
          {pending ? "Enviando…" : "Enviar"}
        </ActionButton>
      </div>
    </form>
  );
}
