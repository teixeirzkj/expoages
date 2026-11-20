import "server-only";
import { connection } from "next/server";
import type { DataMode } from "@/lib/domain";
import { requireAdmin } from "./auth";
import { getRepository } from "./repository";

/**
 * Ponto único de entrada das telas administrativas.
 * live → exige administrador (redireciona ao login); demo → memória fictícia.
 */
export async function loadRepo(mode: DataMode) {
  await connection();
  if (mode === "live") await requireAdmin();
  return getRepository(mode);
}

export const basePath = (mode: DataMode) => (mode === "live" ? "/admin" : "/demo");
