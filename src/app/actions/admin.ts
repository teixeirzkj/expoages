"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import type { DataMode } from "@/lib/domain";
import { getAdmin } from "@/lib/server/auth";
import { getRepository, RepositoryError, type Repository } from "@/lib/server/repository";
import {
  actionSchema,
  actionStatusSchema,
  fieldErrors,
  firstError,
  kindSchema,
  noteSchema,
  responseSchema,
  statusSchema,
  uuidLike,
} from "@/lib/validation";

export type AdminResult = { ok: true } | { ok: false; error: string; fields?: Record<string, string> };

const modeSchema = z.enum(["live", "demo"]);

/**
 * Resolve o repositório garantindo a autorização:
 *  - live: exige administrador autenticado (verificado no servidor e no RLS);
 *  - demo: opera exclusivamente sobre a memória demonstrativa fictícia.
 */
async function authorized(rawMode: unknown): Promise<Repository | AdminResult> {
  const mode = modeSchema.safeParse(rawMode);
  if (!mode.success) return { ok: false, error: "Requisição inválida." };
  if (mode.data === "live") {
    const admin = await getAdmin();
    if (!admin) return { ok: false, error: "Sessão expirada. Entre novamente." };
  }
  return getRepository(mode.data as DataMode);
}

function isResult(v: Repository | AdminResult): v is AdminResult {
  return "ok" in v;
}

async function run(fn: () => Promise<void>): Promise<AdminResult> {
  try {
    await fn();
    refresh();
    return { ok: true };
  } catch (error) {
    if (error instanceof RepositoryError) return { ok: false, error: error.publicMessage };
    console.error("[admin-action]", error);
    return { ok: false, error: "Não foi possível concluir a operação." };
  }
}

const target = z.object({ kind: kindSchema, id: uuidLike });

export async function updateSubmissionStatus(mode: DataMode, raw: unknown): Promise<AdminResult> {
  const repo = await authorized(mode);
  if (isResult(repo)) return repo;
  const parsed = target.extend({ status: statusSchema }).safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Status inválido." };
  return run(() => repo.setStatus(parsed.data.kind, parsed.data.id, parsed.data.status));
}

export async function addInternalNote(mode: DataMode, raw: unknown): Promise<AdminResult> {
  const repo = await authorized(mode);
  if (isResult(repo)) return repo;
  const parsed = target.merge(noteSchema).safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  return run(() => repo.addNote(parsed.data.kind, parsed.data.id, parsed.data.body));
}

export async function addPublicResponse(mode: DataMode, raw: unknown): Promise<AdminResult> {
  const repo = await authorized(mode);
  if (isResult(repo)) return repo;
  const parsed = target.merge(responseSchema).safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  return run(() => repo.addResponse(parsed.data.kind, parsed.data.id, parsed.data.body));
}

export async function createActionPlan(mode: DataMode, raw: unknown): Promise<AdminResult> {
  const repo = await authorized(mode);
  if (isResult(repo)) return repo;
  const parsed = actionSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error), fields: fieldErrors(parsed.error) };
  return run(() => repo.createAction(parsed.data));
}

export async function updateActionPlanStatus(mode: DataMode, raw: unknown): Promise<AdminResult> {
  const repo = await authorized(mode);
  if (isResult(repo)) return repo;
  const parsed = z.object({ id: uuidLike, status: actionStatusSchema }).safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Status inválido." };
  return run(() => repo.updateActionStatus(parsed.data.id, parsed.data.status));
}

export async function deleteActionPlan(mode: DataMode, raw: unknown): Promise<AdminResult> {
  const repo = await authorized(mode);
  if (isResult(repo)) return repo;
  const parsed = z.object({ id: uuidLike }).safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Requisição inválida." };
  return run(() => repo.deleteAction(parsed.data.id));
}
