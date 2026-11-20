import "server-only";
import { cookies } from "next/headers";
import type { DataMode } from "@/lib/domain";
import { DEMO_COOKIE } from "@/lib/demo/constants";
import { isSupabaseConfigured } from "../env";
import { demoRepository } from "./demo";
import { supabaseRepository } from "./supabase";
import type { Repository } from "./types";

export function getRepository(mode: DataMode): Repository {
  if (mode === "demo") return demoRepository;
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase não configurado: o modo live não está disponível.");
  }
  return supabaseRepository;
}

/**
 * Destino dos envios públicos:
 *  - "demo" quando o aparelho ativou o modo demonstração (cookie) ou quando
 *    o Supabase ainda não foi configurado;
 *  - "live" nos demais casos.
 */
export async function resolvePublicMode(): Promise<DataMode> {
  if (!isSupabaseConfigured()) return "demo";
  const store = await cookies();
  return store.get(DEMO_COOKIE)?.value === "1" ? "demo" : "live";
}

export { RepositoryError } from "./types";
export type { Repository } from "./types";
