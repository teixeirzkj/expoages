import { z } from "zod";
import {
  ACTION_CATEGORIES,
  ACTION_PRIORITIES,
  ACTION_STATUSES,
  AREAS,
  FEEDBACK_KINDS,
  LIMITS,
  OUVIDORIA_CATEGORIES,
  SUBMISSION_STATUSES,
} from "./domain";

function keysOf<T extends Record<string, string>>(obj: T) {
  return Object.keys(obj) as [keyof T & string, ...(keyof T & string)[]];
}

/** Remove caracteres de controle e espaços excessivos. A renderização usa
 *  sempre texto (nunca HTML), então isto é higiene, não a defesa principal. */
export function cleanText(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

const text = (min: number, max: number, label: string) =>
  z
    .string({ error: `Informe ${label}.` })
    .transform(cleanText)
    .pipe(
      z
        .string()
        .min(min, min <= 1 ? `Informe ${label}.` : `${label[0].toUpperCase()}${label.slice(1)} precisa ter ao menos ${min} caracteres.`)
        .max(max, `Use no máximo ${max} caracteres.`),
    );

const optionalRating = z
  .union([z.coerce.number().int().min(1).max(5), z.literal(""), z.null(), z.undefined()])
  .transform((v) => (typeof v === "number" ? v : null));

/** Campos anti-abuso enviados por todos os formulários públicos. */
export const antiAbuseSchema = z.object({
  /** Honeypot: precisa chegar vazio. */
  website: z.string().max(0).optional().default(""),
  /** Momento em que o formulário foi aberto (ms). */
  startedAt: z.coerce.number().int().positive(),
});

export const ouvidoriaSchema = z.object({
  category: z.enum(keysOf(OUVIDORIA_CATEGORIES), { error: "Escolha o tipo de manifestação." }),
  topic: text(3, LIMITS.topic, "o tema principal"),
  description: text(LIMITS.descriptionMin, LIMITS.description, "a descrição"),
  impact: optionalRating,
  confirm: z.literal(true, { error: "Confirme a revisão antes de enviar." }),
});
export type OuvidoriaInput = z.infer<typeof ouvidoriaSchema>;

export const feedbackSchema = z.object({
  feedbackKind: z.enum(keysOf(FEEDBACK_KINDS), { error: "Escolha o tipo de contribuição." }),
  topic: text(3, LIMITS.topic, "o tema"),
  area: z
    .union([z.enum(AREAS), z.literal(""), z.null(), z.undefined()])
    .transform((v) => (v ? v : null)),
  message: text(LIMITS.descriptionMin, LIMITS.description, "a mensagem"),
  rating: optionalRating,
});
export type FeedbackInput = z.infer<typeof feedbackSchema>;

const scale = z.coerce.number().int().min(1).max(5);
export const pulseSchema = z.object({
  valorizacao: scale,
  escuta: scale,
  bem_estar: scale,
  feedback: scale,
});
export type PulseInput = z.infer<typeof pulseSchema>;

/** Protocolo completo: HZ-XXXX-XXXX-XXXX-XXXX (alfabeto Crockford). */
export const protocolSchema = z
  .string()
  .transform((v) => v.toUpperCase().replace(/\s+/g, "").replace(/[OIL]/g, (c) => (c === "O" ? "0" : "1")))
  .pipe(z.string().regex(/^HZ-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/, "Protocolo inválido. Confira o formato HZ-XXXX-XXXX-XXXX-XXXX."));

// ---------------------------------------------------------------------------
// Administração
// ---------------------------------------------------------------------------

export const statusSchema = z.enum(keysOf(SUBMISSION_STATUSES));
export const kindSchema = z.enum(["ouvidoria", "feedback"]);
export const uuidLike = z.string().min(8).max(64).regex(/^[0-9a-zA-Z-]+$/);

export const noteSchema = z.object({ body: text(2, LIMITS.note, "a observação") });
export const responseSchema = z.object({ body: text(5, LIMITS.response, "a resposta") });

export const actionSchema = z.object({
  title: text(3, LIMITS.actionTitle, "o título"),
  description: text(0, LIMITS.actionDescription, "a descrição").or(z.literal("")),
  category: z.enum(keysOf(ACTION_CATEGORIES)),
  priority: z.enum(keysOf(ACTION_PRIORITIES)),
  owner: text(2, LIMITS.owner, "o responsável"),
  status: z.enum(keysOf(ACTION_STATUSES)).default("planejada"),
  dueDate: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal(""), z.null(), z.undefined()])
    .transform((v) => (v ? v : null)),
  linkedReference: z
    .union([z.string().regex(/^HZ-[0-9A-Z]{4}-[0-9A-Z]{4}$/), z.literal(""), z.null(), z.undefined()])
    .transform((v) => (v ? v : null)),
});
export type ActionInput = z.infer<typeof actionSchema>;
export const actionStatusSchema = z.enum(keysOf(ACTION_STATUSES));

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido.").max(200),
  password: z.string().min(6, "Senha muito curta.").max(200),
});

export function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
