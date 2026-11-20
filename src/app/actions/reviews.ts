"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import type { DataMode } from "@/lib/domain";
import { getAdmin, getEmployeeUser } from "@/lib/server/auth";
import { getRepository, RepositoryError, type Repository } from "@/lib/server/repository";
import { employeeSchema, fieldErrors, firstError, reviewSchema, uuidLike } from "@/lib/validation";

export type ReviewActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; fields?: Record<string, string> };

const modeSchema = z.enum(["live", "demo"]);

function message(error: unknown) {
  if (error instanceof RepositoryError) return error.publicMessage;
  console.error("[reviews-action]", error);
  return "Não foi possível concluir a operação.";
}

/** Gestão: live exige administrador; demo opera só sobre dados fictícios. */
async function adminRepo(rawMode: unknown): Promise<Repository | null> {
  const mode = modeSchema.safeParse(rawMode);
  if (!mode.success) return null;
  if (mode.data === "live" && !(await getAdmin())) return null;
  return getRepository(mode.data as DataMode);
}

/**
 * Colaborador: no modo live o id vem SEMPRE da sessão (nunca do cliente);
 * no modo demo, aceita apenas um colaborador fictício existente.
 */
async function employeeScope(rawMode: unknown, rawDemoEmployee: unknown): Promise<{ repo: Repository; employeeId: string } | null> {
  const mode = modeSchema.safeParse(rawMode);
  if (!mode.success) return null;
  if (mode.data === "live") {
    const employee = await getEmployeeUser();
    return employee ? { repo: getRepository("live"), employeeId: employee.id } : null;
  }
  const id = uuidLike.safeParse(rawDemoEmployee);
  if (!id.success) return null;
  const repo = getRepository("demo");
  return (await repo.getEmployee(id.data)) ? { repo, employeeId: id.data } : null;
}

const DENIED: ReviewActionResult = { ok: false, error: "Sessão expirada ou sem permissão. Entre novamente." };

export async function saveReview(mode: DataMode, raw: unknown, id: string | null): Promise<ReviewActionResult> {
  const repo = await adminRepo(mode);
  if (!repo) return DENIED;
  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error), fields: fieldErrors(parsed.error) };
  const reviewId = id ? uuidLike.safeParse(id) : null;
  if (reviewId && !reviewId.success) return { ok: false, error: "Requisição inválida." };
  try {
    if (reviewId) {
      const current = await repo.getReview(reviewId.data);
      if (current?.status === "publicado" && !parsed.data.revisionNote) {
        return { ok: false, error: "Descreva o motivo da correção.", fields: { revisionNote: "Descreva o motivo da correção." } };
      }
    }
    const saved = await repo.saveReview(parsed.data, reviewId ? reviewId.data : null);
    refresh();
    return { ok: true, id: saved };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function publishReview(mode: DataMode, id: string): Promise<ReviewActionResult> {
  const repo = await adminRepo(mode);
  if (!repo) return DENIED;
  const parsed = uuidLike.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Requisição inválida." };
  try {
    await repo.publishReview(parsed.data);
    refresh();
    return { ok: true, id: parsed.data };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function registerEmployee(mode: DataMode, raw: unknown): Promise<ReviewActionResult> {
  const repo = await adminRepo(mode);
  if (!repo) return DENIED;
  const parsed = employeeSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error), fields: fieldErrors(parsed.error) };
  try {
    await repo.registerEmployee(parsed.data);
    refresh();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function markReviewViewed(mode: DataMode, reviewId: string, demoEmployee?: string): Promise<ReviewActionResult> {
  const scope = await employeeScope(mode, demoEmployee);
  const id = uuidLike.safeParse(reviewId);
  if (!scope || !id.success) return DENIED;
  try {
    await scope.repo.markReviewViewed(scope.employeeId, id.data);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function acknowledgeReview(mode: DataMode, reviewId: string, demoEmployee?: string): Promise<ReviewActionResult> {
  const scope = await employeeScope(mode, demoEmployee);
  const id = uuidLike.safeParse(reviewId);
  if (!scope || !id.success) return DENIED;
  try {
    await scope.repo.acknowledgeReview(scope.employeeId, id.data);
    refresh();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function markNotificationRead(mode: DataMode, notificationId: string, demoEmployee?: string): Promise<ReviewActionResult> {
  const scope = await employeeScope(mode, demoEmployee);
  const id = uuidLike.safeParse(notificationId);
  if (!scope || !id.success) return DENIED;
  try {
    await scope.repo.markNotificationRead(scope.employeeId, id.data);
    refresh();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}
