"use server";

import type { DataMode, TrackResult } from "@/lib/domain";
import { generateProtocol, hashSecret, splitProtocol } from "@/lib/server/protocol";
import { checkRateLimit, looksAutomated } from "@/lib/server/rate-limit";
import { getRepository, RepositoryError, resolvePublicMode } from "@/lib/server/repository";
import {
  antiAbuseSchema,
  feedbackSchema,
  fieldErrors,
  firstError,
  ouvidoriaSchema,
  protocolSchema,
  pulseSchema,
} from "@/lib/validation";

export type SubmitResult =
  | { ok: true; protocol: string; mode: DataMode }
  | { ok: false; error: string; fields?: Record<string, string> };

export type SimpleResult = { ok: true; mode: DataMode } | { ok: false; error: string };

export type TrackActionResult = { ok: true; data: TrackResult } | { ok: false; error: string };

const GENERIC = "Não foi possível enviar agora. Tente novamente em instantes.";
const LIMITED = "Muitos envios em sequência. Aguarde alguns minutos e tente novamente.";

async function guard(action: string, raw: unknown, mode: DataMode) {
  const anti = antiAbuseSchema.safeParse(raw);
  if (!anti.success) return GENERIC;
  // Em quiosque de demonstração vários visitantes usam o mesmo aparelho.
  const allowed = await checkRateLimit(action, mode === "demo" ? 40 : 20);
  if (!allowed) return LIMITED;
  if (looksAutomated(anti.data.startedAt, anti.data.website ?? "")) return GENERIC;
  return null;
}

function toError(error: unknown): string {
  if (error instanceof RepositoryError) return error.publicMessage;
  console.error("[public-action]", error);
  return GENERIC;
}

export async function submitOuvidoria(raw: unknown): Promise<SubmitResult> {
  const mode = await resolvePublicMode();
  const blocked = await guard("ouvidoria", raw, mode);
  if (blocked) return { ok: false, error: blocked };

  const parsed = ouvidoriaSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error), fields: fieldErrors(parsed.error) };

  const protocol = generateProtocol();
  try {
    const { category, topic, description, impact } = parsed.data;
    await getRepository(mode).insertOuvidoria({ category, topic, description, impact }, protocol);
    return { ok: true, protocol: protocol.full, mode };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}

export async function submitFeedback(raw: unknown): Promise<SubmitResult> {
  const mode = await resolvePublicMode();
  const blocked = await guard("feedback", raw, mode);
  if (blocked) return { ok: false, error: blocked };

  const parsed = feedbackSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error), fields: fieldErrors(parsed.error) };

  const protocol = generateProtocol();
  try {
    await getRepository(mode).insertFeedback(parsed.data, protocol);
    return { ok: true, protocol: protocol.full, mode };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}

export async function submitPulse(raw: unknown): Promise<SimpleResult> {
  const mode = await resolvePublicMode();
  const blocked = await guard("pulse", raw, mode);
  if (blocked) return { ok: false, error: blocked };

  const parsed = pulseSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Responda todas as perguntas para enviar." };
  try {
    await getRepository(mode).insertPulse(parsed.data);
    return { ok: true, mode };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}

export async function trackProtocol(rawProtocol: string): Promise<TrackActionResult> {
  const parsed = protocolSchema.safeParse(rawProtocol);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  // Limite mais rígido para dificultar tentativas de adivinhação.
  const allowed = await checkRateLimit("track", 15, 10 * 60_000);
  if (!allowed) return { ok: false, error: LIMITED };

  const { reference, secret } = splitProtocol(parsed.data);
  const hash = hashSecret(secret);
  const notFound = "Não encontramos um registro com este protocolo. Confira os caracteres e tente novamente.";
  try {
    const mode = await resolvePublicMode();
    // Protocolos criados no modo demonstração vivem apenas na memória demo.
    const data = await getRepository(mode).track(reference, hash);
    if (!data) return { ok: false, error: notFound };
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}
